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
}

export interface InventoryItemUpdateDto {
  itemName?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  category?: string;
  minStock?: number;
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
