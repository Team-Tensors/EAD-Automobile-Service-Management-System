import { Megaphone, Users, Car, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Linkedin, DollarSign, Settings } from "lucide-react"

const FooterTop = () => {
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

  return (
    <div className="bg-[#1d1c1c] text-white pt-16 pb-1 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-1">
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-8 text-white uppercase tracking-wide font-heading">
              Explore Our Full Range of Offerings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="space-y-4">
                  {offerings.map((item, index) => {
                    const IconComponent = item.icon
                    return (
                      <div
                        key={index}
                        className="relative flex items-center gap-4 p-4 bg-[#0f0e0e] border-l-4 border-orange-600 cursor-pointer group overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-orange-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                        <IconComponent className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors duration-300 relative z-10" />
                        <span className="font-medium tracking-wide uppercase relative z-10 group-hover:text-white transition-colors duration-300">
                          {item.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="space-y-4">
                  {contactInfo.map((item, index) => {
                    const IconComponent = item.icon
                    return (
                      <div
                        key={index}
                        className="relative flex items-center gap-4 p-4 bg-[#0f0e0e] border-l-4 border-orange-600 cursor-pointer group overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-orange-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                        <IconComponent className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors duration-300 relative z-10" />
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

          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-8 text-white uppercase tracking-wide font-heading">Connect & Locate Us</h3>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="relative bg-black/50 rounded-lg overflow-hidden h-64 lg:h-80 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Sri Lanka Map</p>
                  </div>
                </div>
              </div>

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
      </div>
      {/* Divider (top border for the bottom/footer area) */}
      <div className="border-t border-orange-500/30 mt-16"></div>
    </div>
    
  )
}

export default FooterTop