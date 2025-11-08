import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRealtimeSync } from './useRealtimeSync';
import React from 'react';

// Mock Supabase
const mockOn = jest.fn();
const mockSubscribe = jest.fn();
const mockRemoveChannel = jest.fn();
const mockChannel = jest.fn();

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    channel: (...args: any[]) => mockChannel(...args),
    removeChannel: (...args: any[]) => mockRemoveChannel(...args)
  }
}));

describe('useRealtimeSync', () => {
  let queryClient: QueryClient;
  let mockChannelInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    // Setup mock channel chain
    mockChannelInstance = {
      on: mockOn,
      subscribe: mockSubscribe
    };
    
    mockOn.mockReturnValue(mockChannelInstance);
    mockSubscribe.mockReturnValue(mockChannelInstance);
    mockChannel.mockReturnValue(mockChannelInstance);
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  describe('Subscription Setup', () => {
    it('creates channel with correct table name', () => {
      renderHook(() => useRealtimeSync('products', ['products']), { wrapper });

      expect(mockChannel).toHaveBeenCalledWith('products_changes');
    });

    it('subscribes to postgres_changes events', () => {
      renderHook(() => useRealtimeSync('branches', ['branches']), { wrapper });

      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'branches' },
        expect.any(Function)
      );
    });

    it('calls subscribe to activate channel', () => {
      renderHook(() => useRealtimeSync('personnel', ['personnel']), { wrapper });

      expect(mockSubscribe).toHaveBeenCalled();
    });

    it('handles multiple tables independently', () => {
      const { unmount: unmount1 } = renderHook(() => useRealtimeSync('products', ['products']), { wrapper });
      const { unmount: unmount2 } = renderHook(() => useRealtimeSync('branches', ['branches']), { wrapper });

      expect(mockChannel).toHaveBeenCalledWith('products_changes');
      expect(mockChannel).toHaveBeenCalledWith('branches_changes');
      expect(mockChannel).toHaveBeenCalledTimes(2);

      unmount1();
      unmount2();
    });
  });

  describe('INSERT Event Handling', () => {
    it('adds new item to query cache on INSERT', async () => {
      const queryKey = ['products'];
      queryClient.setQueryData(queryKey, [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' }
      ]);

      renderHook(() => useRealtimeSync('products', queryKey), { wrapper });

      // Get the callback function passed to .on()
      const callback = mockOn.mock.calls[0][2];
      
      // Simulate INSERT event
      callback({
        eventType: 'INSERT',
        new: { id: 3, name: 'Product 3' }
      });

      await waitFor(() => {
        const data = queryClient.getQueryData(queryKey);
        expect(data).toHaveLength(3);
        expect(data).toContainEqual({ id: 3, name: 'Product 3' });
      });
    });

    it('handles INSERT when cache is empty', async () => {
      const queryKey = ['products'];
      queryClient.setQueryData(queryKey, []);

      renderHook(() => useRealtimeSync('products', queryKey), { wrapper });

      const callback = mockOn.mock.calls[0][2];
      callback({
        eventType: 'INSERT',
        new: { id: 1, name: 'First Product' }
      });

      await waitFor(() => {
        const data = queryClient.getQueryData(queryKey);
        expect(data).toEqual([{ id: 1, name: 'First Product' }]);
      });
    });

    it('handles INSERT when cache is null/undefined', async () => {
      const queryKey = ['products'];
      // Don't set any initial data

      renderHook(() => useRealtimeSync('products', queryKey), { wrapper });

      const callback = mockOn.mock.calls[0][2];
      callback({
        eventType: 'INSERT',
        new: { id: 1, name: 'First Product' }
      });

      await waitFor(() => {
        const data = queryClient.getQueryData(queryKey);
        expect(data).toEqual([{ id: 1, name: 'First Product' }]);
      });
    });
  });

  describe('UPDATE Event Handling', () => {
    it('updates existing item in query cache on UPDATE', async () => {
      const queryKey = ['products'];
      queryClient.setQueryData(queryKey, [
        { id: 1, name: 'Product 1', price: 100 },
        { id: 2, name: 'Product 2', price: 200 }
      ]);

      renderHook(() => useRealtimeSync('products', queryKey), { wrapper });

      const callback = mockOn.mock.calls[0][2];
      callback({
        eventType: 'UPDATE',
        new: { id: 1, name: 'Updated Product 1', price: 150 }
      });

      await waitFor(() => {
        const data = queryClient.getQueryData(queryKey) as any[];
        const updated = data.find(item => item.id === 1);
        expect(updated?.name).toBe('Updated Product 1');
        expect(updated?.price).toBe(150);
      });
    });

    it('preserves other items when updating one', async () => {
      const queryKey = ['products'];
      queryClient.setQueryData(queryKey, [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
        { id: 3, name: 'Product 3' }
      ]);

      renderHook(() => useRealtimeSync('products', queryKey), { wrapper });

      const callback = mockOn.mock.calls[0][2];
      callback({
        eventType: 'UPDATE',
        new: { id: 2, name: 'Updated Product 2' }
      });

      await waitFor(() => {
        const data = queryClient.getQueryData(queryKey) as any[];
        expect(data).toHaveLength(3);
        expect(data[0]).toEqual({ id: 1, name: 'Product 1' });
        expect(data[1]).toEqual({ id: 2, name: 'Updated Product 2' });
        expect(data[2]).toEqual({ id: 3, name: 'Product 3' });
      });
    });

    it('handles UPDATE for non-existent item gracefully', async () => {
      const queryKey = ['products'];
      queryClient.setQueryData(queryKey, [
        { id: 1, name: 'Product 1' }
      ]);

      renderHook(() => useRealtimeSync('products', queryKey), { wrapper });

      const callback = mockOn.mock.calls[0][2];
      callback({
        eventType: 'UPDATE',
        new: { id: 99, name: 'Non-existent' }
      });

      await waitFor(() => {
        const data = queryClient.getQueryData(queryKey) as any[];
        // Should not crash, original data preserved
        expect(data).toHaveLength(1);
        expect(data[0]).toEqual({ id: 1, name: 'Product 1' });
      });
    });
  });

  describe('DELETE Event Handling', () => {
    it('removes item from query cache on DELETE', async () => {
      const queryKey = ['products'];
      queryClient.setQueryData(queryKey, [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
        { id: 3, name: 'Product 3' }
      ]);

      renderHook(() => useRealtimeSync('products', queryKey), { wrapper });

      const callback = mockOn.mock.calls[0][2];
      callback({
        eventType: 'DELETE',
        old: { id: 2 }
      });

      await waitFor(() => {
        const data = queryClient.getQueryData(queryKey) as any[];
        expect(data).toHaveLength(2);
        expect(data.find(item => item.id === 2)).toBeUndefined();
      });
    });

    it('handles DELETE for non-existent item gracefully', async () => {
      const queryKey = ['products'];
      queryClient.setQueryData(queryKey, [
        { id: 1, name: 'Product 1' }
      ]);

      renderHook(() => useRealtimeSync('products', queryKey), { wrapper });

      const callback = mockOn.mock.calls[0][2];
      callback({
        eventType: 'DELETE',
        old: { id: 99 }
      });

      await waitFor(() => {
        const data = queryClient.getQueryData(queryKey) as any[];
        expect(data).toHaveLength(1);
        expect(data[0]).toEqual({ id: 1, name: 'Product 1' });
      });
    });

    it('handles DELETE when cache is empty', async () => {
      const queryKey = ['products'];
      queryClient.setQueryData(queryKey, []);

      renderHook(() => useRealtimeSync('products', queryKey), { wrapper });

      const callback = mockOn.mock.calls[0][2];
      callback({
        eventType: 'DELETE',
        old: { id: 1 }
      });

      await waitFor(() => {
        const data = queryClient.getQueryData(queryKey);
        expect(data).toEqual([]);
      });
    });
  });

  describe('Query Invalidation', () => {
    it('invalidates queries on any event', async () => {
      const queryKey = ['products'];
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      
      renderHook(() => useRealtimeSync('products', queryKey), { wrapper });

      const callback = mockOn.mock.calls[0][2];
      
      callback({ eventType: 'INSERT', new: { id: 1 } });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey });
      
      callback({ eventType: 'UPDATE', new: { id: 1 } });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey });
      
      callback({ eventType: 'DELETE', old: { id: 1 } });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey });
    });
  });

  describe('Cleanup', () => {
    it('removes channel on unmount', () => {
      const { unmount } = renderHook(() => useRealtimeSync('products', ['products']), { wrapper });

      expect(mockRemoveChannel).not.toHaveBeenCalled();

      unmount();

      expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannelInstance);
    });

    it('removes correct channel when multiple hooks are active', () => {
      const { unmount: unmount1 } = renderHook(() => useRealtimeSync('products', ['products']), { wrapper });
      const { unmount: unmount2 } = renderHook(() => useRealtimeSync('branches', ['branches']), { wrapper });

      unmount1();
      expect(mockRemoveChannel).toHaveBeenCalledTimes(1);

      unmount2();
      expect(mockRemoveChannel).toHaveBeenCalledTimes(2);
    });
  });

  describe('Dependency Updates', () => {
    it('resubscribes when table changes', () => {
      const { rerender } = renderHook(
        ({ table, queryKey }) => useRealtimeSync(table, queryKey),
        {
          wrapper,
          initialProps: { table: 'products', queryKey: ['products'] }
        }
      );

      expect(mockChannel).toHaveBeenCalledWith('products_changes');
      expect(mockChannel).toHaveBeenCalledTimes(1);

      rerender({ table: 'branches', queryKey: ['branches'] });

      expect(mockChannel).toHaveBeenCalledWith('branches_changes');
      expect(mockChannel).toHaveBeenCalledTimes(2);
      expect(mockRemoveChannel).toHaveBeenCalledTimes(1);
    });

    it('resubscribes when queryKey changes', () => {
      const { rerender } = renderHook(
        ({ table, queryKey }) => useRealtimeSync(table, queryKey),
        {
          wrapper,
          initialProps: { table: 'products', queryKey: ['products'] }
        }
      );

      expect(mockSubscribe).toHaveBeenCalledTimes(1);

      rerender({ table: 'products', queryKey: ['products', { filter: 'active' }] });

      expect(mockSubscribe).toHaveBeenCalledTimes(2);
      expect(mockRemoveChannel).toHaveBeenCalledTimes(1);
    });

    it('does not resubscribe when dependencies are unchanged', () => {
      const { rerender } = renderHook(
        ({ table, queryKey }) => useRealtimeSync(table, queryKey),
        {
          wrapper,
          initialProps: { table: 'products', queryKey: ['products'] }
        }
      );

      expect(mockSubscribe).toHaveBeenCalledTimes(1);

      // Rerender with same props
      rerender({ table: 'products', queryKey: ['products'] });

      // Should not create new subscription
      expect(mockSubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles events with missing data gracefully', async () => {
      const queryKey = ['products'];
      queryClient.setQueryData(queryKey, [{ id: 1, name: 'Product 1' }]);

      renderHook(() => useRealtimeSync('products', queryKey), { wrapper });

      const callback = mockOn.mock.calls[0][2];
      
      // Event with no new/old data
      callback({ eventType: 'INSERT' });
      callback({ eventType: 'UPDATE' });
      callback({ eventType: 'DELETE' });

      // Should not crash
      const data = queryClient.getQueryData(queryKey);
      expect(data).toBeDefined();
    });

    it('handles complex queryKey arrays', () => {
      const complexKey = ['products', { category: 'coffee', active: true }];
      
      renderHook(() => useRealtimeSync('products', complexKey), { wrapper });

      const callback = mockOn.mock.calls[0][2];
      callback({
        eventType: 'INSERT',
        new: { id: 1, name: 'Product 1' }
      });

      // Should handle complex keys without crashing
      expect(mockChannel).toHaveBeenCalled();
    });

    it('works with empty string table name', () => {
      renderHook(() => useRealtimeSync('', ['']), { wrapper });

      expect(mockChannel).toHaveBeenCalledWith('_changes');
    });
  });
});
