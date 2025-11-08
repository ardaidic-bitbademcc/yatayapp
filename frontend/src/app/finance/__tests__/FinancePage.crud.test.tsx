import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockMutateAsync = jest.fn();

jest.mock('../hooks', () => ({
  useIncomeRecords: jest.fn(() => ({ 
    data: [{ id: 1, type: 'income', amount: 100, description: 'Satış' }], 
    isLoading: false, 
    error: null 
  })),
  useCreateIncomeRecord: jest.fn(() => ({ 
    mutateAsync: mockMutateAsync, 
    isPending: false, 
    error: null 
  })),
  useUpdateIncomeRecord: jest.fn(() => ({ 
    mutateAsync: mockMutateAsync, 
    isPending: false, 
    error: null 
  })),
  useDeleteIncomeRecord: jest.fn(() => ({ 
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

import FinancePage from '../page';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
});

const Wrapper = ({ children }: any) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('FinancePage CRUD akışları', () => {
  beforeEach(() => {
    mockMutateAsync.mockClear();
  });

  it('kayıt ekleme akışı', async () => {
    render(<FinancePage />, { wrapper: Wrapper });
    const amountInput = await screen.findByPlaceholderText('Tutar');
    const descriptionInput = screen.getByPlaceholderText('Açıklama');
    fireEvent.change(amountInput, { target: { value: '250' } });
    fireEvent.change(descriptionInput, { target: { value: 'Yeni Satış' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ekle' }));
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
  });

  it('kayıt düzenleme ve güncelleme akışı', async () => {
    render(<FinancePage />, { wrapper: Wrapper });
    const editButton = await screen.findByRole('button', { name: 'Düzenle' });
    fireEvent.click(editButton);
  expect(screen.getByPlaceholderText('Tutar')).toHaveValue(100);
    expect(screen.getByPlaceholderText('Açıklama')).toHaveValue('Satış');
    fireEvent.click(screen.getByRole('button', { name: 'Güncelle' }));
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
  });

  it('kayıt silme akışı', async () => {
    render(<FinancePage />, { wrapper: Wrapper });
    const deleteButton = await screen.findByRole('button', { name: 'Sil' });
    fireEvent.click(deleteButton);
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
  });
});
