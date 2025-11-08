// Custom hooks: React Query patterns for branches CRUD

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export interface Branch {
  id: number;
  name: string;
  address: string;
}

const BRANCHES_KEY = ['branches'];

// Fetch all branches
export function useBranches() {
  return useQuery({
    queryKey: BRANCHES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from('branches').select('*');
      if (error) throw new Error(error.message);
      return data as Branch[];
    }
  });
}

// Create branch mutation
export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form: Omit<Branch, 'id'>) => {
      const { data, error } = await supabase.from('branches').insert([form]).select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANCHES_KEY });
    }
  });
}

// Update branch mutation
export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...form }: Branch) => {
      const { data, error } = await supabase.from('branches').update(form).eq('id', id).select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANCHES_KEY });
    }
  });
}

// Delete branch mutation
export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('branches').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANCHES_KEY });
    }
  });
}
