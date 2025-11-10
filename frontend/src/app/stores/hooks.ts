import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

const STORES_KEY = ['stores'];

export interface Store {
  id: string;
  store_code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_by?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Fetch all stores
export function useStores() {
  return useQuery({
    queryKey: STORES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data as Store[];
    }
  });
}

// Create store
export function useCreateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newStore: Omit<Store, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('stores').insert([newStore]).select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORES_KEY });
    }
  });
}

// Update store
export function useUpdateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Store> & { id: string }) => {
      const { data, error } = await supabase.from('stores').update(updates).eq('id', id).select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORES_KEY });
    }
  });
}

// Delete store
export function useDeleteStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stores').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORES_KEY });
    }
  });
}
