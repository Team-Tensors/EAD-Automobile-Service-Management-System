// src/pages/MyVehiclesDashboardPage.tsx
import React, { useState } from "react";
import { Plus } from "lucide-react";
import VehicleCardComponent from "../components/Vehicle/VehicleCard";
import VehicleFormComponent from "../components/Vehicle/VehicleForm";
import VehicleEmptyState from "../components/Vehicle/VehicleEmptyState";
import ActionModal from "../components/ui/ActionModal";
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<VehicleFormData>({
    brand: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    lastServiceDate: "",
  });

  // load vehicles from backend
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await (
          await import("../services/vehicleService")
        ).vehicleService.list();
        if (mounted) setVehicles(data || []);
      } catch (err) {
        console.error("Failed to fetch vehicles:", err);
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
    setIsSubmitting(true);
    try {
      const { vehicleService } = await import("../services/vehicleService");
      if (isEditing && editingId !== null) {
        const updated = await vehicleService.update(editingId, data);
        setVehicles((prev) =>
          prev.map((v) => (v.id === editingId ? updated : v))
        );
      } else {
        const created = await vehicleService.create(data);
        setVehicles((prev) => [...prev, created]);
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

      alert(msg);
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
      year: vehicle.year,
      color: vehicle.color,
      licensePlate: vehicle.licensePlate,
      lastServiceDate: dateOnly,
    });
    setEditingId(vehicle.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    (async () => {
      try {
        const { vehicleService } = await import("../services/vehicleService");
        await vehicleService.remove(id);
        setVehicles((prev) => prev.filter((v) => v.id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete vehicle");
      }
    })();
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
    <div className="min-h-screen bg-black flex flex-col pt-15">
      <AuthenticatedNavbar />

      {/* Header Section with proper spacing from navbar */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white">My Vehicles</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyVehiclesPage;
