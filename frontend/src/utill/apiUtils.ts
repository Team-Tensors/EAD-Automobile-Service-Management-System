import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Configure axios defaults
axios.defaults.headers.post['Content-Type'] = 'application/json';

const token  = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['x-auth-token'] = token;
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
});

//Add a request interceptor
api.interceptors.request.use(
  (config) => {

    // Check if token exists before each request
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    // Handle the error
    if (error.response) {
        console.error('API Error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {

    // Handle common errors
    if (error.response) {
      // Server responded with a status outside 2xx range
      if (error.response.status === 401) {
        // Check if the error is due to a missing or invalid token
        const errorMessage = error.response.data?.message || '';
        
        // Only clear authentication if it's a token-related error
        if (errorMessage.includes('No token') || 
            errorMessage.includes('Token is not valid') || 
            errorMessage.includes('authorization denied')) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }

      // Format error message from server
      const errorMessage = error.response.data?.message || 'Something went wrong';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Something went wrong with setting up the request
      return Promise.reject(error);
    }
  }
);

export default api;
