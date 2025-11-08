import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

const INCOME_RECORDS_KEY = ['income_records'];

export interface IncomeRecord {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  created_at?: string;
}

// Fetch all income records
export function useIncomeRecords() {
  return useQuery({
    queryKey: INCOME_RECORDS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from('income_records').select('*');
      if (error) throw new Error(error.message);
      return data as IncomeRecord[];
    }
  });
}

// Create income record
export function useCreateIncomeRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newRecord: Omit<IncomeRecord, 'id'>) => {
      const { data, error } = await supabase.from('income_records').insert([newRecord]).select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCOME_RECORDS_KEY });
    }
  });
}

// Update income record
export function useUpdateIncomeRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<IncomeRecord> & { id: number }) => {
      const { data, error } = await supabase.from('income_records').update(updates).eq('id', id).select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCOME_RECORDS_KEY });
    }
  });
}

// Delete income record
export function useDeleteIncomeRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('income_records').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCOME_RECORDS_KEY });
    }
  });
}
