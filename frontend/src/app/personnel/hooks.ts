import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

const PERSONNEL_KEY = ['personnel'];

export interface Personnel {
  id: number;
  name: string;
  role: string;
  created_at?: string;
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
    mutationFn: async (newPersonnel: Omit<Personnel, 'id'>) => {
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
    mutationFn: async ({ id, ...updates }: Partial<Personnel> & { id: number }) => {
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
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('personnel').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERSONNEL_KEY });
    }
  });
}
