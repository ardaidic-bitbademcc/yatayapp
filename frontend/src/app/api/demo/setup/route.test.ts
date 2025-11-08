import { NextResponse } from 'next/server';
import { POST } from './route';

// Mock Supabase
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockLimit = jest.fn();

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args)
  }
}));

describe('Demo Setup API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock chain setup
    mockLimit.mockReturnValue({ data: null, error: null });
    mockSelect.mockReturnValue({ limit: mockLimit });
    mockInsert.mockResolvedValue({ data: null, error: null });
    mockFrom.mockReturnValue({ 
      select: mockSelect,
      insert: mockInsert
    });
  });

  describe('Demo Mode Control', () => {
    it('returns 403 when demo mode is disabled', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_DEMO_MODE;
      process.env.NEXT_PUBLIC_DEMO_MODE = 'false';

      const response = await POST();
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.error).toBe('Demo modu kapalı');
      expect(mockFrom).not.toHaveBeenCalled();

      process.env.NEXT_PUBLIC_DEMO_MODE = originalEnv;
    });

    it('returns 403 when demo mode is undefined', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_DEMO_MODE;
      delete process.env.NEXT_PUBLIC_DEMO_MODE;

      const response = await POST();
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.error).toBe('Demo modu kapalı');

      process.env.NEXT_PUBLIC_DEMO_MODE = originalEnv;
    });

    it('allows setup when demo mode is enabled', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_DEMO_MODE;
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';

      // Mock empty tables (will trigger inserts)
      mockLimit.mockReturnValue({ data: [], error: null });

      const response = await POST();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(mockFrom).toHaveBeenCalled();

      process.env.NEXT_PUBLIC_DEMO_MODE = originalEnv;
    });
  });

  describe('Data Creation', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
    });

    afterEach(() => {
      delete process.env.NEXT_PUBLIC_DEMO_MODE;
    });

    it('creates products when table is empty', async () => {
      mockLimit.mockReturnValueOnce({ data: [], error: null }); // products check
      mockLimit.mockReturnValue({ data: [{ id: 1 }], error: null }); // other tables

      await POST();

      expect(mockFrom).toHaveBeenCalledWith('products');
      expect(mockInsert).toHaveBeenCalledWith([
        { name: 'Espresso', price: 55 },
        { name: 'Latte', price: 65 },
        { name: 'Filtre Kahve', price: 50 }
      ]);
    });

    it('creates branches when table is empty', async () => {
      mockLimit
        .mockReturnValueOnce({ data: [{ id: 1 }], error: null }) // products exist
        .mockReturnValueOnce({ data: [], error: null }) // branches empty
        .mockReturnValue({ data: [{ id: 1 }], error: null }); // others exist

      await POST();

      expect(mockFrom).toHaveBeenCalledWith('branches');
      expect(mockInsert).toHaveBeenCalledWith([
        { name: 'Merkez', address: 'İstiklal Cad. No:1' },
        { name: 'Şube 2', address: 'Bağdat Cad. No:45' }
      ]);
    });

    it('creates personnel when table is empty', async () => {
      mockLimit
        .mockReturnValueOnce({ data: [{ id: 1 }], error: null }) // products exist
        .mockReturnValueOnce({ data: [{ id: 1 }], error: null }) // branches exist
        .mockReturnValueOnce({ data: [], error: null }) // personnel empty
        .mockReturnValue({ data: [{ id: 1 }], error: null }); // others exist

      await POST();

      expect(mockFrom).toHaveBeenCalledWith('personnel');
      expect(mockInsert).toHaveBeenCalledWith([
        { name: 'Ayşe', title: 'Barista' },
        { name: 'Mehmet', title: 'Kasiyer' }
      ]);
    });

    it('creates income records when table is empty', async () => {
      mockLimit
        .mockReturnValueOnce({ data: [{ id: 1 }], error: null }) // products exist
        .mockReturnValueOnce({ data: [{ id: 1 }], error: null }) // branches exist
        .mockReturnValueOnce({ data: [{ id: 1 }], error: null }) // personnel exist
        .mockReturnValueOnce({ data: [], error: null }); // income empty

      await POST();

      expect(mockFrom).toHaveBeenCalledWith('income_records');
      expect(mockInsert).toHaveBeenCalledWith([
        { description: 'Günlük Satış', amount: 1250 },
        { description: 'Yan Gelir', amount: 300 }
      ]);
    });

    it('skips creation when tables already have data', async () => {
      mockLimit.mockReturnValue({ data: [{ id: 1 }], error: null }); // all tables have data

      const response = await POST();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('creates all data when all tables are empty', async () => {
      mockLimit.mockReturnValue({ data: [], error: null }); // all tables empty

      const response = await POST();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(mockInsert).toHaveBeenCalledTimes(4); // products, branches, personnel, income
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
    });

    afterEach(() => {
      delete process.env.NEXT_PUBLIC_DEMO_MODE;
    });

    it('returns 500 when insert fails', async () => {
      mockLimit.mockReturnValue({ data: [], error: null }); // empty tables
      mockInsert.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } });

      const response = await POST();
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.ok).toBe(false);
      expect(json.errors).toContain('Insert failed');
    });

    it('collects all errors from multiple failed inserts', async () => {
      mockLimit.mockReturnValue({ data: [], error: null }); // all empty
      mockInsert
        .mockResolvedValueOnce({ data: null, error: { message: 'Products error' } })
        .mockResolvedValueOnce({ data: null, error: { message: 'Branches error' } })
        .mockResolvedValueOnce({ data: null, error: null }) // personnel succeeds
        .mockResolvedValueOnce({ data: null, error: { message: 'Income error' } });

      const response = await POST();
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.ok).toBe(false);
      expect(json.errors).toHaveLength(3);
      expect(json.errors).toContain('Products error');
      expect(json.errors).toContain('Branches error');
      expect(json.errors).toContain('Income error');
    });

    it('succeeds even if some tables have errors on check', async () => {
      // If select check fails, we treat it as "no data" and try insert
      mockLimit
        .mockReturnValueOnce({ data: null, error: { message: 'Check error' } }) // products check fails
        .mockReturnValue({ data: [{ id: 1 }], error: null }); // others exist

      const response = await POST();
      const json = await response.json();

      // Should still try to insert products since check failed (treated as empty)
      expect(mockInsert).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
    });

    afterEach(() => {
      delete process.env.NEXT_PUBLIC_DEMO_MODE;
    });

    it('returns success message on completion', async () => {
      mockLimit.mockReturnValue({ data: [{ id: 1 }], error: null });

      const response = await POST();
      const json = await response.json();

      expect(json).toHaveProperty('ok', true);
      expect(json).toHaveProperty('message');
      expect(json.message).toContain('Demo verileri oluşturuldu');
    });

    it('returns proper JSON content-type', async () => {
      mockLimit.mockReturnValue({ data: [{ id: 1 }], error: null });

      const response = await POST();

      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });
});
