// Branch CRUD hooks unit testleri

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch } from '../hooks';
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

describe('Branch Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('useBranches veri çeker', async () => {
    mockSelect.mockResolvedValue({ data: [{ id: 1, name: 'Test', address: 'Addr' }], error: null });
    const { result } = renderHook(() => useBranches(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 1, name: 'Test', address: 'Addr' }]);
  });

  it('useCreateBranch mutation çalışır', async () => {
    mockInsert.mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [{ id: 2 }], error: null }) });
    const { result } = renderHook(() => useCreateBranch(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ name: 'Yeni', address: 'Adres' });
    expect(mockInsert).toHaveBeenCalledWith([{ name: 'Yeni', address: 'Adres' }]);
  });

  it('useUpdateBranch mutation çalışır', async () => {
    const eqMock = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }) });
    mockUpdate.mockReturnValue({ eq: eqMock });
    const { result } = renderHook(() => useUpdateBranch(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ id: 1, name: 'Güncel', address: 'Yeni Adres' });
    expect(eqMock).toHaveBeenCalledWith('id', 1);
  });

  it('useDeleteBranch mutation çalışır', async () => {
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ eq: eqMock });
    const { result } = renderHook(() => useDeleteBranch(), { wrapper: createWrapper() });
    await result.current.mutateAsync(1);
    expect(eqMock).toHaveBeenCalledWith('id', 1);
  });
});
