import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: () => null })
}));

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithOtp: jest.fn(async () => ({ error: null }))
    }
  }
}));

jest.mock('@/components/ui/button', () => ({
  Button: (props: any) => <button {...props} />
}));

import LoginPage from '../page';

describe('LoginPage', () => {
  it('başlık render ediyor', async () => {
    render(<LoginPage />);
    const heading = await screen.findByRole('heading', { name: 'Giriş Yap' });
    expect(heading).toBeInTheDocument();
  });
});
