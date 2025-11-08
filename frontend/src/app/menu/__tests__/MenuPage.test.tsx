import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: async () => ({ data: [], error: null }),
      update: async () => ({ error: null }),
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

import MenuPage from '../page';

describe('MenuPage', () => {
  it('başlık render ediyor', async () => {
    render(<MenuPage />);
    const heading = await screen.findByRole('heading', { name: 'Menü Mühendisliği' });
    expect(heading).toBeInTheDocument();
  });
});
