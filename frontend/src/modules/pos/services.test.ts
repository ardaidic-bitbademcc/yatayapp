import { getProducts, createSale } from './services';

// Mock Supabase
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockInsert = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args)
  }
}));

describe('POS Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    beforeEach(() => {
      // Setup default mock chain
      mockSingle.mockResolvedValue({ data: null, error: null });
      mockEq.mockReturnValue({ 
        eq: mockEq,
        select: mockSelect,
        single: mockSingle
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ 
        select: mockSelect,
        insert: mockInsert
      });
    });

    it('fetches products for given branch', async () => {
      const branchId = 'branch-123';
      const mockProducts = [
        { 
          id: 1, 
          branch_id: branchId, 
          is_available: true,
          product: { id: 101, name: 'Espresso', price: 55 }
        },
        { 
          id: 2, 
          branch_id: branchId, 
          is_available: true,
          product: { id: 102, name: 'Latte', price: 65 }
        }
      ];

      mockEq.mockReturnValueOnce({ 
        eq: jest.fn().mockResolvedValue({ data: mockProducts, error: null })
      });

      const result = await getProducts(branchId);

      expect(mockFrom).toHaveBeenCalledWith('branch_products');
      expect(mockSelect).toHaveBeenCalledWith('*, product:products(*)');
      expect(mockEq).toHaveBeenCalledWith('branch_id', branchId);
      expect(result).toEqual(mockProducts);
    });

    it('filters only available products', async () => {
      const branchId = 'branch-123';
      const mockProducts = [
        { 
          id: 1, 
          is_available: true,
          product: { name: 'Espresso' }
        }
      ];

      let eqCallCount = 0;
      mockEq.mockImplementation((field: string, value: any) => {
        eqCallCount++;
        if (eqCallCount === 2) {
          return Promise.resolve({ data: mockProducts, error: null });
        }
        return { eq: mockEq };
      });

      await getProducts(branchId);

      expect(mockEq).toHaveBeenCalledWith('branch_id', branchId);
      expect(mockEq).toHaveBeenCalledWith('is_available', true);
    });

    it('throws error when fetch fails', async () => {
      const branchId = 'branch-123';
      const error = new Error('Database error');

      mockEq.mockReturnValueOnce({ 
        eq: jest.fn().mockResolvedValue({ data: null, error })
      });

      await expect(getProducts(branchId)).rejects.toThrow('Database error');
    });

    it('returns empty array when no products found', async () => {
      const branchId = 'branch-123';

      mockEq.mockReturnValueOnce({ 
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      });

      const result = await getProducts(branchId);

      expect(result).toEqual([]);
    });

    it('includes product details via join', async () => {
      const branchId = 'branch-123';
      const mockProducts = [
        { 
          id: 1,
          product: { 
            id: 101, 
            name: 'Espresso', 
            price: 55,
            description: 'Strong coffee'
          }
        }
      ];

      mockEq.mockReturnValueOnce({ 
        eq: jest.fn().mockResolvedValue({ data: mockProducts, error: null })
      });

      const result = await getProducts(branchId);

      expect(result[0].product).toBeDefined();
      expect(result[0].product.name).toBe('Espresso');
      expect(result[0].product.price).toBe(55);
    });

    it('handles different branch IDs correctly', async () => {
      const branchId1 = 'branch-1';
      const branchId2 = 'branch-2';

      mockEq.mockReturnValue({ 
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      });

      await getProducts(branchId1);
      expect(mockEq).toHaveBeenCalledWith('branch_id', branchId1);

      jest.clearAllMocks();
      mockEq.mockReturnValue({ 
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      });

      await getProducts(branchId2);
      expect(mockEq).toHaveBeenCalledWith('branch_id', branchId2);
    });
  });

  describe('createSale', () => {
    beforeEach(() => {
      mockSingle.mockResolvedValue({ data: null, error: null });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });
    });

    it('creates a new sale record', async () => {
      const saleData = {
        branch_id: 'branch-123',
        total_amount: 120,
        items: [
          { product_id: 101, quantity: 2, price: 55 },
          { product_id: 102, quantity: 1, price: 10 }
        ],
        payment_method: 'cash'
      };

      const mockCreatedSale = { id: 'sale-456', ...saleData, created_at: new Date() };
      mockSingle.mockResolvedValueOnce({ data: mockCreatedSale, error: null });

      const result = await createSale(saleData);

      expect(mockFrom).toHaveBeenCalledWith('sales');
      expect(mockInsert).toHaveBeenCalledWith(saleData);
      expect(mockSelect).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedSale);
    });

    it('returns single sale record', async () => {
      const saleData = { total_amount: 50 };
      const mockSale = { id: 'sale-1', ...saleData };

      mockSingle.mockResolvedValueOnce({ data: mockSale, error: null });

      const result = await createSale(saleData);

      expect(mockSingle).toHaveBeenCalled();
      expect(result).toEqual(mockSale);
    });

    it('throws error when insert fails', async () => {
      const saleData = { total_amount: 100 };
      const error = new Error('Insert failed');

      mockSingle.mockResolvedValueOnce({ data: null, error });

      await expect(createSale(saleData)).rejects.toThrow('Insert failed');
    });

    it('handles empty sale data', async () => {
      const saleData = {};
      const mockSale = { id: 'sale-empty' };

      mockSingle.mockResolvedValueOnce({ data: mockSale, error: null });

      const result = await createSale(saleData);

      expect(mockInsert).toHaveBeenCalledWith({});
      expect(result).toEqual(mockSale);
    });

    it('handles complex sale data with multiple items', async () => {
      const saleData = {
        branch_id: 'branch-123',
        user_id: 'user-456',
        total_amount: 500,
        items: [
          { product_id: 1, quantity: 3, price: 55, name: 'Espresso' },
          { product_id: 2, quantity: 2, price: 65, name: 'Latte' },
          { product_id: 3, quantity: 1, price: 200, name: 'Gift Card' }
        ],
        payment_method: 'card',
        discount: 10,
        tax: 50,
        notes: 'Customer requested extra foam'
      };

      const mockSale = { id: 'sale-complex', ...saleData };
      mockSingle.mockResolvedValueOnce({ data: mockSale, error: null });

      const result = await createSale(saleData);

      expect(mockInsert).toHaveBeenCalledWith(saleData);
      expect(result.items).toHaveLength(3);
      expect(result.total_amount).toBe(500);
    });

    it('handles different payment methods', async () => {
      const paymentMethods = ['cash', 'card', 'mobile', 'credit'];

      for (const method of paymentMethods) {
        const saleData = { payment_method: method, total_amount: 100 };
        const mockSale = { id: `sale-${method}`, ...saleData };

        mockSingle.mockResolvedValueOnce({ data: mockSale, error: null });

        const result = await createSale(saleData);
        expect(result.payment_method).toBe(method);

        jest.clearAllMocks();
        mockSingle.mockResolvedValue({ data: null, error: null });
        mockSelect.mockReturnValue({ single: mockSingle });
        mockInsert.mockReturnValue({ select: mockSelect });
        mockFrom.mockReturnValue({ insert: mockInsert });
      }
    });
  });

  describe('Integration Scenarios', () => {
    beforeEach(() => {
      mockSingle.mockResolvedValue({ data: null, error: null });
      mockEq.mockReturnValue({ 
        eq: mockEq,
        select: mockSelect,
        single: mockSingle
      });
      mockSelect.mockReturnValue({ 
        eq: mockEq,
        single: mockSingle
      });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ 
        select: mockSelect,
        insert: mockInsert
      });
    });

    it('can fetch products and create sale in sequence', async () => {
      const branchId = 'branch-123';
      const mockProducts = [
        { id: 1, product: { id: 101, price: 55 } }
      ];

      // Mock getProducts
      mockEq.mockReturnValueOnce({ 
        eq: jest.fn().mockResolvedValue({ data: mockProducts, error: null })
      });

      const products = await getProducts(branchId);
      expect(products).toEqual(mockProducts);

      // Mock createSale
      const saleData = { 
        branch_id: branchId,
        items: [{ product_id: products[0].product.id, quantity: 1 }],
        total_amount: products[0].product.price
      };
      const mockSale = { id: 'sale-1', ...saleData };

      mockSingle.mockResolvedValueOnce({ data: mockSale, error: null });

      const sale = await createSale(saleData);
      expect(sale).toEqual(mockSale);
    });

    it('handles errors independently for each service', async () => {
      // getProducts fails
      mockEq.mockReturnValueOnce({ 
        eq: jest.fn().mockResolvedValue({ 
          data: null, 
          error: new Error('Products fetch error') 
        })
      });

      await expect(getProducts('branch-1')).rejects.toThrow('Products fetch error');

      // createSale should still work
      mockSingle.mockResolvedValueOnce({ 
        data: { id: 'sale-1' }, 
        error: null 
      });

      const result = await createSale({ total_amount: 100 });
      expect(result.id).toBe('sale-1');
    });
  });

  describe('Error Edge Cases', () => {
    beforeEach(() => {
      mockSingle.mockResolvedValue({ data: null, error: null });
      mockEq.mockReturnValue({ eq: mockEq });
      mockSelect.mockReturnValue({ 
        eq: mockEq,
        single: mockSingle
      });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ 
        select: mockSelect,
        insert: mockInsert
      });
    });

    it('handles null error gracefully', async () => {
      mockEq.mockReturnValueOnce({ 
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      });

      const result = await getProducts('branch-1');
      expect(result).toEqual([]);
    });

    it('handles undefined data', async () => {
      mockEq.mockReturnValueOnce({ 
        eq: jest.fn().mockResolvedValue({ data: undefined, error: null })
      });

      const result = await getProducts('branch-1');
      expect(result).toBeUndefined();
    });

    it('propagates error objects correctly', async () => {
      const errorObject = { 
        message: 'Constraint violation',
        code: '23505',
        details: 'Duplicate key'
      };

      mockSingle.mockResolvedValueOnce({ data: null, error: errorObject });

      await expect(createSale({ total_amount: 100 })).rejects.toEqual(errorObject);
    });
  });
});
