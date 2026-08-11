import bcrypt from 'bcryptjs';
import { pool } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { parsePagination } from '../../utils/pagination';

export const usersService = {
  async list(query: Record<string, unknown>) {
    const { page, limit, offset } = parsePagination(query);
    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (query.role) {
      conditions.push(`role = $${i}`);
      params.push(query.role);
      i++;
    }
    if (query.search) {
      conditions.push(`(name ILIKE $${i} OR email ILIKE $${i})`);
      params.push(`%${query.search}%`);
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await pool.query(`SELECT COUNT(*) FROM users ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    const rows = await pool.query(
      `SELECT id, name, email, role, is_active, permissions, created_at, updated_at
       FROM users
       ${where}
       ORDER BY name ASC
       LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, offset]
    );

    return { rows: rows.rows, total, page, limit };
  },

  async getById(id: string) {
    const result = await pool.query(
      `SELECT id, name, email, role, is_active, permissions, created_at, updated_at FROM users WHERE id = $1`,
      [id]
    );
    if (!result.rows[0]) throw new ApiError(404, 'User not found');
    return result.rows[0];
  },

  async create(data: Record<string, unknown>) {
    const { name, email, password, role } = data;

    // Check duplicate email
    const dupRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (dupRes.rows[0]) throw new ApiError(400, 'Email address already registered');

    const hash = await bcrypt.hash(password as string, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, name, email, role, is_active, permissions, created_at`,
      [name, email, hash, role]
    );
    return result.rows[0];
  },

  async updateUser(id: string, data: { role?: string; permissions?: string[] | null; is_active?: boolean }) {
    const user = await this.getById(id);
    const fields: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (data.role !== undefined) {
      fields.push(`role = $${i}`);
      params.push(data.role);
      i++;
    }
    if (data.permissions !== undefined) {
      fields.push(`permissions = $${i}`);
      // null means "reset to role defaults"
      params.push(data.permissions === null ? null : JSON.stringify(data.permissions));
      i++;
    }
    if (data.is_active !== undefined) {
      fields.push(`is_active = $${i}`);
      params.push(data.is_active);
      i++;
    }

    if (fields.length === 0) return user;

    fields.push(`updated_at = NOW()`);
    params.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i}
       RETURNING id, name, email, role, is_active, permissions, updated_at`,
      params
    );
    return result.rows[0];
  },

  async toggleActive(id: string) {
    const user = await this.getById(id);
    const nextStatus = !user.is_active;
    const result = await pool.query(
      `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, name, email, role, is_active, permissions`,
      [nextStatus, id]
    );
    return result.rows[0];
  },

  async resetPassword(id: string, newPassword: string) {
    await this.getById(id); // ensure exists
    if (!newPassword || newPassword.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters.');
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [hash, id]
    );
    return { success: true };
  },
};
