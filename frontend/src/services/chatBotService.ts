import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create a local axios instance for the chatbot service.
const chatApi = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach token automatically if present
chatApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
            if (token) {
                // Axios types differ between versions; use cast to any to set Authorization safely
                (config.headers as any) = { ...(config.headers as any), Authorization: `Bearer ${token}` };
            }
        return config;
    },
    (error) => Promise.reject(error)
);

interface Location {
    latitude: number;
    longitude: number;
}

class ChatBotService {
    private base = '/chat';

    /**
     * Send a message to the chatbot and receive a response.
     * Backend endpoint: /chatbot/message
     */
    public async sendMessage(payload: { message: string; location?: Location }) {
        const res = await chatApi.post(`${this.base}/message`, payload);
        return res.data;
    }

    /**
     * Get the user's current location using the browser's Geolocation API
     * Returns a Promise that resolves with the location or null if unavailable
     */
    public async getUserLocation(): Promise<Location | null> {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                console.warn('Geolocation is not supported by this browser.');
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    console.warn('Error getting location:', error.message);
                    resolve(null);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 300000, // Cache location for 5 minutes
                }
            );
        });
    }
}

export default new ChatBotService();
