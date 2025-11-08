import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockUseBranches = jest.fn(() => ({ data: [], isLoading: false, error: null }));
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

describe('BranchPage boş liste durumu', () => {
  it('hiç şube yoksa mesaj gösteriliyor', async () => {
    render(<BranchPage />);
    expect(await screen.findByText(/Hiç şube bulunamadı/i)).toBeInTheDocument();
  });
});
