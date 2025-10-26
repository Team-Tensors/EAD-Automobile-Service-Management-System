// src/components/vehicles/VehicleFormComponent.tsx
import React, { useState } from 'react';
import { Car, Calendar, Palette, Hash } from 'lucide-react';
import FormInputField from '../ui/FormInputField';
import FormSelectField from '../ui/FormSelectField';

interface VehicleFormData {
  brand: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  lastServiceDate: string;
}

interface VehicleFormComponentProps {
  formData: VehicleFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (data: VehicleFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

const VehicleForm: React.FC<VehicleFormComponentProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  isEditing,
}) => {
  const [errors, setErrors] = useState<Partial<VehicleFormData>>({});

  const popularBrands = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Hyundai', 'Mazda', 'Other'];

  // Validation moved here
  const validate = (): boolean => {
    const newErrors: Partial<VehicleFormData> = {};

    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.year.trim()) newErrors.year = 'Year is required';
    if (!formData.color.trim()) newErrors.color = 'Color is required';
    if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';

    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(formData.year);
    if (formData.year && (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1)) {
      newErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(formData); // Pass validated data up
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <FormSelectField
          label="Brand *"
          name="brand"
          value={formData.brand}
          onChange={onChange}
          options={popularBrands}
          error={errors.brand}
          icon={<Car className="w-4 h-4 text-orange-500" />}
        />

        <FormInputField
          label="Model *"
          name="model"
          value={formData.model}
          onChange={onChange}
          placeholder="e.g., Camry, Civic, F-150"
          error={errors.model}
          icon={<Car className="w-4 h-4 text-orange-500" />}
        />

        <FormInputField
          label="Year *"
          name="year"
          value={formData.year}
          onChange={onChange}
          placeholder="e.g., 2020"
          maxLength={4}
          error={errors.year}
          icon={<Calendar className="w-4 h-4 text-orange-500" />}
        />

        <FormInputField
          label="Color *"
          name="color"
          value={formData.color}
          onChange={onChange}
          placeholder="e.g., Black, White, Silver"
          error={errors.color}
          icon={<Palette className="w-4 h-4 text-orange-500" />}
        />

        <FormInputField
          label="License Plate *"
          name="licensePlate"
          value={formData.licensePlate}
          onChange={onChange}
          placeholder="e.g., ABC-1234"
          error={errors.licensePlate}
          icon={<Hash className="w-4 h-4 text-orange-500" />}
          className="uppercase"
        />

        <FormInputField
          label="Last Service Date"
          name="lastServiceDate"
          type="date"
          value={formData.lastServiceDate}
          onChange={onChange}
          icon={<Calendar className="w-4 h-4 text-orange-500" />}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all duration-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Vehicle' : 'Add Vehicle')}
        </button>
      </div>
    </div>
  );
};

export default VehicleForm;