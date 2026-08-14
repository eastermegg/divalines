import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/variants/liquid/Hero";
import Manifesto from "@/components/variants/liquid/Manifesto";
import { getReleaseDate } from "@/lib/site";

/** Design proposal V2 "Liquid" — not indexed while under evaluation. */
export const metadata: Metadata = { robots: { index: false } };

export default function LiquidPage() {
  const releaseDate = getReleaseDate();
  return (
    <div id="top" className="overflow-x-clip">
      {/* floatier, inertia-heavy scroll */}
      <SmoothScroll lerp={0.06} />
      <Preloader />
      <Header releaseDate={releaseDate} />
      <main>
        <Hero />
        <Manifesto />
      </main>
      <Footer />
    </div>
  );
}
