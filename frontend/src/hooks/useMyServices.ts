import { useState, useEffect } from "react";
import { slotAppointmentService, type AppointmentSummary } from "@/services/slotAppointmentService";
import { myServicesRealtimeService } from "@/services/myServicesRealtimeService";
import { mapSummaryToService } from "@/types/myService";
import type { Service } from "@/types/myService";
import { useAuth } from "@/hooks/useAuth";

export const useMyServices = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const userId = user?.id?.toString() || "";
        if (!userId) throw new Error("User ID is required");
        const summaries = await slotAppointmentService.getMyAppointments(userId);
        const mappedServices = await Promise.all(
          summaries.map((summary) => mapSummaryToService(summary))
        );
        setServices(mappedServices);
      } catch (err) {
        console.error("Failed to fetch services:", err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();

    if (user?.id) {
      const userId = user.id.toString();
      myServicesRealtimeService.connect(userId);
      const unsubscribe = myServicesRealtimeService.onUpdate(async (update) => {
        try {
          const updatedServices = await Promise.all(
            services.map(async (service) => {
              if (service.id === update.id) {
                const summary: AppointmentSummary = {
                  id: service.id,
                  vehicle: service.vehicleName,
                  service: service.serviceType,
                  status: update.status || service.status,
                  date: service.startDate,
                  serviceCenter: update.serviceCenter || service.serviceCenter,
  centerSlot: update.centerSlot != null ? Number(update.centerSlot) : null, // Keep as number | null for AppointmentSummary
                  estimatedCompletion: update.estimatedCompletion || service.estimatedCompletion,
                  assignedEmployee: update.assignedEmployee || service.assignedEmployee,
                };
                return await mapSummaryToService(summary);
              }
              return service;
            })
          );
          setServices(updatedServices);
        } catch (err) {
          console.error("Failed to update services:", err);
        }
      });
      return () => {
        unsubscribe();
        myServicesRealtimeService.disconnect();
      };
    }
  }, [user?.id]);

  return { services, loading };
};