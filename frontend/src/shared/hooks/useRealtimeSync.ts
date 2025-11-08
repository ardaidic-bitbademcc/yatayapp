// @ts-nocheck
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export function useRealtimeSync(table: string, queryKey: any[]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        queryClient.invalidateQueries({ queryKey });
        if (payload.eventType === 'INSERT') {
          queryClient.setQueryData(queryKey, (old: any) => ([...(old || []), payload.new]));
        } else if (payload.eventType === 'UPDATE') {
          queryClient.setQueryData(queryKey, (old: any) => old?.map((i: any) => (i.id === payload.new.id ? payload.new : i)));
        } else if (payload.eventType === 'DELETE') {
          queryClient.setQueryData(queryKey, (old: any) => old?.filter((i: any) => i.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, JSON.stringify(queryKey)]);
}
