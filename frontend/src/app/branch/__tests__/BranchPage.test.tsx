import React from 'react';
import { render, screen } from '@testing-library/react';

const mockUseBranches = jest.fn(() => ({ data: [], isLoading: false, error: null }));
const mockUseCreateBranch = jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null }));
const mockUseUpdateBranch = jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null }));
const mockUseDeleteBranch = jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null }));

// React Query hooks'larını mockla
jest.mock('../hooks', () => ({
  useBranches: () => mockUseBranches(),
  useCreateBranch: () => mockUseCreateBranch(),
  useUpdateBranch: () => mockUseUpdateBranch(),
  useDeleteBranch: () => mockUseDeleteBranch()
}));

// next/link'i basit bir wrapper ile mockla
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>
}));

// UI Button bileşenini basit bir button ile mockla
jest.mock('@/components/ui/button', () => ({
  Button: (props: any) => <button {...props} />
}));

import BranchPage from '../page';

describe('BranchPage', () => {
  it('başlık render ediyor', async () => {
    render(<BranchPage />);
    const heading = await screen.findByRole('heading', { name: 'Şube Yönetimi' });
    expect(heading).toBeInTheDocument();
  });
});
