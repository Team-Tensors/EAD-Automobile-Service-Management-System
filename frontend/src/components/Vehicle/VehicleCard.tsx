import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  lastServiceDate?: string;
}

const VehicleCard: React.FC<{
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: number) => void;
}> = ({ vehicle, onEdit, onDelete }) => {
  return (
    <div className="group bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 p-6 rounded-lg hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-0.5 bg-orange-500"></div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            {vehicle.brand}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(vehicle)}
            className="p-2 bg-zinc-800 rounded-lg hover:bg-orange-500 transition-all duration-300"
          >
            <Edit className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => onDelete(vehicle.id)}
            className="p-2 bg-zinc-800 rounded-lg hover:bg-red-500 transition-all duration-300"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <h3 className="text-3xl font-bold text-white mb-4">
        {vehicle.model}
      </h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Year:</span>
          <span className="text-white font-semibold">{vehicle.year}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Color:</span>
          <span className="text-white font-semibold">{vehicle.color}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">License:</span>
          <span className="text-white font-semibold uppercase">{vehicle.licensePlate}</span>
        </div>
        {vehicle.lastServiceDate && (
          <div className="flex items-center justify-between text-sm pt-2 border-t border-zinc-800">
            <span className="text-gray-400">Last Service:</span>
            <span className="text-orange-500 font-semibold">
              {new Date(vehicle.lastServiceDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;