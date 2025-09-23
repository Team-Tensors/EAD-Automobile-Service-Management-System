import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, setAuthToken } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (firstName: string, lastName: string, email: string, password: string, phone: string) => Promise<void>;
}
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          // Set auth token using helper
          setAuthToken(storedToken);
          
          // Parse and set user data
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
          
          console.log('Authentication restored from localStorage:', { userId: userData.id, role: userData.role });
        } catch (err) {
          console.error('Authentication error:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          setAuthToken(null);
        }
      } else {
        console.log('No stored authentication found');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const { token, user } = await authService.Login({ email, password });
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set in state
      setToken(token);
      setUser(user);
      
      // Set auth token using helper
      setAuthToken(token);
    } catch (err: unknown) {
      console.error('Login error:', err);
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  const register = async (firstName: string, lastName: string, email: string, password: string, phone: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { token, user }  = await authService.Register({ firstName, lastName, email, password, phone });

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set in state
      setToken(token);
      setUser(user);
      
      // Set auth token using helper
      setAuthToken(token);
    } catch (err: unknown) {
      console.error('Registration error:', err);
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

