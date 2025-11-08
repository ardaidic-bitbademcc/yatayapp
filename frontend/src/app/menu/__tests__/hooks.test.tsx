// Menu CRUD hooks unit testleri

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks';
import React from 'react';

// Supabase mock
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete
    })
  }
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  return ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Menu Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('useProducts veri çeker', async () => {
    mockSelect.mockResolvedValue({ data: [{ id: 1, name: 'Test Ürün', price: 50 }], error: null });
    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 1, name: 'Test Ürün', price: 50 }]);
  });

  it('useCreateProduct mutation çalışır', async () => {
    mockInsert.mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [{ id: 2 }], error: null }) });
    const { result } = renderHook(() => useCreateProduct(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ name: 'Yeni Ürün', price: 100 });
    expect(mockInsert).toHaveBeenCalledWith([{ name: 'Yeni Ürün', price: 100 }]);
  });

  it('useUpdateProduct mutation çalışır', async () => {
    const eqMock = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }) });
    mockUpdate.mockReturnValue({ eq: eqMock });
    const { result } = renderHook(() => useUpdateProduct(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ id: 1, name: 'Güncel Ürün', price: 150 });
    expect(eqMock).toHaveBeenCalledWith('id', 1);
  });

  it('useDeleteProduct mutation çalışır', async () => {
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ eq: eqMock });
    const { result } = renderHook(() => useDeleteProduct(), { wrapper: createWrapper() });
    await result.current.mutateAsync(1);
    expect(eqMock).toHaveBeenCalledWith('id', 1);
  });
});
