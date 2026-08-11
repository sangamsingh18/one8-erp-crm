import { pool } from '../config/db';

export async function generateChallanNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const result = await pool.query(
    `SELECT COUNT(*) FROM challans WHERE challan_number LIKE $1`,
    [`SC-${year}-%`]
  );
  const seq = parseInt(result.rows[0].count, 10) + 1;
  return `SC-${year}-${String(seq).padStart(4, '0')}`;
}
