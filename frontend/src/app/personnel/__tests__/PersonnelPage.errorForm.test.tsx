import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('../hooks', () => ({
  usePersonnel: jest.fn(() => ({ 
    data: [{ id: 1, name: 'Personel 1', role: 'Garson' }], 
    isLoading: false, 
    error: null 
  })),
  useCreatePersonnel: jest.fn(() => ({ 
    mutateAsync: jest.fn().mockRejectedValue(new Error('Personel ekleme hatası')), 
    isPending: false, 
    error: { message: 'Personel ekleme hatası' } 
  })),
  useUpdatePersonnel: jest.fn(() => ({ 
    mutateAsync: jest.fn().mockRejectedValue(new Error('Personel güncelleme hatası')), 
    isPending: false, 
    error: { message: 'Personel güncelleme hatası' } 
  })),
  useDeletePersonnel: jest.fn(() => ({ 
    mutateAsync: jest.fn(), 
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

import PersonnelPage from '../page';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
});

const Wrapper = ({ children }: any) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('PersonnelPage form hata durumları', () => {
  it('ekleme hatası mesajı gösteriliyor', async () => {
    render(<PersonnelPage />, { wrapper: Wrapper });
    // Hata hook'tan döndüğü için component'te render edilmeli
    expect(await screen.findByText(/Personel ekleme hatası/i)).toBeInTheDocument();
  });
});
