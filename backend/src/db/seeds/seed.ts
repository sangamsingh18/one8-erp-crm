import bcrypt from 'bcryptjs';
import { pool } from '../../config/db';
import '../../config/env';

const users = [
  { name: 'Admin User', email: 'admin@erp.com', password: 'Admin@123', role: 'admin' },
  { name: 'Sales User', email: 'sales@erp.com', password: 'Sales@123', role: 'sales' },
  { name: 'Warehouse User', email: 'warehouse@erp.com', password: 'Warehouse@123', role: 'warehouse' },
  { name: 'Accounts User', email: 'accounts@erp.com', password: 'Accounts@123', role: 'accounts' },
];

async function seed() {
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [u.name, u.email, hash, u.role]
    );
    console.log(`✓ Seeded: ${u.email}`);
  }
  await pool.end();
  console.log('Seed complete.');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
