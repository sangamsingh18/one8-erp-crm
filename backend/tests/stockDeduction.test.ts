import { productService } from '../src/modules/products/products.service';
import { pool } from '../src/config/db';

jest.mock('../src/config/db', () => ({
  pool: { query: jest.fn() },
}));

describe('productService.adjustStock', () => {
  const productId = 'prod-uuid-1';
  const userId = 'user-uuid-1';
  const mockProduct = { id: productId, name: 'Widget', sku: 'SKU-001', current_stock: 10 };

  beforeEach(() => jest.clearAllMocks());

  it('throws 409 when OUT quantity exceeds current stock', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockProduct] });
    await expect(productService.adjustStock(productId, 15, 'OUT', 'test', userId))
      .rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining('SKU-001') });
  });

  it('allows OUT when quantity equals current stock', async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [mockProduct] })  // getById
      .mockResolvedValueOnce(undefined)                 // UPDATE
      .mockResolvedValueOnce({ rows: [{ id: 'mv-1', movement_type: 'OUT' }] }); // INSERT

    const result = await productService.adjustStock(productId, 10, 'OUT', 'test', userId);
    expect(result.movement_type).toBe('OUT');
  });

  it('allows IN regardless of current stock', async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ ...mockProduct, current_stock: 0 }] })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rows: [{ id: 'mv-2', movement_type: 'IN' }] });

    const result = await productService.adjustStock(productId, 100, 'IN', 'restock', userId);
    expect(result.movement_type).toBe('IN');
  });
});
