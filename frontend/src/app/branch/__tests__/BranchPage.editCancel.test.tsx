import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockUseBranches = jest.fn(() => ({ data: [{ id: 1, name: 'Şube 1', address: 'Adres 1' }], isLoading: false, error: null }));
const mockUseCreateBranch = jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null }));
const mockUseUpdateBranch = jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null }));
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

describe('BranchPage edit iptal akışı', () => {
  it('edit modunda iptal butonuna basınca form resetleniyor', async () => {
    render(<BranchPage />);
    const editButton = await screen.findByRole('button', { name: 'Düzenle' });
    fireEvent.click(editButton);
    expect(screen.getByPlaceholderText('Şube adı')).toHaveValue('Şube 1');
    expect(screen.getByPlaceholderText('Adres')).toHaveValue('Adres 1');
    fireEvent.click(screen.getByRole('button', { name: 'İptal' }));
    expect(screen.getByPlaceholderText('Şube adı')).toHaveValue('');
    expect(screen.getByPlaceholderText('Adres')).toHaveValue('');
  });
});
