import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockMutateAsync = jest.fn();

jest.mock('../hooks', () => ({
  useSales: jest.fn(() => ({ 
    data: [{ id: 99, product_id: 10, quantity: 2 }], 
    isLoading: false, 
    error: null 
  })),
  useCreateSale: jest.fn(() => ({ 
    mutateAsync: mockMutateAsync, 
    isPending: false, 
    error: null 
  })),
  useDeleteSale: jest.fn(() => ({ 
    mutateAsync: mockMutateAsync, 
    isPending: false, 
    error: null 
  }))
}));

jest.mock('@/app/menu/hooks', () => ({
  useProducts: jest.fn(() => ({ 
    data: [{ id: 10, name: 'Ürün A', price: 50 }], 
    isLoading: false, 
    error: null 
  }))
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>
}));

jest.mock('@/components/ui/button', () => ({
  Button: (props: any) => <button {...props} />
}));

import PosPage from '../page';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
});

const Wrapper = ({ children }: any) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('PosPage CRUD akışları', () => {
  beforeEach(() => {
    mockMutateAsync.mockClear();
  });

  it('satış ekleme akışı', async () => {
    render(<PosPage />, { wrapper: Wrapper });
  const selectEl = await screen.findByRole('combobox');
    fireEvent.change(selectEl, { target: { value: '10' } });
    const qtyInput = screen.getByDisplayValue('1');
    fireEvent.change(qtyInput, { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Satış Ekle' }));
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
  });

  it('satış silme akışı', async () => {
    render(<PosPage />, { wrapper: Wrapper });
    const deleteButton = await screen.findByRole('button', { name: 'Sil' });
    fireEvent.click(deleteButton);
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
  });
});
