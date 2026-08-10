import { PoolClient } from 'pg';
import { pool } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { parsePagination } from '../../utils/pagination';
import { generateChallanNumber } from '../../utils/generateChallanNumber';

interface ChallanItem {
  product_id: string;
  quantity: number;
}

export const challanService = {
  async list(query: Record<string, unknown>) {
    const { page, limit, offset } = parsePagination(query);
    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (query.status) { conditions.push(`ch.status = $${i}`); params.push(query.status); i++; }
    if (query.customerId) { conditions.push(`ch.customer_id = $${i}`); params.push(query.customerId); i++; }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await pool.query(`SELECT COUNT(*) FROM challans ch ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    const rows = await pool.query(
      `SELECT ch.*, c.name as customer_name, u.name as created_by_name
       FROM challans ch
       LEFT JOIN customers c ON c.id = ch.customer_id
       LEFT JOIN users u ON u.id = ch.created_by
       ${where} ORDER BY ch.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, offset]
    );
    return { rows: rows.rows, total, page, limit };
  },

  async getById(id: string) {
    const challan = await pool.query(
      `SELECT ch.*, c.name as customer_name, u.name as created_by_name
       FROM challans ch
       LEFT JOIN customers c ON c.id = ch.customer_id
       LEFT JOIN users u ON u.id = ch.created_by
       WHERE ch.id = $1`,
      [id]
    );
    if (!challan.rows[0]) throw new ApiError(404, 'Challan not found');

    const items = await pool.query(
      `SELECT * FROM challan_items WHERE challan_id = $1 ORDER BY id`, [id]
    );
    return { ...challan.rows[0], items: items.rows };
  },

  async create(customerId: string, items: ChallanItem[], userId: string) {
    const challanNumber = await generateChallanNumber();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const challanRes = await client.query(
        `INSERT INTO challans (challan_number, customer_id, status, total_quantity, created_by)
         VALUES ($1,$2,'draft',0,$3) RETURNING *`,
        [challanNumber, customerId, userId]
      );
      const challan = challanRes.rows[0];

      let totalQty = 0;
      for (const item of items) {
        const prod = await client.query(`SELECT * FROM products WHERE id = $1`, [item.product_id]);
        if (!prod.rows[0]) throw new ApiError(404, `Product not found: ${item.product_id}`);
        const p = prod.rows[0];
        const lineTotal = parseFloat(p.unit_price) * item.quantity;
        await client.query(
          `INSERT INTO challan_items (challan_id, product_id, product_name, product_sku, unit_price, quantity, line_total)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [challan.id, p.id, p.name, p.sku, p.unit_price, item.quantity, lineTotal]
        );
        totalQty += item.quantity;
      }

      await client.query(
        `UPDATE challans SET total_quantity = $1 WHERE id = $2`, [totalQty, challan.id]
      );
      await client.query('COMMIT');
      return this.getById(challan.id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async update(id: string, customerId: string | undefined, items: ChallanItem[] | undefined) {
    const existing = await this.getById(id);
    if (existing.status !== 'draft') throw new ApiError(400, 'Only draft challans can be edited');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (customerId) {
        await client.query(`UPDATE challans SET customer_id = $1, updated_at = NOW() WHERE id = $2`, [customerId, id]);
      }

      if (items) {
        await client.query(`DELETE FROM challan_items WHERE challan_id = $1`, [id]);
        let totalQty = 0;
        for (const item of items) {
          const prod = await client.query(`SELECT * FROM products WHERE id = $1`, [item.product_id]);
          if (!prod.rows[0]) throw new ApiError(404, `Product not found: ${item.product_id}`);
          const p = prod.rows[0];
          const lineTotal = parseFloat(p.unit_price) * item.quantity;
          await client.query(
            `INSERT INTO challan_items (challan_id, product_id, product_name, product_sku, unit_price, quantity, line_total)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [id, p.id, p.name, p.sku, p.unit_price, item.quantity, lineTotal]
          );
          totalQty += item.quantity;
        }
        await client.query(`UPDATE challans SET total_quantity = $1, updated_at = NOW() WHERE id = $2`, [totalQty, id]);
      }

      await client.query('COMMIT');
      return this.getById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async confirm(id: string, userId: string) {
    const existing = await this.getById(id);
    if (existing.status !== 'draft') throw new ApiError(400, 'Only draft challans can be confirmed');
    if (!existing.items.length) throw new ApiError(400, 'Challan has no items');

    const client: PoolClient = await pool.connect();
    try {
      await client.query('BEGIN');

      // Lock all product rows involved — prevents race conditions
      const productIds = existing.items.map((item: { product_id: string }) => item.product_id);
      await client.query(
        `SELECT id, name, sku, current_stock FROM products WHERE id = ANY($1::uuid[]) FOR UPDATE`,
        [productIds]
      );

      // Validate stock for every item before any mutation
      for (const item of existing.items as Array<{ product_id: string; product_name: string; product_sku: string; quantity: number }>) {
        const stockRes = await client.query(
          `SELECT current_stock FROM products WHERE id = $1`, [item.product_id]
        );
        const stock = stockRes.rows[0]?.current_stock ?? 0;
        if (stock < item.quantity) {
          throw new ApiError(
            409,
            `Insufficient stock for ${item.product_name} (${item.product_sku}): available ${stock}, required ${item.quantity}`
          );
        }
      }

      // All checks passed — apply mutations
      for (const item of existing.items as Array<{ product_id: string; product_name: string; product_sku: string; quantity: number }>) {
        await client.query(
          `UPDATE products SET current_stock = current_stock - $1, updated_at = NOW() WHERE id = $2`,
          [item.quantity, item.product_id]
        );
        await client.query(
          `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, reference_id, created_by)
           VALUES ($1,$2,'OUT',$3,$4,$5)`,
          [item.product_id, item.quantity, `Challan #${existing.challan_number}`, id, userId]
        );
      }

      await client.query(
        `UPDATE challans SET status = 'confirmed', confirmed_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [id]
      );

      await client.query('COMMIT');
      return this.getById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async cancel(id: string) {
    const existing = await this.getById(id);
    if (existing.status === 'cancelled') throw new ApiError(400, 'Challan already cancelled');
    if (existing.status === 'confirmed') throw new ApiError(400, 'Confirmed challans cannot be cancelled');

    await pool.query(
      `UPDATE challans SET status = 'cancelled', updated_at = NOW() WHERE id = $1`, [id]
    );
    return this.getById(id);
  },
};
