"use client";

import type React from "react";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Infinite photo tunnel — planes stream toward the camera on a looping
 * Z-track, fading and un-blurring as they arrive and dissolving again
 * as they pass. Scroll / arrow keys / touch drive it; it idles into a
 * slow auto-advance after a few seconds of quiet.
 *
 * Adapted from the 21st.dev "3d-gallery-photography" component. Two
 * local changes from the source:
 *   1. Textures load via R3F's `useLoader(TextureLoader)` instead of
 *      drei's `useTexture`, so the section adds no new dependency on
 *      top of the `three` + `@react-three/fiber` already in the tree.
 *   2. Each image takes an optional `zoom` / `focusY` crop, applied
 *      once to its (deduped) texture — a light lever for tightening an
 *      already-close plate. Left at zoom:1 it's a no-op.
 */

type ImageItem = string | { src: string; alt?: string; zoom?: number; focusY?: number };

interface FadeSettings {
  fadeIn: { start: number; end: number };
  fadeOut: { start: number; end: number };
}

interface BlurSettings {
  blurIn: { start: number; end: number };
  blurOut: { start: number; end: number };
  maxBlur: number;
}

interface InfiniteGalleryProps {
  images: ImageItem[];
  speed?: number;
  /** Idle auto-advance rate (velocity added per second while at rest). */
  autoSpeed?: number;
  visibleCount?: number;
  /** 0 = plates centred in one focal column; 1 = full golden-angle scatter. */
  spread?: number;
  /** Uniform scale multiplier on every plate (1 = source component size). */
  size?: number;
  /** Wheel + arrow-key control. Off = auto-drift only, page scroll passes
   *  through (use when embedding in a scrolling page). */
  interactive?: boolean;
  /** Track position (0–1) a plate converges to centre / counts as focal.
   *  Defaults to the middle of the opaque plateau so the centred plate is
   *  fully lit. Keep it inside the [fadeIn.end, fadeOut.start] band. */
  focusAt?: number;
  /** Fires with the image index of the dominant (nearest, opaque) plate. */
  onFocus?: (imageIndex: number) => void;
  /** Imperative drive handle. The parent gets a `push(deltaVelocity)` fn
   *  here to advance the tunnel from scroll (pin + scrub). */
  driveRef?: React.MutableRefObject<((deltaVelocity: number) => void) | null>;
  fadeSettings?: FadeSettings;
  blurSettings?: BlurSettings;
  className?: string;
  style?: React.CSSProperties;
}

interface PlaneData {
  index: number;
  z: number;
  imageIndex: number;
  x: number;
  y: number;
}

const DEFAULT_DEPTH_RANGE = 50;
const MAX_HORIZONTAL_OFFSET = 8;
const MAX_VERTICAL_OFFSET = 8;
/** Track distance (in normalized units) over which a plate ramps from
 *  fully scattered to centred as it approaches the focal depth. */
const CONVERGE_RANGE = 0.32;

const normalize = (img: ImageItem) =>
  typeof img === "string" ? { src: img, alt: "" } : img;

const createClothMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      map: { value: null },
      opacity: { value: 1.0 },
      blurAmount: { value: 0.0 },
      scrollForce: { value: 0.0 },
      time: { value: 0.0 },
      isHovered: { value: 0.0 },
    },
    vertexShader: `
      uniform float scrollForce;
      uniform float time;
      uniform float isHovered;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vNormal = normal;

        vec3 pos = position;

        // Curve the plane in proportion to the scroll force.
        float curveIntensity = scrollForce * 0.3;
        float distanceFromCenter = length(pos.xy);
        float curve = distanceFromCenter * distanceFromCenter * curveIntensity;

        // Gentle cloth-like ripples riding the curve.
        float ripple1 = sin(pos.x * 2.0 + scrollForce * 3.0) * 0.02;
        float ripple2 = sin(pos.y * 2.5 + scrollForce * 2.0) * 0.015;
        float clothEffect = (ripple1 + ripple2) * abs(curveIntensity) * 2.0;

        // Flag-wave on hover, damped toward the free (right) edge.
        float flagWave = 0.0;
        if (isHovered > 0.5) {
          float wavePhase = pos.x * 3.0 + time * 8.0;
          float waveAmplitude = sin(wavePhase) * 0.1;
          float dampening = smoothstep(-0.5, 0.5, pos.x);
          flagWave = waveAmplitude * dampening;
          float secondaryWave = sin(pos.x * 5.0 + time * 12.0) * 0.03 * dampening;
          flagWave += secondaryWave;
        }

        pos.z -= (curve + clothEffect + flagWave);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform float blurAmount;
      uniform float scrollForce;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vec4 color = texture2D(map, vUv);

        // Cheap box blur, strength driven by blurAmount.
        if (blurAmount > 0.0) {
          vec2 texelSize = 1.0 / vec2(textureSize(map, 0));
          vec4 blurred = vec4(0.0);
          float total = 0.0;
          for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
              vec2 offset = vec2(x, y) * texelSize * blurAmount;
              float weight = 1.0 / (1.0 + length(vec2(x, y)));
              blurred += texture2D(map, vUv + offset) * weight;
              total += weight;
            }
          }
          color = blurred / total;
        }

        // Plate shows clean — only opacity is touched, no colour grade.
        gl_FragColor = vec4(color.rgb, color.a * opacity);
      }
    `,
  });

function ImagePlane({
  texture,
  position,
  scale,
  material,
}: {
  texture: THREE.Texture;
  position: [number, number, number];
  scale: [number, number, number];
  material: THREE.ShaderMaterial;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (material && texture) material.uniforms.map.value = texture;
  }, [material, texture]);

  useEffect(() => {
    if (material?.uniforms) material.uniforms.isHovered.value = isHovered ? 1.0 : 0.0;
  }, [material, isHovered]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      material={material}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <planeGeometry args={[1, 1, 32, 32]} />
    </mesh>
  );
}

function GalleryScene({
  images,
  speed = 1,
  autoSpeed = 0.3,
  visibleCount = 8,
  spread = 1,
  size = 1,
  interactive = true,
  focusAt,
  onFocus,
  driveRef,
  fadeSettings = {
    fadeIn: { start: 0.05, end: 0.15 },
    fadeOut: { start: 0.85, end: 0.95 },
  },
  blurSettings = {
    blurIn: { start: 0.0, end: 0.1 },
    blurOut: { start: 0.9, end: 1.0 },
    maxBlur: 3.0,
  },
}: Omit<InfiniteGalleryProps, "className" | "style">) {
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const lastInteraction = useRef(Date.now());
  const lastFocus = useRef(-1);

  const normalizedImages = useMemo(() => images.map(normalize), [images]);

  const textures = useLoader(
    THREE.TextureLoader,
    normalizedImages.map((img) => img.src),
  ) as THREE.Texture[];

  // Raw passthrough (NoColorSpace) so the JPEG shows exactly as shot —
  // the plain `texture2D` shader neither linearises on input nor
  // re-encodes on output, so any managed colour space would double-
  // convert and shift the plate. Optional crop applied per texture.
  useEffect(() => {
    textures.forEach((t, i) => {
      t.colorSpace = THREE.NoColorSpace;
      const item = normalizedImages[i];
      const zoom = Math.max(1, item.zoom ?? 1);
      const r = 1 / zoom;
      const focusY = item.focusY ?? 50;
      t.repeat.set(r, r);
      t.offset.set((1 - r) / 2, (1 - r) * (1 - focusY / 100));
      t.needsUpdate = true;
    });
  }, [textures, normalizedImages]);

  const materials = useMemo(
    () => Array.from({ length: visibleCount }, () => createClothMaterial()),
    [visibleCount],
  );

  const spatialPositions = useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < visibleCount; i++) {
      const horizontalAngle = (i * 2.618) % (Math.PI * 2); // golden angle
      const verticalAngle = (i * 1.618 + Math.PI / 3) % (Math.PI * 2);
      const horizontalRadius = (i % 3) * 1.2;
      const verticalRadius = ((i + 1) % 4) * 0.8;
      const x =
        (Math.sin(horizontalAngle) * horizontalRadius * MAX_HORIZONTAL_OFFSET) / 3;
      const y =
        (Math.cos(verticalAngle) * verticalRadius * MAX_VERTICAL_OFFSET) / 4;
      positions.push({ x: x * spread, y: y * spread });
    }
    return positions;
  }, [visibleCount, spread]);

  const totalImages = normalizedImages.length;
  const depthRange = DEFAULT_DEPTH_RANGE;

  const planesData = useRef<PlaneData[]>(
    Array.from({ length: visibleCount }, (_, i) => ({
      index: i,
      z: visibleCount > 0 ? ((depthRange / visibleCount) * i) % depthRange : 0,
      imageIndex: totalImages > 0 ? i % totalImages : 0,
      x: spatialPositions[i]?.x ?? 0,
      y: spatialPositions[i]?.y ?? 0,
    })),
  );

  useEffect(() => {
    planesData.current = Array.from({ length: visibleCount }, (_, i) => ({
      index: i,
      z:
        visibleCount > 0
          ? ((depthRange / Math.max(visibleCount, 1)) * i) % depthRange
          : 0,
      imageIndex: totalImages > 0 ? i % totalImages : 0,
      x: spatialPositions[i]?.x ?? 0,
      y: spatialPositions[i]?.y ?? 0,
    }));
  }, [depthRange, spatialPositions, totalImages, visibleCount]);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      setScrollVelocity((prev) => prev + event.deltaY * 0.01 * speed);
      setAutoPlay(false);
      lastInteraction.current = Date.now();
    },
    [speed],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        setScrollVelocity((prev) => prev - 2 * speed);
        setAutoPlay(false);
        lastInteraction.current = Date.now();
      } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        setScrollVelocity((prev) => prev + 2 * speed);
        setAutoPlay(false);
        lastInteraction.current = Date.now();
      }
    },
    [speed],
  );

  useEffect(() => {
    // When embedded in a scrolling page, don't hijack the wheel or the
    // arrow keys — the section rides its own auto-drift and lets the
    // page scroll straight through.
    if (!interactive) return;
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [interactive, handleWheel, handleKeyDown]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastInteraction.current > 3000) setAutoPlay(true);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Expose a push() so a parent can drive the tunnel from scroll (pin +
  // scrub) — same velocity model as the wheel, just fed externally.
  useEffect(() => {
    if (!driveRef) return;
    driveRef.current = (deltaVelocity: number) => {
      setScrollVelocity((prev) => prev + deltaVelocity);
      setAutoPlay(false);
      lastInteraction.current = Date.now();
    };
    return () => {
      driveRef.current = null;
    };
  }, [driveRef]);

  useFrame((state, delta) => {
    if (autoPlay) setScrollVelocity((prev) => prev + autoSpeed * delta);
    setScrollVelocity((prev) => prev * 0.95); // damping

    const time = state.clock.getElapsedTime();
    materials.forEach((material) => {
      if (material?.uniforms) {
        material.uniforms.time.value = time;
        material.uniforms.scrollForce.value = scrollVelocity;
      }
    });

    const imageAdvance =
      totalImages > 0 ? visibleCount % totalImages || totalImages : 0;
    const totalRange = depthRange;

    // Where a plate sits centred and is treated as in-focus: the middle
    // of the opaque plateau by default, so the centred plate is fully lit.
    const focus =
      focusAt ?? (fadeSettings.fadeIn.end + fadeSettings.fadeOut.start) / 2;

    // The dominant plate = the opaque one closest to the focus position.
    let focalIndex = -1;
    let focalScore = -Infinity;

    planesData.current.forEach((plane, i) => {
      let newZ = plane.z + scrollVelocity * delta * 10;
      let wrapsForward = 0;
      let wrapsBackward = 0;

      if (newZ >= totalRange) {
        wrapsForward = Math.floor(newZ / totalRange);
        newZ -= totalRange * wrapsForward;
      } else if (newZ < 0) {
        wrapsBackward = Math.ceil(-newZ / totalRange);
        newZ += totalRange * wrapsBackward;
      }

      if (wrapsForward > 0 && imageAdvance > 0 && totalImages > 0) {
        plane.imageIndex =
          (plane.imageIndex + wrapsForward * imageAdvance) % totalImages;
      }
      if (wrapsBackward > 0 && imageAdvance > 0 && totalImages > 0) {
        const step = plane.imageIndex - wrapsBackward * imageAdvance;
        plane.imageIndex = ((step % totalImages) + totalImages) % totalImages;
      }

      plane.z = ((newZ % totalRange) + totalRange) % totalRange;

      const normalizedPosition = plane.z / totalRange; // 0 → 1 along the track

      // Converge to centre at the focus position, scatter away from it:
      // a plate drifts in from the scattered background, pulls to centre
      // (fully opaque there), then drifts back out and dissolves.
      const converge = Math.min(
        1,
        Math.abs(normalizedPosition - focus) / CONVERGE_RANGE,
      );
      plane.x = (spatialPositions[i]?.x ?? 0) * converge;
      plane.y = (spatialPositions[i]?.y ?? 0) * converge;

      // opacity from the fade window
      let opacity = 1;
      if (
        normalizedPosition >= fadeSettings.fadeIn.start &&
        normalizedPosition <= fadeSettings.fadeIn.end
      ) {
        opacity =
          (normalizedPosition - fadeSettings.fadeIn.start) /
          (fadeSettings.fadeIn.end - fadeSettings.fadeIn.start);
      } else if (normalizedPosition < fadeSettings.fadeIn.start) {
        opacity = 0;
      } else if (
        normalizedPosition >= fadeSettings.fadeOut.start &&
        normalizedPosition <= fadeSettings.fadeOut.end
      ) {
        opacity =
          1 -
          (normalizedPosition - fadeSettings.fadeOut.start) /
            (fadeSettings.fadeOut.end - fadeSettings.fadeOut.start);
      } else if (normalizedPosition > fadeSettings.fadeOut.end) {
        opacity = 0;
      }
      opacity = Math.max(0, Math.min(1, opacity));

      const proximity = -Math.abs(normalizedPosition - focus);
      if (opacity > 0.5 && proximity > focalScore) {
        focalScore = proximity;
        focalIndex = plane.imageIndex;
      }

      // blur from the blur window
      let blur = 0;
      if (
        normalizedPosition >= blurSettings.blurIn.start &&
        normalizedPosition <= blurSettings.blurIn.end
      ) {
        const p =
          (normalizedPosition - blurSettings.blurIn.start) /
          (blurSettings.blurIn.end - blurSettings.blurIn.start);
        blur = blurSettings.maxBlur * (1 - p);
      } else if (normalizedPosition < blurSettings.blurIn.start) {
        blur = blurSettings.maxBlur;
      } else if (
        normalizedPosition >= blurSettings.blurOut.start &&
        normalizedPosition <= blurSettings.blurOut.end
      ) {
        const p =
          (normalizedPosition - blurSettings.blurOut.start) /
          (blurSettings.blurOut.end - blurSettings.blurOut.start);
        blur = blurSettings.maxBlur * p;
      } else if (normalizedPosition > blurSettings.blurOut.end) {
        blur = blurSettings.maxBlur;
      }
      blur = Math.max(0, Math.min(blurSettings.maxBlur, blur));

      const material = materials[i];
      if (material?.uniforms) {
        material.uniforms.opacity.value = opacity;
        material.uniforms.blurAmount.value = blur;
      }
    });

    if (focalIndex >= 0 && focalIndex !== lastFocus.current) {
      lastFocus.current = focalIndex;
      onFocus?.(focalIndex);
    }
  });

  if (normalizedImages.length === 0) return null;

  return (
    <>
      {planesData.current.map((plane, i) => {
        const texture = textures[plane.imageIndex];
        const material = materials[i];
        if (!texture || !material) return null;

        const worldZ = plane.z - depthRange / 2;
        const img = texture.image as { width: number; height: number } | undefined;
        const aspect = img ? img.width / img.height : 1;
        const base: [number, number, number] =
          aspect > 1 ? [2 * aspect, 2, 1] : [2, 2 / aspect, 1];
        const scale: [number, number, number] = [
          base[0] * size,
          base[1] * size,
          1,
        ];

        return (
          <ImagePlane
            key={plane.index}
            texture={texture}
            position={[plane.x, plane.y, worldZ]}
            scale={scale}
            material={material}
          />
        );
      })}
    </>
  );
}

/** No-WebGL fallback — a plain cropped contact sheet of the plates. */
function FallbackGallery({ images }: { images: ImageItem[] }) {
  const normalized = useMemo(() => images.map(normalize), [images]);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      <div className="grid max-h-full grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3">
        {normalized.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={img.src}
            alt={img.alt ?? ""}
            className="h-40 w-full rounded object-cover"
          />
        ))}
      </div>
    </div>
  );
}

export default function InfiniteGallery({
  images,
  speed = 1,
  autoSpeed = 0.3,
  visibleCount = 8,
  spread = 1,
  size = 1,
  interactive = true,
  focusAt,
  onFocus,
  driveRef,
  className = "h-96 w-full",
  style,
  fadeSettings = {
    fadeIn: { start: 0.05, end: 0.25 },
    fadeOut: { start: 0.4, end: 0.43 },
  },
  blurSettings = {
    blurIn: { start: 0.0, end: 0.1 },
    blurOut: { start: 0.4, end: 0.43 },
    maxBlur: 8.0,
  },
}: InfiniteGalleryProps) {
  const [webglSupported, setWebglSupported] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Freeze the render loop while the section is scrolled out of view so
  // an embedded gallery doesn't keep the GPU spinning off-screen.
  const [inView, setInView] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!webglSupported) {
    return (
      <div className={className} style={style}>
        <FallbackGallery images={images} />
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={className} style={style}>
      {/* `flat` + `linear` disable tone-mapping and colour management so
          the plates render as the raw photo, not a graded version.
          `frameloop` parks the render loop when scrolled out of view. */}
      <Canvas
        flat
        linear
        frameloop={inView ? "always" : "never"}
        camera={{ position: [0, 0, 0], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <GalleryScene
            images={images}
            speed={speed}
            autoSpeed={autoSpeed}
            visibleCount={visibleCount}
            spread={spread}
            size={size}
            interactive={interactive}
            focusAt={focusAt}
            onFocus={onFocus}
            driveRef={driveRef}
            fadeSettings={fadeSettings}
            blurSettings={blurSettings}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export type { ImageItem, InfiniteGalleryProps };
