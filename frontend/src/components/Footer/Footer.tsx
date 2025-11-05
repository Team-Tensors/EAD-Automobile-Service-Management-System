const Footer = () => {
  const officeLocations = [
    {
      label: "Our Office:",
      address: "320A, T.B. Jayah Mawatha, Colombo 10, Sri Lanka.",
    },
  ];

  const businessHours = [
    { day: "Monday to Friday:", time: "8:00 AM - 7:00 PM" },
    { day: "Saturday/Sunday:", time: "9:00 AM - 4:00 PM" },
  ];

  return (
    <footer className="bg-[#1d1c1c] text-white py-8 px-6 md:px-8">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto">
        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Newsletter Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-wide font-heading">
              Stay Updated with DRIVECARE!
            </h3>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Subscribe to our newsletter for the latest news, exclusive offers,
              and expert tips on car care. Join our community of car enthusiasts
              and never miss out on important updates.
            </p>
            <div className="flex gap-1 max-w-md">
              <input
                type="email"
                placeholder="ENTER YOUR MAIL"
                className="flex-1 bg-black/50 border border-gray-700 px-3 py-2 text-white placeholder-gray-500 text-xs uppercase focus:outline-none focus:border-orange-500"
              />
              <button className="bg-orange-600 hover:bg-orange-700 transition-colors px-4 py-2 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99721575 L3.03521743,10.4382088 C3.03521743,10.5953061 3.19218622,10.7524035 3.50612381,10.7524035 L16.6915026,11.5378905 C16.6915026,11.5378905 17.1624089,11.5378905 17.1624089,12.0091827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Office Address Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-wide font-heading">
              Office Address
            </h3>
            <div className="space-y-4 mb-4">
              {officeLocations.map((location, index) => (
                <div key={index}>
                  <p className="text-sm">
                    <span className="text-gray-300 font-semibold">
                      {location.label}
                    </span>
                    <span className="text-gray-400 ml-2">
                      {location.address}
                    </span>
                  </p>
                </div>
              ))}
              {businessHours.map((hour, index) => (
                <div key={index} className="text-sm">
                  <span className="text-gray-300 font-semibold">
                    {hour.day}
                  </span>
                  <span className="text-gray-400 ml-2">{hour.time}</span>
                </div>
              ))}
            </div>
            {/* Copyright */}
            <p className="text-gray-500 text-sm">
              © DRIVECARE 2025. All rights reserved. Designed by{" "}
              <span className="text-orange-600 font-semibold font-heading text-xs">
                Drive <span className="text-white">Care</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
