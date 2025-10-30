import api from "../utill/apiUtils";
import type { Vehicle, VehicleCreateDto } from "../types/vehicle";

const base = "/vehicles";

export const vehicleService = {
  list: async (): Promise<Vehicle[]> => {
    const res = await api.get(base);
    return res.data;
  },

  get: async (id: number): Promise<Vehicle> => {
    const res = await api.get(`${base}/${id}`);
    return res.data;
  },

  create: async (payload: VehicleCreateDto): Promise<Vehicle> => {
    // Remove empty lastServiceDate to avoid backend validation issues
    const cleanPayload = {
      ...payload,
      lastServiceDate: payload.lastServiceDate?.trim() || undefined,
    };
    const res = await api.post(base, cleanPayload);
    return res.data;
  },

  update: async (id: number, payload: VehicleCreateDto): Promise<Vehicle> => {
    // Remove empty lastServiceDate to avoid backend validation issues
    const cleanPayload = {
      ...payload,
      lastServiceDate: payload.lastServiceDate?.trim() || undefined,
    };
    const res = await api.put(`${base}/${id}`, cleanPayload);
    return res.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`${base}/${id}`);
  },
};

export default vehicleService;
