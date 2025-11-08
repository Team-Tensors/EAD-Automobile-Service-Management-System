// src/types/serviceType.ts
import type { AppointmentType } from './appointment';

/**
 * Full service or modification type entity (from backend)
 */
export interface ServiceTypeDto {
  id: string; // UUID as string
  type: AppointmentType; // 'SERVICE' | 'MODIFICATION'
  name: string;
  description: string;
  estimatedCost: number;
  estimatedTimeMinutes: number;
}

/**
 * DTO for creating a new service or modification type
 */
export interface ServiceTypeCreateDto {
  type: AppointmentType; // 'SERVICE' | 'MODIFICATION'
  name: string;
  description: string;
  estimatedCost: number;
  estimatedTimeMinutes: number;
}

/**
 * DTO for updating a service or modification type
 */
export interface ServiceTypeUpdateDto {
  type: AppointmentType; // 'SERVICE' | 'MODIFICATION'
  name: string;
  description: string;
  estimatedCost: number;
  estimatedTimeMinutes: number;
}
