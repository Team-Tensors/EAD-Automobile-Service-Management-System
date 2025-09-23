// Authentication Provider - Components only for Fast Refresh compatibility
import React, { useReducer, useEffect, type ReactNode } from 'react';
import type { User, UserRole, AuthContextType, LoginCredentials, RegisterData, AuthState } from '../types/auth';
import { STORAGE_KEYS, ERROR_MESSAGES } from '../types/constants';
import { authService, setAuthToken } from '../services/authService';
import { AuthContext } from './authContextBase';

// Auth Reducer Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string; refreshToken?: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial State
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser) as User;
          
          // Set auth token for API calls
          setAuthToken(storedToken);
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user,
              token: storedToken,
              refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || undefined,
            },
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthStorage();
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  // Helper function to clear auth storage
  const clearAuthStorage = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    setAuthToken(null);
  };

  // Helper function to store auth data
  const storeAuthData = (user: User, token: string, refreshToken?: string) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    setAuthToken(token);
  };

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Use legacy Login method for backward compatibility
      const response = await authService.Login({ 
        email: credentials.email, 
        password: credentials.password 
      });
      
      if (response.token && response.user) {
        const { user, token, refreshToken } = response;
        
        storeAuthData(user, token, refreshToken);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token, refreshToken },
        });
      } else {
        throw new Error(response.message || ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || ERROR_MESSAGES.NETWORK_ERROR;
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Use legacy Register method for backward compatibility
      const response = await authService.Register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role,
      });
      
      if (response.token && response.user) {
        const { user, token, refreshToken } = response;
        
        storeAuthData(user, token, refreshToken);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token, refreshToken },
        });
      } else {
        throw new Error(response.message || ERROR_MESSAGES.VALIDATION_ERROR);
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || ERROR_MESSAGES.NETWORK_ERROR;
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      if (state.token) {
        await authService.logout(state.token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthStorage();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<void> => {
    try {
      const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(storedRefreshToken);
      
      if (response.success) {
        const { user, token, refreshToken: newRefreshToken } = response.data;
        
        storeAuthData(user, token, newRefreshToken);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token, refreshToken: newRefreshToken },
        });
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuthStorage();
      dispatch({ type: 'AUTH_LOGOUT' });
      throw error;
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Role-based access helpers
  const hasRole = (role: UserRole): boolean => {
    return state.user?.role === role;
  };

  const hasPermission = (): boolean => {
    if (!state.user) return false;
    
    // TODO: Implement proper permission checking
    // For now, return true if user is authenticated
    return state.isAuthenticated;
  };

  // OAuth login (placeholder - will implement in next step)
  const loginWithOAuth = (provider: 'google' | 'github'): void => {
    console.log(`OAuth login with ${provider} - coming soon!`);
  };

  // Context value
  const contextValue: AuthContextType = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    register,
    logout,
    refreshToken,
    clearError,

    // Role-based helpers
    hasRole,
    hasPermission,

    // OAuth
    loginWithOAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

