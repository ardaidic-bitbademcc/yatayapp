import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('../hooks', () => ({
  useSales: jest.fn(() => ({ data: [], isLoading: false, error: null })),
  useCreateSale: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null })),
  useUpdateSale: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null })),
  useDeleteSale: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null }))
}));

jest.mock('@/app/menu/hooks', () => ({
  useProducts: jest.fn(() => ({ data: [], isLoading: false, error: null }))
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

describe('PosPage', () => {
  it('başlık render ediyor', async () => {
    render(<PosPage />, { wrapper: Wrapper });
    const heading = await screen.findByRole('heading', { name: 'Satış Ekranı (POS)' });
    expect(heading).toBeInTheDocument();
  });
});
