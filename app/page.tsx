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
      </div>
    </PageTransition>
  );
}
