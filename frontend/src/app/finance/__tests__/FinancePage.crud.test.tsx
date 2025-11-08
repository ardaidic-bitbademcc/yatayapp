import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const insertMock = jest.fn(async () => ({ error: null }));
const updateMock = jest.fn(async () => ({ error: null }));
const deleteMock = jest.fn(async () => ({ error: null }));

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: (table: string) => ({
      select: async () => ({ data: [{ id: 1, type: 'income', amount: 100, description: 'Satış' }], error: null }),
      insert: insertMock,
      update: (_: any) => ({ eq: () => updateMock() }),
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

import FinancePage from '../page';

describe('FinancePage CRUD akışları', () => {
  it('kayıt ekleme akışı', async () => {
    render(<FinancePage />);
    const amountInput = await screen.findByPlaceholderText('Tutar');
    const descriptionInput = screen.getByPlaceholderText('Açıklama');
    fireEvent.change(amountInput, { target: { value: '250' } });
    fireEvent.change(descriptionInput, { target: { value: 'Yeni Satış' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ekle' }));
    await waitFor(() => expect(insertMock).toHaveBeenCalled());
  });

  it('kayıt düzenleme ve güncelleme akışı', async () => {
    render(<FinancePage />);
    const editButton = await screen.findByRole('button', { name: 'Düzenle' });
    fireEvent.click(editButton);
  expect(screen.getByPlaceholderText('Tutar')).toHaveValue(100);
    expect(screen.getByPlaceholderText('Açıklama')).toHaveValue('Satış');
    fireEvent.click(screen.getByRole('button', { name: 'Güncelle' }));
    await waitFor(() => expect(updateMock).toHaveBeenCalled());
  });

  it('kayıt silme akışı', async () => {
    render(<FinancePage />);
    const deleteButton = await screen.findByRole('button', { name: 'Sil' });
    fireEvent.click(deleteButton);
    await waitFor(() => expect(deleteMock).toHaveBeenCalled());
  });
});
