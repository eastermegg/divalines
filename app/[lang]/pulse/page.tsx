import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/variants/pulse/Hero";
import Manifesto from "@/components/variants/pulse/Manifesto";
import Marquee from "@/components/variants/pulse/Marquee";
import { getReleaseDate } from "@/lib/site";

/** Design proposal V3 "Night Pulse" — not indexed while under evaluation. */
export const metadata: Metadata = { robots: { index: false } };

export default function PulsePage() {
  const releaseDate = getReleaseDate();
  return (
    <div id="top" className="overflow-x-clip">
      {/* tighter, snappier scroll */}
      <SmoothScroll lerp={0.12} />
      <Preloader />
      <Header releaseDate={releaseDate} />
      <main>
        <Hero />
        <Marquee />
        <Manifesto />
      </main>
      <Footer />
    </div>
  );
}
