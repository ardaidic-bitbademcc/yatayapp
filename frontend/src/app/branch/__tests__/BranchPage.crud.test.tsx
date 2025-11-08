
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// React Query hooks mock
const mockMutateAsync = jest.fn();
jest.mock('../hooks', () => ({
  useBranches: jest.fn(() => ({ 
    data: [{ id: 1, name: 'Şube 1', address: 'Adres 1' }], 
    isLoading: false, 
    error: null 
  })),
  useCreateBranch: jest.fn(() => ({ 
    mutateAsync: mockMutateAsync, 
    isPending: false, 
    error: null 
  })),
  useUpdateBranch: jest.fn(() => ({ 
    mutateAsync: mockMutateAsync, 
    isPending: false, 
    error: null 
  })),
  useDeleteBranch: jest.fn(() => ({ 
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

import BranchPage from '../page';

describe('BranchPage CRUD akışları', () => {
  it('şube silme akışı', async () => {
    render(<BranchPage />);
    const deleteButton = await screen.findByRole('button', { name: 'Sil' });
    fireEvent.click(deleteButton);
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
  });

  it('şube düzenleme ve güncelleme akışı', async () => {
    render(<BranchPage />);
    const editButton = await screen.findByRole('button', { name: 'Düzenle' });
    fireEvent.click(editButton);
    // Form inputları edit modunda dolu gelmeli
    expect(screen.getByPlaceholderText('Şube adı')).toHaveValue('Şube 1');
    expect(screen.getByPlaceholderText('Adres')).toHaveValue('Adres 1');
    // Güncelle butonuna tıkla
    const updateBtn = screen.getByRole('button', { name: 'Güncelle' });
    fireEvent.click(updateBtn);
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
    // Form resetlenmeli
    expect(screen.getByPlaceholderText('Şube adı')).toHaveValue('');
    expect(screen.getByPlaceholderText('Adres')).toHaveValue('');
  });
});
