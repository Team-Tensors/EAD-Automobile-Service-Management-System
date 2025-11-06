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

interface Location {
    latitude: number;
    longitude: number;
}

// Store the user's location globally for the service
let cachedLocation: Location | null = null;
let locationRequestInProgress = false;

// Function to get and cache user location
const getUserLocationForInterceptor = async (): Promise<Location | null> => {
    if (cachedLocation) {
        return cachedLocation;
    }

    if (locationRequestInProgress) {
        return null; // Avoid multiple simultaneous requests
    }

    locationRequestInProgress = true;

    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.warn('Geolocation is not supported by this browser.');
            locationRequestInProgress = false;
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                cachedLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                locationRequestInProgress = false;
                resolve(cachedLocation);
            },
            (error) => {
                console.warn('Error getting location:', error.message);
                locationRequestInProgress = false;
                resolve(null);
            },
            {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 300000, // Cache location for 5 minutes
            }
        );
    });
};

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

// Interceptor to automatically add location to all POST requests
chatApi.interceptors.request.use(
    async (config) => {
        if (config.method === 'post' && config.data) {
            // Get location if not already cached
            if (!cachedLocation) {
                await getUserLocationForInterceptor();
            }
            
            // Add location to the request body if available
            if (cachedLocation) {
                config.data = {
                    ...config.data,
                    location: cachedLocation,
                };
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

class ChatBotService {
    private base = '/chat';

    /**
     * Send a message to the chatbot and receive a response.
     * Location will be automatically attached by the interceptor.
     * Backend endpoint: /chat/message
     */
    public async sendMessage(payload: { message: string }) {
        const res = await chatApi.post(`${this.base}/message`, payload);
        return res.data;
    }

    /**
     * Get the user's current location using the browser's Geolocation API
     * Returns a Promise that resolves with the location or null if unavailable
     * This also triggers location caching for automatic inclusion in requests
     */
    public async getUserLocation(): Promise<Location | null> {
        return getUserLocationForInterceptor();
    }

    /**
     * Clear the cached location to force a fresh location request
     */
    public clearLocationCache(): void {
        cachedLocation = null;
    }
}

export default new ChatBotService();
