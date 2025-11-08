// POS CRUD hooks unit testleri

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSales, useCreateSale, useUpdateSale, useDeleteSale } from '../hooks';
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

describe('POS Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('useSales veri çeker', async () => {
    mockSelect.mockResolvedValue({ data: [{ id: 1, product_id: 10, quantity: 2, total: 100 }], error: null });
    const { result } = renderHook(() => useSales(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 1, product_id: 10, quantity: 2, total: 100 }]);
  });

  it('useCreateSale mutation çalışır', async () => {
    mockInsert.mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [{ id: 2 }], error: null }) });
    const { result } = renderHook(() => useCreateSale(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ product_id: 20, quantity: 3, total: 150 });
    expect(mockInsert).toHaveBeenCalledWith([{ product_id: 20, quantity: 3, total: 150 }]);
  });

  it('useUpdateSale mutation çalışır', async () => {
    const eqMock = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }) });
    mockUpdate.mockReturnValue({ eq: eqMock });
    const { result } = renderHook(() => useUpdateSale(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ id: 1, product_id: 20, quantity: 4, total: 200 });
    expect(eqMock).toHaveBeenCalledWith('id', 1);
  });

  it('useDeleteSale mutation çalışır', async () => {
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ eq: eqMock });
    const { result } = renderHook(() => useDeleteSale(), { wrapper: createWrapper() });
    await result.current.mutateAsync(1);
    expect(eqMock).toHaveBeenCalledWith('id', 1);
  });
});
