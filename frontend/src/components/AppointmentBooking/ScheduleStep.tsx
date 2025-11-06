import React, { useEffect, useState } from "react";
import { Calendar, Clock, FileText, MapPin } from "lucide-react";
import {
  appointmentService,
  type SlotAvailability,
} from "../../services/appointmentService";
import toast from "react-hot-toast";

interface ScheduleFormData {
  serviceCenterId: string;
  appointmentDate: string;
  appointmentTime: string;
  description: string;
}

interface ServiceCenter {
  id: number; // Changed from string to number for type consistency
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
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability>(
    {}
  );
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Define available time slots based on day of week
  const weekdayTimeSlots = [
    { value: "08:00", label: "8:00 AM", hour: 8 },
    { value: "09:00", label: "9:00 AM", hour: 9 },
    { value: "10:00", label: "10:00 AM", hour: 10 },
    { value: "11:00", label: "11:00 AM", hour: 11 },
    { value: "12:00", label: "12:00 PM", hour: 12 },
    { value: "13:00", label: "1:00 PM", hour: 13 },
    { value: "14:00", label: "2:00 PM", hour: 14 },
    { value: "15:00", label: "3:00 PM", hour: 15 },
    { value: "16:00", label: "4:00 PM", hour: 16 },
    { value: "17:00", label: "5:00 PM", hour: 17 },
    { value: "18:00", label: "6:00 PM", hour: 18 },
    { value: "19:00", label: "7:00 PM", hour: 19 },
  ];

  const weekendTimeSlots = [
    { value: "09:00", label: "9:00 AM", hour: 9 },
    { value: "10:00", label: "10:00 AM", hour: 10 },
    { value: "11:00", label: "11:00 AM", hour: 11 },
    { value: "12:00", label: "12:00 PM", hour: 12 },
    { value: "13:00", label: "1:00 PM", hour: 13 },
    { value: "14:00", label: "2:00 PM", hour: 14 },
    { value: "15:00", label: "3:00 PM", hour: 15 },
    { value: "16:00", label: "4:00 PM", hour: 16 },
  ];

  // Fetch slot availability when service center or date changes
  useEffect(() => {
    const fetchSlotAvailability = async () => {
      if (!formData.serviceCenterId || !formData.appointmentDate) {
        setSlotAvailability({});
        return;
      }

      setIsLoadingSlots(true);
      try {
        const availability = await appointmentService.getAvailableSlots(
          formData.serviceCenterId,
          formData.appointmentDate
        );
        console.log("Slot availability loaded:", availability);
        setSlotAvailability(availability);
      } catch (error) {
        console.error("Failed to fetch slot availability:", error);
        toast.error("Failed to load slot availability");
        setSlotAvailability({});
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlotAvailability();
  }, [formData.serviceCenterId, formData.appointmentDate]);

  // Determine which time slots to use based on selected date
  const getTimeSlots = () => {
    if (!formData.appointmentDate) return weekdayTimeSlots;

    const selectedDate = new Date(formData.appointmentDate + "T00:00:00");
    const dayOfWeek = selectedDate.getDay();

    return dayOfWeek === 0 || dayOfWeek === 6
      ? weekendTimeSlots
      : weekdayTimeSlots;
  };

  const timeSlots = getTimeSlots();

  // Get minimum date
  const now = new Date();
  const currentHour = now.getHours();
  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
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

  // Check if a time slot is available
  const isTimeSlotAvailable = (hour: number) => {
    if (!formData.appointmentDate) return false;

    const selectedDate = formData.appointmentDate;
    const isToday = selectedDate === today;

    // Check if the time slot has passed (for today)
    if (isToday) {
      const currentHour = now.getHours();
      if (hour <= currentHour) return false;
    }

    // If slots are still loading, consider them potentially available
    if (isLoadingSlots) return true;

    // Check slot availability from backend
    if (slotAvailability && slotAvailability[hour] !== undefined) {
      return slotAvailability[hour] > 0;
    }

    // If no data for this hour, it might be outside business hours
    // or the backend didn't return it, so assume unavailable
    return false;
  };

  // Handle time slot click
  const handleTimeSlotClick = (slot: {
    value: string;
    label: string;
    hour: number;
  }) => {
    if (!isTimeSlotAvailable(slot.hour)) return;

    const syntheticEvent = {
      target: {
        name: "appointmentTime",
        value: slot.value,
      },
    } as React.ChangeEvent<HTMLSelectElement>;

    onChange(syntheticEvent);
  };

  return (
    <div className="space-y-6">
      {/* Service Center Selection */}
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
              value={center.id} // If changing to string globally, convert with String(center.id)
              className="bg-zinc-800 text-white"
            >
              {center.name} - {center.address}, {center.city}
            </option>
          ))}
        </select>
      </div>

      {/* Date Selection */}
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
          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Visual Time Slot Selection */}
      {formData.serviceCenterId && formData.appointmentDate && (
        <div>
          <label className="flex items-center space-x-2 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-semibold text-white uppercase tracking-wide">
              Preferred Time *
            </span>
          </label>

          {isLoadingSlots ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="text-sm text-gray-400">
                  Loading available slots...
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Business Hours Info */}
              {formData.appointmentDate && (
                <p className="text-xs text-gray-400 mb-3 flex items-center space-x-1">
                  <span>⏰</span>
                  <span>
                    {(() => {
                      const selectedDate = new Date(
                        formData.appointmentDate + "T00:00:00"
                      );
                      const dayOfWeek = selectedDate.getDay();
                      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                      return isWeekend
                        ? "Weekend hours: 9:00 AM - 4:00 PM"
                        : "Weekday hours: 8:00 AM - 7:00 PM";
                    })()}
                  </span>
                </p>
              )}

              {/* Instruction Text */}
              <p className="text-sm text-gray-400 mb-4">
                Click on a time slot to select
              </p>

              {/* Time Slots Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {timeSlots.map((slot) => {
                  const isAvailable = isTimeSlotAvailable(slot.hour);
                  const availableSlots = slotAvailability[slot.hour] ?? 0;
                  const isSelected = formData.appointmentTime === slot.value;

                  return (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => handleTimeSlotClick(slot)}
                      disabled={!isAvailable}
                      className={`
                        relative p-5 rounded-xl border-2 transition-all duration-200
                        ${
                          isSelected
                            ? "bg-zinc-900 border-orange-500 shadow-lg shadow-orange-500/20"
                            : isAvailable
                            ? "bg-zinc-900 border-zinc-700 hover:border-orange-500/50 hover:shadow-md"
                            : "bg-zinc-900/50 border-zinc-800 opacity-60 cursor-not-allowed"
                        }
                      `}
                    >
                      {/* Time */}
                      <div
                        className={`text-lg font-bold mb-2 ${
                          isSelected
                            ? "text-white"
                            : isAvailable
                            ? "text-white"
                            : "text-gray-600"
                        }`}
                      >
                        {slot.label}
                      </div>

                      {/* Availability */}
                      <div
                        className={`text-sm ${
                          isSelected
                            ? "text-gray-300"
                            : isAvailable
                            ? "text-gray-400"
                            : "text-gray-600"
                        }`}
                      >
                        {isAvailable
                          ? `${availableSlots} available`
                          : "Fully booked"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Additional Notes */}
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
          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-8 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={
            isSubmitting ||
            !formData.serviceCenterId ||
            !formData.appointmentDate ||
            !formData.appointmentTime ||
            isLoadingSlots
          }
          className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
        >
          {isSubmitting ? "Booking..." : "Book Appointment"}
        </button>
      </div>
    </div>
  );
};

export default ScheduleStep;
