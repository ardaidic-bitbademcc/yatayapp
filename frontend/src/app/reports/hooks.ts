import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export interface SaleReport {
  id: string;
  product_name: string;
  quantity: number;
  total_amount: number;
  payment_method: string;
  created_at: string;
}

export function useSalesReport(dateRange: 'today' | 'week' | 'month') {
  return useQuery({
    queryKey: ['sales-report', dateRange],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;

      if (dateRange === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateRange === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data as SaleReport[];
    }
  });
}
