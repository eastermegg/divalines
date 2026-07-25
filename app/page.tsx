import CollectionTeaser from "@/components/CollectionTeaser";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/variants/heat/Hero";
import Manifesto from "@/components/variants/heat/Manifesto";
import { getReleaseDate } from "@/lib/site";

export default function Page() {
  const releaseDate = getReleaseDate();
  return (
    <div id="top" className="overflow-x-clip">
      <SmoothScroll />
      <Preloader />
      <Header releaseDate={releaseDate} />
      <main>
        <Hero />
        <Manifesto />
        <CollectionTeaser />
      </main>
      <Footer />
    </div>
  );
}
