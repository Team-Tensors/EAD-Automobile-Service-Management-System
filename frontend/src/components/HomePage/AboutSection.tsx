
export default function AboutSection() {
  return (
    <section className="relative bg-black px-6 py-16 md:px-12 md:py-24 mb-5 overflow-hidden">
      {/* Right side radial glow in middle */}
      <div
        className="pointer-events-none absolute right-0 top-1/2 transform -translate-y-1/2 w-1/3 h-full opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at center right, rgba(74,31,22,0.85) 0%, rgba(74,31,22,0.6) 20%, transparent 60%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Accent label */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-6 bg-orange-600"></div>
          <p className="text-sm font-semibold tracking-wider text-gray-300">
            DISCOVER THE PASSION AND EXPERTISE BEHIND DRIVECARE
          </p>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold text-white mb-16 leading-tight text-balance font-heading">
          FROM OUR GARAGE TO YOUR DRIVEWAY: DRIVECARE'S JOURNEY TO SUPERIOR CAR CARE AND CUSTOMER SATISFACTION
        </h1>

        {/* Two column content */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Core Values */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-5 bg-orange-600"></div>
              <h2 className="text-lg font-semibold tracking-wider text-white">CORE VALUES</h2>
            </div>
            <p className="text-gray-400 leading-relaxed">
              At DriveCare, our values are the bedrock of our company. We uphold integrity in all our actions, believing
              that honesty and transparency build the foundation of trust with our customers and partners. We strive for
              excellence, constantly seeking.
            </p>
          </div>

          {/* Get to Know */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-5 bg-orange-600"></div>
              <h2 className="text-lg font-semibold tracking-wider text-white">GET TO KNOW</h2>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Our goals at DriveCare are designed to drive our continuous improvement and success. We aim to provide
              exceptional service that exceeds customer expectations, ensuring every interaction leaves a positive
              impression.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
