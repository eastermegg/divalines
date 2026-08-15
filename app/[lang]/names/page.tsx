import Footer from "@/components/Footer";
import LineScroll from "@/components/variants/line/LineScroll";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/variants/dither/Hero";
import Manifesto from "@/components/variants/heat/Manifesto";
import { getReleaseDate } from "@/lib/site";

/**
 * Preview route — the live home with the collection section swapped for
 * the sideways-scrollee variant (LineScroll): an editorial filmstrip with
 * each piece named huge and vertical. Compare against `/` (scrubbed stack)
 * and `/shape` (silhouette window).
 */
export default function NamesPage() {
  const releaseDate = getReleaseDate();
  return (
    <div id="top" className="overflow-x-clip">
      <SmoothScroll />
      <Preloader />
      <Header releaseDate={releaseDate} />
      <main>
        <Hero />
        <Manifesto />
        <LineScroll releaseDate={releaseDate} />
      </main>
      <Footer />
    </div>
  );
}
