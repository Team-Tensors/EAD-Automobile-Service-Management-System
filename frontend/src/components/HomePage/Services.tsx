import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const tabs = [
  { id: "autofix", label: "Autofix Services" },
  { id: "maintenance", label: "Maintenance" },
  { id: "repair", label: "Repair" },
  { id: "diagnostics", label: "Diagnostics" },
];

const services: Record<string, Array<{ title: string; desc: string }>> = {
  autofix: [
    { title: "Brake Repair", desc: "Comprehensive brake inspections and repairs." },
    { title: "Engine Repair", desc: "Diagnostics and repair for all engine issues." },
    { title: "Tire Repair", desc: "Patching, replacement and balancing services." },
    { title: "AC Repair", desc: "Air conditioning system recharge, leak detection, and cooling fixes." },
  ],
  maintenance: [
    { title: "Oil Change", desc: "Fast oil & filter changes with quality oil." },
    { title: "Battery Service", desc: "Testing and replacement of car batteries." },
    { title: "Wheel Alignment", desc: "Ensure even tire wear and safe handling." },
    { title: "Fluid Top-Up", desc: "Check and refill all essential vehicle fluids." },
    { title: "Tire Rotation", desc: "Extend tire life and maintain balanced performance." },
  ],
  repair: [
    { title: "Transmission", desc: "Transmission diagnostics and rebuilds." },
    { title: "Suspension", desc: "Shock/strut replacement and repairs." },
    { title: "Electrical", desc: "Electrical system troubleshooting & repair." },
    { title: "Exhaust System", desc: "Muffler, catalytic converter, and exhaust leak repairs." },
    { title: "Cooling System", desc: "Radiator, water pump, and coolant leak repairs." },
    { title: "Fuel System", desc: "Fuel pump, injector cleaning, and fuel filter replacement." },
    { title: "Steering System", desc: "Power steering repair and fluid service." },
  ],
  diagnostics: [
    { title: "Check Engine", desc: "Full OBD-II scanning and troubleshooting." },
    { title: "Emissions", desc: "Emissions testing and fixes to pass inspections." },
    { title: "Advanced Diagnostics", desc: "Computerized system checks and sensor tests." },
    { title: "ABS & Airbag Systems", desc: "Diagnostic scans and safety system troubleshooting." },
  ],
};

const Services: React.FC = () => {
  const [active, setActive] = useState(0);

  const handleClick = (index: number) => {
    setActive(index);
  };

  return (
    <section className="pt-28 pb-20 px-6 md:px-10 lg:px-24 bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-6 font-heading text-orange-700">Services</h2>

        {/* Timeline Navigation */}
        <nav className="mb-12" aria-label="Services navigation">
          <div className="flex items-center justify-between relative">
            {/* Progress line background */}
            <div className="absolute top-8 left-0 right-0 h-[2px] bg-gray-700" />
            {/* Active progress line */}
            <div 
              className="absolute top-8 left-0 h-[2px] bg-orange-500 transition-all duration-300"
              style={{ width: `${(active / (tabs.length - 1)) * 100}%` }}
            />
            
            {/* Tab buttons */}
            {tabs.map((t, i) => (
              <div key={t.id} className="flex flex-col items-center relative z-10">
                <button
                  onClick={() => handleClick(i)}
                  className={`w-10 h-10 rounded border-2 mb-3 transition-all ${
                    i === active
                      ? "bg-orange-500 border-orange-500"
                      : i < active
                      ? " border-gray-700"
                      : "bg-transparent border-gray-700"
                  }`}
                >
                  {i < active && (
                    <span className="text-white text-sm"></span>
                  )}
                </button>
                <span
                  className={`text-sm font-medium uppercase tracking-wider ${
                    i === active ? "text-orange-500" : "text-gray-400"
                  }`}
                >
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </nav>

        {/* Active Section ONLY */}
        <div className="min-h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-orange-500" />
            <h3 className="text-2xl font-semibold font-heading">{tabs[active].label}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services[tabs[active].id].map((s) => (
              <Card key={s.title} className="bg-[#111] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg text-white font-heading">{s.title}</CardTitle>
                  <CardDescription className="text-gray-300">{s.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">
                    At Autofix, we offer a comprehensive range of automotive
                    services to keep your vehicle running smoothly. Trust Carsy for all your car care
                    needs.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;