import '@testing-library/jest-dom';
import React from 'react';

// Global mocklar: Next Link ve UI Button
jest.mock('next/link', () => ({
	__esModule: true,
	default: ({ children, href }: any) => React.createElement('a', { href }, children)
}));

jest.mock('@/components/ui/button', () => ({
	Button: (props: any) => React.createElement('button', props)
}));

// Varsayılan Supabase mock'u: select -> boş data & count: 0
jest.mock('@/lib/supabaseClient', () => ({
	supabase: {
		from: () => ({
			select: async () => ({ data: [], error: null, count: 0 }),
			update: async () => ({ error: null }),
			insert: async () => ({ error: null }),
			delete: async () => ({ error: null })
		}),
		auth: {
			signInWithOtp: jest.fn(async () => ({ error: null }))
		}
	}
}));
