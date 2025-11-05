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

class ChatBotService {
    private base = '/chat';

    /**
     * Send a message to the chatbot and receive a response.
     * Backend endpoint: /chatbot/message
     */
    public async sendMessage(payload: { message: string }) {
        const res = await chatApi.post(`${this.base}/message`, payload);
        return res.data;
    }
}

export default new ChatBotService();
