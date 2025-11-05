import api from "../util/apiUtils";
import type {
  InventoryItem,
  InventoryItemCreateDto,
  InventoryItemUpdateDto,
  InventoryRestockDto,
  InventoryBuyDto
} from "../types/inventory";

const base = "/inventory";

export const inventoryService = {
  // Get all inventory items
  list: async (): Promise<InventoryItem[]> => {
    const res = await api.get(base);
    return res.data;
  },

  // Get single inventory item
  get: async (id: string): Promise<InventoryItem> => {
    const res = await api.get(`${base}/${id}`);
    return res.data;
  },

  // Get low stock items
  getLowStock: async (): Promise<InventoryItem[]> => {
    const res = await api.get(`${base}/low-stock`);
    return res.data;
  },

  // Get items by category
  getByCategory: async (category: string): Promise<InventoryItem[]> => {
    const res = await api.get(`${base}/category/${category}`);
    return res.data;
  },

  // Search items by name
  search: async (name: string): Promise<InventoryItem[]> => {
    const res = await api.get(`${base}/search`, { params: { name } });
    return res.data;
  },

  // Create new item (Admin only)
  create: async (payload: InventoryItemCreateDto): Promise<InventoryItem> => {
    const res = await api.post(base, payload);
    return res.data;
  },

  // Update item (Admin only)
  update: async (id: string, payload: InventoryItemUpdateDto): Promise<InventoryItem> => {
    const res = await api.put(`${base}/${id}`, payload);
    return res.data;
  },

  // Restock item (Admin only)
  restock: async (id: string, payload: InventoryRestockDto): Promise<InventoryItem> => {
    const res = await api.patch(`${base}/${id}/restock`, payload);
    return res.data;
  },

  // Buy/Use item (Employee only)
  buy: async (id: string, payload: InventoryBuyDto): Promise<InventoryItem> => {
    const res = await api.patch(`${base}/${id}/buy`, payload);
    return res.data;
  },

  // Delete item (Admin only)
  remove: async (id: string): Promise<void> => {
    await api.delete(`${base}/${id}`);
  },
};

export default inventoryService;
