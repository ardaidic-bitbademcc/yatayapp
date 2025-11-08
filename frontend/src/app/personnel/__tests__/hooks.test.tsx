// Personnel CRUD hooks unit testleri

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePersonnel, useCreatePersonnel, useUpdatePersonnel, useDeletePersonnel } from '../hooks';
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

describe('Personnel Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('usePersonnel veri çeker', async () => {
    mockSelect.mockResolvedValue({ data: [{ id: 1, name: 'Test Personel', role: 'Garson' }], error: null });
    const { result } = renderHook(() => usePersonnel(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 1, name: 'Test Personel', role: 'Garson' }]);
  });

  it('useCreatePersonnel mutation çalışır', async () => {
    mockInsert.mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [{ id: 2 }], error: null }) });
    const { result } = renderHook(() => useCreatePersonnel(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ name: 'Yeni Personel', role: 'Kasiyer' });
    expect(mockInsert).toHaveBeenCalledWith([{ name: 'Yeni Personel', role: 'Kasiyer' }]);
  });

  it('useUpdatePersonnel mutation çalışır', async () => {
    const eqMock = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }) });
    mockUpdate.mockReturnValue({ eq: eqMock });
    const { result } = renderHook(() => useUpdatePersonnel(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ id: 1, name: 'Güncel Personel', role: 'Müdür' });
    expect(eqMock).toHaveBeenCalledWith('id', 1);
  });

  it('useDeletePersonnel mutation çalışır', async () => {
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ eq: eqMock });
    const { result } = renderHook(() => useDeletePersonnel(), { wrapper: createWrapper() });
    await result.current.mutateAsync(1);
    expect(eqMock).toHaveBeenCalledWith('id', 1);
  });
});
