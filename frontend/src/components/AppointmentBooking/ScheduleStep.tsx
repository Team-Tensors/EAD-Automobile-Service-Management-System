// src/components/appointment/ScheduleStep.tsx
import React from 'react';
import { Calendar, Clock, FileText } from 'lucide-react';

interface ScheduleFormData {
  appointmentDate: string;
  appointmentTime: string;
  description: string;
}

interface ScheduleStepProps {
  formData: ScheduleFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const ScheduleStep: React.FC<ScheduleStepProps> = ({ formData, onChange, onBack, onSubmit }) => {
  return (
    <div className="space-y-6">
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
          disabled={!formData.appointmentDate || !formData.appointmentTime}
          className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default ScheduleStep;