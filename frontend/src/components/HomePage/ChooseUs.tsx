import React from "react"

const ChooseUs: React.FC = () => {
  const stats = [
    { label: "EXPERT TECHNICIANS", percentage: 90 },
    { label: "QUICK TURNAROUND", percentage: 85 },
    { label: "QUALITY ASSURANCE", percentage: 95 },
  ]

  return (
    <section className="relative w-full aspect-[1/1] lg:aspect-[2/1] bg-black overflow-hidden">
      {/* Orange accent bars at top */}
      <div className="absolute top-0 left-0 w-6 h-6 bg-orange-600"></div>
      {/* <div className="absolute top-0 right-0 w-6 h-6 bg-orange-600"></div> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center h-[calc(100%-40px)]">
        {/* Left Content */}
        <div className="px-8 md:px-12 lg:pl-30 py-16 lg:py-0">
          {/* Accent line with text */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 bg-orange-600"></div>
            <p className="text-gray-400 text-sm font-semibold tracking-wide">
              DISCOVER THE DRIVECARE ADVANTAGE
            </p>
          </div>

          {/* Main heading */}
          <h2 className="text-5xl md:text-4xl font-bold text-white mb-8 leading-tight text-balance font-heading">
            WHY CHOOSE DRIVECARE?
          </h2>

          {/* Description */}
          <p className="text-gray-700 text-base leading-relaxed mb-12 max-w-full">
            At DriveCare, we prioritize your vehicle&apos;s performance and your satisfaction. 
            Our expert team delivers top-quality service using the latest technology and 
            industry best practices. We offer comprehensive automotive care, from routine 
            maintenance to complex repairs, ensuring your car runs smoothly and efficiently.
          </p>

          {/* Stats */}
          <div className="space-y-8">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white font-semibold text-sm tracking-wide">
                    {stat.label}
                  </span>
                  <span className="text-white font-bold text-lg">
                    {stat.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Image/Video */}
        <div className="relative h-full">
          {/* Orange gradient overlay */}
          {/* <div className="absolute inset-0 bg-gradient-to-l from-orange-600/40 to-transparent z-10"></div> */}

        {/* Video */}
        <video
          src="/carvideo1.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        ></video>

          {/* Orange accent bars at bottom right */}
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-orange-600 z-20"></div>
        </div>
      </div>
    </section>
  )
}

export default ChooseUs
