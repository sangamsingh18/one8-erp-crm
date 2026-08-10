import { pool } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { parsePagination } from '../../utils/pagination';

export const customerService = {
  async list(query: Record<string, unknown>) {
    const { page, limit, offset } = parsePagination(query);
    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (query.search) {
      conditions.push(`(c.name ILIKE $${i} OR c.mobile ILIKE $${i} OR c.business_name ILIKE $${i})`);
      params.push(`%${query.search}%`); i++;
    }
    if (query.status) { conditions.push(`c.status = $${i}`); params.push(query.status); i++; }
    if (query.type) { conditions.push(`c.customer_type = $${i}`); params.push(query.type); i++; }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await pool.query(`SELECT COUNT(*) FROM customers c ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    const rows = await pool.query(
      `SELECT c.*, u.name as created_by_name FROM customers c
       LEFT JOIN users u ON u.id = c.created_by
       ${where} ORDER BY c.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, offset]
    );
    return { rows: rows.rows, total, page, limit };
  },

  async getById(id: string) {
    const result = await pool.query(
      `SELECT c.*, u.name as created_by_name FROM customers c
       LEFT JOIN users u ON u.id = c.created_by WHERE c.id = $1`,
      [id]
    );
    if (!result.rows[0]) throw new ApiError(404, 'Customer not found');
    return result.rows[0];
  },

  async create(data: Record<string, unknown>, userId: string) {
    const { name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date } = data;
    const result = await pool.query(
      `INSERT INTO customers (name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, mobile, email ?? null, business_name ?? null, gst_number ?? null,
       customer_type ?? 'retail', address ?? null, status ?? 'lead', follow_up_date ?? null, userId]
    );
    return result.rows[0];
  },

  async update(id: string, data: Record<string, unknown>) {
    await this.getById(id);
    const fields = ['name', 'mobile', 'email', 'business_name', 'gst_number', 'customer_type', 'address', 'status', 'follow_up_date'];
    const updates: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    for (const f of fields) {
      if (data[f] !== undefined) { updates.push(`${f} = $${i}`); params.push(data[f]); i++; }
    }
    if (!updates.length) throw new ApiError(400, 'No fields to update');
    updates.push(`updated_at = NOW()`);
    params.push(id);
    const result = await pool.query(
      `UPDATE customers SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    return result.rows[0];
  },

  async getNotes(customerId: string) {
    await this.getById(customerId);
    const result = await pool.query(
      `SELECT cn.*, u.name as created_by_name FROM customer_notes cn
       LEFT JOIN users u ON u.id = cn.created_by
       WHERE cn.customer_id = $1 ORDER BY cn.created_at DESC`,
      [customerId]
    );
    return result.rows;
  },

  async addNote(customerId: string, note: string, userId: string) {
    await this.getById(customerId);
    const result = await pool.query(
      `INSERT INTO customer_notes (customer_id, note, created_by) VALUES ($1,$2,$3) RETURNING *`,
      [customerId, note, userId]
    );
    return result.rows[0];
  },
};
