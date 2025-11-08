import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const insertMock = jest.fn(async () => ({ error: { message: 'Personel ekleme hatası' } }));
const updateMock = jest.fn(async () => ({ error: { message: 'Personel güncelleme hatası' } }));
function withEq(fn) {
  return (...args) => ({ eq: () => fn(...args) });
}

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: (table: string) => ({
      select: async () => ({ data: [{ id: 1, name: 'Personel 1', role: 'Garson' }], error: null }),
      insert: insertMock,
      update: withEq(updateMock),
      delete: withEq(() => Promise.resolve({ error: null }))
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

import PersonnelPage from '../page';

describe('PersonnelPage form hata durumları', () => {
  it('ekleme hatası mesajı gösteriliyor', async () => {
    render(<PersonnelPage />);
    const nameInput = await screen.findByPlaceholderText('Personel adı');
    const roleInput = screen.getByPlaceholderText('Rol');
    fireEvent.change(nameInput, { target: { value: 'Test Personel' } });
    fireEvent.change(roleInput, { target: { value: 'Test Rol' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ekle' }));
    await waitFor(() => expect(screen.getByText(/Personel ekleme hatası/i)).toBeInTheDocument());
  });

  it('güncelleme hatası mesajı gösteriliyor', async () => {
    render(<PersonnelPage />);
    const editButton = await screen.findByRole('button', { name: 'Düzenle' });
    fireEvent.click(editButton);
    fireEvent.click(screen.getByRole('button', { name: 'Güncelle' }));
    await waitFor(() => expect(screen.getByText(/Personel güncelleme hatası/i)).toBeInTheDocument());
  });
});
