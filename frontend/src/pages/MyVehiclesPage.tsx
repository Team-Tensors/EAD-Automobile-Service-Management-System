import React, { useState } from "react";
import { Plus, Car } from "lucide-react";
import toast from "react-hot-toast";
import VehicleCardComponent from "../components/Vehicle/VehicleCard";
import VehicleFormComponent from "../components/Vehicle/VehicleForm";
import VehicleEmptyState from "../components/Vehicle/VehicleEmptyState";
import ActionModal from "../components/ui/ActionModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import AuthenticatedNavbar from "@/components/Navbar/AuthenticatedNavbar";
import Footer from "@/components/Footer/Footer";
import { useAuth } from "@/hooks/useAuth";

import type { Vehicle } from "../types/vehicle";

interface VehicleFormData {
  brand: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  lastServiceDate: string;
}

const MyVehiclesPage = () => {
  useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<VehicleFormData>({
    brand: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    lastServiceDate: "",
  });

  
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await (
          await import("../services/vehicleService")
        ).vehicleService.list();
        if (mounted) setVehicles(data || []);
      } catch (err) {
        console.error("Failed to fetch vehicles:", err);
        if (mounted) {
          toast.error("Failed to load vehicles. Please refresh the page.");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (data: VehicleFormData) => {
    
    const normalizedLicensePlate = data.licensePlate.trim().toUpperCase();
    const isDuplicate = vehicles.some(
      (v) =>
        v.licensePlate.toUpperCase() === normalizedLicensePlate &&
        v.id !== editingId 
    );

    if (isDuplicate) {
      toast.error(
        `A vehicle with license plate "${data.licensePlate}" already exists!`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const { vehicleService } = await import("../services/vehicleService");

      // Convert year from string to number for the API
      const vehicleData = {
        ...data,
        year: parseInt(data.year, 10),
      };

      if (isEditing && editingId !== null) {
        const updated = await vehicleService.update(editingId, vehicleData);
        setVehicles((prev) =>
          prev.map((v) => (v.id === editingId ? updated : v))
        );
        toast.success("Vehicle updated successfully!");
      } else {
        const created = await vehicleService.create(vehicleData);
        setVehicles((prev) => [...prev, created]);
        toast.success("Vehicle added successfully!");
      }
      closeModal();
    } catch (err: unknown) {
      console.error("Vehicle save error:", err);

      // Extract meaningful error message
      let msg = "Failed to save vehicle";
      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === "object" && err !== null) {
        // Handle axios error structure
        const axiosErr = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        if (axiosErr.response?.data?.message) {
          msg = axiosErr.response.data.message;
        } else if (axiosErr.message) {
          msg = axiosErr.message;
        }
      }

      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    const dateOnly = vehicle.lastServiceDate
      ? new Date(vehicle.lastServiceDate).toISOString().slice(0, 10)
      : "";
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year.toString(), 
      color: vehicle.color,
      licensePlate: vehicle.licensePlate,
      lastServiceDate: dateOnly,
    });
    setEditingId(vehicle.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setVehicleToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (vehicleToDelete === null) return;

    const vehicleIdToDelete = vehicleToDelete;

    const deletePromise = (async () => {
      const { vehicleService } = await import("../services/vehicleService");
      await vehicleService.remove(vehicleIdToDelete);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleIdToDelete));
    })();

    toast.promise(deletePromise, {
      loading: "Deleting vehicle...",
      success: () => {
        setVehicleToDelete(null);
        return "Vehicle deleted successfully!";
      },
      error: (err) => {
        console.error(err);
        setVehicleToDelete(null);
        return "Failed to delete vehicle";
      },
    });
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      brand: "",
      model: "",
      year: "",
      color: "",
      licensePlate: "",
      lastServiceDate: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      brand: "",
      model: "",
      year: "",
      color: "",
      licensePlate: "",
      lastServiceDate: "",
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col pt-5">
      <AuthenticatedNavbar />

      <div className="bg-black border-zinc-700 border-b">
        <div className="max-w-7xl mx-auto px-0 pt-26 pb-8">
          <h1 className="text-3xl font-bold text-white">My Vehicles</h1>
          <p className="text-gray-400 mt-2">
            View and manage your service vehicles
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Loading State */}
          {isLoading ? (
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
                <p className="text-zinc-400 text-sm">Loading vehicles...</p>
              </div>
            </div>
          ) : (
            <>
              {vehicles.length > 0 && (
                <div className="mb-8">
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Vehicle</span>
                  </button>
                </div>
              )}

              {vehicles.length === 0 ? (
                <VehicleEmptyState onAddClick={openAddModal} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vehicles.map((vehicle) => (
                    <VehicleCardComponent
                      key={vehicle.id}
                      vehicle={vehicle}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          <ActionModal
            isOpen={isModalOpen}
            onClose={closeModal}
            title={isEditing ? "Edit Vehicle" : "Add New Vehicle"}
          >
            <VehicleFormComponent
              formData={formData}
              onChange={handleChange}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
              isSubmitting={isSubmitting}
              isEditing={isEditing}
            />
          </ActionModal>

          <ConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={confirmDelete}
            title="Delete Vehicle"
            message="Are you sure you want to delete this vehicle? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            isDestructive={true}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyVehiclesPage;
