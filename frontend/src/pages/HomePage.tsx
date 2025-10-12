import Navbar from "@/components/Navbar/Narbar";
import Hero from "@/components/HomePage/Hero";
import Features from "@/components/HomePage/Features";
import Footer from "@/components/Footer/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#1d1c1c]">
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;