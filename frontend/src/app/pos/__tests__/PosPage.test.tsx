import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: async () => ({ data: [], error: null }),
      insert: async () => ({ error: null }),
      delete: async () => ({ error: null })
    })
  }
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>
}));

jest.mock('@/components/ui/button', () => ({
  Button: (props: any) => <button {...props} />
}));

import PosPage from '../page';

describe('PosPage', () => {
  it('başlık render ediyor', async () => {
    render(<PosPage />);
    const heading = await screen.findByRole('heading', { name: 'Satış Ekranı (POS)' });
    expect(heading).toBeInTheDocument();
  });
});
