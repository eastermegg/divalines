import type { Metadata } from "next";
import LineGallery from "@/components/variants/line/LineGallery";

/**
 * Collection proposal "/line" — "The first line" as a photographic
 * tunnel of the real close-up plates, an alternative to the wireframe
 * turntable in LookViewer. Full-screen and scroll-capturing, so it runs
 * standalone (no SmoothScroll). Not indexed while under evaluation.
 */
export const metadata: Metadata = { robots: { index: false } };

export default function LinePage() {
  return <LineGallery interactive />;
}
