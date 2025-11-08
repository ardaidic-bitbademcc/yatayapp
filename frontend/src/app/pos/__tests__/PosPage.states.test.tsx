import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: (table: string) => ({
      select: async () => ({ data: [], error: null })
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

describe('PosPage boş veri durumu', () => {
  it('hiç ürün yok ve hiç satış yok mesajı render ediyor', async () => {
    render(<PosPage />);
    expect(await screen.findByText(/Hiç ürün yok/i)).toBeInTheDocument();
    expect(screen.getByText(/Hiç satış yok/i)).toBeInTheDocument();
  });
});
