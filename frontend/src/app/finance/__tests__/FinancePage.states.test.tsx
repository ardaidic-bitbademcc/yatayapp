import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: () => ({
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

import FinancePage from '../page';

describe('FinancePage boş veri durumu', () => {
  it('hiç kayıt yok mesajı render ediyor', async () => {
    render(<FinancePage />);
    expect(await screen.findByText(/Hiç kayıt yok/i)).toBeInTheDocument();
  });
});
