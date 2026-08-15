import Footer from "@/components/Footer";
import LineSilhouette from "@/components/variants/line/LineSilhouette";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/variants/dither/Hero";
import Manifesto from "@/components/variants/heat/Manifesto";
import { getReleaseDate } from "@/lib/site";

/**
 * Preview route — the live home with the collection section swapped for
 * the silhouette-window variant (LineSilhouette): a dancer-shaped cut
 * onto the veiled plates running as a reel. Compare against `/` (scrubbed
 * stack) and `/names` (sideways scrollee).
 */
export default function ShapePage() {
  const releaseDate = getReleaseDate();
  return (
    <div id="top" className="overflow-x-clip">
      <SmoothScroll />
      <Preloader />
      <Header releaseDate={releaseDate} />
      <main>
        <Hero />
        <Manifesto />
        <LineSilhouette releaseDate={releaseDate} />
      </main>
      <Footer />
    </div>
  );
}
