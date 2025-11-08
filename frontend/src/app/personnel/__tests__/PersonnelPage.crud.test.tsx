import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockMutateAsync = jest.fn();

jest.mock('../hooks', () => ({
  usePersonnel: jest.fn(() => ({ 
    data: [{ id: 1, name: 'Personel 1', role: 'Garson' }], 
    isLoading: false, 
    error: null 
  })),
  useCreatePersonnel: jest.fn(() => ({ 
    mutateAsync: mockMutateAsync, 
    isPending: false, 
    error: null 
  })),
  useUpdatePersonnel: jest.fn(() => ({ 
    mutateAsync: mockMutateAsync, 
    isPending: false, 
    error: null 
  })),
  useDeletePersonnel: jest.fn(() => ({ 
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

import PersonnelPage from '../page';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
});

const Wrapper = ({ children }: any) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('PersonnelPage CRUD akışları', () => {
  beforeEach(() => {
    mockMutateAsync.mockClear();
  });

  it('personel ekleme akışı', async () => {
    render(<PersonnelPage />, { wrapper: Wrapper });
    const nameInput = await screen.findByPlaceholderText('Personel adı');
    const roleInput = screen.getByPlaceholderText('Rol');
    fireEvent.change(nameInput, { target: { value: 'Test Personel' } });
    fireEvent.change(roleInput, { target: { value: 'Test Rol' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ekle' }));
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
  });

  it('personel düzenleme ve güncelleme akışı', async () => {
    render(<PersonnelPage />, { wrapper: Wrapper });
    const editButton = await screen.findByRole('button', { name: 'Düzenle' });
    fireEvent.click(editButton);
    expect(screen.getByPlaceholderText('Personel adı')).toHaveValue('Personel 1');
    expect(screen.getByPlaceholderText('Rol')).toHaveValue('Garson');
    fireEvent.click(screen.getByRole('button', { name: 'Güncelle' }));
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
    expect(screen.getByPlaceholderText('Personel adı')).toHaveValue('');
    expect(screen.getByPlaceholderText('Rol')).toHaveValue('');
  });

  it('personel silme akışı', async () => {
    render(<PersonnelPage />, { wrapper: Wrapper });
    const deleteButton = await screen.findByRole('button', { name: 'Sil' });
    fireEvent.click(deleteButton);
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
  });

  it('edit modunda iptal butonuna basınca form resetleniyor', async () => {
    render(<PersonnelPage />, { wrapper: Wrapper });
    const editButton = await screen.findByRole('button', { name: 'Düzenle' });
    fireEvent.click(editButton);
    expect(screen.getByPlaceholderText('Personel adı')).toHaveValue('Personel 1');
    expect(screen.getByPlaceholderText('Rol')).toHaveValue('Garson');
    fireEvent.click(screen.getByRole('button', { name: 'İptal' }));
    expect(screen.getByPlaceholderText('Personel adı')).toHaveValue('');
    expect(screen.getByPlaceholderText('Rol')).toHaveValue('');
  });
});
