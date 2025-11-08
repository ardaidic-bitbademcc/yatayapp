import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const insertMock = jest.fn(async () => ({ error: null }));
const updateMock = jest.fn(async () => ({ error: null }));
const deleteMock = jest.fn(async () => ({ error: null }));
function withEq(fn) {
  return (...args) => ({ eq: () => fn(...args) });
}

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: (table: string) => ({
      select: async () => ({ data: [{ id: 1, name: 'Personel 1', role: 'Garson' }], error: null }),
      insert: insertMock,
      update: withEq(updateMock),
      delete: withEq(deleteMock)
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

describe('PersonnelPage CRUD akışları', () => {
  it('personel ekleme akışı', async () => {
    render(<PersonnelPage />);
    const nameInput = await screen.findByPlaceholderText('Personel adı');
    const roleInput = screen.getByPlaceholderText('Rol');
    fireEvent.change(nameInput, { target: { value: 'Test Personel' } });
    fireEvent.change(roleInput, { target: { value: 'Test Rol' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ekle' }));
    await waitFor(() => expect(insertMock).toHaveBeenCalled());
  });

  it('personel düzenleme ve güncelleme akışı', async () => {
    render(<PersonnelPage />);
    const editButton = await screen.findByRole('button', { name: 'Düzenle' });
    fireEvent.click(editButton);
    expect(screen.getByPlaceholderText('Personel adı')).toHaveValue('Personel 1');
    expect(screen.getByPlaceholderText('Rol')).toHaveValue('Garson');
    fireEvent.click(screen.getByRole('button', { name: 'Güncelle' }));
    await waitFor(() => expect(updateMock).toHaveBeenCalled());
    expect(screen.getByPlaceholderText('Personel adı')).toHaveValue('');
    expect(screen.getByPlaceholderText('Rol')).toHaveValue('');
  });

  it('personel silme akışı', async () => {
    render(<PersonnelPage />);
    const deleteButton = await screen.findByRole('button', { name: 'Sil' });
    fireEvent.click(deleteButton);
    await waitFor(() => expect(deleteMock).toHaveBeenCalled());
  });

  it('edit modunda iptal butonuna basınca form resetleniyor', async () => {
    render(<PersonnelPage />);
    const editButton = await screen.findByRole('button', { name: 'Düzenle' });
    fireEvent.click(editButton);
    expect(screen.getByPlaceholderText('Personel adı')).toHaveValue('Personel 1');
    expect(screen.getByPlaceholderText('Rol')).toHaveValue('Garson');
    fireEvent.click(screen.getByRole('button', { name: 'İptal' }));
    expect(screen.getByPlaceholderText('Personel adı')).toHaveValue('');
    expect(screen.getByPlaceholderText('Rol')).toHaveValue('');
  });
});
