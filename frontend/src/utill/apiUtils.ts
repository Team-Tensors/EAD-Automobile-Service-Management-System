import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Configure axios defaults
axios.defaults.headers.post['Content-Type'] = 'application/json';

const token  = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
      config.headers['Authorization'] = `Bearer ${token}`;
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

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (error: Error) => void;
}> = [];

// Process the queue after refresh is complete
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle common errors
    if (error.response) {
      // Server responded with a status outside 2xx range
      if (error.response.status === 401 && !originalRequest._retry) {
        const errorMessage = error.response.data?.message || '';
        
        // Check if this is a token expiration (not missing token)
        if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
          // Try to refresh the token
          if (isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return api(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          const refreshToken = localStorage.getItem('refresh_token');
          
          if (refreshToken) {
            try {
              const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                refreshToken: refreshToken
              });

              const { token, refreshToken: newRefreshToken } = response.data;
              
              // Store new tokens
              localStorage.setItem('token', token);
              if (newRefreshToken) {
                localStorage.setItem('refresh_token', newRefreshToken);
              }

              // Update axios default headers
              api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              
              // Process queued requests
              processQueue(null, token);
              
              // Retry original request
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return api(originalRequest);
              
            } catch (refreshError) {
              // Refresh failed - clear everything and redirect
              processQueue(refreshError as Error, null);
              localStorage.removeItem('token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              
              if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
              }
              
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          } else {
            // No refresh token - clear everything and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
        } else if (errorMessage.includes('No token') || 
                   errorMessage.includes('authorization denied')) {
          // Missing token - clear everything and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          
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
