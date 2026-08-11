import { Pool } from 'pg';
import { env } from './env';

const isRemote = env.databaseUrl.includes('supabase') || env.databaseUrl.includes('sslmode=require');

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: isRemote ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected DB error', err);
  process.exit(1);
});
