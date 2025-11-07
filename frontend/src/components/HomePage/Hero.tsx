import heroImage from "@/assets/hero-car.jpg";

const Hero = () => {
  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-30 pt-20">
        <div className="max-w-4xl">
          {/* Tagline */}
          <div className="flex items-center space-x-3 mb-6 animate-fade-in">
            <div className="w-12 h-0.5 bg-orange-600"></div>
            <p className="text-sm text-gray-200 uppercase tracking-wider dark:text-white">
              Discover the passion and expertise behind DriveCare
            </p>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-200 mb-8 leading-tight animate-fade-in-up font-heading">
            TOP-QUALITY SERVICE
            <br />
            <span className="text-gray-200">FOR YOUR VEHICLE</span>
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 animate-fade-in-up-delay">
            <button 
              onClick={scrollToAbout}
              className="px-8 py-4 bg-orange-600 text-gray-100 font-semibold rounded-md hover:bg-orange-700 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,87,51,0.4)]"
            >
              LEARN MORE
            </button>
            {/* <button className="px-8 py-4 bg-transparent border-2 border-white/20 text-gray-200 font-semibold rounded-md hover:border-orange-700 hover:text-orange-700 transition-all duration-300">
              LEARN MORE
            </button> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
