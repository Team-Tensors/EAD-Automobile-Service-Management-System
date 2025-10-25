import Navbar from "@/components/Navbar/Narbar";
import Hero from "@/components/HomePage/Hero";
import Features from "@/components/HomePage/Features";
import Services from "@/components/HomePage/Services";
import Footer from "@/components/Footer/Footer";
import ContactUs from "@/components/HomePage/ContactUs";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#131212]">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Services />
        <ContactUs />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;