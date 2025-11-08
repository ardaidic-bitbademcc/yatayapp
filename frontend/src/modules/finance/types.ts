// @ts-nocheck
// Finans Modülü - Tipler
export interface IncomeRecord {
  id: string;
  branchId: string;
  saleId?: string;
  amount: number;
  incomeDate: string;
  description?: string;
}

export interface Expense {
  id: string;
  branchId: string;
  categoryId: string;
  amount: number;
  expenseDate: string;
  description?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}
