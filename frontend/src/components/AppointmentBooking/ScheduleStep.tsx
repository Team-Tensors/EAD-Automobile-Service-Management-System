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
  serviceCenters: ServiceCenter[];
  isLoadingServiceCenters?: boolean;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const ScheduleStep: React.FC<ScheduleStepProps> = ({
  formData,
  serviceCenters,
  isLoadingServiceCenters = false,
  onChange,
  onBack,
  onSubmit,
  isSubmitting = false,
}) => {
  // Define available time slots based on day of week
  const weekdayTimeSlots = [
    { value: "08:00", label: "8:00 AM" },
    { value: "09:00", label: "9:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "13:00", label: "1:00 PM" },
    { value: "14:00", label: "2:00 PM" },
    { value: "15:00", label: "3:00 PM" },
    { value: "16:00", label: "4:00 PM" },
    { value: "17:00", label: "5:00 PM" },
    { value: "18:00", label: "6:00 PM" },
    { value: "19:00", label: "7:00 PM" },
  ];

  const weekendTimeSlots = [
    { value: "09:00", label: "9:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "13:00", label: "1:00 PM" },
    { value: "14:00", label: "2:00 PM" },
    { value: "15:00", label: "3:00 PM" },
    { value: "16:00", label: "4:00 PM" },
  ];

  // Determine which time slots to use based on selected date
  const getTimeSlots = () => {
    if (!formData.appointmentDate) return weekdayTimeSlots; // Default to weekday slots
    
    const selectedDate = new Date(formData.appointmentDate + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay(); // 0=Sunday, 6=Saturday
    
    // Weekend: Saturday (6) or Sunday (0)
    return (dayOfWeek === 0 || dayOfWeek === 6) ? weekendTimeSlots : weekdayTimeSlots;
  };

  const timeSlots = getTimeSlots();

  // Get minimum date - if it's past closing time, set minimum to tomorrow
  const now = new Date();
  const currentHour = now.getHours();
  const dayOfWeek = now.getDay(); // 0=Sunday, 6=Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Weekend closes at 4 PM (16:00), weekday closes at 7 PM (19:00)
  const closingHour = isWeekend ? 16 : 19;
  
  const minDate =
    currentHour >= closingHour
      ? new Date(now.getTime() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      : now.toISOString().split("T")[0];

  // Get maximum date - 1 month from today
  const maxDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const today = now.toISOString().split("T")[0];

  // Check if a time slot is available (not in the past)
  const isTimeSlotAvailable = (timeValue: string) => {
    if (!formData.appointmentDate) return true; // Allow all if no date selected

    const selectedDate = formData.appointmentDate;
    const isToday = selectedDate === today;

    if (!isToday) return true; // All times available for future dates

    // For today, check if the time slot has passed
    const now = new Date();
    const currentHour = now.getHours();
    const slotHour = parseInt(timeValue.split(":")[0]);

    // Add 1 hour buffer (must book at least 1 hour ahead)
    return slotHour > currentHour;
  };

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
          disabled={isLoadingServiceCenters}
          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" className="bg-zinc-800 text-gray-400">
            {isLoadingServiceCenters
              ? "Loading service centers..."
              : "Select a service center"}
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
          min={minDate}
          max={maxDate}
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
        {formData.appointmentDate && (
          <p className="text-xs text-gray-400 mb-2">
            {(() => {
              const selectedDate = new Date(formData.appointmentDate + 'T00:00:00');
              const dayOfWeek = selectedDate.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              return isWeekend 
                ? "⏰ Weekend hours: 9:00 AM - 4:00 PM"
                : "⏰ Weekday hours: 8:00 AM - 7:00 PM";
            })()}
          </p>
        )}
        <select
          name="appointmentTime"
          value={formData.appointmentTime}
          onChange={onChange}
          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="" className="bg-zinc-800 text-gray-400">
            Select a time slot
          </option>
          {timeSlots.map((slot) => {
            const isAvailable = isTimeSlotAvailable(slot.value);
            return (
              <option
                key={slot.value}
                value={slot.value}
                disabled={!isAvailable}
                className={`bg-zinc-800 ${
                  isAvailable ? "text-white" : "text-gray-500"
                }`}
              >
                {slot.label} {!isAvailable ? "(Not available)" : ""}
              </option>
            );
          })}
        </select>
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
          disabled={isSubmitting}
          className="px-8 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={
            isSubmitting ||
            !formData.serviceCenterId ||
            !formData.appointmentDate ||
            !formData.appointmentTime
          }
          className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? "Booking..." : "Book Appointment"}
        </button>
      </div>
    </div>
  );
};

export default ScheduleStep;
