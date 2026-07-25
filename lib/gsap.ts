/**
 * Single GSAP entry point — import ONLY from "use client" components.
 * Registers every plugin once (all GSAP plugins are free since 2025).
 */
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
  // iOS toolbar collapse fires resize; don't rebuild triggers mid-scroll.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin };
