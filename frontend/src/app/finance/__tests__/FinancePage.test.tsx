import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('../hooks', () => ({
  useIncomeRecords: jest.fn(() => ({ data: [], isLoading: false, error: null })),
  useCreateIncomeRecord: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null })),
  useUpdateIncomeRecord: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null })),
  useDeleteIncomeRecord: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null }))
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

describe('FinancePage', () => {
  it('başlık render ediyor', async () => {
    render(<FinancePage />, { wrapper: Wrapper });
    const heading = await screen.findByRole('heading', { name: 'Finans Yönetimi' });
    expect(heading).toBeInTheDocument();
  });
});
