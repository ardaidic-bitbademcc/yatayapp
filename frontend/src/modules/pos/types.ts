// @ts-nocheck
// POS Modülü - Satış İşlemleri

export interface POSState {
  cart: CartItem[];
  total: number;
}

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
