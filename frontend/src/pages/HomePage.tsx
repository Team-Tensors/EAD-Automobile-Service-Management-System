import Navbar from "@/components/Navbar/Narbar";
import Hero from "@/components/HomePage/Hero";
import Features from "@/components/HomePage/Features";
import Services from "@/components/HomePage/Services";
import Footer from "@/components/Footer/Footer";
import FooterTop from "@/components/Footer/FooterTop";
import ContactUs from "@/components/HomePage/ContactUs";
import { SponsorLogoSlider } from "@/components/HomePage/SponsorLogoSlider"
import ServicesSlider from "@/components/HomePage/ServicesSlider"
import AboutSection from "@/components/HomePage/AboutSection";
import ChooseUs from "@/components/HomePage/ChooseUs";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";


const sponsorLogos = [
  "/companylogos/logo77.png",
  "/companylogos/logo1.png",
  "/companylogos/logo2.png",
  "/companylogos/logo3.png",
  "/companylogos/logo4.png",
  "/companylogos/logo5.png",
  // "/companylogos/logo8.png",
  "/companylogos/logo6.png",
  "/companylogos/logo9.png",
]

const HomePage = () => {
  const location = useLocation();

  // If navigated with state.scrollToId, scroll to that section on mount.
  useEffect(() => {
    const idFromState = (location.state as any)?.scrollToId;
    const hashId = window.location.hash ? window.location.hash.substring(1) : null;
    const targetId = idFromState || hashId;
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        // small timeout to allow layout/mounting to finish
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      }

      // Clear navigation state so back/forward won't keep resubmitting the scroll state
      if (idFromState) {
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-[#000000]">
      <Navbar />
      <main>
        <section id="top"><Hero /></section>
        <Features />
        <AboutSection />
        <section id="choose-us"><ChooseUs /></section>
        <section id="services"><Services /></section>
        <ServicesSlider />
        <section id="contact-us"><ContactUs /></section>
      </main>
        <SponsorLogoSlider logos={sponsorLogos} backgroundColor="bg-orange-600" speed={10} />
        <FooterTop />
        <Footer />
    </div>
  );
};

export default HomePage;