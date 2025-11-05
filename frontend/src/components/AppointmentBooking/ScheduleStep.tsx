import React, { useEffect, useState } from "react";
import { Calendar, Clock, FileText, MapPin, Loader2 } from "lucide-react";
import { appointmentService, type TimeSlotAvailability } from "../../services/appointmentService";

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
  const [availableSlots, setAvailableSlots] = useState<TimeSlotAvailability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Fetch available slots when service center or date changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.serviceCenterId || !formData.appointmentDate) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      setSlotsError(null);

      try {
        const slots = await appointmentService.getAvailableTimeSlots(
          formData.serviceCenterId,
          formData.appointmentDate
        );
        setAvailableSlots(slots);
      } catch (error) {
        console.error("Failed to fetch available slots:", error);
        setSlotsError("Failed to load available slots");
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [formData.serviceCenterId, formData.appointmentDate]);

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
  // Get maximum date - 1 month from today
  const maxDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

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

        {/* Show loading state */}
        {loadingSlots && (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span>Loading available slots...</span>
          </div>
        )}

        {/* Show error state */}
        {slotsError && !loadingSlots && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3">
            <p className="text-sm text-red-400">{slotsError}</p>
          </div>
        )}

        {/* Show available slots grid when data is loaded */}
        {!loadingSlots && !slotsError && formData.serviceCenterId && formData.appointmentDate && availableSlots.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-3">
              Click on a time slot to select (showing available slots / total capacity)
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSlots.map((slot) => {
                const isSelected = formData.appointmentTime === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => {
                      const syntheticEvent = {
                        target: { name: "appointmentTime", value: slot.time },
                      } as React.ChangeEvent<HTMLSelectElement>;
                      onChange(syntheticEvent);
                    }}
                    className={`
                      relative p-3 rounded-lg border transition-all
                      ${isSelected
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-zinc-800/50 border-zinc-700 text-white hover:border-orange-500 hover:bg-zinc-800'
                      }
                    `}
                  >
                    <div className="text-sm font-semibold">
                      {(() => {
                        const [hour] = slot.time.split(':');
                        const h = parseInt(hour);
                        const ampm = h >= 12 ? 'PM' : 'AM';
                        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
                        return `${displayHour}:00 ${ampm}`;
                      })()}
                    </div>
                    <div className={`text-xs mt-1 ${isSelected ? 'text-orange-100' : 'text-gray-400'}`}>
                      {slot.availableSlots} available
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Show message when no slots available */}
        {!loadingSlots && !slotsError && formData.serviceCenterId && formData.appointmentDate && availableSlots.length === 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-3">
            <p className="text-sm text-yellow-400">
              No available time slots for the selected date. Please choose a different date.
            </p>
          </div>
        )}

        {/* Fallback dropdown for when slots haven't been fetched yet */}
        {!formData.serviceCenterId || !formData.appointmentDate ? (
          <select
            name="appointmentTime"
            value={formData.appointmentTime}
            onChange={onChange}
            disabled
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
          >
            <option value="">Please select service center and date first</option>
          </select>
        ) : null}
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
