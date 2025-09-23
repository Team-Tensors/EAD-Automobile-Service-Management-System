import api from "../utill/apiUtils";

// User registration data interface
export interface RegisterCustomerData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {

    //login user
    Login: async (credentials: LoginCredentials) => {
            const response = await api.post("/auth/login", credentials);
            return response.data;
        },

    // Register new customer
    Register: async (customerData: RegisterCustomerData) => {
            const response = await api.post("/auth/signup", customerData);
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
