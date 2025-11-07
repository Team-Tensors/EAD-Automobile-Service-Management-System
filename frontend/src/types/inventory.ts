export interface InventoryItem {
  id: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  category: string;
  minStock: number;
  createdByName: string;
  createdById: string;
  serviceCenterId: string;
  serviceCenterName: string;
  createdAt: string;
  lastUpdated: string;
  lowStock: boolean;
}

export interface InventoryItemCreateDto {
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  category: string;
  minStock: number;
  serviceCenterId: string;
}

export interface InventoryItemUpdateDto {
  itemName?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  category?: string;
  // Note: minStock is intentionally excluded - it cannot be changed after item creation
}

export interface InventoryRestockDto {
  quantity: number;
}

export interface InventoryBuyDto {
  quantity: number;
}

export const INVENTORY_CATEGORIES = [
  'Lubricant',
  'Filter',
  'Spare Part',
  'Brake Component',
  'Battery',
  'Tire',
  'Belt',
  'Fluid',
  'Electrical',
  'Body Part',
  'Other'
] as const;

export type InventoryCategory = typeof INVENTORY_CATEGORIES[number];
