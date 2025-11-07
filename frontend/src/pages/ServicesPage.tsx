import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wrench,
  Droplet,
  Wind,
  Gauge,
  ShieldCheck,
  Battery,
  Clock,
  Sparkles,
  Car,
  Zap,
  Paintbrush,
  Speaker,
  Sun,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthenticatedNavbar from "@/components/Navbar/AuthenticatedNavbar";
import Footer from "@/components/Footer/Footer";

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  icon: React.ReactNode;
  features: string[];
}

const ServicesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("services");

  const services: ServiceItem[] = [
    {
      id: "oil-change",
      name: "Oil Change",
      description:
        "Complete engine oil replacement with premium quality oil and filter",
      price: 2500,
      duration: 45,
      icon: <Droplet className="w-6 h-6" />,
      features: [
        "Premium synthetic or conventional oil",
        "Oil filter replacement",
        "Fluid level check",
        "Multi-point inspection",
      ],
    },
    {
      id: "brake-inspection",
      name: "Brake Inspection",
      description: "Comprehensive brake system check and maintenance",
      price: 1500,
      duration: 60,
      icon: <ShieldCheck className="w-6 h-6" />,
      features: [
        "Brake pad inspection",
        "Rotor condition check",
        "Brake fluid level",
        "ABS system diagnostic",
      ],
    },
    {
      id: "tire-rotation",
      name: "Tire Rotation",
      description: "Professional tire rotation and balancing service",
      price: 1200,
      duration: 30,
      icon: <Gauge className="w-6 h-6" />,
      features: [
        "All four tires rotated",
        "Tire pressure adjustment",
        "Tread depth check",
        "Visual inspection",
      ],
    },
    {
      id: "battery-check",
      name: "Battery Check",
      description:
        "Complete battery health assessment and charging system test",
      price: 800,
      duration: 20,
      icon: <Battery className="w-6 h-6" />,
      features: [
        "Battery voltage test",
        "Charging system check",
        "Terminal cleaning",
        "Load test",
      ],
    },
    {
      id: "ac-service",
      name: "AC Service",
      description: "Air conditioning system service and refrigerant recharge",
      price: 3500,
      duration: 90,
      icon: <Wind className="w-6 h-6" />,
      features: [
        "AC gas refill",
        "Compressor check",
        "Filter replacement",
        "Cooling performance test",
      ],
    },
    {
      id: "engine-tune",
      name: "Engine Tune-Up",
      description: "Complete engine optimization for better performance",
      price: 4500,
      duration: 120,
      icon: <Wrench className="w-6 h-6" />,
      features: [
        "Spark plug replacement",
        "Air filter change",
        "Fuel system cleaning",
        "Engine diagnostic scan",
      ],
    },
  ];

  const modifications: ServiceItem[] = [
    {
      id: "body-kit",
      name: "Body Kit Installation",
      description: "Custom body kits for enhanced aerodynamics and style",
      price: 45000,
      duration: 480,
      icon: <Car className="w-6 h-6" />,
      features: [
        "Front & rear bumpers",
        "Side skirts installation",
        "Spoiler mounting",
        "Professional fitting",
      ],
    },
    {
      id: "custom-paint",
      name: "Custom Paint Job",
      description: "Professional custom paint with protective coating",
      price: 65000,
      duration: 720,
      icon: <Paintbrush className="w-6 h-6" />,
      features: [
        "Color consultation",
        "Surface preparation",
        "Multi-coat application",
        "Ceramic coating finish",
      ],
    },
    {
      id: "performance-exhaust",
      name: "Performance Exhaust",
      description: "High-performance exhaust system upgrade",
      price: 35000,
      duration: 300,
      icon: <Zap className="w-6 h-6" />,
      features: [
        "Stainless steel construction",
        "Improved sound & power",
        "Cat-back system",
        "Professional installation",
      ],
    },
    {
      id: "audio-system",
      name: "Premium Audio System",
      description: "High-end audio system installation and tuning",
      price: 55000,
      duration: 360,
      icon: <Speaker className="w-6 h-6" />,
      features: [
        "Premium speakers",
        "Subwoofer installation",
        "Amplifier setup",
        "Sound deadening",
      ],
    },
    {
      id: "window-tinting",
      name: "Window Tinting",
      description: "Professional window tinting with UV protection",
      price: 12000,
      duration: 180,
      icon: <Sun className="w-6 h-6" />,
      features: [
        "High-quality film",
        "UV protection",
        "Heat rejection",
        "Warranty included",
      ],
    },
    {
      id: "led-upgrade",
      name: "LED Lighting Upgrade",
      description: "Complete LED lighting system conversion",
      price: 18000,
      duration: 240,
      icon: <Sparkles className="w-6 h-6" />,
      features: [
        "Headlight conversion",
        "Tail light upgrade",
        "Interior ambient lighting",
        "Underbody lights",
      ],
    },
  ];

  const ServiceCard = ({ service }: { service: ServiceItem }) => (
    <Card className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800 hover:border-orange-500/50 transition-all duration-300 h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="p-3 bg-orange-500/10 rounded-lg text-orange-500">
            {service.icon}
          </div>
        </div>
        <CardTitle className="mt-4 text-xl text-white">
          {service.name}
        </CardTitle>
        <CardDescription className="text-sm mt-2 text-gray-400">
          {service.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-3 mb-4">
          <h4 className="font-semibold text-sm text-gray-400">
            What's Included:
          </h4>
          <ul className="space-y-2">
            {service.features.map((feature, index) => (
              <li key={index} className="flex items-start text-sm">
                <ShieldCheck className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="pt-4 mt-auto">
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            onClick={() => navigate("/my-appointments/appointment-booking")}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col pt-12">
      <AuthenticatedNavbar />

      {/* Header Section */}
      <div className="bg-black border-b border-zinc-700">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-0 pt-4 sm:pt-15 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white uppercase">
                Our Services & Modifications
              </h1>
              <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
                Professional automotive care and customization by DriveCare
                experts
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-black py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Tabs Section */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-zinc-900 border border-zinc-800">
                <TabsTrigger
                  value="services"
                  className="text-base data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-400"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  Services
                </TabsTrigger>
                <TabsTrigger
                  value="modifications"
                  className="text-base data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-400"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Modifications
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="services" className="mt-0">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3 text-white">
                  Regular Maintenance Services
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Keep your vehicle running smoothly with our comprehensive
                  maintenance services. All services include a complimentary
                  multi-point inspection.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="modifications" className="mt-0">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3 text-white">
                  Custom Modifications
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Transform your vehicle with our premium modification services.
                  Each modification requires advance booking and professional
                  consultation.
                </p>
                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg max-w-2xl mx-auto">
                  <p className="text-sm text-amber-400 flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-2" />
                    All modifications require booking at least 2 days in advance
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modifications.map((modification) => (
                  <ServiceCard key={modification.id} service={modification} />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Additional Info Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <Card className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800">
              <CardHeader>
                <ShieldCheck className="w-8 h-8 text-orange-500 mb-2" />
                <CardTitle className="text-white">Quality Guaranteed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">
                  All services backed by our quality assurance and warranty
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800">
              <CardHeader>
                <Clock className="w-8 h-8 text-orange-500 mb-2" />
                <CardTitle className="text-white">
                  Flexible Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">
                  Book appointments that fit your schedule with real-time
                  availability
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800">
              <CardHeader>
                <Wrench className="w-8 h-8 text-orange-500 mb-2" />
                <CardTitle className="text-white">Expert Technicians</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">
                  Certified professionals with years of automotive experience
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServicesPage;
