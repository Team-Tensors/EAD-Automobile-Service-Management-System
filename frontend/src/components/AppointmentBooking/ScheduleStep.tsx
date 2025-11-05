import React, { useEffect, useState } from "react";
import { Calendar, Clock, FileText, MapPin, AlertCircle, Users } from "lucide-react";
import { appointmentService, type SlotAvailability } from "../../services/appointmentService";
import toast from "react-hot-toast";

interface ScheduleFormData {
  serviceCenterId: string;
  appointmentDate: string;
  appointmentTime: string;
  description: string;
}

interface ServiceCenter {
  id: number;  // Changed from string to number for type consistency
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
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability>({});
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
    
    const selectedDate = new Date(formData.appointmentDate + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay();
    
    return (dayOfWeek === 0 || dayOfWeek === 6) ? weekendTimeSlots : weekdayTimeSlots;
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

    // Check slot availability from backend
    if (slotAvailability && slotAvailability[hour] !== undefined) {
      return slotAvailability[hour] > 0;
    }

    return false; // Default to unavailable if not loaded yet
  };

  // Get slot status for color coding
  const getSlotStatus = (hour: number): 'available' | 'limited' | 'full' => {
    const available = slotAvailability[hour];
    if (available === undefined || available === 0) return 'full';
    if (available <= 2) return 'limited';
    return 'available';
  };

  // Handle time slot click
  const handleTimeSlotClick = (slot: { value: string; label: string; hour: number }) => {
    if (!isTimeSlotAvailable(slot.hour)) return;
    
    const syntheticEvent = {
      target: {
        name: 'appointmentTime',
        value: slot.value,
      }
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
              value={center.id}  // If changing to string globally, convert with String(center.id)
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
        {formData.appointmentDate && (
          <p className="text-xs text-gray-400 mt-2">
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
      </div>

      {/* Visual Time Slot Selection */}
      {formData.serviceCenterId && formData.appointmentDate && (
        <div>
          <label className="flex items-center space-x-2 mb-4">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-white uppercase tracking-wide">
              Select Time Slot *
            </span>
          </label>

          {isLoadingSlots ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="text-sm text-gray-400">Loading available slots...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-4 p-3 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500/20 border-2 border-green-500 rounded"></div>
                  <span className="text-xs text-gray-400">Available (3+ slots)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500/20 border-2 border-yellow-500 rounded"></div>
                  <span className="text-xs text-gray-400">Limited (1-2 slots)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500/20 border-2 border-red-500 rounded"></div>
                  <span className="text-xs text-gray-400">Fully Booked</span>
                </div>
              </div>

              {/* Time Slots Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {timeSlots.map((slot) => {
                  const isAvailable = isTimeSlotAvailable(slot.hour);
                  const availableSlots = slotAvailability[slot.hour] ?? 0;
                  const status = getSlotStatus(slot.hour);
                  const isSelected = formData.appointmentTime === slot.value;

                  return (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => handleTimeSlotClick(slot)}
                      disabled={!isAvailable}
                      className={`
                        relative p-4 rounded-lg border-2 transition-all duration-200
                        ${isSelected 
                          ? 'bg-orange-500/20 border-orange-500 ring-2 ring-orange-500 ring-offset-2 ring-offset-black' 
                          : isAvailable
                            ? status === 'available'
                              ? 'bg-green-500/10 border-green-500/50 hover:bg-green-500/20 hover:border-green-500'
                              : status === 'limited'
                              ? 'bg-yellow-500/10 border-yellow-500/50 hover:bg-yellow-500/20 hover:border-yellow-500'
                              : 'bg-zinc-800/50 border-zinc-700'
                            : 'bg-red-500/10 border-red-500/50 opacity-50 cursor-not-allowed'
                        }
                      `}
                    >
                      {/* Time Label */}
                      <div className={`text-sm font-semibold mb-2 ${
                        isSelected 
                          ? 'text-orange-400' 
                          : isAvailable 
                            ? 'text-white' 
                            : 'text-gray-500'
                      }`}>
                        {slot.label}
                      </div>

                      {/* Availability Info */}
                      <div className="flex items-center justify-center space-x-1">
                        <Users className={`w-3 h-3 ${
                          isSelected
                            ? 'text-orange-400'
                            : isAvailable
                              ? status === 'available'
                                ? 'text-green-400'
                                : status === 'limited'
                                ? 'text-yellow-400'
                                : 'text-gray-400'
                              : 'text-red-400'
                        }`} />
                        <span className={`text-xs font-medium ${
                          isSelected
                            ? 'text-orange-400'
                            : isAvailable
                              ? status === 'available'
                                ? 'text-green-400'
                                : status === 'limited'
                                ? 'text-yellow-400'
                                : 'text-gray-400'
                              : 'text-red-400'
                        }`}>
                          {isAvailable ? `${availableSlots} left` : 'Full'}
                        </span>
                      </div>

                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Info Alert */}
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <div className="text-xs text-blue-300">
                    <p className="font-semibold mb-1">Booking Information</p>
                    <p className="text-blue-200/80">
                      Multiple customers can book the same time slot if the service center has available capacity. 
                      Select any slot with available spaces to proceed.
                    </p>
                  </div>
                </div>
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