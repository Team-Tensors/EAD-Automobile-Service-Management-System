import React from "react";
import { Edit, Trash2, Eye } from "lucide-react";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  lastServiceDate?: string;
}

const VehicleCard: React.FC<{
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  onViewDetails?: (vehicle: Vehicle) => void;
}> = ({ vehicle, onEdit, onDelete, onViewDetails }) => {
  return (
    <div className="group bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 p-4 sm:p-6 rounded-lg hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-6 sm:w-8 h-0.5 bg-orange-500"></div>
          <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">
            {vehicle.brand}
          </p>
        </div>
        <div className="flex space-x-1.5 sm:space-x-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(vehicle)}
              className="p-1.5 sm:p-2 bg-zinc-800 rounded-lg hover:bg-blue-500 transition-all duration-300"
              title="View Details"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </button>
          )}
          <button
            onClick={() => onEdit(vehicle)}
            className="p-1.5 sm:p-2 bg-zinc-800 rounded-lg hover:bg-orange-500 transition-all duration-300"
            title="Edit"
          >
            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </button>
          <button
            onClick={() => onDelete(vehicle.id)}
            className="p-1.5 sm:p-2 bg-zinc-800 rounded-lg hover:bg-red-500 transition-all duration-300"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </button>
        </div>
      </div>

      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 truncate">
        {vehicle.model}
      </h3>

      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-400">Year:</span>
          <span className="text-white font-semibold">{vehicle.year}</span>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-400">Color:</span>
          <span className="text-white font-semibold">{vehicle.color}</span>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-400">License:</span>
          <span className="text-white font-semibold uppercase truncate ml-2">
            {vehicle.licensePlate}
          </span>
        </div>
        {vehicle.lastServiceDate && (
          <div className="flex items-center justify-between text-xs sm:text-sm pt-1.5 sm:pt-2 border-t border-zinc-800">
            <span className="text-gray-400">Last Service:</span>
            <span className="text-orange-500 font-semibold text-xs sm:text-sm">
              {new Date(vehicle.lastServiceDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
