export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  lastServiceDate?: string;
}

export interface VehicleCreateDto {
  brand: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  lastServiceDate?: string;
}

// No default export — only named exports for types
