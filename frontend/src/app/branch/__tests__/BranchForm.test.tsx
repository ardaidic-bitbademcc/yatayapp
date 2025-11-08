import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockMutateAsync = jest.fn();
const mockUseBranches = jest.fn(() => ({ data: [], isLoading: false, error: null }));
const mockUseCreateBranch = jest.fn(() => ({ mutateAsync: mockMutateAsync, isPending: false, error: null }));
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

describe('Branch form etkileşim testi', () => {
  it('yeni şube ekleme akışı', async () => {
    render(<BranchPage />);
    const nameInput = await screen.findByPlaceholderText('Şube adı');
    const addressInput = screen.getByPlaceholderText('Adres');
    fireEvent.change(nameInput, { target: { value: 'Test Şube' } });
    fireEvent.change(addressInput, { target: { value: 'Test Adres' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ekle' }));
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
  });
});
