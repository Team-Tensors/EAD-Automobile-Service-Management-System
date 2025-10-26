import Navbar from "@/components/Navbar/Narbar";
import Hero from "@/components/HomePage/Hero";
import Features from "@/components/HomePage/Features";
import Services from "@/components/HomePage/Services";
import Footer from "@/components/Footer/Footer";
import ContactUs from "@/components/HomePage/ContactUs";
import { SponsorLogoSlider } from "@/components/HomePage/SponsorLogoSlider"
import ServicesSlider from "@/components/HomePage/ServicesSlider"
import AboutSection from "@/components/HomePage/AboutSection";


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
  return (
    <div className="min-h-screen bg-[#000000]">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <AboutSection />
        <Services />
        <ServicesSlider />
        <ContactUs />
      </main>
      <SponsorLogoSlider logos={sponsorLogos} backgroundColor="bg-orange-600" speed={10} />
      <Footer />
    </div>
  );
};

export default HomePage;