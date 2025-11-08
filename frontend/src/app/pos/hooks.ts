import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

const SALES_KEY = ['sales'];

export interface Sale {
  id: number;
  product_id?: number;
  quantity: number;
  total: number;
  created_at?: string;
}

// Fetch all sales
export function useSales() {
  return useQuery({
    queryKey: SALES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from('sales').select('*');
      if (error) throw new Error(error.message);
      return data as Sale[];
    }
  });
}

// Create sale
export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newSale: Omit<Sale, 'id'>) => {
      const { data, error } = await supabase.from('sales').insert([newSale]).select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_KEY });
    }
  });
}

// Update sale
export function useUpdateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Sale> & { id: number }) => {
      const { data, error } = await supabase.from('sales').update(updates).eq('id', id).select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_KEY });
    }
  });
}

// Delete sale
export function useDeleteSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_KEY });
    }
  });
}
