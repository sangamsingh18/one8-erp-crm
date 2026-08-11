import { challanService } from '../src/modules/challans/challans.service';
import { pool } from '../src/config/db';

jest.mock('../src/config/db', () => ({
  pool: { query: jest.fn(), connect: jest.fn() },
}));
jest.mock('../src/utils/generateChallanNumber', () => ({
  generateChallanNumber: jest.fn().mockResolvedValue('SC-2024-0001'),
}));

const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (pool.connect as jest.Mock).mockResolvedValue(mockClient);
});

const challanId = 'challan-uuid-1';
const userId = 'user-uuid-1';

const mockItems = [
  { product_id: 'prod-1', product_name: 'Widget A', product_sku: 'SKU-001', quantity: 5 },
  { product_id: 'prod-2', product_name: 'Widget B', product_sku: 'SKU-002', quantity: 3 },
];

const mockChallanRow = {
  id: challanId,
  challan_number: 'SC-2024-0001',
  status: 'draft',
  customer_id: 'cust-1',
  customer_name: 'Test Customer',
  created_by_name: 'Admin',
};

// Helper: mock pool.query for getById (challan row + items)
const mockGetById = (status = 'draft') => {
  (pool.query as jest.Mock)
    .mockResolvedValueOnce({ rows: [{ ...mockChallanRow, status }] })
    .mockResolvedValueOnce({ rows: mockItems });
};

describe('challanService.confirm — stock deduction', () => {
  it('rolls back and throws 409 when any item has insufficient stock', async () => {
    mockGetById();

    mockClient.query
      .mockResolvedValueOnce(undefined)                          // BEGIN
      .mockResolvedValueOnce({ rows: mockItems })                // SELECT FOR UPDATE
      .mockResolvedValueOnce({ rows: [{ current_stock: 10 }] }) // prod-1 stock OK
      .mockResolvedValueOnce({ rows: [{ current_stock: 2 }] }); // prod-2 stock FAIL (need 3)

    await expect(challanService.confirm(challanId, userId)).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('SKU-002'),
    });

    const calls = mockClient.query.mock.calls.map((c: unknown[]) => c[0]);
    expect(calls).toContain('ROLLBACK');
    expect(calls).not.toContain('COMMIT');
  });

  it('commits when all items have sufficient stock', async () => {
    // First getById (before confirm logic)
    mockGetById('draft');
    // Second getById (after confirm, inside confirm method)
    mockGetById('confirmed');

    mockClient.query
      .mockResolvedValueOnce(undefined)                           // BEGIN
      .mockResolvedValueOnce({ rows: mockItems })                 // SELECT FOR UPDATE
      .mockResolvedValueOnce({ rows: [{ current_stock: 10 }] })  // prod-1 stock OK
      .mockResolvedValueOnce({ rows: [{ current_stock: 10 }] })  // prod-2 stock OK
      .mockResolvedValueOnce(undefined)                           // UPDATE products prod-1
      .mockResolvedValueOnce(undefined)                           // INSERT stock_movements prod-1
      .mockResolvedValueOnce(undefined)                           // UPDATE products prod-2
      .mockResolvedValueOnce(undefined)                           // INSERT stock_movements prod-2
      .mockResolvedValueOnce(undefined)                           // UPDATE challans confirmed
      .mockResolvedValueOnce(undefined);                          // COMMIT

    const result = await challanService.confirm(challanId, userId);
    expect(result.status).toBe('confirmed');

    const calls = mockClient.query.mock.calls.map((c: unknown[]) => c[0]);
    expect(calls).toContain('COMMIT');
    expect(calls).not.toContain('ROLLBACK');
  });

  it('does not partially deduct stock — no UPDATE before all checks pass', async () => {
    mockGetById();

    mockClient.query
      .mockResolvedValueOnce(undefined)                          // BEGIN
      .mockResolvedValueOnce({ rows: mockItems })                // SELECT FOR UPDATE
      .mockResolvedValueOnce({ rows: [{ current_stock: 10 }] }) // prod-1 OK
      .mockResolvedValueOnce({ rows: [{ current_stock: 0 }] }); // prod-2 FAIL (need 3)

    await expect(challanService.confirm(challanId, userId)).rejects.toMatchObject({ statusCode: 409 });

    const updateCalls = mockClient.query.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && (c[0] as string).startsWith('UPDATE products')
    );
    expect(updateCalls).toHaveLength(0);
  });
});
