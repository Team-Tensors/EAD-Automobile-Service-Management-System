import api from "../utill/apiUtils";
import type { AuthResponse, LoginCredentials, RegisterData } from "../types/auth";

// User registration data interface
export interface RegisterCustomerData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: string;
}

export const authService = {
    // Login user
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post("/auth/login", credentials);
        return response.data;
    },

    // Register new user
    register: async (userData: RegisterData): Promise<AuthResponse> => {
        const response = await api.post("/auth/register", userData);
        return response.data;
    },

    // Logout user
    logout: async (token: string): Promise<void> => {
        try {
            await api.post("/auth/logout", {}, {
                headers: { 'x-auth-token': token }
            });
        } catch {
            console.warn('Logout request failed');
        }
    },

    // Refresh token
    refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
        const response = await api.post("/auth/refresh", { refreshToken });
        return response.data;
    },

    // Verify token
    verifyToken: async (token: string): Promise<boolean> => {
        try {
            const response = await api.get("/auth/verify", {
                headers: { 'x-auth-token': token }
            });
            return response.data.success === true;
        } catch (error) {
            return false;
        }
    },

    // Legacy methods for backward compatibility
    Login: async (credentials: LoginCredentials) => {
        const response = await api.post("/auth/login", credentials);
        return response.data;
    },

    Register: async (customerData: RegisterCustomerData) => {
        const response = await api.post("/auth/register", customerData);
        return response.data;
    },
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete api.defaults.headers.common['x-auth-token'];
  }
};
