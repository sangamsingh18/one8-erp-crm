import { pool } from '../../config/db';
import '../../config/env';

async function seedAccounts() {
  console.log('Seeding accounts (invoices & payments)...');
  
  // Clear any existing invoices
  await pool.query('TRUNCATE invoices, payments CASCADE');
  
  // Find customers, users and confirmed/draft challans
  const custRes = await pool.query('SELECT id FROM customers LIMIT 3');
  const userRes = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  const challanRes = await pool.query("SELECT id, total_quantity, challan_number FROM challans LIMIT 3");
  
  if (custRes.rows.length > 0 && userRes.rows.length > 0) {
    const adminId = userRes.rows[0].id;
    
    for (let i = 0; i < custRes.rows.length; i++) {
      const customerId = custRes.rows[i].id;
      const challan = challanRes.rows[i] || null;
      
      // Calculate amounts
      const total = challan ? challan.total_quantity * 120 : (i + 1) * 3500;
      const paid = i === 0 ? total : i === 1 ? total / 2 : 0;
      const outstanding = total - paid;
      const status = paid === total ? 'paid' : paid > 0 ? 'partially_paid' : 'pending';
      const invNum = `INV-2026-00${i+1}`;
      
      const invRes = await pool.query(`
        INSERT INTO invoices (invoice_number, challan_id, customer_id, total_amount, paid_amount, outstanding_amount, status, due_date, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() + INTERVAL '14 days', $8)
        RETURNING id
      `, [invNum, challan?.id || null, customerId, total, paid, outstanding, status, adminId]);
      
      if (paid > 0) {
        await pool.query(`
          INSERT INTO payments (invoice_id, amount, payment_method, reference_number, notes, created_by)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [invRes.rows[0].id, paid, 'bank_transfer', `TXN-876${i+1}`, 'Invoice payment', adminId]);
      }
    }
    console.log('✓ Accounts seeded successfully.');
  } else {
    console.log('⚠ Skipping seeding: no customers or admin user found.');
  }
  await pool.end();
}

seedAccounts().catch(err => {
  console.error('Accounts seeding failed:', err);
  process.exit(1);
});
