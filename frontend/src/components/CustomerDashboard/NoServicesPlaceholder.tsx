import { Link } from "react-router-dom";
import { FaOilCan, FaCar, FaFilm, FaVolumeUp } from "react-icons/fa"; // Icons for service types

const NoServicesPlaceholder = () => {
  const availableServices = [
    {
      category: "Regular Maintenance and Repairs",
      types: [
        {
          name: "Oil Change",
          description: "Regular engine oil change with oil filter replacement",
          icon: <FaOilCan className="text-orange-500 text-3xl" />,
        },
        {
          name: "Full Service",
          description: "Complete vehicle inspection and maintenance service",
          icon: <FaCar className="text-orange-500 text-2xl" />,
        },
      ],
    },
    {
      category: "Modifications",
      types: [
        {
          name: "Window Tinting",
          description: "Professional window tinting for all vehicle windows",
          icon: <FaFilm className="text-orange-500 text-xl" />,
        },
        {
          name: "Audio System Installation",
          description: "Premium audio system installation with speakers and subwoofer",
          icon: <FaVolumeUp className="text-orange-500 text-xl" />,
        },
      ],
    },
  ];

  return (
    <div className="py-16 px-0">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold bg-orange-500 bg-clip-text text-transparent animate-pulse">
          Get Started with Your Vehicle Services!
        </h2>
        <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
          You haven't added any services yet. Explore our premium offerings below to keep your vehicle in top shape or customize it to your style!
        </p>
      </div>

      {/* Services Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {availableServices.map((service, index) => (
          <div
            key={index}
            className="bg-zinc-900/80 p-6 rounded-xl shadow-lg border border-zinc-800 hover:shadow-xl hover:scale-102 transition-transform"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="bg-orange-500 h-2 w-2 rounded-full"></span>
              {service.category}
            </h3>
            <ul className="space-y-6">
              {service.types.map((type, typeIndex) => (
                <li
                  key={typeIndex}
                  className="flex items-start gap-4 group p-4 rounded-lg transition-colors duration-200"
                >
                  <div className="mt-1">
                    {type.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-orange-500">
                      {type.name}
                    </h4>
                    <p className="text-gray-300 text-sm">{type.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <Link
          to="/my-appointments"
          className="inline-block bg-orange-500 rounded-lg text-white font-semibold py-3 px-6"
        >
          Explore All Services
        </Link>
      </div>
    </div>
  );
};

export default NoServicesPlaceholder;