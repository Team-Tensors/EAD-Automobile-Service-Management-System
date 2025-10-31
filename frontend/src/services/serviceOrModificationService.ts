// src/services/serviceOrModificationService.ts
import api from "../util/apiUtils";

export interface ServiceOrModificationDto {
  id: number;
  name: string;
  description: string;
  estimatedCost: number;
  estimatedTimeMinutes: number;
}

/**
 * Fetch all available services (for SERVICE appointments)
 */
export async function getServices(): Promise<ServiceOrModificationDto[]> {
  const response = await api.get<ServiceOrModificationDto[]>(
    "/services-modifications/services"
  );
  return response.data;
}

/**
 * Fetch all available modifications (for MODIFICATION appointments)
 */
export async function getModifications(): Promise<ServiceOrModificationDto[]> {
  const response = await api.get<ServiceOrModificationDto[]>(
    "/services-modifications/modifications"
  );
  return response.data;
}

export const serviceOrModificationService = {
  getServices,
  getModifications,
};
