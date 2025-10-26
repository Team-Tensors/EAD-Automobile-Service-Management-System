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

const services: Record<string, Array<{ title: string; desc: string; details: string }>> = {
  autofix: [
    {
      title: "Brake Repair",
      desc: "Comprehensive brake inspections and repairs.",
      details: "We inspect pads, rotors and hydraulic systems; replace worn components and restore braking performance to factory standards.",
    },
    {
      title: "Engine Repair",
      desc: "Diagnostics and repair for all engine issues.",
      details: "Our technicians diagnose misfires, leaks and worn parts, perform precision repairs and validate performance with dyno/road checks.",
    },
    {
      title: "Tire Repair",
      desc: "Patching, replacement and balancing services.",
      details: "From puncture repairs to full replacements and balance/rotation — we ensure safe handling and even wear for longer tire life.",
    },
    {
      title: "AC Repair",
      desc: "Air conditioning system recharge, leak detection, and cooling fixes.",
      details: "We locate refrigerant leaks, repair components, and recharge systems so your cabin stays cool and comfortable year-round.",
    },
  ],
  maintenance: [
    {
      title: "Oil Change",
      desc: "Fast oil & filter changes with quality oil.",
      details: "Quick service using manufacturer-recommended oils and filters to protect your engine and extend service intervals.",
    },
    {
      title: "Battery Service",
      desc: "Testing and replacement of car batteries.",
      details: "We test battery health, charging system performance and replace batteries with the correct spec for reliable starts.",
    },
    {
      title: "Wheel Alignment",
      desc: "Ensure even tire wear and safe handling.",
      details: "Precision alignment corrects camber, caster and toe to improve handling, fuel economy and tire longevity.",
    },
    {
      title: "Fluid Top-Up",
      desc: "Check and refill all essential vehicle fluids.",
      details: "We inspect and top off brake, coolant, transmission and power steering fluids, plus inspect for leaks and contamination.",
    },
    {
      title: "Tire Rotation",
      desc: "Extend tire life and maintain balanced performance.",
      details: "Regular tire rotation evens tread wear and helps maintain predictable handling and braking performance.",
    },
  ],
  repair: [
    {
      title: "Transmission",
      desc: "Transmission diagnostics and rebuilds.",
      details: "We diagnose slipping, rough shifts or leaks and provide repairs from fluid service to full rebuilds depending on need.",
    },
    {
      title: "Suspension",
      desc: "Shock/strut replacement and repairs.",
      details: "Replace worn shocks, struts and bushings to restore ride comfort and vehicle stability under load and cornering.",
    },
    {
      title: "Electrical",
      desc: "Electrical system troubleshooting & repair.",
      details: "From starter/alternator issues to wiring faults and sensor failures, we locate electrical problems and repair them accurately.",
    },
    {
      title: "Exhaust System",
      desc: "Muffler, catalytic converter, and exhaust leak repairs.",
      details: "We repair leaks, replace damaged sections and ensure emissions components are functioning to reduce noise and pass inspections.",
    },
    {
      title: "Cooling System",
      desc: "Radiator, water pump, and coolant leak repairs.",
      details: "Prevent overheating with radiator service, hose and pump replacement, and coolant system flushes using recommended coolant mixes.",
    },
    {
      title: "Fuel System",
      desc: "Fuel pump, injector cleaning, and fuel filter replacement.",
      details: "We clean or replace injectors, test fuel pressure and service pumps/filters to restore proper combustion and efficiency.",
    },
    {
      title: "Steering System",
      desc: "Power steering repair and fluid service.",
      details: "Diagnose steering play or noise, repair racks/pumps and service fluids to maintain safe, responsive steering.",
    },
  ],
  diagnostics: [
    {
      title: "Check Engine",
      desc: "Full OBD-II scanning and troubleshooting.",
      details: "We read and interpret codes, perform live-data checks and fix the root cause so the driveability and emissions are restored.",
    },
    {
      title: "Emissions",
      desc: "Emissions testing and fixes to pass inspections.",
      details: "From sensor replacements to catalytic system checks, we address the causes of failed emissions tests and retest as needed.",
    },
    {
      title: "Advanced Diagnostics",
      desc: "Computerized system checks and sensor tests.",
      details: "Our advanced tools let us test modules, communication buses and sensors to rapidly pinpoint complex faults.",
    },
    {
      title: "ABS & Airbag Systems",
      desc: "Diagnostic scans and safety system troubleshooting.",
      details: "We inspect ABS and airbag fault codes, repair sensors and wiring, and verify safety systems for correct operation.",
    },
  ],
};

const Services: React.FC = () => {
  const [active, setActive] = useState(0);

  const handleClick = (index: number) => {
    setActive(index);
  };

  return (
    <section className="pt-28 pb-2 px-6 md:px-10 lg:px-24 bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-6 font-heading text-orange-700">Services</h2>

        {/* Timeline Navigation */}
        <nav className="mb-12" aria-label="Services navigation">
          <div className="flex items-center justify-between relative w-full">
            {/* Progress line background */}
            <div className="absolute top-8 left-0 right-0 h-[2px] bg-gray-700" />
            {/* Active progress line */}
            <div
              className="absolute top-8 left-0 h-[2px] bg-orange-600 transition-all duration-300"
              style={{ width: `${((active + 0.5) / tabs.length) * 100}%` }}
            />
            
            {/* Tab buttons */}
            {tabs.map((t, i) => (
              <div key={t.id} className="flex-1 flex flex-col items-center relative z-10">
                <button
                  onClick={() => handleClick(i)}
                  className={`w-10 h-10 rounded border-2 mb-3 transition-all ${
                    i === active
                      ? "bg-orange-600 border-orange-600"
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
                    i === active ? "text-orange-600" : "text-gray-400"
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
            <div className="w-1 h-6 bg-orange-600" />
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
                  <p className="text-sm text-gray-400">{s.details}</p>
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