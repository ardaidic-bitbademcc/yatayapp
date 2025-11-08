import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const insertMock = jest.fn(async () => ({ error: null }));
const updateMock = jest.fn(async () => ({ error: null }));
const deleteMock = jest.fn(async () => ({ error: null }));

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: (table: string) => ({
      select: async () => ({ data: [{ id: 1, name: 'Ürün 1', price: 10 }], error: null }),
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

import MenuPage from '../page';

describe('MenuPage CRUD akışları', () => {
  it('ürün ekleme akışı', async () => {
    render(<MenuPage />);
    const nameInput = await screen.findByPlaceholderText('Ürün adı');
    const priceInput = screen.getByPlaceholderText('Fiyat');
    fireEvent.change(nameInput, { target: { value: 'Test Ürün' } });
    fireEvent.change(priceInput, { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ekle' }));
    await waitFor(() => expect(insertMock).toHaveBeenCalled());
  });

  it('ürün düzenleme ve güncelleme akışı', async () => {
    render(<MenuPage />);
    const editButton = await screen.findByRole('button', { name: 'Düzenle' });
    fireEvent.click(editButton);
  expect(screen.getByPlaceholderText('Ürün adı')).toHaveValue('Ürün 1');
  expect(screen.getByPlaceholderText('Fiyat')).toHaveValue(10);
    fireEvent.click(screen.getByRole('button', { name: 'Güncelle' }));
    await waitFor(() => expect(updateMock).toHaveBeenCalled());
  });

  it('ürün silme akışı', async () => {
    render(<MenuPage />);
    const deleteButton = await screen.findByRole('button', { name: 'Sil' });
    fireEvent.click(deleteButton);
    await waitFor(() => expect(deleteMock).toHaveBeenCalled());
  });
});
