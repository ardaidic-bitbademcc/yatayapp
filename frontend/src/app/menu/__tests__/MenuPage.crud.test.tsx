import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockMutateAsync = jest.fn();

jest.mock('../hooks', () => ({
  useProducts: jest.fn(() => ({ 
    data: [{ id: 1, name: 'Ürün 1', price: 10 }], 
    isLoading: false, 
    error: null 
  })),
  useCreateProduct: jest.fn(() => ({ 
    mutateAsync: mockMutateAsync, 
    isPending: false, 
    error: null 
  })),
  useUpdateProduct: jest.fn(() => ({ 
    mutateAsync: mockMutateAsync, 
    isPending: false, 
    error: null 
  })),
  useDeleteProduct: jest.fn(() => ({ 
    mutateAsync: mockMutateAsync, 
    isPending: false, 
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

import MenuPage from '../page';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
});

const Wrapper = ({ children }: any) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('MenuPage CRUD akışları', () => {
  beforeEach(() => {
    mockMutateAsync.mockClear();
  });

  it('ürün ekleme akışı', async () => {
    render(<MenuPage />, { wrapper: Wrapper });
    const nameInput = await screen.findByPlaceholderText('Ürün adı');
    const priceInput = screen.getByPlaceholderText('Fiyat');
    fireEvent.change(nameInput, { target: { value: 'Test Ürün' } });
    fireEvent.change(priceInput, { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ekle' }));
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
  });

  it('ürün düzenleme ve güncelleme akışı', async () => {
    render(<MenuPage />, { wrapper: Wrapper });
    const editButton = await screen.findByRole('button', { name: 'Düzenle' });
    fireEvent.click(editButton);
  expect(screen.getByPlaceholderText('Ürün adı')).toHaveValue('Ürün 1');
  expect(screen.getByPlaceholderText('Fiyat')).toHaveValue(10);
    fireEvent.click(screen.getByRole('button', { name: 'Güncelle' }));
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
  });

  it('ürün silme akışı', async () => {
    render(<MenuPage />, { wrapper: Wrapper });
    const deleteButton = await screen.findByRole('button', { name: 'Sil' });
    fireEvent.click(deleteButton);
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
  });
});
