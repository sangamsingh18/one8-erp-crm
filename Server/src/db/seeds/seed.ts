import bcrypt from 'bcryptjs';
import { pool } from '../../config/db';
import '../../config/env';

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Truncate existing data to start clean
    console.log('Truncating existing data...');
    await client.query(
      `TRUNCATE TABLE payments, invoices, challan_items, challans, stock_movements, customer_notes, customers, products, users RESTART IDENTITY CASCADE`
    );

    // 2. Insert users
    console.log('Seeding users...');
    const users = [
      { name: 'Admin User', email: 'admin@erp.com', password: 'Admin@123', role: 'admin' },
      { name: 'Sales User', email: 'sales@erp.com', password: 'Sales@123', role: 'sales' },
      { name: 'Warehouse User', email: 'warehouse@erp.com', password: 'Warehouse@123', role: 'warehouse' },
      { name: 'Accounts User', email: 'accounts@erp.com', password: 'Accounts@123', role: 'accounts' },
    ];

    const userMap: Record<string, string> = {};
    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 10);
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [u.name, u.email, hash, u.role]
      );
      userMap[u.role] = res.rows[0].id;
      console.log(`✓ Seeded user: ${u.email}`);
    }

    const adminId = userMap['admin'];
    const salesId = userMap['sales'];
    const warehouseId = userMap['warehouse'];
    const accountsId = userMap['accounts'];

    // 3. Insert products
    console.log('Seeding products...');
    const productsData = [
      { name: 'Polyester Yarn Spool', sku: 'TEX-POL-001', category: 'Textiles', unit_price: 250.00, current_stock: 200, min_stock_alert: 20, warehouse_loc: 'Rack A-1' },
      { name: 'Cotton Fabric Roll', sku: 'TEX-COT-002', category: 'Textiles', unit_price: 1200.00, current_stock: 100, min_stock_alert: 15, warehouse_loc: 'Rack A-2' },
      { name: 'Industrial Boiler Valve', sku: 'MEC-VAL-003', category: 'Mechanical', unit_price: 4500.00, current_stock: 25, min_stock_alert: 5, warehouse_loc: 'Rack B-1' },
      { name: 'Pneumatic Cylinder', sku: 'MEC-CYL-004', category: 'Mechanical', unit_price: 8500.00, current_stock: 30, min_stock_alert: 8, warehouse_loc: 'Rack B-2' },
      { name: 'LED Panel 24W', sku: 'ELE-LED-005', category: 'Electrical', unit_price: 450.00, current_stock: 250, min_stock_alert: 30, warehouse_loc: 'Rack C-1' },
      { name: 'Copper Wire Coil 100m', sku: 'ELE-COP-006', category: 'Electrical', unit_price: 3200.00, current_stock: 10, min_stock_alert: 10, warehouse_loc: 'Rack C-2' }, // Ends at 4 (Low Stock)
      { name: 'Steel Nuts & Bolts Box', sku: 'HRD-NUT-007', category: 'Hardware', unit_price: 750.00, current_stock: 50, min_stock_alert: 25, warehouse_loc: 'Rack D-1' }, // Ends at 8 (Low Stock)
      { name: 'Hydraulic Oil 20L', sku: 'HRD-OIL-008', category: 'Hardware', unit_price: 2400.00, current_stock: 2, min_stock_alert: 5, warehouse_loc: 'Rack D-2' }, // Low Stock
      { name: 'Precision Drill Bit Set', sku: 'TL-DRL-009', category: 'Tools', unit_price: 1500.00, current_stock: 3, min_stock_alert: 12, warehouse_loc: 'Rack E-1' }, // Low Stock
      { name: 'Laser Sensor Module', sku: 'SEN-LSR-010', category: 'Sensors', unit_price: 1800.00, current_stock: 1, min_stock_alert: 8, warehouse_loc: 'Rack E-2' }, // Low Stock
    ];

    const productMap: Record<string, any> = {};
    for (const p of productsData) {
      const res = await client.query(
        `INSERT INTO products (name, sku, category, unit_price, current_stock, min_stock_alert, warehouse_loc)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [p.name, p.sku, p.category, p.unit_price, p.current_stock, p.min_stock_alert, p.warehouse_loc]
      );
      productMap[p.sku] = res.rows[0];
    }
    console.log('✓ Seeding products complete.');

    // 4. Insert customers/leads
    console.log('Seeding customers/leads...');
    const customersData = [
      { name: 'Aarav Sharma', mobile: '9876543210', email: 'aarav@sharma.in', business_name: 'Sharma Enterprises', gst_number: '07AAAAA1111A1Z1', customer_type: 'distributor', address: '101, Connaught Place, New Delhi', status: 'active' },
      { name: 'Priya Patel', mobile: '9988776655', email: 'priya@patel.com', business_name: 'Patel & Sons', gst_number: '24BBBBB2222B2Z2', customer_type: 'wholesale', address: '202, SG Highway, Ahmedabad', status: 'active' },
      { name: 'Amit Verma', mobile: '9898989898', email: 'amit@verma.co.in', business_name: 'Verma Logistics', gst_number: '36CCCCC3333C3Z3', customer_type: 'wholesale', address: '303, Hitech City, Hyderabad', status: 'active' },
      { name: 'Neha Gupta', mobile: '9123456789', email: 'neha@gupta.org', business_name: 'Gupta Electronics', gst_number: '19DDDDD4444D4Z4', customer_type: 'retail', address: '404, Salt Lake, Kolkata', status: 'active' },
      { name: 'Vikram Singh', mobile: '9345678901', email: 'vikram@singh.net', business_name: 'Singh Industries', gst_number: '29EEEEE5555E5Z5', customer_type: 'distributor', address: '505, Indiranagar, Bengaluru', status: 'active' },
      { name: 'Sanya Iyer', mobile: '9456789012', email: 'sanya@iyer.com', business_name: 'Iyer Consulting', gst_number: '33FFFFF6666F6Z6', customer_type: 'retail', address: '606, Nungambakkam, Chennai', status: 'lead', follow_up_date: '2026-08-15' },
      { name: 'Rahul Mehta', mobile: '9567890123', email: 'rahul@mehta.co.in', business_name: 'Mehta Textiles', gst_number: '27GGGGG7777G7Z7', customer_type: 'wholesale', address: '707, Andheri West, Mumbai', status: 'lead', follow_up_date: '2026-08-18' },
      { name: 'Ananya Reddy', mobile: '9678901234', email: 'ananya@reddy.org', business_name: 'Reddy Pharma', gst_number: '36HHHHH8888H8Z8', customer_type: 'wholesale', address: '808, Banjara Hills, Hyderabad', status: 'lead', follow_up_date: '2026-08-20' },
      { name: 'Rohan Das', mobile: '9789012345', email: 'rohan@dastrading.com', business_name: 'Das Trading', gst_number: '19IIIII9999I9Z9', customer_type: 'retail', address: '909, Park Street, Kolkata', status: 'lead', follow_up_date: '2026-08-22' },
      { name: 'Karan Malhotra', mobile: '9890123456', email: 'karan@malhotra.in', business_name: 'Malhotra Jewellers', gst_number: '09JJJJJ0000J0Z0', customer_type: 'distributor', address: '1010, Hazratganj, Lucknow', status: 'lead', follow_up_date: '2026-08-25' },
    ];

    const customerMap: Record<string, string> = {};
    for (const c of customersData) {
      const res = await client.query(
        `INSERT INTO customers (name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [c.name, c.mobile, c.email, c.business_name, c.gst_number, c.customer_type, c.address, c.status, c.follow_up_date ?? null, salesId]
      );
      customerMap[c.name] = res.rows[0].id;
    }
    console.log('✓ Seeding customers/leads complete.');

    // 5. Insert customer notes (activities)
    console.log('Seeding customer notes (activities)...');
    const notesData = [
      { customer: 'Aarav Sharma', note: 'Discussed wholesale pricing. Client is interested in placing a bulk order for Polyester Yarn Spools next week.', user: salesId },
      { customer: 'Priya Patel', note: 'Shared product catalogue and sample copper wires. Awaiting feedback.', user: salesId },
      { customer: 'Vikram Singh', note: 'Negotiated distributor margins. Finalizing contract terms.', user: salesId },
      { customer: 'Rahul Mehta', note: 'Initial call completed. Requested quotation for 10 pneumatic cylinders.', user: salesId },
      { customer: 'Amit Verma', note: 'Sent follow-up email about pending invoice clearance.', user: accountsId },
    ];

    for (const n of notesData) {
      await client.query(
        `INSERT INTO customer_notes (customer_id, note, created_by)
         VALUES ($1, $2, $3)`,
        [customerMap[n.customer], n.note, n.user]
      );
    }
    console.log('✓ Seeding customer notes complete.');

    // 6. Insert initial stock movements ('IN')
    console.log('Seeding initial stock movements...');
    const movementsData = [
      { sku: 'TEX-POL-001', quantity: 200, type: 'IN', reason: 'Initial stock arrival from vendor' },
      { sku: 'TEX-COT-002', quantity: 100, type: 'IN', reason: 'Supplier delivery' },
      { sku: 'ELE-LED-005', quantity: 250, type: 'IN', reason: 'Warehouse intake' },
      { sku: 'ELE-COP-006', quantity: 10, type: 'IN', reason: 'Initial stocking' },
      { sku: 'HRD-NUT-007', quantity: 50, type: 'IN', reason: 'Stock intake' },
    ];

    for (const m of movementsData) {
      await client.query(
        `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [productMap[m.sku].id, m.quantity, m.type, m.reason, warehouseId]
      );
    }
    console.log('✓ Seeding initial stock movements complete.');

    // 7. Insert Challans & Challan Items
    console.log('Seeding challans and items...');
    const challansData = [
      {
        number: 'SC-2026-0001',
        customer: 'Aarav Sharma',
        status: 'confirmed' as const,
        items: [
          { sku: 'TEX-POL-001', qty: 50 },
          { sku: 'TEX-COT-002', qty: 20 },
        ],
        confirmed_at: '2026-08-01T10:00:00Z',
      },
      {
        number: 'SC-2026-0002',
        customer: 'Priya Patel',
        status: 'confirmed' as const,
        items: [
          { sku: 'ELE-LED-005', qty: 50 },
          { sku: 'ELE-COP-006', qty: 6 },
        ],
        confirmed_at: '2026-08-03T11:30:00Z',
      },
      {
        number: 'SC-2026-0003',
        customer: 'Amit Verma',
        status: 'confirmed' as const,
        items: [
          { sku: 'HRD-NUT-007', qty: 42 },
        ],
        confirmed_at: '2026-08-05T14:15:00Z',
      },
      {
        number: 'SC-2026-0004',
        customer: 'Neha Gupta',
        status: 'draft' as const,
        items: [
          { sku: 'TL-DRL-009', qty: 2 },
          { sku: 'SEN-LSR-010', qty: 5 },
        ],
        confirmed_at: null,
      },
      {
        number: 'SC-2026-0005',
        customer: 'Vikram Singh',
        status: 'cancelled' as const,
        items: [
          { sku: 'MEC-VAL-003', qty: 5 },
        ],
        confirmed_at: null,
      },
    ];

    const challanMap: Record<string, string> = {};

    for (const ch of challansData) {
      let totalQty = 0;
      for (const item of ch.items) {
        totalQty += item.qty;
      }

      // Insert challan
      const res = await client.query(
        `INSERT INTO challans (challan_number, customer_id, status, total_quantity, confirmed_at, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [ch.number, customerMap[ch.customer], ch.status, totalQty, ch.confirmed_at, salesId]
      );
      const challanId = res.rows[0].id;
      challanMap[ch.number] = challanId;

      // Insert challan items and apply stock changes + stock movement if confirmed
      for (const item of ch.items) {
        const prod = productMap[item.sku];
        const lineTotal = parseFloat(prod.unit_price) * item.qty;

        await client.query(
          `INSERT INTO challan_items (challan_id, product_id, product_name, product_sku, unit_price, quantity, line_total)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [challanId, prod.id, prod.name, prod.sku, prod.unit_price, item.qty, lineTotal]
        );

        if (ch.status === 'confirmed') {
          // Subtract stock
          await client.query(
            `UPDATE products
             SET current_stock = current_stock - $1, updated_at = NOW()
             WHERE id = $2`,
            [item.qty, prod.id]
          );

          // Stock movement
          await client.query(
            `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, reference_id, created_by)
             VALUES ($1, $2, 'OUT', $3, $4, $5)`,
            [prod.id, item.qty, `Challan #${ch.number}`, challanId, warehouseId]
          );
        }
      }
    }
    console.log('✓ Seeding challans and items complete.');

    // 8. Seeding Invoices & Payments
    console.log('Seeding invoices and payments...');
    const invoicesData = [
      {
        number: 'INV-2026-0001',
        challanNum: 'SC-2026-0001',
        customer: 'Aarav Sharma',
        total: 36500.00,
        paid: 36500.00,
        due: '2026-08-15',
        status: 'paid',
        payment: { amount: 36500.00, method: 'NEFT', ref: 'N123456789', notes: 'Full payment received' }
      },
      {
        number: 'INV-2026-0002',
        challanNum: 'SC-2026-0002',
        customer: 'Priya Patel',
        total: 41700.00,
        paid: 25000.00,
        due: '2026-08-18',
        status: 'partially_paid',
        payment: { amount: 25000.00, method: 'Bank Transfer', ref: 'TXN98765', notes: 'First installment paid' }
      },
      {
        number: 'INV-2026-0003',
        challanNum: 'SC-2026-0003',
        customer: 'Amit Verma',
        total: 31500.00,
        paid: 0.00,
        due: '2026-08-20',
        status: 'pending',
        payment: null
      },
      {
        number: 'INV-2026-0004',
        challanNum: null,
        customer: 'Neha Gupta',
        total: 15000.00,
        paid: 15000.00,
        due: '2026-08-10',
        status: 'paid',
        payment: { amount: 15000.00, method: 'UPI', ref: 'UPI889922', notes: 'Instant payment via UPI' }
      },
      {
        number: 'INV-2026-0005',
        challanNum: null,
        customer: 'Vikram Singh',
        total: 8500.00,
        paid: 5000.00,
        due: '2026-08-25',
        status: 'partially_paid',
        payment: { amount: 5000.00, method: 'Cheque', ref: 'CHQ009988', notes: 'Cheque cleared' }
      },
      {
        number: 'INV-2026-0006',
        challanNum: null,
        customer: 'Aarav Sharma',
        total: 12000.00,
        paid: 12000.00,
        due: '2026-08-12',
        status: 'paid',
        payment: { amount: 12000.00, method: 'UPI', ref: 'UPI776655', notes: 'UPI payment' }
      }
    ];

    for (const inv of invoicesData) {
      const outstanding = inv.total - inv.paid;
      const challanId = inv.challanNum ? challanMap[inv.challanNum] : null;

      const res = await client.query(
        `INSERT INTO invoices (invoice_number, challan_id, customer_id, total_amount, paid_amount, outstanding_amount, status, due_date, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [inv.number, challanId, customerMap[inv.customer], inv.total, inv.paid, outstanding, inv.status, inv.due, accountsId]
      );
      const invoiceId = res.rows[0].id;

      if (inv.payment) {
        await client.query(
          `INSERT INTO payments (invoice_id, amount, payment_method, reference_number, notes, created_by)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [invoiceId, inv.payment.amount, inv.payment.method, inv.payment.ref, inv.payment.notes, accountsId]
        );
      }
    }
    console.log('✓ Seeding invoices and payments complete.');

    await client.query('COMMIT');
    console.log('Transaction committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction rolled back due to error:', err);
    throw err;
  } finally {
    client.release();
  }
}

seed()
  .then(() => {
    console.log('Database seeding finished.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database seeding failed:', err);
    process.exit(1);
  });
