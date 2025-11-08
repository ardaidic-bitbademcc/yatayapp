import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockPush = jest.fn();
const mockGet = jest.fn();
const mockSignInWithOtp = jest.fn();
const mockSignInWithPassword = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet })
}));

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithOtp: (...args: any[]) => mockSignInWithOtp(...args),
      signInWithPassword: (...args: any[]) => mockSignInWithPassword(...args)
    }
  }
}));

jest.mock('@/components/ui/button', () => ({
  Button: (props: any) => <button {...props} />
}));

import LoginPage from '../page';

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue(null);
    delete (global as any).fetch;
  });

  describe('Render Tests', () => {
    it('başlık render ediyor', async () => {
      render(<LoginPage />);
      const heading = await screen.findByRole('heading', { name: 'Giriş Yap' });
      expect(heading).toBeInTheDocument();
    });

    it('varsayılan olarak password mode aktif', async () => {
      render(<LoginPage />);
      await screen.findByPlaceholderText('E-posta adresiniz');
      expect(screen.getByPlaceholderText('Şifreniz')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Giriş Yap' })).toBeInTheDocument();
    });

    it('magic link moduna geçiş yapılabiliyor', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);
      
      await screen.findByPlaceholderText('E-posta adresiniz');
      const magicLinkButton = screen.getByRole('button', { name: 'Magic Link' });
      await user.click(magicLinkButton);
      
      expect(screen.getByRole('button', { name: 'Giriş Linki Gönder' })).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Şifreniz')).not.toBeInTheDocument();
    });
  });

  describe('Password Login', () => {
    it('başarılı giriş sonrası redirect ediyor', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { session: { access_token: 'token' } },
        error: null
      });

      render(<LoginPage />);
      await screen.findByPlaceholderText('E-posta adresiniz');

      await user.type(screen.getByPlaceholderText('E-posta adresiniz'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Şifreniz'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Giriş Yap' }));

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('hatalı giriş durumunda error mesajı gösteriyor', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'Invalid credentials' }
      });

      render(<LoginPage />);
      await screen.findByPlaceholderText('E-posta adresiniz');

      await user.type(screen.getByPlaceholderText('E-posta adresiniz'), 'wrong@example.com');
      await user.type(screen.getByPlaceholderText('Şifreniz'), 'wrongpass');
      await user.click(screen.getByRole('button', { name: 'Giriş Yap' }));

      await waitFor(() => {
        expect(screen.getByText(/Hata: Invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('redirect parametresi ile giriş yapılabiliyor', async () => {
      const user = userEvent.setup();
      mockGet.mockReturnValue('/branch');
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { session: { access_token: 'token' } },
        error: null
      });

      render(<LoginPage />);
      await screen.findByPlaceholderText('E-posta adresiniz');

      await user.type(screen.getByPlaceholderText('E-posta adresiniz'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Şifreniz'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Giriş Yap' }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/branch');
      });
    });

    it('loading durumunda button disable oluyor', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<LoginPage />);
      await screen.findByPlaceholderText('E-posta adresiniz');

      await user.type(screen.getByPlaceholderText('E-posta adresiniz'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Şifreniz'), 'password123');
      
      const button = screen.getByRole('button', { name: 'Giriş Yap' });
      await user.click(button);

      expect(screen.getByRole('button', { name: 'Giriş Yapılıyor...' })).toBeDisabled();
    });
  });

  describe('OTP Login', () => {
    it('magic link başarıyla gönderilebiliyor', async () => {
      const user = userEvent.setup();
      mockSignInWithOtp.mockResolvedValueOnce({ error: null });

      render(<LoginPage />);
      await screen.findByPlaceholderText('E-posta adresiniz');

      const magicLinkButton = screen.getByRole('button', { name: 'Magic Link' });
      await user.click(magicLinkButton);

      await user.type(screen.getByPlaceholderText('E-posta adresiniz'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: 'Giriş Linki Gönder' }));

      await waitFor(() => {
        expect(mockSignInWithOtp).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(screen.getByText(/Giriş linki e-posta adresinize gönderildi/i)).toBeInTheDocument();
      });
    });

    it('magic link hatası gösteriliyor', async () => {
      const user = userEvent.setup();
      mockSignInWithOtp.mockResolvedValueOnce({ error: { message: 'Email failed' } });

      render(<LoginPage />);
      await screen.findByPlaceholderText('E-posta adresiniz');

      const magicLinkButton = screen.getByRole('button', { name: 'Magic Link' });
      await user.click(magicLinkButton);

      await user.type(screen.getByPlaceholderText('E-posta adresiniz'), 'invalid@example.com');
      await user.click(screen.getByRole('button', { name: 'Giriş Linki Gönder' }));

      await waitFor(() => {
        expect(screen.getByText(/Hata: Email failed/i)).toBeInTheDocument();
      });
    });

    it('loading durumunda magic link button disable oluyor', async () => {
      const user = userEvent.setup();
      mockSignInWithOtp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<LoginPage />);
      await screen.findByPlaceholderText('E-posta adresiniz');

      const magicLinkButton = screen.getByRole('button', { name: 'Magic Link' });
      await user.click(magicLinkButton);

      await user.type(screen.getByPlaceholderText('E-posta adresiniz'), 'test@example.com');
      
      const sendButton = screen.getByRole('button', { name: 'Giriş Linki Gönder' });
      await user.click(sendButton);

      expect(screen.getByRole('button', { name: 'Gönderiliyor...' })).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('email alanı required', async () => {
      render(<LoginPage />);
      await screen.findByPlaceholderText('E-posta adresiniz');

      const emailInput = screen.getByPlaceholderText('E-posta adresiniz');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('password alanı required', async () => {
      render(<LoginPage />);
      await screen.findByPlaceholderText('E-posta adresiniz');

      const passwordInput = screen.getByPlaceholderText('Şifreniz');
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Demo Mode', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
    });

    afterEach(() => {
      delete process.env.NEXT_PUBLIC_DEMO_MODE;
    });

    it('demo mode aktif ise demo butonları gösteriliyor', async () => {
      render(<LoginPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Demo Verileri Oluştur' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Demo Kullanıcı Oluştur' })).toBeInTheDocument();
      });
    });

    it('demo verileri oluştur butonu çalışıyor', async () => {
      const user = userEvent.setup();
      (global as any).fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(<LoginPage />);
      await screen.findByRole('button', { name: 'Demo Verileri Oluştur' });

      await user.click(screen.getByRole('button', { name: 'Demo Verileri Oluştur' }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/demo/setup', expect.any(Object));
        expect(screen.getByText(/Demo verileri hazır!/i)).toBeInTheDocument();
      });
    });

    it('demo kullanıcı oluştur butonu çalışıyor', async () => {
      const user = userEvent.setup();
      (global as any).fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(<LoginPage />);
      await screen.findByRole('button', { name: 'Demo Kullanıcı Oluştur' });

      await user.click(screen.getByRole('button', { name: 'Demo Kullanıcı Oluştur' }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/demo/user', expect.any(Object));
        expect(screen.getByText(/Demo kullanıcı hazır/i)).toBeInTheDocument();
      });
    });

    it('demo API hatası gösteriliyor', async () => {
      const user = userEvent.setup();
      (global as any).fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'API Error' })
      });

      render(<LoginPage />);
      await screen.findByRole('button', { name: 'Demo Verileri Oluştur' });

      await user.click(screen.getByRole('button', { name: 'Demo Verileri Oluştur' }));

      await waitFor(() => {
        expect(screen.getByText(/Hata: API Error/i)).toBeInTheDocument();
      });
    });

    it('demo mode pasif ise demo hatası gösteriliyor', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'User not found' }
      });

      render(<LoginPage />);
      await screen.findByPlaceholderText('E-posta adresiniz');

      await user.type(screen.getByPlaceholderText('E-posta adresiniz'), 'demo@yatay.app');
      await user.type(screen.getByPlaceholderText('Şifreniz'), 'Demo1234!');
      await user.click(screen.getByRole('button', { name: 'Giriş Yap' }));

      await waitFor(() => {
        expect(screen.getByText(/Demo kullanıcı henüz yok olabilir/i)).toBeInTheDocument();
      });
    });
  });
});
