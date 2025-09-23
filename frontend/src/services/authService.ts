import api from "../utill/apiUtils";
import type { AuthResponse, LoginCredentials, RegisterData, User } from "../types/auth";

// User registration data interface for backward compatibility
export interface RegisterCustomerData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: string;
}

export const authService = {
    // Login user
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post("/auth/login", {
            email: credentials.email,
            password: credentials.password
        });
        return response.data;
    },

    // Register customer
    registerCustomer: async (userData: RegisterData): Promise<AuthResponse> => {
        const registrationData = {
            email: userData.email,
            password: userData.password,
            fullName: userData.fullName,
            phoneNumber: userData.phoneNumber,
            address: userData.address || "",
            role: "CUSTOMER"
        };
        
        console.log('Sending registration data to backend:', registrationData);
        console.log('Each field:', {
            email: registrationData.email,
            password: registrationData.password?.substring(0, 3) + '***',
            fullName: registrationData.fullName,
            phoneNumber: registrationData.phoneNumber,
            address: registrationData.address,
            role: registrationData.role
        });
        
        const response = await api.post("/auth/register/customer", registrationData);
        return response.data;
    },

    // Register employee (requires admin token)
    registerEmployee: async (userData: RegisterData, adminToken: string): Promise<AuthResponse> => {
        const registrationData = {
            email: userData.email,
            password: userData.password,
            fullName: userData.fullName,
            phoneNumber: userData.phoneNumber,
            address: userData.address || "",
            role: userData.role || "EMPLOYEE",
            employeeId: userData.employeeId,
            department: userData.department
        };
        const response = await api.post("/auth/register/employee", registrationData, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        return response.data;
    },

    // Legacy register method - defaults to customer
    register: async (userData: RegisterData): Promise<AuthResponse> => {
        return authService.registerCustomer(userData);
    },

    // Logout user
    logout: async (): Promise<void> => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.warn('Logout request failed:', error);
        }
    },

    // Logout from all devices
    logoutAll: async (): Promise<void> => {
        try {
            await api.post("/auth/logout-all");
        } catch (error) {
            console.warn('Logout all devices failed:', error);
        }
    },

    // Refresh access token
    refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
        const response = await api.post("/auth/refresh-token", { refreshToken });
        return response.data;
    },

    // Rotate refresh token
    rotateRefreshToken: async (refreshToken: string): Promise<AuthResponse> => {
        const response = await api.post("/auth/rotate-refresh-token", { refreshToken });
        return response.data;
    },

    // Get user profile
    getProfile: async (): Promise<User> => {
        const response = await api.get("/auth/profile");
        return response.data;
    },

    // Check email availability
    checkEmailAvailability: async (email: string): Promise<{ available: boolean }> => {
        const response = await api.get(`/auth/check-email/${encodeURIComponent(email)}`);
        return response.data;
    },

    // Get active sessions
    getActiveSessions: async (): Promise<unknown[]> => {
        const response = await api.get("/auth/active-sessions");
        return response.data;
    },

    // Verify token (backward compatibility)
    verifyToken: async (token: string): Promise<boolean> => {
        try {
            const response = await api.get("/auth/profile", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return !!response.data;
        } catch {
            return false;
        }
    },

    // Legacy methods for backward compatibility
    Login: async (credentials: LoginCredentials) => {
        return authService.login(credentials);
    },

    Register: async (customerData: RegisterCustomerData) => {
        const userData: RegisterData = {
            email: customerData.email,
            password: customerData.password,
            fullName: customerData.fullName,
            phoneNumber: customerData.phoneNumber,
            address: "",
            role: "CUSTOMER"
        };
        return authService.registerCustomer(userData);
    },
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
