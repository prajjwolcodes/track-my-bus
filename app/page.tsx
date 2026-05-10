import Navbar from "./landingpage/components/Navbar";
import Hero from "./landingpage/components/Hero";
import Features from "./landingpage/components/Features";
import HowItWorks from "./landingpage/components/HowItWorks";
import FAQ from "./landingpage/components/FAQ";
import Contact from "./landingpage/components/Contact";
import Footer from "./landingpage/components/Footer";

export default function Home() {
  return (
    <main className="text-gray-800">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}