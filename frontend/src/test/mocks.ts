// Ortak test mock'ları
import React from 'react';

export const createSupabaseMock = () => ({
  supabase: {
    from: () => ({
      select: async () => ({ data: [], error: null }),
      update: async () => ({ error: null }),
      insert: async () => ({ error: null }),
      delete: async () => ({ error: null })
    })
  }
});

export const createAuthSupabaseMock = () => ({
  supabase: {
    auth: {
      signInWithOtp: jest.fn(async () => ({ error: null }))
    },
    from: () => ({
      select: async () => ({ data: [], error: null })
    })
  }
});

export const mockNextLink = () => ({
  __esModule: true,
  default: ({ children, href }: any) => React.createElement('a', { href }, children)
});

export const mockUIButton = () => ({
  Button: (props: any) => React.createElement('button', props)
});
