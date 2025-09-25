// Authentication Context - separate from component for Fast Refresh
import { createContext } from 'react';
import type { AuthContextType } from '../types/auth';

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);