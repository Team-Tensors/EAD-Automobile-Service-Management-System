import { useState, useEffect } from "react";
import { appointmentService } from "@/services/appointmentService";
import { mapDetailedToService } from "@/types/myService"; // <-- NEW
import type { Service } from "@/types/myService";

export const useMyServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const detailedAppointments =
          await appointmentService.getMyDetailedAppointments();
        const mapped = await Promise.all(
          detailedAppointments.map(mapDetailedToService)
        );
        // Filter out cancelled appointments
        const activeServices = mapped.filter(
          (service) => service.status !== "cancelled"
        );
        setServices(activeServices);
      } catch (err) {
        console.error("Failed to fetch services:", err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();

    // Poll for updates every 30 seconds
    const intervalId = setInterval(async () => {
      try {
        const detailedAppointments =
          await appointmentService.getMyDetailedAppointments();
        const mapped = await Promise.all(
          detailedAppointments.map(mapDetailedToService)
        );
        const activeServices = mapped.filter(
          (service) => service.status !== "cancelled"
        );
        setServices(activeServices);
      } catch (err) {
        console.error("Failed to refresh services:", err);
      }
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return { services, loading };
};
