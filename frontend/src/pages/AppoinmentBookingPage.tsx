// src/pages/AppointmentBookingPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VehicleSelector from "../components/AppointmentBooking/VehicleSelector";
import AppointmentTypeSelector from "../components/AppointmentBooking/AppointmentTypeSelector";
import ServiceTypeSelector from "../components/AppointmentBooking/ServiceTypeSelector";
import ScheduleStep from "../components/AppointmentBooking/ScheduleStep";
import StepIndicator from "../components/ui/StepIndicator";
import ActionModal from "../components/ui/ActionModal";
import VehicleFormComponent from "../components/Vehicle/VehicleForm";
import AuthenticatedNavbar from "@/components/Navbar/AuthenticatedNavbar";
import Footer from "@/components/Footer/Footer";

// Sample Data (Move to API later)
const sampleVehicles = [
  {
    id: 1,
    brand: "Toyota",
    model: "Camry",
    year: "2020",
    licensePlate: "ABC-1234",
  },
  {
    id: 2,
    brand: "Honda",
    model: "Civic",
    year: "2021",
    licensePlate: "XYZ-5678",
  },
];

const serviceTypes = [
  {
    id: 1,
    name: "Oil Change",
    description: "Regular engine oil and filter replacement",
    estimatedDuration: "30 mins",
    price: 50,
  },
  {
    id: 2,
    name: "Brake Service",
    description: "Brake pad replacement and system check",
    estimatedDuration: "1-2 hours",
    price: 150,
  },
  {
    id: 3,
    name: "Tire Rotation",
    description: "Rotate tires for even wear",
    estimatedDuration: "45 mins",
    price: 40,
  },
  {
    id: 4,
    name: "Full Service",
    description: "Complete vehicle inspection and service",
    estimatedDuration: "3-4 hours",
    price: 250,
  },
  {
    id: 5,
    name: "AC Service",
    description: "Air conditioning system check and recharge",
    estimatedDuration: "1 hour",
    price: 100,
  },
];

const modificationTypes = [
  {
    id: 1,
    name: "Body Kit Installation",
    description: "Custom body kit fitting",
    estimatedDuration: "1 day",
    price: 500,
  },
  {
    id: 2,
    name: "Exhaust System Upgrade",
    description: "Performance exhaust installation",
    estimatedDuration: "2-3 hours",
    price: 400,
  },
  {
    id: 3,
    name: "Window Tinting",
    description: "Professional window tint application",
    estimatedDuration: "2 hours",
    price: 200,
  },
  {
    id: 4,
    name: "Suspension Upgrade",
    description: "Performance suspension installation",
    estimatedDuration: "1 day",
    price: 800,
  },
  {
    id: 5,
    name: "Audio System Installation",
    description: "Custom audio system setup",
    estimatedDuration: "4-6 hours",
    price: 600,
  },
];

interface AppointmentFormData {
  vehicleId: string;
  appointmentType: "SERVICE" | "MODIFICATION" | "";
  serviceTypeId: string;
  modificationTypeId: string;
  serviceCenterId: string;
  appointmentDate: string;
  appointmentTime: string;
  description: string;
}

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
}

interface VehicleFormData {
  brand: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  lastServiceDate: string;
}

const AppointmentBookingPage = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>(sampleVehicles);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);

  const [formData, setFormData] = useState<AppointmentFormData>({
    vehicleId: "",
    appointmentType: "",
    serviceTypeId: "",
    modificationTypeId: "",
    serviceCenterId: "",
    appointmentDate: "",
    appointmentTime: "",
    description: "",
  });

  const [vehicleFormData, setVehicleFormData] = useState({
    brand: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    lastServiceDate: "",
  });

  const handleVehicleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setVehicleFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVehicleFormSubmit = (vehicleData: VehicleFormData) => {
    setIsSubmittingVehicle(true);

    setTimeout(() => {
      const newVehicle: Vehicle = {
        id: Date.now(),
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        licensePlate: vehicleData.licensePlate,
      };
      setVehicles((prev) => [...prev, newVehicle]);
      setFormData((prev) => ({ ...prev, vehicleId: newVehicle.id.toString() }));
      setIsSubmittingVehicle(false);
      setVehicleFormData({
        brand: "",
        model: "",
        year: "",
        color: "",
        licensePlate: "",
        lastServiceDate: "",
      });
      setIsVehicleModalOpen(false);
    }, 1000);
  };

  const handleSubmit = () => {
    console.log("Appointment Data:", formData);
    // Here you would normally make an API call to save the appointment
    // For now, we'll just simulate it and redirect
    setTimeout(() => {
      alert("Appointment booked successfully!");
      navigate("/my-appointments");
    }, 500);
  };

  const canProceedToStep2 = formData.vehicleId !== "";
  const canProceedToStep3 =
    formData.appointmentType !== "" &&
    (formData.appointmentType === "SERVICE"
      ? formData.serviceTypeId !== ""
      : formData.modificationTypeId !== "");

  return (
    <div className="min-h-screen bg-black flex flex-col pt-12">
      <AuthenticatedNavbar />

      <div className="flex-1 bg-black py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-0.5 bg-orange-500"></div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                Book Appointment
              </p>
              <div className="w-12 h-0.5 bg-orange-500"></div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Schedule Your Service
            </h1>
            <p className="text-gray-400">
              Book your vehicle service or modification appointment in 3 easy
              steps
            </p>
          </div>

          <StepIndicator currentStep={currentStep} />

          <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-lg p-8">
            {currentStep === 1 && (
              <VehicleSelector
                vehicles={vehicles}
                selectedVehicleId={formData.vehicleId}
                onSelectVehicle={(id) =>
                  setFormData((prev) => ({ ...prev, vehicleId: id }))
                }
                onAddVehicle={() => setIsVehicleModalOpen(true)}
                onNext={() => setCurrentStep(2)}
                canProceed={canProceedToStep2}
              />
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <AppointmentTypeSelector
                  selectedType={formData.appointmentType}
                  onSelectType={(type) =>
                    setFormData((prev) => ({
                      ...prev,
                      appointmentType: type,
                      serviceTypeId: "",
                      modificationTypeId: "",
                    }))
                  }
                />

                {formData.appointmentType === "SERVICE" && (
                  <ServiceTypeSelector
                    types={serviceTypes}
                    selectedId={formData.serviceTypeId}
                    onSelectType={(id) =>
                      setFormData((prev) => ({ ...prev, serviceTypeId: id }))
                    }
                    label="Select Service Type"
                  />
                )}

                {formData.appointmentType === "MODIFICATION" && (
                  <ServiceTypeSelector
                    types={modificationTypes}
                    selectedId={formData.modificationTypeId}
                    onSelectType={(id) =>
                      setFormData((prev) => ({
                        ...prev,
                        modificationTypeId: id,
                      }))
                    }
                    label="Select Modification Type"
                  />
                )}

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-8 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    disabled={!canProceedToStep3}
                    className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <ScheduleStep
                formData={formData}
                onChange={(e) => {
                  const { name, value } = e.target;
                  setFormData((prev) => ({ ...prev, [name]: value }));
                }}
                onBack={() => setCurrentStep(2)}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>

        <ActionModal
          isOpen={isVehicleModalOpen}
          onClose={() => setIsVehicleModalOpen(false)}
          title="Add New Vehicle"
        >
          <VehicleFormComponent
            formData={vehicleFormData}
            onChange={handleVehicleFormChange}
            onSubmit={handleVehicleFormSubmit}
            onCancel={() => setIsVehicleModalOpen(false)}
            isSubmitting={isSubmittingVehicle}
            isEditing={false}
          />
        </ActionModal>
      </div>

      <Footer />
    </div>
  );
};

export default AppointmentBookingPage;
