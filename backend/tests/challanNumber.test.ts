import { generateChallanNumber } from '../src/utils/generateChallanNumber';
import { pool } from '../src/config/db';

jest.mock('../src/config/db', () => ({
  pool: { query: jest.fn() },
}));

describe('generateChallanNumber', () => {
  it('generates SC-YYYY-0001 when no challans exist', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ count: '0' }] });
    const year = new Date().getFullYear();
    const result = await generateChallanNumber();
    expect(result).toBe(`SC-${year}-0001`);
  });

  it('pads sequence to 4 digits', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ count: '42' }] });
    const year = new Date().getFullYear();
    const result = await generateChallanNumber();
    expect(result).toBe(`SC-${year}-0043`);
  });

  it('handles sequence > 9999', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ count: '9999' }] });
    const year = new Date().getFullYear();
    const result = await generateChallanNumber();
    expect(result).toBe(`SC-${year}-10000`);
  });
});
