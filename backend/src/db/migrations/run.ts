import fs from 'fs';
import path from 'path';
import { pool } from '../../config/db';
import '../../config/env';

async function runMigrations() {
  const migrationsDir = path.join(__dirname);
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Running migration: ${file}`);
    await pool.query(sql);
    console.log(`✓ ${file}`);
  }

  await pool.end();
  console.log('Migrations complete.');
}

runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
