// src/components/appointment/ScheduleStep.tsx
import React from "react";
import { Calendar, Clock, FileText, MapPin } from "lucide-react";

interface ScheduleFormData {
  serviceCenterId: string;
  appointmentDate: string;
  appointmentTime: string;
  description: string;
}

interface ServiceCenter {
  id: number;
  name: string;
  address: string;
  city: string;
}

interface ScheduleStepProps {
  formData: ScheduleFormData;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onBack: () => void;
  onSubmit: () => void;
}

// Sample service centers - replace with API call later
const serviceCenters: ServiceCenter[] = [
  {
    id: 1,
    name: "DriveCare Downtown",
    address: "123 Main Street",
    city: "Downtown",
  },
  {
    id: 2,
    name: "DriveCare North Branch",
    address: "456 North Avenue",
    city: "North City",
  },
  {
    id: 3,
    name: "DriveCare South Center",
    address: "789 South Road",
    city: "South District",
  },
  {
    id: 4,
    name: "DriveCare East Location",
    address: "321 East Boulevard",
    city: "East Side",
  },
  {
    id: 5,
    name: "DriveCare West Hub",
    address: "654 West Lane",
    city: "West End",
  },
];

const ScheduleStep: React.FC<ScheduleStepProps> = ({
  formData,
  onChange,
  onBack,
  onSubmit,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="flex items-center space-x-2 mb-3">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-white uppercase tracking-wide">
            Service Center *
          </span>
        </label>
        <select
          name="serviceCenterId"
          value={formData.serviceCenterId}
          onChange={onChange}
          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="" className="bg-zinc-800 text-gray-400">
            Select a service center
          </option>
          {serviceCenters.map((center) => (
            <option
              key={center.id}
              value={center.id}
              className="bg-zinc-800 text-white"
            >
              {center.name} - {center.address}, {center.city}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="flex items-center space-x-2 mb-3">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-white uppercase tracking-wide">
            Appointment Date *
          </span>
        </label>
        <input
          type="date"
          name="appointmentDate"
          value={formData.appointmentDate}
          onChange={onChange}
          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white"
        />
      </div>

      <div>
        <label className="flex items-center space-x-2 mb-3">
          <Clock className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-white uppercase tracking-wide">
            Preferred Time *
          </span>
        </label>
        <input
          type="time"
          name="appointmentTime"
          value={formData.appointmentTime}
          onChange={onChange}
          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white"
        />
      </div>

      <div>
        <label className="flex items-center space-x-2 mb-3">
          <FileText className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-white uppercase tracking-wide">
            Additional Notes (Optional)
          </span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          rows={4}
          placeholder="Any specific requirements or issues..."
          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 resize-none"
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={
            !formData.serviceCenterId ||
            !formData.appointmentDate ||
            !formData.appointmentTime
          }
          className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default ScheduleStep;
