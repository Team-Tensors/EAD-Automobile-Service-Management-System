// src/pages/AppointmentBookingPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Car } from "lucide-react";
import VehicleSelector from "../components/AppointmentBooking/VehicleSelector";
import AppointmentTypeSelector from "../components/AppointmentBooking/AppointmentTypeSelector";
import ServiceTypeSelector from "../components/AppointmentBooking/ServiceTypeSelector";
import ScheduleStep from "../components/AppointmentBooking/ScheduleStep";
import StepIndicator from "../components/ui/StepIndicator";
import ActionModal from "../components/ui/ActionModal";
import VehicleFormComponent from "../components/Vehicle/VehicleForm";
import AuthenticatedNavbar from "@/components/Navbar/AuthenticatedNavbar";
import Footer from "@/components/Footer/Footer";
import { vehicleService } from "../services/vehicleService";
import type { Vehicle, VehicleCreateDto } from "../types/vehicle";
import type { AppointmentType } from "../types/appointment";
import { AppointmentTypeValues } from "../types/appointment";
import { appointmentService } from "../services/appointmentService";
import { serviceOrModificationService } from "../services/serviceOrModificationService";
import {
  serviceCenterService,
  type ServiceCenterDto,
} from "../services/serviceCenterService";

// Local interface for transformed service/modification types
interface ServiceType {
  id: string; // UUID as string
  name: string;
  description: string;
  estimatedDuration: string;
  price: number;
}

interface AppointmentFormData {
  vehicleId: string;
  appointmentType: AppointmentType | "";
  serviceTypeId: string;
  modificationTypeId: string;
  serviceCenterId: string;
  appointmentDate: string;
  appointmentTime: string;
  description: string;
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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [modificationTypes, setModificationTypes] = useState<ServiceType[]>([]);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenterDto[]>([]);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isLoadingServiceTypes, setIsLoadingServiceTypes] = useState(false);
  const [isLoadingServiceCenters, setIsLoadingServiceCenters] = useState(false);
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);

  // Helper function to format duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

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

  // Fetch vehicles on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoadingVehicles(true);
        const data = await vehicleService.list();
        setVehicles(data);
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
        toast.error("Failed to load vehicles");
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, []);

  // Fetch service types and modification types on component mount
  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        setIsLoadingServiceTypes(true);
        const [services, modifications] = await Promise.all([
          serviceOrModificationService.getServices(),
          serviceOrModificationService.getModifications(),
        ]);

        // Transform backend data to match frontend interface
        const transformedServices = services.map((service) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          estimatedDuration: service.estimatedTimeMinutes
            ? formatDuration(service.estimatedTimeMinutes)
            : "N/A",
          price: service.estimatedCost,
        }));

        const transformedModifications = modifications.map((mod) => ({
          id: mod.id,
          name: mod.name,
          description: mod.description,
          estimatedDuration: mod.estimatedTimeMinutes
            ? formatDuration(mod.estimatedTimeMinutes)
            : "N/A",
          price: mod.estimatedCost,
        }));

        setServiceTypes(transformedServices);
        setModificationTypes(transformedModifications);
      } catch (error) {
        console.error("Failed to fetch service types:", error);
        toast.error("Failed to load service types");
      } finally {
        setIsLoadingServiceTypes(false);
      }
    };

    fetchServiceTypes();
  }, []);

  // Fetch service centers on component mount
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

    fetchServiceCenters();
  }, []);

  const handleVehicleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setVehicleFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVehicleFormSubmit = async (vehicleData: VehicleFormData) => {
    // Check for duplicate license plate
    const isDuplicate = vehicles.some(
      (v) =>
        v.licensePlate.toLowerCase() === vehicleData.licensePlate.toLowerCase()
    );

    if (isDuplicate) {
      toast.error("A vehicle with this license plate already exists");
      return;
    }

    setIsSubmittingVehicle(true);

    const createDto: VehicleCreateDto = {
      brand: vehicleData.brand,
      model: vehicleData.model,
      year: parseInt(vehicleData.year, 10), // Convert string to number
      color: vehicleData.color,
      licensePlate: vehicleData.licensePlate,
      lastServiceDate: vehicleData.lastServiceDate || undefined,
    };

    const createPromise = vehicleService
      .create(createDto)
      .then((newVehicle) => {
        setVehicles((prev) => [...prev, newVehicle]);
        setFormData((prev) => ({
          ...prev,
          vehicleId: newVehicle.id, // UUID is already a string
        }));
        setVehicleFormData({
          brand: "",
          model: "",
          year: "",
          color: "",
          licensePlate: "",
          lastServiceDate: "",
        });
        setIsVehicleModalOpen(false);
        setIsSubmittingVehicle(false);
        return newVehicle;
      });

    toast.promise(createPromise, {
      loading: "Adding vehicle...",
      success: "Vehicle added successfully!",
      error: (err) => {
        console.error(err);
        setIsSubmittingVehicle(false);
        return "Failed to add vehicle";
      },
    });
  };

  const handleSubmit = async () => {
    if (isSubmittingAppointment) return;

    // Validate required fields
    if (
      !formData.vehicleId ||
      !formData.appointmentType ||
      !formData.appointmentDate ||
      !formData.appointmentTime ||
      !formData.serviceCenterId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Get the service/modification ID based on appointment type
    const serviceOrModificationId =
      formData.appointmentType === AppointmentTypeValues.SERVICE
        ? formData.serviceTypeId
        : formData.modificationTypeId;

    if (!serviceOrModificationId) {
      toast.error("Please select a service or modification type");
      return;
    }

    setIsSubmittingAppointment(true);

    // Combine date and time into ISO format for backend
    const appointmentDateTime = `${formData.appointmentDate}T${formData.appointmentTime}:00`;

    const appointmentRequest = {
      vehicleId: formData.vehicleId, // UUID as string
      serviceOrModificationId: serviceOrModificationId, // UUID as string
      serviceCenterId: formData.serviceCenterId, // UUID as string
      appointmentType: formData.appointmentType as AppointmentType,
      appointmentDate: appointmentDateTime,
      description: formData.description || undefined,
    };

    const bookingPromise = appointmentService
      .bookAppointment(appointmentRequest)
      .then((response) => {
        setIsSubmittingAppointment(false);
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
        // Navigate after a short delay
        setTimeout(() => {
          navigate("/my-appointments");
        }, 1500);
        return response;
      })
      .catch((error) => {
        setIsSubmittingAppointment(false);
        throw error;
      });

    toast.promise(bookingPromise, {
      loading: "Booking appointment...",
      success: (response) =>
        response.message || "Appointment booked successfully!",
      error: (err) => {
        console.error("Appointment booking error:", err);
        console.error("Error response:", err?.response);
        console.error("Error data:", err?.response?.data);

        // Try multiple ways to get the error message
        const errorMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to book appointment";

        return errorMessage;
      },
    });
  };

  const canProceedToStep2 = formData.vehicleId !== "";
  const canProceedToStep3 =
    formData.appointmentType !== "" &&
    (formData.appointmentType === AppointmentTypeValues.SERVICE
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
              <>
                {isLoadingVehicles ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <Car className="w-16 h-16 text-orange-500 animate-bounce" />
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-150"></div>
                        </div>
                      </div>
                      <p className="text-zinc-400 text-sm">
                        Loading vehicles...
                      </p>
                    </div>
                  </div>
                ) : (
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
              </>
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

                {formData.appointmentType === AppointmentTypeValues.SERVICE && (
                  <>
                    {isLoadingServiceTypes ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative">
                            <Car className="w-12 h-12 text-orange-500 animate-bounce" />
                          </div>
                          <p className="text-zinc-400 text-sm">
                            Loading service types...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ServiceTypeSelector
                        types={serviceTypes}
                        selectedId={formData.serviceTypeId}
                        onSelectType={(id) =>
                          setFormData((prev) => ({
                            ...prev,
                            serviceTypeId: id,
                          }))
                        }
                        label="Select Service Type"
                      />
                    )}
                  </>
                )}

                {formData.appointmentType ===
                  AppointmentTypeValues.MODIFICATION && (
                  <>
                    {isLoadingServiceTypes ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative">
                            <Car className="w-12 h-12 text-orange-500 animate-bounce" />
                          </div>
                          <p className="text-zinc-400 text-sm">
                            Loading modification types...
                          </p>
                        </div>
                      </div>
                    ) : (
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
                  </>
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
                onChange={(e) => {
                  const { name, value } = e.target;
                  setFormData((prev) => ({ ...prev, [name]: value }));
                }}
                onBack={() => setCurrentStep(2)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmittingAppointment}
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
