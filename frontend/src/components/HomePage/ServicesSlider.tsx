import React, { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Wrench, Droplet, Zap, Gauge, Flame, Disc3 } from "lucide-react"

interface Service {
  id: number
  title: string
  badge: string
  description: string
  image: string
  icon: React.ReactNode
}

const services: Service[] = [
  {
    id: 1,
    title: "SYSTEM REPAIR",
    badge: "DIAGNOSTICS",
    description:
      "Complete diagnostic and repair services for all vehicle systems. Our expert technicians use advanced equipment to identify and fix any issues with your car's electronic and mechanical systems.",
  image: "/services/service1.jpg",
    icon: <Wrench size={32} className="text-white" />,
  },
  {
    id: 2,
    title: "RADIATOR SERVICE",
    badge: "MAINTENANCE",
    description:
      "Professional radiator maintenance and repair to keep your engine cool. We provide radiator flushing, leak repairs, and coolant system checks to prevent overheating and ensure optimal performance.",
  image: "/services/service2.jpg",
    icon: <Gauge size={32} className="text-white" />,
  },
  {
    id: 3,
    title: "BRAKE REPAIR",
    badge: "REPAIR",
    description:
      "Expert brake repair and replacement services for your safety. From brake pad replacement to complete brake system overhauls, we ensure your vehicle stops reliably every time.",
  image: "/services/service3.jpg",
    icon: <Disc3 size={32} className="text-white" />,
  },
  {
    id: 4,
    title: "BATTERY REPAIR",
    badge: "MAINTENANCE",
    description:
      "Battery testing, maintenance, and replacement services. We diagnose battery issues, clean terminals, check charging systems, and install new batteries to keep your vehicle starting strong.",
  image: "/services/service4.jpg",
    icon: <Zap size={32} className="text-white" />,
  },
  {
    id: 5,
    title: "OIL CHANGE",
    badge: "REPAIR",
    description:
      "Quick and professional oil change services to extend engine life. We use quality oil and filters, check fluid levels, and perform multi-point inspections to keep your engine running smoothly.",
  image: "/services/service5.jpg",
    icon: <Droplet size={32} className="text-white" />,
  },
  {
    id: 6,
    title: "SYSTEM REPAIR",
    badge: "REPAIR",
    description:
      "Comprehensive repair services for exhaust, fuel, and ignition systems. Our certified mechanics handle everything from minor adjustments to major system repairs with precision and care.",
  image: "/services/service6.jpg",
    icon: <Flame size={32} className="text-white" />,
  },
]

export default function ServicesSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? services.length - 3 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === services.length - 3 ? 0 : prev + 1))
  }

  const visibleServices = services.slice(currentIndex, currentIndex + 3)

  return (
    <section className="w-full bg-black pt-10 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {visibleServices.map((service) => (
            <div
              key={service.id}
              className="group bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 hover:border-orange-600 transition-all duration-300"
            >
              {/* Card Header with Icon and Badge */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={service.image || "/placeholder.svg"}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                <div className="absolute top-4 left-4 bg-orange-600 p-3 rounded">{service.icon}</div>
                <div className="absolute top-4 right-4 bg-neutral-800/80 px-3 py-1 rounded text-xs font-semibold text-white tracking-wider">
                  {service.badge}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-orange-600 rounded-full" />
                  <h3 className="text-lg font-bold text-white tracking-wide">{service.title}</h3>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3">{service.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-start gap-4">
          <button
            onClick={goToPrevious}
            className="flex items-center justify-center w-12 h-12 border-2 border-orange-600 text-orange-600 rounded hover:bg-orange-600 hover:text-white transition-all duration-300"
            aria-label="Previous services"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="flex items-center justify-center w-12 h-12 border-2 border-orange-600 text-orange-600 rounded hover:bg-orange-600 hover:text-white transition-all duration-300"
            aria-label="Next services"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  )
}
