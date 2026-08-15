import Footer from "@/components/Footer";
import LineGalleryWall from "@/components/variants/line/LineGalleryWall";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/variants/dither/Hero";
import Manifesto from "@/components/variants/heat/Manifesto";
import { getReleaseDate } from "@/lib/site";

/**
 * Preview route — the live home with the collection section swapped for
 * the infinite-wall variant (LineGalleryWall) so it can be compared
 * side-by-side with the scrubbed stack on `/`.
 */
export default function WallPage() {
  const releaseDate = getReleaseDate();
  return (
    <div id="top" className="overflow-x-clip">
      <SmoothScroll />
      <Preloader />
      <Header releaseDate={releaseDate} />
      <main>
        <Hero />
        <Manifesto />
        <LineGalleryWall releaseDate={releaseDate} />
      </main>
      <Footer />
    </div>
  );
}
