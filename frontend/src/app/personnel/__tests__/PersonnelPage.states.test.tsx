import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('../hooks', () => ({
  usePersonnel: jest.fn(() => ({ data: [], isLoading: false, error: null })),
  useCreatePersonnel: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null })),
  useUpdatePersonnel: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null })),
  useDeletePersonnel: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null }))
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>
}));

jest.mock('@/components/ui/button', () => ({
  Button: (props: any) => <button {...props} />
}));

import PersonnelPage from '../page';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
});

const Wrapper = ({ children }: any) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('PersonnelPage boş veri durumu', () => {
  it('hiç personel bulunamadı mesajı render ediyor', async () => {
    render(<PersonnelPage />, { wrapper: Wrapper });
    expect(await screen.findByText(/Hiç personel bulunamadı/i)).toBeInTheDocument();
  });
});
