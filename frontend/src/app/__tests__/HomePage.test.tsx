import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../page';

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

describe('HomePage Dashboard', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('istatistik başlıkları render ediyor', async () => {
    render(<HomePage />);
    expect(await screen.findByText('Hızlı İstatistikler')).toBeInTheDocument();
    expect(screen.getByText('Bugünkü Satış')).toBeInTheDocument();
    expect(screen.getByText('Aktif Ürün')).toBeInTheDocument();
  // Personel hem kart açıklamasında hem başlıkta geçiyor; heading rolü ile ayırt ediyoruz
  expect(screen.getByRole('heading', { name: 'Personel' })).toBeInTheDocument();
    expect(screen.getByText('Şube')).toBeInTheDocument();
  });

  it('Sentry DSN yoksa hata testi butonu görünmez', () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = '';
    render(<HomePage />);
    expect(screen.queryByRole('button', { name: /Hata Testi/ })).not.toBeInTheDocument();
  });

  it('Sentry DSN varsa hata testi butonu görünür', () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test-dsn@sentry.io/123';
    render(<HomePage />);
    expect(screen.getByRole('button', { name: /Hata Testi/ })).toBeInTheDocument();
  });
});
