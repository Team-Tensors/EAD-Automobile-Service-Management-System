import { useEffect } from "react"

interface SponsorLogoSliderProps {
  logos: string[]
  backgroundColor?: string
  speed?: number // seconds for full scroll
}

export function SponsorLogoSlider({
  logos,
  backgroundColor = "bg-orange-600",
  speed = 30,
}: SponsorLogoSliderProps) {
  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [...logos, ...logos, ...logos]

  // Generate dynamic keyframes for this component
  useEffect(() => {
    const styleEl = document.createElement("style")
    styleEl.id = "sponsor-slider-styles"
    styleEl.innerHTML = `
      @keyframes sponsor-scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-33.333%); }
      }
      .sponsor-slider {
        animation: sponsor-scroll ${speed}s linear infinite;
      }
      .sponsor-slider:hover {
        animation-play-state: paused;
      }
    `
    document.head.appendChild(styleEl)
    return () => {
      document.getElementById("sponsor-slider-styles")?.remove()
    }
  }, [speed])

  return (
    <div className={`w-full ${backgroundColor} overflow-hidden py-8`}>
      <div className="flex gap-30 sponsor-slider">
        {duplicatedLogos.map((logo, index) => (
          <div
            key={index}
            className="flex-shrink-0 flex items-center justify-center min-w-max h-20"
          >
            <img
              src={logo || "/placeholder.svg"}
              alt={`Sponsor logo ${index}`}
              className="h-20 w-auto object-contain filter brightness-0"
            />
          </div>
        ))}
      </div>
    </div>
  )
}