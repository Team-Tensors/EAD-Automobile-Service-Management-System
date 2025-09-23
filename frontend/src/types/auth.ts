// Authentication Types & Interfaces for Automobile Service Management System

export const UserRole = {
  CUSTOMER: 'CUSTOMER',
  EMPLOYEE: 'EMPLOYEE', 
  ADMIN: 'ADMIN'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  roles: string[];
  // Legacy support for backward compatibility
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Additional fields based on role
  employeeId?: string; // For employees
  customerId?: string; // For customers
  department?: string; // For employees
  profileImage?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;  // Use email for login
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  role: UserRole;
  confirmPassword?: string;
  // Additional fields for employees
  employeeId?: string;
  department?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  type: string;
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  success?: boolean;
  message?: string;
  data?: {
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface OAuthProvider {
  name: 'google' | 'github';
  clientId: string;
  redirectUri: string;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  [UserRole.CUSTOMER]: Permission[];
  [UserRole.EMPLOYEE]: Permission[];
  [UserRole.ADMIN]: Permission[];
}

// API Error Response
export interface ApiError {
  success: false;
  message: string;
  errors?: {
    field: string;
    message: string;
  }[];
  statusCode: number;
}

// Form Validation
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Auth Context Type
export interface AuthContextType {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  
  // Role-based helpers
  hasRole: (role: UserRole) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  
  // OAuth
  loginWithOAuth: (provider: 'google' | 'github') => void;
}

// Route Protection
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: {
    resource: string;
    action: string;
  };
  fallback?: React.ReactNode;
}