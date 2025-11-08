import { NextRequest, NextResponse } from 'next/server';
import { POST } from './route';

// Mock Supabase Admin
const mockCreateUser = jest.fn();
const mockGetUserByEmail = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      admin: {
        createUser: mockCreateUser,
        getUserByEmail: mockGetUserByEmail
      }
    }
  }))
}));

// Helper to create NextRequest with headers
function createRequest(headers: Record<string, string> = {}): NextRequest {
  const url = 'http://localhost:3000/api/demo/user';
  const headersObj = new Headers(headers);
  return new NextRequest(url, { method: 'POST', headers: headersObj });
}

describe('Demo User API Route', () => {
  const DEMO_EMAIL = 'demo@yatay.app';
  const DEMO_PASSWORD = 'Demo1234!';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Demo Mode Control', () => {
    it('returns 403 when demo mode is disabled', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_DEMO_MODE;
      process.env.NEXT_PUBLIC_DEMO_MODE = 'false';

      const request = createRequest({ 'x-demo-setup-token': 'test-token' });
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.error).toBe('Demo modu kapalı');
      expect(mockCreateUser).not.toHaveBeenCalled();

      process.env.NEXT_PUBLIC_DEMO_MODE = originalEnv;
    });

    it('returns 403 when demo mode is undefined', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_DEMO_MODE;
      delete process.env.NEXT_PUBLIC_DEMO_MODE;

      const request = createRequest({ 'x-demo-setup-token': 'test-token' });
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.error).toBe('Demo modu kapalı');

      process.env.NEXT_PUBLIC_DEMO_MODE = originalEnv;
    });
  });

  describe('Token Authentication', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
      process.env.DEMO_SETUP_TOKEN = 'valid-token';
    });

    afterEach(() => {
      delete process.env.NEXT_PUBLIC_DEMO_MODE;
      delete process.env.DEMO_SETUP_TOKEN;
    });

    it('returns 401 when token is missing', async () => {
      const request = createRequest(); // no token
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('Yetkisiz istek');
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it('returns 401 when token is invalid', async () => {
      const request = createRequest({ 'x-demo-setup-token': 'wrong-token' });
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('Yetkisiz istek');
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it('allows request with valid token', async () => {
      mockGetUserByEmail.mockResolvedValueOnce({
        data: { users: [] },
        error: null
      });
      mockCreateUser.mockResolvedValueOnce({
        data: { user: { id: '123', email: DEMO_EMAIL } },
        error: null
      });

      const request = createRequest({ 'x-demo-setup-token': 'valid-token' });
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockCreateUser).toHaveBeenCalled();
    });

    it('allows request when DEMO_SETUP_TOKEN is not set (development)', async () => {
      delete process.env.DEMO_SETUP_TOKEN;

      mockGetUserByEmail.mockResolvedValueOnce({
        data: { users: [] },
        error: null
      });
      mockCreateUser.mockResolvedValueOnce({
        data: { user: { id: '123', email: DEMO_EMAIL } },
        error: null
      });

      const request = createRequest({ 'x-demo-setup-token': 'any-token' });
      const response = await POST(request);

      // Should still work in dev (no token required)
      expect(response.status).toBe(200);
    });
  });

  describe('Service Role Key Validation', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
    });

    afterEach(() => {
      delete process.env.NEXT_PUBLIC_DEMO_MODE;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    });

    it('returns 500 when service role key is missing', async () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const request = createRequest({ 'x-demo-setup-token': 'test-token' });
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toContain('SUPABASE_SERVICE_ROLE_KEY');
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it('proceeds when service role key is set', async () => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

      mockGetUserByEmail.mockResolvedValueOnce({
        data: { users: [] },
        error: null
      });
      mockCreateUser.mockResolvedValueOnce({
        data: { user: { id: '123', email: DEMO_EMAIL } },
        error: null
      });

      const request = createRequest({ 'x-demo-setup-token': 'test-token' });
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockCreateUser).toHaveBeenCalled();
    });
  });

  describe('User Creation', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    });

    afterEach(() => {
      delete process.env.NEXT_PUBLIC_DEMO_MODE;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    });

    it('creates user with correct credentials', async () => {
      mockGetUserByEmail.mockResolvedValueOnce({
        data: { users: [] },
        error: null
      });
      mockCreateUser.mockResolvedValueOnce({
        data: { user: { id: '123', email: DEMO_EMAIL } },
        error: null
      });

      const request = createRequest({ 'x-demo-setup-token': 'test-token' });
      await POST(request);

      expect(mockCreateUser).toHaveBeenCalledWith({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { role: 'admin' }
      });
    });

    it('returns 200 when user already exists', async () => {
      mockGetUserByEmail.mockResolvedValueOnce({
        data: { users: [{ id: '123', email: DEMO_EMAIL }] },
        error: null
      });

      const request = createRequest({ 'x-demo-setup-token': 'test-token' });
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.message).toContain('zaten mevcut');
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it('returns created user data on success', async () => {
      const mockUser = { id: '123', email: DEMO_EMAIL, user_metadata: { role: 'admin' } };
      mockGetUserByEmail.mockResolvedValueOnce({
        data: { users: [] },
        error: null
      });
      mockCreateUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      });

      const request = createRequest({ 'x-demo-setup-token': 'test-token' });
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.user).toEqual(mockUser);
      expect(json.message).toContain('oluşturuldu');
    });

    it('sets email_confirm to true for auto-verification', async () => {
      mockGetUserByEmail.mockResolvedValueOnce({
        data: { users: [] },
        error: null
      });
      mockCreateUser.mockResolvedValueOnce({
        data: { user: { id: '123', email: DEMO_EMAIL } },
        error: null
      });

      const request = createRequest({ 'x-demo-setup-token': 'test-token' });
      await POST(request);

      const callArgs = mockCreateUser.mock.calls[0][0];
      expect(callArgs.email_confirm).toBe(true);
    });

    it('assigns admin role to demo user', async () => {
      mockGetUserByEmail.mockResolvedValueOnce({
        data: { users: [] },
        error: null
      });
      mockCreateUser.mockResolvedValueOnce({
        data: { user: { id: '123', email: DEMO_EMAIL } },
        error: null
      });

      const request = createRequest({ 'x-demo-setup-token': 'test-token' });
      await POST(request);

      const callArgs = mockCreateUser.mock.calls[0][0];
      expect(callArgs.user_metadata).toEqual({ role: 'admin' });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    });

    afterEach(() => {
      delete process.env.NEXT_PUBLIC_DEMO_MODE;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    });

    it('returns 500 when getUserByEmail fails', async () => {
      mockGetUserByEmail.mockResolvedValueOnce({
        data: { users: [] },
        error: { message: 'Database error' }
      });

      const request = createRequest({ 'x-demo-setup-token': 'test-token' });
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toContain('Database error');
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it('returns 500 when createUser fails', async () => {
      mockGetUserByEmail.mockResolvedValueOnce({
        data: { users: [] },
        error: null
      });
      mockCreateUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Creation failed' }
      });

      const request = createRequest({ 'x-demo-setup-token': 'test-token' });
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toContain('Creation failed');
    });

    it('handles network errors gracefully', async () => {
      mockGetUserByEmail.mockRejectedValueOnce(new Error('Network error'));

      const request = createRequest({ 'x-demo-setup-token': 'test-token' });
      
      await expect(POST(request)).rejects.toThrow('Network error');
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    });

    afterEach(() => {
      delete process.env.NEXT_PUBLIC_DEMO_MODE;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    });

    it('returns JSON content-type', async () => {
      mockGetUserByEmail.mockResolvedValueOnce({
        data: { users: [{ id: '123' }] },
        error: null
      });

      const request = createRequest({ 'x-demo-setup-token': 'test-token' });
      const response = await POST(request);

      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('includes user credentials in success message', async () => {
      mockGetUserByEmail.mockResolvedValueOnce({
        data: { users: [] },
        error: null
      });
      mockCreateUser.mockResolvedValueOnce({
        data: { user: { id: '123', email: DEMO_EMAIL } },
        error: null
      });

      const request = createRequest({ 'x-demo-setup-token': 'test-token' });
      const response = await POST(request);
      const json = await response.json();

      expect(json.message).toContain(DEMO_EMAIL);
      expect(json.message).toContain(DEMO_PASSWORD);
    });
  });
});
