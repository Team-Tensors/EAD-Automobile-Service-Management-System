import { useState, useEffect } from "react";
import { appointmentService } from "../services/appointmentService";
import { myServicesRealtimeService } from "../services/myServicesRealtimeService";
import { mapSummaryToService, type Service } from "../types/myService";
import { useAuth } from "./useAuth";

export const useMyServices = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchServices = async () => {
      try {
        setLoading(true);
        const summaries = await appointmentService.getMyAppointments();
        const mapped = summaries.map(mapSummaryToService);
        setServices(mapped);
      } catch (err) {
        setError("Failed to load services");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();

    // SSE: Listen for status/employee updates
    myServicesRealtimeService.connect(user.id);
    const unsubscribe = myServicesRealtimeService.onUpdate((update) => {
      setServices((prev) =>
        prev.map((s) =>
          s.id === update.id
            ? {
                ...s,
                status:
                  update.status === "COMPLETED"
                    ? "completed"
                    : "not_completed",
                assignedEmployee: update.assignedEmployee || s.assignedEmployee,
              }
            : s
        )
      );
    });

    return () => {
      unsubscribe();
      myServicesRealtimeService.disconnect();
    };
  }, [user?.id]);

  return { services, loading, error };
};