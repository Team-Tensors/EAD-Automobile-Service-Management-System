// src/components/AppointmentBooking/AppointmentBookingModal.tsx
import { useState, useEffect } from "react";
import VehicleSelector from "../AppointmentBooking/VehicleSelector";
import AppointmentTypeSelector from "../AppointmentBooking/AppointmentTypeSelector";
import ServiceTypeSelector from "../AppointmentBooking/ServiceTypeSelector";
import ScheduleStep from "../AppointmentBooking/ScheduleStep";
import StepIndicator from "../ui/StepIndicator";
import ActionModal from "../ui/ActionModal";
import VehicleFormComponent from "../Vehicle/VehicleForm";
import { serviceCenterService, type ServiceCenterDto } from "../../services/serviceCenterService";
import toast from "react-hot-toast";

// Sample Data (Move to API later)
const sampleVehicles = [
  {
    id: 1,
    brand: "Toyota",
    model: "Camry",
    year: "2020",
    color: "Silver",
    licensePlate: "ABC-1234",
  },
  {
    id: 2,
    brand: "Honda",
    model: "Civic",
    year: "2021",
    color: "Blue",
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
  color: string;
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

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

const AppointmentBookingModal = ({
  isOpen,
  onClose,
  onSubmitSuccess,
}: AppointmentBookingModalProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(sampleVehicles);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenterDto[]>([]);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);
  const [isLoadingServiceCenters, setIsLoadingServiceCenters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch service centers on mount
  useEffect(() => {
    const fetchServiceCenters = async () => {
      try {
        setIsLoadingServiceCenters(true);
        const centers = await serviceCenterService.getAllServiceCenters();
        setServiceCenters(centers);
      } catch (error) {
        console.error("Failed to fetch service centers:", error);
        toast.error("Failed to load service centers");
      } finally {
        setIsLoadingServiceCenters(false);
      }
    };

    if (isOpen) {
      fetchServiceCenters();
    }
  }, [isOpen]);

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
        color: vehicleData.color,
        licensePlate: vehicleData.licensePlate,
      };
      setVehicles((prev) => [...prev, newVehicle]);
      setFormData((prev) => ({
        ...prev,
        vehicleId: newVehicle.id.toString(),
      }));
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
    if (isSubmitting) return;
    
    console.log("Appointment Data:", formData);
    setIsSubmitting(true);
    // Here you would normally make an API call to save the appointment
    setTimeout(() => {
      alert("Appointment booked successfully!");
      // Reset form
      setFormData({
        vehicleId: "",
        appointmentType: "",
        serviceTypeId: "",
        modificationTypeId: "",
        serviceCenterId: "",
        appointmentDate: "",
        appointmentTime: "",
        description: "",
      });
      setCurrentStep(1);
      setIsSubmitting(false);
      onClose();
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    }, 500);
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      vehicleId: "",
      appointmentType: "",
      serviceTypeId: "",
      modificationTypeId: "",
      serviceCenterId: "",
      appointmentDate: "",
      appointmentTime: "",
      description: "",
    });
    setCurrentStep(1);
    onClose();
  };

  const canProceedToStep2 = formData.vehicleId !== "";
  const canProceedToStep3 =
    formData.appointmentType !== "" &&
    (formData.appointmentType === "SERVICE"
      ? formData.serviceTypeId !== ""
      : formData.modificationTypeId !== "");

  return (
    <>
      <ActionModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Book Appointment"
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm">
              Book your vehicle service or modification appointment in 3 easy
              steps
            </p>
          </div>

          <StepIndicator currentStep={currentStep} />

          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <VehicleSelector
                vehicles={vehicles}
                selectedVehicleId={formData.vehicleId}
                onSelectVehicle={(id: string) =>
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
                  onSelectType={(type: "SERVICE" | "MODIFICATION" | "") =>
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
                    onSelectType={(id: string) =>
                      setFormData((prev) => ({ ...prev, serviceTypeId: id }))
                    }
                    label="Select Service Type"
                  />
                )}

                {formData.appointmentType === "MODIFICATION" && (
                  <ServiceTypeSelector
                    types={modificationTypes}
                    selectedId={formData.modificationTypeId}
                    onSelectType={(id: string) =>
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
                serviceCenters={serviceCenters}
                isLoadingServiceCenters={isLoadingServiceCenters}
                onChange={(
                  e: React.ChangeEvent<
                    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                  >
                ) => {
                  const { name, value } = e.target;
                  setFormData((prev) => ({ ...prev, [name]: value }));
                }}
                onBack={() => setCurrentStep(2)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </ActionModal>

      {/* Vehicle Form Modal */}
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
    </>
  );
};

export default AppointmentBookingModal;
