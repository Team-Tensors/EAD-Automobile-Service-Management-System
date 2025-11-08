// src/services/serviceTypeAdminService.ts
import { api } from '../util/apiUtils';
import type { ServiceTypeDto, ServiceTypeCreateDto, ServiceTypeUpdateDto } from '../types/serviceType';

/**
 * Get all services and modifications (Admin only)
 */
export async function getAll(): Promise<ServiceTypeDto[]> {
  const response = await api.get<ServiceTypeDto[]>('/services-modifications/admin/all');
  return response.data;
}

/**
 * Get a single service or modification by ID (Admin only)
 */
export async function getById(id: string): Promise<ServiceTypeDto> {
  const response = await api.get<ServiceTypeDto>(`/services-modifications/admin/${id}`);
  return response.data;
}

/**
 * Create a new service or modification (Admin only)
 */
export async function create(data: ServiceTypeCreateDto): Promise<ServiceTypeDto> {
  const response = await api.post<ServiceTypeDto>('/services-modifications/admin', data);
  return response.data;
}

/**
 * Update an existing service or modification (Admin only)
 */
export async function update(id: string, data: ServiceTypeUpdateDto): Promise<ServiceTypeDto> {
  const response = await api.put<ServiceTypeDto>(`/services-modifications/admin/${id}`, data);
  return response.data;
}

/**
 * Delete a service or modification (Admin only)
 */
export async function remove(id: string): Promise<void> {
  await api.delete(`/services-modifications/admin/${id}`);
}

export const serviceTypeAdminService = {
  getAll,
  getById,
  create,
  update,
  remove,
};
