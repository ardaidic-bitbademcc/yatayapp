import { NextRequest, NextResponse } from 'next/server';
import { middleware, config } from './middleware';

// Mock Supabase
const mockGetUser = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser
    }
  }))
}));

// Helper function to create mock NextRequest
function createRequest(pathname: string, cookie?: string): NextRequest {
  const url = `http://localhost:3000${pathname}`;
  const headers = new Headers();
  if (cookie) {
    headers.set('cookie', cookie);
  }
  
  return new NextRequest(url, { headers });
}

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Unprotected Routes', () => {
    it('allows access to login page without auth', async () => {
      const request = createRequest('/login');
      const response = await middleware(request);
      
      expect(response).toEqual(NextResponse.next());
      expect(mockGetUser).not.toHaveBeenCalled();
    });

    it('allows access to home page without auth check', async () => {
      const request = createRequest('/');
      const response = await middleware(request);
      
      expect(response).toEqual(NextResponse.next());
      expect(mockGetUser).not.toHaveBeenCalled();
    });

    it('allows access to public API routes', async () => {
      const request = createRequest('/api/public');
      const response = await middleware(request);
      
      expect(response).toEqual(NextResponse.next());
      expect(mockGetUser).not.toHaveBeenCalled();
    });

    it('allows access to static assets', async () => {
      const request = createRequest('/favicon.ico');
      const response = await middleware(request);
      
      expect(response).toEqual(NextResponse.next());
      expect(mockGetUser).not.toHaveBeenCalled();
    });

    it('allows access to _next resources', async () => {
      const request = createRequest('/_next/static/chunk.js');
      const response = await middleware(request);
      
      expect(response).toEqual(NextResponse.next());
      expect(mockGetUser).not.toHaveBeenCalled();
    });
  });

  describe('Protected Routes - Authentication', () => {
    const protectedPaths = ['/branch', '/personnel', '/menu', '/pos', '/finance'];

    protectedPaths.forEach(path => {
      it(`redirects to login when accessing ${path} without auth`, async () => {
        mockGetUser.mockResolvedValueOnce({
          data: { user: null },
          error: { message: 'Not authenticated' }
        });

        const request = createRequest(path);
        const response = await middleware(request);
        
        expect(mockGetUser).toHaveBeenCalled();
        expect(response).toBeInstanceOf(NextResponse);
        expect(response.status).toBe(307); // Redirect status
        expect(response.headers.get('location')).toContain('/login');
        expect(response.headers.get('location')).toContain(`redirect=${encodeURIComponent(path)}`);
      });

      it(`allows access to ${path} when authenticated`, async () => {
        mockGetUser.mockResolvedValueOnce({
          data: { 
            user: { 
              id: '123', 
              email: 'test@example.com',
              user_metadata: { role: 'user' }
            } 
          },
          error: null
        });

        const request = createRequest(path);
        const response = await middleware(request);
        
        expect(mockGetUser).toHaveBeenCalled();
        expect(response).toEqual(NextResponse.next());
      });

      it(`redirects to login when accessing ${path} with expired token`, async () => {
        mockGetUser.mockResolvedValueOnce({
          data: { user: null },
          error: null
        });

        const request = createRequest(path);
        const response = await middleware(request);
        
        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toContain('/login');
      });
    });

    it('preserves query parameters in redirect URL', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });

      const request = createRequest('/branch?id=123&tab=details');
      const response = await middleware(request);
      
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('redirect=');
      expect(decodeURIComponent(location!)).toContain('/branch?id=123&tab=details');
    });

    it('handles nested protected routes', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });

      const request = createRequest('/branch/edit/123');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
      expect(response.headers.get('location')).toContain('redirect=%2Fbranch%2Fedit%2F123');
    });
  });

  describe('Admin-Only Routes', () => {
    it('allows admin access to /settings', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { 
          user: { 
            id: '123', 
            email: 'admin@example.com',
            user_metadata: { role: 'admin' }
          } 
        },
        error: null
      });

      const request = createRequest('/settings');
      const response = await middleware(request);
      
      expect(response).toEqual(NextResponse.next());
    });

    it('redirects non-admin users from /settings to home', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { 
          user: { 
            id: '123', 
            email: 'user@example.com',
            user_metadata: { role: 'user' }
          } 
        },
        error: null
      });

      const request = createRequest('/settings');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/');
    });

    it('redirects users without role metadata from /settings', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { 
          user: { 
            id: '123', 
            email: 'user@example.com',
            user_metadata: {}
          } 
        },
        error: null
      });

      const request = createRequest('/settings');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/');
    });

    it('redirects unauthenticated users from /settings to login', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });

      const request = createRequest('/settings');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
      expect(response.headers.get('location')).toContain('redirect=%2Fsettings');
    });

    it('handles nested admin routes', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { 
          user: { 
            id: '123', 
            email: 'admin@example.com',
            user_metadata: { role: 'admin' }
          } 
        },
        error: null
      });

      const request = createRequest('/settings/users');
      const response = await middleware(request);
      
      expect(response).toEqual(NextResponse.next());
    });
  });

  describe('Cookie Handling', () => {
    it('passes cookie header to Supabase client', async () => {
      const mockCookie = 'sb-auth-token=abc123; Path=/; HttpOnly';
      mockGetUser.mockResolvedValueOnce({
        data: { 
          user: { 
            id: '123', 
            email: 'test@example.com',
            user_metadata: { role: 'user' }
          } 
        },
        error: null
      });

      const request = createRequest('/branch', mockCookie);
      await middleware(request);
      
      expect(mockGetUser).toHaveBeenCalled();
      // Cookie is passed via createClient global headers
    });

    it('handles missing cookie gracefully', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'No session' }
      });

      const request = createRequest('/branch');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });
  });

  describe('Error Handling', () => {
    it('handles Supabase auth errors gracefully', async () => {
      mockGetUser.mockRejectedValueOnce(new Error('Network error'));

      const request = createRequest('/branch');
      
      await expect(middleware(request)).rejects.toThrow('Network error');
    });

    it('redirects to login on auth service error', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Service unavailable' }
      });

      const request = createRequest('/branch');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });
  });

  describe('Edge Cases', () => {
    it('handles malformed URLs gracefully', async () => {
      const request = createRequest('/branch/../personnel');
      mockGetUser.mockResolvedValueOnce({
        data: { 
          user: { 
            id: '123', 
            email: 'test@example.com',
            user_metadata: { role: 'user' }
          } 
        },
        error: null
      });

      const response = await middleware(request);
      expect(response).toEqual(NextResponse.next());
    });

    it('handles case-sensitive paths correctly', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });

      // Lowercase should trigger protection
      const request = createRequest('/branch');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
    });

    it('does not protect similar but different paths', async () => {
      const request = createRequest('/branches-info');
      const response = await middleware(request);
      
      // Should not be protected (doesn't start with /branch)
      expect(response).toEqual(NextResponse.next());
      expect(mockGetUser).not.toHaveBeenCalled();
    });
  });

  describe('Role Hierarchy', () => {
    it('allows admin to access regular protected routes', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { 
          user: { 
            id: '123', 
            email: 'admin@example.com',
            user_metadata: { role: 'admin' }
          } 
        },
        error: null
      });

      const request = createRequest('/branch');
      const response = await middleware(request);
      
      expect(response).toEqual(NextResponse.next());
    });

    it('treats missing role as regular user', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { 
          user: { 
            id: '123', 
            email: 'user@example.com',
            user_metadata: {}
          } 
        },
        error: null
      });

      const request = createRequest('/branch');
      const response = await middleware(request);
      
      // Regular routes should be accessible
      expect(response).toEqual(NextResponse.next());
    });

    it('treats undefined user_metadata as regular user', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { 
          user: { 
            id: '123', 
            email: 'user@example.com'
            // No user_metadata
          } 
        },
        error: null
      });

      const request = createRequest('/branch');
      const response = await middleware(request);
      
      expect(response).toEqual(NextResponse.next());
    });
  });

  describe('Middleware Config', () => {
    it('has correct matcher pattern', () => {
      expect(config.matcher).toBeDefined();
      expect(config.matcher).toContain('/((?!_next|.*\\.\n*|api|favicon.ico).*)');
    });
  });
});
