// @ts-nocheck
// Şube Modülü - Tipler
export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}

export interface BranchStats {
  totalSales: number;
  totalProducts: number;
  activeStaff: number;
}
