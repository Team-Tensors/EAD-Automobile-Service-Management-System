const Features = () => {
  const features = [
    {
      label: "CYLINDER CONFIGURATION",
      value: "V8",
      subtext: "Cylinder Configuration: V8",
      description: "Welcome to DriveCare, your trusted partner in car care and services.",
    },
    {
      label: "FUEL EFFICIENCY",
      value: "30",
      subtext: "Fuel Efficiency: 30 mpg",
      description: "Welcome to DriveCare, your trusted partner in car care and services.",
    },
    {
      label: "MAX REVOLUTIONS",
      value: "7K",
      subtext: "Max RPM: 7,000",
      description: "Welcome to DriveCare, your trusted partner in car care and services.",
    },
  ];

  return (
    <section className="relative z-10 -mt-32 pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 p-8 rounded-lg hover:border-orange-600/70 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10"
            >
              {/* Label */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-0.5 bg-orange-600"></div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  {feature.label}
                </p>
              </div>

              {/* Value */}
              <h3 className="text-6xl font-bold text-white/10 mb-2 group-hover:text-orange-600/20 transition-colors font-heading">
                {feature.value}
              </h3>

              {/* Subtext */}
              <p className="text-sm font-semibold text-white mb-3">
                {feature.subtext}
              </p>

              {/* Description */}
              <p className="text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;