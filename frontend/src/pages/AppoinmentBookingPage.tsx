import React, { useState } from "react";
import { Calendar, Clock, Wrench, Car, CheckCircle } from "lucide-react";
import AuthenticatedNavbar from "@/components/Navbar/AuthenticatedNavbar";
import Footer from "@/components/Footer/Footer";

const AppointmentBookingPage: React.FC = () => {
  const [vehicleId, setVehicleId] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const serviceOptions = [
    "Full Service",
    "Oil Change",
    "Brake Inspection",
    "Tire Rotation",
    "Battery Check",
    "Air Filter Replacement",
  ];

  const timeSlots = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
  ];

  const handleBookAnotherClick = () => {
    setSubmitted(false);
    setVehicleId("");
    setServiceType("");
    setServiceDate("");
    setTimeSlot("");
  };

  const handleButtonClick = () => {
    if (vehicleId && serviceType && serviceDate && timeSlot) {
      console.log("Appointment Saved (Hardcoded): ", {
        vehicleId,
        serviceType,
        serviceDate,
        timeSlot,
      });
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <AuthenticatedNavbar />
        <div className="flex items-center justify-center p-4 py-12">
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg shadow-lg p-8 max-w-md w-full border border-zinc-800 hover:border-orange-500/50 transition-all duration-300">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-orange-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            Appointment Confirmed!
          </h2>
          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-3 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
              <Car className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Vehicle Number</p>
                <p className="text-lg font-semibold text-white mt-1">{vehicleId}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
              <Wrench className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Service Type</p>
                <p className="text-lg font-semibold text-white mt-1">{serviceType}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
              <Calendar className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Service Date</p>
                <p className="text-lg font-semibold text-white mt-1">{serviceDate}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
              <Clock className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Time Slot</p>
                <p className="text-lg font-semibold text-white mt-1">{timeSlot}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleBookAnotherClick}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition duration-300 shadow-lg hover:shadow-orange-500/20"
          >
            Book Another Appointment
          </button>
        </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <AuthenticatedNavbar />
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg shadow-lg p-8 border border-zinc-800 hover:border-orange-500/50 transition-all duration-300">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-0.5 bg-orange-500 mr-4"></div>
            <h2 className="text-4xl font-bold text-white">
              Book Your Service
            </h2>
            <div className="w-12 h-0.5 bg-orange-500 ml-4"></div>
          </div>
          <p className="text-center text-gray-400 mb-8">
            Schedule your vehicle maintenance appointment with ease
          </p>

          <div className="space-y-6">
            {/* Vehicle ID */}
            <div>
              <label className="flex items-center text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                Vehicle ID
              </label>
              <input
                type="text"
                placeholder="Enter your Vehicle ID"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-700 rounded-lg bg-zinc-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
              />
            </div>

            {/* Service Type */}
            <div>
              <label className="flex items-center text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                Service Type
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-700 rounded-lg bg-zinc-800/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
              >
                <option value="">Select a service type</option>
                {serviceOptions.map((option) => (
                  <option key={option} value={option} className="bg-zinc-900">
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Date */}
            <div>
              <label className="flex items-center text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                Service Date
              </label>
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-700 rounded-lg bg-zinc-800/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
              />
            </div>

            {/* Time Slot */}
            <div>
              <label className="flex items-center text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                Time Slot
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-700 rounded-lg bg-zinc-800/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
              >
                <option value="">Select a time slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot} className="bg-zinc-900">
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleButtonClick}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg hover:shadow-orange-500/20 transform hover:scale-105 uppercase tracking-wider"
            >
              Book Appointment
            </button>
          </div>

          <p className="text-center text-gray-500 text-xs mt-6 uppercase tracking-wider">
            You'll receive a confirmation email shortly after booking
          </p>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AppointmentBookingPage;