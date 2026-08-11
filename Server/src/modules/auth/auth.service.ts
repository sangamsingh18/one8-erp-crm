import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/db';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';

export const authService = {
  async login(email: string, password: string) {
    const result = await pool.query(
      `SELECT id, name, email, password_hash, role, is_active, permissions FROM users WHERE email = $1`,
      [email]
    );
    const user = result.rows[0];
    if (!user) throw new ApiError(401, 'Invalid email or password. Please check your credentials.');
    if (!user.is_active) throw new ApiError(403, 'ACCOUNT_INACTIVE');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new ApiError(401, 'Invalid email or password. Please check your credentials.');

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      env.jwtSecret,
      { expiresIn: '8h' }
    );
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions ?? null,
      },
    };
  },

  async register(name: string, email: string, password: string, role: string) {
    const exists = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (exists.rows.length) throw new ApiError(409, 'Email already registered');

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name, email, hash, role]
    );
    return result.rows[0];
  },

  // Public self-registration — always creates as 'sales', is_active = true
  async selfRegister(name: string, email: string, password: string) {
    // Enforce @one8.com domain
    if (!email.toLowerCase().endsWith('@one8.com')) {
      throw new ApiError(400, 'Email must use the @one8.com domain (e.g. yourname@one8.com).');
    }
    const exists = await pool.query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase()]);
    if (exists.rows.length) throw new ApiError(409, 'Username already exists. Please choose another.');

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, 'sales', true)
       RETURNING id, name, email, role, is_active`,
      [name, email.toLowerCase(), hash]
    );
    return result.rows[0];
  },

  async getMe(userId: string) {
    const result = await pool.query(
      `SELECT id, name, email, role, is_active, permissions, created_at FROM users WHERE id = $1`,
      [userId]
    );
    if (!result.rows[0]) throw new ApiError(404, 'User not found');
    return result.rows[0];
  },
};
