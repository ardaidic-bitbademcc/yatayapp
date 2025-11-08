import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockMutateAsync = jest.fn();
const mockUseBranches = jest.fn(() => ({ data: [{ id: 1, name: 'Şube 1', address: 'Adres 1' }], isLoading: false, error: null }));
const mockUseCreateBranch = jest.fn(() => ({ mutateAsync: mockMutateAsync, isPending: false, error: null }));
const mockUseUpdateBranch = jest.fn(() => ({ mutateAsync: mockMutateAsync, isPending: false, error: null }));
const mockUseDeleteBranch = jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null }));

jest.mock('../hooks', () => ({
  useBranches: () => mockUseBranches(),
  useCreateBranch: () => mockUseCreateBranch(),
  useUpdateBranch: () => mockUseUpdateBranch(),
  useDeleteBranch: () => mockUseDeleteBranch()
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>
}));

jest.mock('@/components/ui/button', () => ({
  Button: (props: any) => <button {...props} />
}));

import BranchPage from '../page';

describe('BranchPage form hata durumları', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBranches.mockReturnValue({ data: [], isLoading: false, error: null });
    mockUseCreateBranch.mockReturnValue({ mutateAsync: jest.fn(), isPending: false, error: null });
    mockUseUpdateBranch.mockReturnValue({ mutateAsync: jest.fn(), isPending: false, error: null });
    mockUseDeleteBranch.mockReturnValue({ mutateAsync: jest.fn(), isPending: false, error: null });
  });

  it('form ekleme mutateAsync çağrısı yapıyor', async () => {
    const createMutateAsync = jest.fn().mockResolvedValue({});
    mockUseCreateBranch.mockReturnValue({ 
      mutateAsync: createMutateAsync, 
      isPending: false, 
      error: null
    });

    render(<BranchPage />);

    const nameInput = await screen.findByPlaceholderText('Şube adı');
    const addressInput = screen.getByPlaceholderText('Adres');
    fireEvent.change(nameInput, { target: { value: 'Yeni Şube' } });
    fireEvent.change(addressInput, { target: { value: 'Yeni Adres' } });

    const submitButton = screen.getByRole('button', { name: 'Ekle' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalled();
    });
  });

  it('form güncelleme mutateAsync çağrısı yapıyor', async () => {
    mockUseBranches.mockReturnValue({ 
      data: [{ id: 1, name: 'Şube 1', address: 'Adres 1' }], 
      isLoading: false, 
      error: null 
    });
    
    const updateMutateAsync = jest.fn().mockResolvedValue({});
    mockUseUpdateBranch.mockReturnValue({ 
      mutateAsync: updateMutateAsync, 
      isPending: false, 
      error: null
    });

    render(<BranchPage />);

    await waitFor(() => {
      expect(screen.getByText('Şube 1')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: 'Düzenle' });
    fireEvent.click(editButton);

    const nameInput = screen.getByPlaceholderText('Şube adı');
    fireEvent.change(nameInput, { target: { value: 'Güncel Şube' } });

    const updateButton = screen.getByRole('button', { name: 'Güncelle' });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalled();
    });
  });
});
