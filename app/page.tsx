import Footer from "@/components/Footer";
import LookViewer from "@/components/LookViewer";
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
        <LookViewer />
      </main>
      <Footer />
    </div>
  );
}
