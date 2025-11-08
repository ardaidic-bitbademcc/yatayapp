// @ts-nocheck
// Menü Modülü - Tipler
export interface MenuItem {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  sellingPrice: number;
  category: string;
  isActive: boolean;
}

export interface Recipe {
  id: string;
  menuItemId: string;
  productId: string;
  quantity: number;
  unit: string;
}
