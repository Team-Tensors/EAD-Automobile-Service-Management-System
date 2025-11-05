import React from "react";
import { Wrench, Settings } from "lucide-react";
import type { AppointmentType } from "../../types/appointment";
import { AppointmentTypeValues } from "../../types/appointment";

interface AppointmentTypeSelectorProps {
  selectedType: AppointmentType | "";
  onSelectType: (type: AppointmentType) => void;
}

const AppointmentTypeSelector: React.FC<AppointmentTypeSelectorProps> = ({
  selectedType,
  onSelectType,
}) => {
  return (
    <div>
      <label className="flex items-center space-x-2 mb-3">
        <Settings className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-semibold text-white uppercase tracking-wide">
          Appointment Type *
        </span>
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => onSelectType(AppointmentTypeValues.SERVICE)}
          className={`cursor-pointer p-6 rounded-lg border-2 transition-all duration-300 ${
            selectedType === AppointmentTypeValues.SERVICE
              ? "border-orange-500 bg-orange-500/10"
              : "border-zinc-700 bg-zinc-800/50 hover:border-orange-500/50"
          }`}
        >
          <Wrench className="w-8 h-8 text-orange-500 mb-3" />
          <h3 className="text-white font-semibold text-lg mb-2">Service</h3>
          <p className="text-gray-400 text-sm">
            Regular maintenance and repairs
          </p>
        </div>
        <div
          onClick={() => onSelectType(AppointmentTypeValues.MODIFICATION)}
          className={`cursor-pointer p-6 rounded-lg border-2 transition-all duration-300 ${
            selectedType === AppointmentTypeValues.MODIFICATION
              ? "border-orange-500 bg-orange-500/10"
              : "border-zinc-700 bg-zinc-800/50 hover:border-orange-500/50"
          }`}
        >
          <Settings className="w-8 h-8 text-orange-500 mb-3" />
          <h3 className="text-white font-semibold text-lg mb-2">
            Modification
          </h3>
          <p className="text-gray-400 text-sm">Upgrades and customizations</p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentTypeSelector;
