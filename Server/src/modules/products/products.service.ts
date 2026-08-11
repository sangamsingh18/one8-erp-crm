import { pool } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { parsePagination } from '../../utils/pagination';

export const productService = {
  async list(query: Record<string, unknown>) {
    const { page, limit, offset } = parsePagination(query);
    const conditions: string[] = ['p.is_active = true'];
    const params: unknown[] = [];
    let i = 1;

    if (query.search) {
      conditions.push(`(p.name ILIKE $${i} OR p.sku ILIKE $${i})`);
      params.push(`%${query.search}%`); i++;
    }
    if (query.category) { conditions.push(`p.category = $${i}`); params.push(query.category); i++; }
    if (query.lowStock === 'true') { conditions.push(`p.current_stock <= p.min_stock_alert`); }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const countRes = await pool.query(`SELECT COUNT(*) FROM products p ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    const rows = await pool.query(
      `SELECT * FROM products p ${where} ORDER BY p.name LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, offset]
    );
    return { rows: rows.rows, total, page, limit };
  },

  async getById(id: string) {
    const result = await pool.query(`SELECT * FROM products WHERE id = $1`, [id]);
    if (!result.rows[0]) throw new ApiError(404, 'Product not found');
    return result.rows[0];
  },

  async create(data: Record<string, unknown>) {
    const { name, sku, category, unit_price, current_stock, min_stock_alert, warehouse_loc } = data;
    try {
      const result = await pool.query(
        `INSERT INTO products (name, sku, category, unit_price, current_stock, min_stock_alert, warehouse_loc)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [name, sku, category ?? null, unit_price, current_stock ?? 0, min_stock_alert ?? 0, warehouse_loc ?? null]
      );
      return result.rows[0];
    } catch (err: unknown) {
      // Postgres unique_violation on sku column
      if ((err as { code?: string }).code === '23505') {
        throw new ApiError(409, `A product with SKU '${sku}' already exists.`);
      }
      throw err;
    }
  },

  async update(id: string, data: Record<string, unknown>) {
    await this.getById(id);
    const fields = ['name', 'sku', 'category', 'unit_price', 'min_stock_alert', 'warehouse_loc', 'is_active'];
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
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    return result.rows[0];
  },

  async getStockLog(productId: string, query: Record<string, unknown>) {
    await this.getById(productId);
    const { page, limit, offset } = parsePagination(query);
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM stock_movements WHERE product_id = $1`, [productId]
    );
    const total = parseInt(countRes.rows[0].count, 10);
    const rows = await pool.query(
      `SELECT sm.*, u.name as created_by_name FROM stock_movements sm
       LEFT JOIN users u ON u.id = sm.created_by
       WHERE sm.product_id = $1 ORDER BY sm.created_at DESC LIMIT $2 OFFSET $3`,
      [productId, limit, offset]
    );
    return { rows: rows.rows, total, page, limit };
  },

  async listAllMovements(query: Record<string, unknown>) {
    const { page, limit, offset } = parsePagination(query);
    const countRes = await pool.query('SELECT COUNT(*) FROM stock_movements');
    const total = parseInt(countRes.rows[0].count, 10);
    const rows = await pool.query(
      `SELECT sm.*, p.name as product_name, p.sku as product_sku, u.name as created_by_name
       FROM stock_movements sm
       JOIN products p ON p.id = sm.product_id
       LEFT JOIN users u ON u.id = sm.created_by
       ORDER BY sm.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return { rows: rows.rows, total, page, limit };
  },

  async adjustStock(productId: string, quantity: number, movement_type: 'IN' | 'OUT', reason: string, userId: string) {
    const product = await this.getById(productId);
    if (movement_type === 'OUT' && product.current_stock < quantity) {
      throw new ApiError(409, `Insufficient stock for SKU: ${product.sku}`);
    }
    const delta = movement_type === 'IN' ? quantity : -quantity;
    await pool.query(
      `UPDATE products SET current_stock = current_stock + $1, updated_at = NOW() WHERE id = $2`,
      [delta, productId]
    );
    const result = await pool.query(
      `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [productId, quantity, movement_type, reason, userId]
    );
    return result.rows[0];
  },

  async delete(id: string) {
    await this.getById(id);
    // Soft-delete: deactivate so it no longer appears in product lists
    await pool.query(
      `UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1`,
      [id]
    );
  },
};
