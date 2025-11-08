import React from 'react';
import { render, screen, act } from '@testing-library/react';

const mockUseBranches = jest.fn(() => ({ data: [], isLoading: false, error: { message: 'Bağlantı hatası' } }));
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

describe('BranchPage hata ve boş veri durumu', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  it('hata mesajı loading sonrası render ediliyor', async () => {
    render(<BranchPage />);
    // loading state hemen biter, error mesajı render edilir
    expect(await screen.findByText(/Hata: Bağlantı hatası/i)).toBeInTheDocument();
  });
});
