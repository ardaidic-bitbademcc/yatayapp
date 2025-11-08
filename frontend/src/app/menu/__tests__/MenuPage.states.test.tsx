import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('../hooks', () => ({
  useProducts: jest.fn(() => ({ data: [], isLoading: false, error: null })),
  useCreateProduct: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null })),
  useUpdateProduct: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null })),
  useDeleteProduct: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null }))
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

describe('MenuPage boş veri durumu', () => {
  it('hiç ürün bulunamadı mesajı render ediyor', async () => {
    render(<MenuPage />, { wrapper: Wrapper });
    expect(await screen.findByText(/Hiç ürün bulunamadı/i)).toBeInTheDocument();
  });
});
