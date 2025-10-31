// src/services/serviceCenterService.ts
import api from "../util/apiUtils";

export interface ServiceCenterDto {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  operatingHours: string;
  isActive: boolean;
}

/**
 * Fetch all active service centers
 */
export async function getAllServiceCenters(): Promise<ServiceCenterDto[]> {
  const response = await api.get<ServiceCenterDto[]>(
    "/service-centers/with-services"
  );
  return response.data;
}

/**
 * Fetch nearby service centers based on coordinates
 */
export async function getNearbyServiceCenters(
  lat: number,
  lng: number,
  radius: number = 50
): Promise<ServiceCenterDto[]> {
  const response = await api.get<ServiceCenterDto[]>(
    `/service-centers/nearby-with-services`,
    {
      params: { lat, lng, radius },
    }
  );
  return response.data;
}

export const serviceCenterService = {
  getAllServiceCenters,
  getNearbyServiceCenters,
};
