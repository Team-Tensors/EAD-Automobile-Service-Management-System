export interface ServiceUpdate {
  id: string;
  status?: string;
  assignedEmployee?: string;
  serviceCenter?: string;
  centerSlot?: number | null;
  estimatedCompletion?: string; // Added
}

export class MyServicesRealtimeService {
  private eventSource: EventSource | null = null;
  private listeners: ((update: ServiceUpdate) => void)[] = [];

  connect(customerId: string) {
    if (this.eventSource) return;

    const token = localStorage.getItem("token");
    if (!customerId) {
      console.error("Customer ID is required for SSE");
      return;
    }
    const url = `${import.meta.env.VITE_API_URL}/slot-appointments/sse/${customerId}`;

    this.eventSource = new EventSource(url, {
      headers: { Authorization: `Bearer ${token}` },
    } as any);

    this.eventSource.onmessage = (event) => {
      try {
        const data: ServiceUpdate = JSON.parse(event.data);
        this.listeners.forEach((cb) => cb(data));
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    this.eventSource.onerror = () => {
      console.warn("SSE disconnected. Reconnecting...");
      this.eventSource?.close();
      setTimeout(() => this.connect(customerId), 3000);
    };
  }

  disconnect() {
    this.eventSource?.close();
    this.eventSource = null;
  }

  onUpdate(callback: (update: ServiceUpdate) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }
}

export const myServicesRealtimeService = new MyServicesRealtimeService();