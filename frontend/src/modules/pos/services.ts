// @ts-nocheck
// POS Modülü - Supabase servisleri
import { supabase } from '@/lib/supabaseClient';

export async function getProducts(branchId: string) {
  const { data, error } = await supabase
    .from('branch_products')
    .select('*, product:products(*)')
    .eq('branch_id', branchId)
    .eq('is_available', true);

  if (error) throw error;
  return data;
}

export async function createSale(saleData: any) {
  const { data, error } = await supabase
    .from('sales')
    .insert(saleData)
    .select()
    .single();

  if (error) throw error;
  return data;
}
