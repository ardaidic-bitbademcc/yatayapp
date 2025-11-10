import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

const PERSONNEL_KEY = ['personnel'];

export interface Personnel {
  id: string; // uuid
  name: string;
  email?: string;
  phone?: string;
  role: string;
  store_id?: string;
  branch_id?: string;
  created_by?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Fetch all personnel
export function usePersonnel() {
  return useQuery({
    queryKey: PERSONNEL_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from('personnel').select('*');
      if (error) throw new Error(error.message);
      return data as Personnel[];
    }
  });
}

// Create personnel
export function useCreatePersonnel() {
  const queryClient = useQueryClient();
  return useMutation({
  mutationFn: async (newPersonnel: Omit<Personnel, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('personnel').insert([newPersonnel]).select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERSONNEL_KEY });
    }
  });
}

// Update personnel
export function useUpdatePersonnel() {
  const queryClient = useQueryClient();
  return useMutation({
  mutationFn: async ({ id, ...updates }: Partial<Personnel> & { id: string }) => {
      const { data, error } = await supabase.from('personnel').update(updates).eq('id', id).select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERSONNEL_KEY });
    }
  });
}

// Delete personnel
export function useDeletePersonnel() {
  const queryClient = useQueryClient();
  return useMutation({
  mutationFn: async (id: string) => {
      const { error } = await supabase.from('personnel').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERSONNEL_KEY });
    }
  });
}
