// Finance CRUD hooks unit testleri

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useIncomeRecords, useCreateIncomeRecord, useUpdateIncomeRecord, useDeleteIncomeRecord } from '../hooks';
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

describe('Finance Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('useIncomeRecords veri çeker', async () => {
    mockSelect.mockResolvedValue({ data: [{ id: 1, description: 'Test Gelir', amount: 1000, type: 'income' }], error: null });
    const { result } = renderHook(() => useIncomeRecords(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 1, description: 'Test Gelir', amount: 1000, type: 'income' }]);
  });

  it('useCreateIncomeRecord mutation çalışır', async () => {
    mockInsert.mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [{ id: 2 }], error: null }) });
    const { result } = renderHook(() => useCreateIncomeRecord(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ description: 'Yeni Gelir', amount: 2000, type: 'income' });
    expect(mockInsert).toHaveBeenCalledWith([{ description: 'Yeni Gelir', amount: 2000, type: 'income' }]);
  });

  it('useUpdateIncomeRecord mutation çalışır', async () => {
    const eqMock = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }) });
    mockUpdate.mockReturnValue({ eq: eqMock });
    const { result } = renderHook(() => useUpdateIncomeRecord(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ id: 1, description: 'Güncel Gelir', amount: 1500, type: 'income' });
    expect(eqMock).toHaveBeenCalledWith('id', 1);
  });

  it('useDeleteIncomeRecord mutation çalışır', async () => {
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ eq: eqMock });
    const { result } = renderHook(() => useDeleteIncomeRecord(), { wrapper: createWrapper() });
    await result.current.mutateAsync(1);
    expect(eqMock).toHaveBeenCalledWith('id', 1);
  });
});
