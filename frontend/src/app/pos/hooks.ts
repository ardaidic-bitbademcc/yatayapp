import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

const SALES_KEY = ['sales'];

export interface Sale {
  id: number;
  product_id?: number;
  product_name?: string;
  amount?: number; // Birim fiyat
  quantity: number;
  total?: number; // Computed column - read-only (amount * quantity)
  created_at?: string;
  order_id?: string;
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
    mutationFn: async (newSale: Omit<Sale, 'id' | 'total'>) => {
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

// =============================
// POS Masa ve Sipariş Yönetimi
// =============================

// Bölgeler
export function useZones() {
  return useQuery({
    queryKey: ['table_zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('table_zones')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw new Error(error.message);
      return data as any[];
    },
  });
}

// Masalar
export function useTables(zoneId?: string) {
  return useQuery({
    queryKey: ['tables', zoneId ?? 'all'],
    queryFn: async () => {
      let q = supabase.from('tables').select('*');
      if (zoneId) q = q.eq('zone_id', zoneId);
      const { data, error } = await q.order('name', { ascending: true });
      if (error) throw new Error(error.message);
      return data as any[];
    }
  });
}

export function useUpsertTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase.from('tables').upsert(payload).select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
    }
  });
}

export function useDeleteTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tables').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
    }
  });
}

// Açık siparişi getir/yoksa oluştur
export function useEnsureOpenOrder() {
  return useMutation({
    mutationFn: async (tableId: string) => {
      // açık sipariş var mı?
      const { data: existing, error: selErr } = await supabase
        .from('orders')
        .select('*')
        .eq('table_id', tableId)
        .eq('status', 'open')
        .limit(1)
        .maybeSingle();
      if (selErr && selErr.code !== 'PGRST116') throw new Error(selErr.message);
      if (existing) return existing;
      // yoksa oluştur
      const { data, error } = await supabase
        .from('orders')
        .insert([{ table_id: tableId, status: 'open' }])
        .select()
        .single();
      if (error) throw new Error(error.message);
      // masayı meşgul işaretle
      await supabase.from('tables').update({ status: 'occupied' }).eq('id', tableId);
      return data;
    }
  });
}

export function useOrderItems(orderId?: string) {
  return useQuery({
    queryKey: ['order_items', orderId ?? 'none'],
    queryFn: async () => {
      if (!orderId) return [] as any[];
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      if (error) throw new Error(error.message);
      return data as any[];
    },
    enabled: !!orderId
  });
}

export function useAddItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ order_id, product, quantity = 1 }: { order_id: string, product: any, quantity?: number }) => {
      const payload = {
        order_id,
        product_id: product.id,
        product_name: product.name,
        unit_price: product.price,
        quantity,
      };
      const { data, error } = await supabase.from('order_items').insert([payload]).select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['order_items', vars.order_id] });
    }
  });
}

export function useUpdateItemQty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity, order_id }: { id: string, quantity: number, order_id: string }) => {
      const { data, error } = await supabase.from('order_items').update({ quantity }).eq('id', id).select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['order_items', vars.order_id] });
    }
  });
}

export function useRemoveItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, order_id }: { id: string, order_id: string }) => {
      const { error } = await supabase.from('order_items').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['order_items', vars.order_id] });
    }
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment_methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      if (error) throw new Error(error.message);
      return data as any[];
    }
  });
}

export function usePayAndClose() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ order_id, method, amount, table_id, is_split }: { 
      order_id: string; 
      method: string; 
      amount: number; 
      table_id: string; 
      is_split?: boolean;
    }) => {
      // ödeme kaydı
      const { error: payErr } = await supabase.from('payments').insert([{ order_id, method, amount }]);
      if (payErr) throw new Error(payErr.message);
      
      // Bölünmüş ödemede sadece ilk çağrıda siparişi kapat
      if (!is_split) {
        // siparişi kapat
        const { error: updErr } = await supabase.from('orders').update({ status: 'paid', closed_at: new Date().toISOString() }).eq('id', order_id);
        if (updErr) throw new Error(updErr.message);
        // masa boşalt
        await supabase.from('tables').update({ status: 'empty' }).eq('id', table_id);
        // order_items -> sales aktar (dashboard için)
        const { data: orderItems, error: oiErr } = await supabase.from('order_items').select('*').eq('order_id', order_id);
        if (oiErr) throw new Error(oiErr.message);
        if (orderItems && orderItems.length) {
          // Önceden eklenmiş mi kontrol (aynı order_id ile satırlar var mı?)
          const { data: existingSales } = await supabase.from('sales').select('id').eq('order_id', order_id).limit(1);
          if (!existingSales || existingSales.length === 0) {
            const salesPayload = orderItems.map(oi => ({
              amount: oi.unit_price, // birim fiyat
              quantity: oi.quantity,
              product_name: oi.product_name,
              product_id: oi.product_id,
              description: `Masa siparişi #${table_id}`,
              status: 'completed',
              order_id
            }));
            const { error: salesErr } = await supabase.from('sales').insert(salesPayload);
            if (salesErr) throw new Error(salesErr.message);
          }
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: SALES_KEY });
    }
  });
}
