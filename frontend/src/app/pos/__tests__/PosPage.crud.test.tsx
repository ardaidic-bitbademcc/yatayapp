import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const insertMock = jest.fn(async () => ({ error: null }));
const deleteMock = jest.fn(async () => ({ error: null }));

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: (table: string) => ({
      select: async () => {
        if (table === 'products') {
          return { data: [{ id: 10, name: 'Ürün A', price: 50 }], error: null };
        }
        if (table === 'sales') {
          return { data: [{ id: 99, product_id: 10, quantity: 2 }], error: null };
        }
        return { data: [], error: null };
      },
      insert: insertMock,
      delete: () => ({ eq: () => deleteMock() })
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

describe('PosPage CRUD akışları', () => {
  it('satış ekleme akışı', async () => {
    render(<PosPage />);
  const selectEl = await screen.findByRole('combobox');
    fireEvent.change(selectEl, { target: { value: '10' } });
    const qtyInput = screen.getByDisplayValue('1');
    fireEvent.change(qtyInput, { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Satış Ekle' }));
    await waitFor(() => expect(insertMock).toHaveBeenCalled());
  });

  it('satış silme akışı', async () => {
    render(<PosPage />);
    const deleteButton = await screen.findByRole('button', { name: 'Sil' });
    fireEvent.click(deleteButton);
    await waitFor(() => expect(deleteMock).toHaveBeenCalled());
  });
});
