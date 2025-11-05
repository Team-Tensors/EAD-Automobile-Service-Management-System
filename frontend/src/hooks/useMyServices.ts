import { useState, useEffect } from "react";
import { appointmentService } from "@/services/appointmentService";
import { mapSummaryToService } from "@/types/myService";
import type { Service } from "@/types/myService";

export const useMyServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const summaries = await appointmentService.getMyAppointments();
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
  }, []);

  return { services, loading };
};