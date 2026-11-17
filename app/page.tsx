import About from "@/components/About";
import Contact from "@/components/Contact";
import Experience from "@/components/Experience";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Testimonials from "@/components/Testimonials";
import AsciiButterfly from "@/components/ui/AsciiButterfly";

export default function Home() {
  return (
    <PageTransition>
      <div>
        <Navbar />
        <main id="main-content">
          <Hero />
          <About />
          <Projects />
          <Testimonials />
          <Experience />
          <Skills />
          <Contact />
        </main>
        <Footer />
        {/* ASCII butterfly that flies along the wave, ring and timelines */}
        <AsciiButterfly />
      </div>
    </PageTransition>
  );
}
