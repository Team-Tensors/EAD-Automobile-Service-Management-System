import React from "react";
import { Car, Plus, ChevronRight } from "lucide-react";
import type { Vehicle } from "../../types/vehicle";

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
  onAddVehicle: () => void;
  onNext: () => void;
  canProceed: boolean;
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onAddVehicle,
  onNext,
  canProceed,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="flex items-center space-x-2 mb-3">
          <Car className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-white uppercase tracking-wide">
            Select Vehicle *
          </span>
        </label>

        {vehicles.length === 0 ? (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 text-center">
            <Car className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">No vehicles added yet</p>
            <button
              onClick={onAddVehicle}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Vehicle</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => onSelectVehicle(vehicle.id.toString())}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${
                    selectedVehicleId === vehicle.id.toString()
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-orange-500/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {vehicle.year} • {vehicle.licensePlate}
                      </p>
                    </div>
                    {selectedVehicleId === vehicle.id.toString() && (
                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <ChevronRight className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={onAddVehicle}
              className="w-full p-3 border-2 border-dashed border-zinc-700 rounded-lg text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Vehicle</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default VehicleSelector;
