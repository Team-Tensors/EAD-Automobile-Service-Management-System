import { Megaphone, Users, Car, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Linkedin, DollarSign, Settings} from "lucide-react"

const Footer = () => {
  const offerings = [
    { icon: Car, label: "DISCOVER DRIVECARE" },
    { icon: Settings, label: "OUR SERVICES" },
    { icon: DollarSign, label: "PRICING PLANS" },
    { icon: Users, label: "JOIN OUR TEAM" },
    { icon: Megaphone, label: "LATEST NEWS" },
  ]

  const contactInfo = [
    { icon: Phone, text: "+1-800-123-4567" },
    { icon: Phone, text: "+1-630-753-8513" },
    { icon: Twitter, text: "TWEET US @CARSUPPORT" },
    { icon: Mail, text: "SUPPORT@EXAMPLE.COM" },
    { icon: Mail, text: "CONTACT@EXAMPLE.COM" },
  ]

  const socialLinks = [
    { icon: Instagram, label: "Instagram" },
    { icon: Facebook, label: "Facebook" },
    { icon: Twitter, label: "Twitter" },
    { icon: Linkedin, label: "LinkedIn" },
  ]

  const officeLocations = [
    { label: "Visit Us:", address: "1234 Main St, Los Angeles, USA320A, T.B. Jayah Mawatha, Colombo 10, Sri Lanka." },
    { label: "Our Office:", address: "320A, T.B. Jayah Mawatha, Colombo 10, Sri Lanka." },
    { label: "Headquarters:", address: "145 Majeed Road, Colombo 00800, Sri Lanka." },
  ]

  const businessHours = [
    { day: "Monday to Friday:", time: "8:00 AM - 6:00 PM" },
    { day: "Saturday/Sunday:", time: "9:00 AM - 4:00 PM" },
  ]

  return (
    <footer className="bg-[#1d1c1c] text-white py-16 px-6 md:px-12">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Offers Section (spans 2 columns on large screens) with A & B side-by-side */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-8 text-white uppercase tracking-wide font-heading">
              Explore Our Full Range of Offerings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* A Section */}
              <div>
                <div className="space-y-4">
                  {offerings.map((item, index) => {
                    const IconComponent = item.icon
                    return (
                      <div
                        key={index}
                        className="relative flex items-center gap-4 p-4 bg-[#0f0e0e] border-l-4 border-orange-600 cursor-pointer group overflow-hidden"
                      >
                        {/* Hover background effect */}
                        <div className="absolute inset-0 bg-orange-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                        {/* Icon */}
                        <IconComponent className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors duration-300 relative z-10" />
                        {/* Label */}
                        <span className="font-medium tracking-wide uppercase relative z-10 group-hover:text-white transition-colors duration-300">
                          {item.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* B Section */}
              <div>
                <div className="space-y-4">
                  {contactInfo.map((item, index) => {
                    const IconComponent = item.icon
                    return (
                      <div
                        key={index}
                        className="relative flex items-center gap-4 p-4 bg-[#0f0e0e] border-l-4 border-orange-600 cursor-pointer group overflow-hidden"
                      >
                        {/* Hover background effect */}
                        <div className="absolute inset-0 bg-orange-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                        {/* Icon */}
                        <IconComponent className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors duration-300 relative z-10" />
                        {/* Label */}
                        <span className="font-medium tracking-wide uppercase relative z-10 group-hover:text-white transition-colors duration-300">
                          {item.text}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Map and Social Section */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-8 text-white uppercase tracking-wide font-heading">Connect & Locate Us</h3>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* World Map Placeholder */}
              <div className="flex-1">
                <div className="relative bg-black/50 rounded-lg overflow-hidden h-64 lg:h-80 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">World Map</p>
                  </div>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex flex-col gap-4 justify-center">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon
                  return (
                    <a
                      key={index}
                      href="#"
                      className="w-16 h-16 bg-orange-600 hover:bg-orange-700 transition-colors flex items-center justify-center rounded"
                      aria-label={social.label}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-orange-500/30 my-12"></div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Newsletter Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-wide font-heading">Stay Updated with DRIVECARE!</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Subscribe to our newsletter for the latest news, exclusive offers, and expert tips on car care. Join our
              community of car enthusiasts and never miss out on important updates.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="ENTER YOUR MAIL"
                className="flex-1 bg-black/50 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 text-sm uppercase tracking-wide focus:outline-none focus:border-orange-500"
              />
              <button className="bg-orange-600 hover:bg-orange-700 transition-colors px-6 py-3 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99721575 L3.03521743,10.4382088 C3.03521743,10.5953061 3.19218622,10.7524035 3.50612381,10.7524035 L16.6915026,11.5378905 C16.6915026,11.5378905 17.1624089,11.5378905 17.1624089,12.0091827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Office Address Section */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white uppercase tracking-wide font-heading">Office Address</h3>
            <div className="space-y-4 mb-8">
              {officeLocations.map((location, index) => (
                <div key={index}>
                  <p className="text-sm">
                    <span className="text-gray-300 font-semibold">{location.label}</span>
                    <span className="text-gray-400 ml-2">{location.address}</span>
                  </p>
                </div>
              ))}
              {businessHours.map((hour, index) => (
                <div key={index} className="text-sm">
                  <span className="text-gray-300 font-semibold">{hour.day}</span>
                  <span className="text-gray-400 ml-2">{hour.time}</span>
                </div>
              ))}
            </div>
            {/* Copyright */}
            <p className="text-gray-500 text-sm">
            © DRIVECARE 2025. All rights reserved. Designed by{" "}
            <span className="text-orange-600 font-semibold font-heading text-xs">DriveCare</span>
          </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
