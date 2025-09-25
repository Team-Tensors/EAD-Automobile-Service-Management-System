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

//Add a request interceptor for JWT-based authentication
api.interceptors.request.use(
  (config) => {
    // Ensure Content-Type is set for all requests
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    // Check if token exists before each request and add Authorization header
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle the request error
    if (error.response) {
        console.error('API Request Error:', error.response.data);
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

// Add response interceptor for JWT-based authentication and error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle 401 Unauthorized - JWT token expired or invalid
      if (status === 401 && !originalRequest._retry) {
        const errorMessage = data?.message || '';
        
        // Check if this is a token expiration (attempt refresh)
        if (errorMessage.includes('expired') || errorMessage.includes('invalid') || 
            errorMessage.includes('jwt') || errorMessage.includes('token')) {
          
          // Prevent infinite refresh loops
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
              // Call your backend's refresh token endpoint
              const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                refreshToken: refreshToken
              });

              const { token, refreshToken: newRefreshToken } = response.data;
              
              // Store new JWT tokens
              localStorage.setItem('token', token);
              if (newRefreshToken) {
                localStorage.setItem('refresh_token', newRefreshToken);
              }

              // Update axios default headers with new JWT token
              api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              
              // Process queued requests with new token
              processQueue(null, token);
              
              // Retry original request with new JWT token
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return api(originalRequest);
              
            } catch (refreshError) {
              // Refresh failed - clear everything and redirect to login
              processQueue(refreshError as Error, null);
              localStorage.removeItem('token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              
              // Redirect to login page
              if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
              }
              
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          } else {
            // No refresh token available - clear everything and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
        } else {
          // Other 401 errors (missing token, etc.) - clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
      
      // Handle 403 Forbidden - User lacks required role/permission
      else if (status === 403) {
        const errorMessage = data?.message || 'Access denied. You do not have permission to access this resource.';
        console.error('403 Forbidden:', errorMessage);
        
        // Don't redirect for 403 - user is authenticated but lacks permission
        // Let the component handle this error appropriately
        return Promise.reject(new Error(errorMessage));
      }

      // Format other error messages from server
      const errorMessage = data?.message || 'Something went wrong';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Request was made but no response received (network error)
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Something went wrong with setting up the request
      return Promise.reject(error);
    }
  }
);

export default api;
