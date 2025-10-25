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

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  lastServiceDate?: string;
}

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

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 1,
      brand: "Toyota",
      model: "Camry",
      year: "2020",
      color: "Silver",
      licensePlate: "ABC-1234",
      lastServiceDate: "2024-09-15",
    },
    {
      id: 2,
      brand: "Honda",
      model: "Civic",
      year: "2021",
      color: "Black",
      licensePlate: "XYZ-5678",
    },
  ]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (data: VehicleFormData) => {
    setIsSubmitting(true);

    setTimeout(() => {
      if (isEditing && editingId !== null) {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === editingId
              ? {
                  ...data,
                  id: editingId,
                  lastServiceDate: data.lastServiceDate || undefined,
                }
              : v
          )
        );
      } else {
        const newVehicle: Vehicle = {
          ...data,
          id: Date.now(),
          lastServiceDate: data.lastServiceDate || undefined,
        };
        setVehicles((prev) => [...prev, newVehicle]);
      }

      setIsSubmitting(false);
      closeModal();
    }, 1000);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      licensePlate: vehicle.licensePlate,
      lastServiceDate: vehicle.lastServiceDate || "",
    });
    setEditingId(vehicle.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    }
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
