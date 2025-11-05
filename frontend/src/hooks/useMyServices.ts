import { useState, useEffect } from "react";
import { appointmentService } from "@/services/appointmentService";
import { mapDetailedToService } from "@/types/myService";   // <-- NEW
import type { Service } from "@/types/myService";

export const useMyServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const detailedAppointments = await appointmentService.getMyDetailedAppointments();
        const mapped = await Promise.all(
          detailedAppointments.map(mapDetailedToService)
        );
        setServices(mapped);
      } catch (err) {
        console.error("Failed to fetch services:", err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading };
};