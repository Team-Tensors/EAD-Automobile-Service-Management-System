import heroImage from "@/assets/hero-car.jpg";

const Hero = () => {
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
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-4xl">
          {/* Tagline */}
          <div className="flex items-center space-x-3 mb-6 animate-fade-in">
            <div className="w-12 h-0.5 bg-orange-500"></div>
            <p className="text-sm text-gray-400 uppercase tracking-wider">
              Discover the passion and expertise behind AutoFix
            </p>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight animate-fade-in-up">
            TOP-QUALITY SERVICE
            <br />
            <span className="text-white">FOR YOUR VEHICLE</span>
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 animate-fade-in-up-delay">
            <button className="px-8 py-4 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,87,51,0.4)]">
              GET STARTED
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white/20 text-white font-semibold rounded-md hover:border-orange-500 hover:text-orange-500 transition-all duration-300">
              LEARN MORE
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
