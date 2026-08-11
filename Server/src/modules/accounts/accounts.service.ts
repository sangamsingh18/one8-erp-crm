import { pool } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { parsePagination } from '../../utils/pagination';

export const accountsService = {
  async listInvoices(query: Record<string, unknown>) {
    const { page, limit, offset } = parsePagination(query);
    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (query.status) {
      conditions.push(`inv.status = $${i}`);
      params.push(query.status);
      i++;
    }
    if (query.customer_id) {
      conditions.push(`inv.customer_id = $${i}`);
      params.push(query.customer_id);
      i++;
    }
    if (query.search) {
      conditions.push(`(inv.invoice_number ILIKE $${i} OR c.name ILIKE $${i})`);
      params.push(`%${query.search}%`);
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM invoices inv JOIN customers c ON c.id = inv.customer_id ${where}`,
      params
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const rows = await pool.query(
      `SELECT inv.*, c.name as customer_name, c.business_name as customer_business_name,
              ch.challan_number
       FROM invoices inv
       JOIN customers c ON c.id = inv.customer_id
       LEFT JOIN challans ch ON ch.id = inv.challan_id
       ${where}
       ORDER BY inv.created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, offset]
    );

    return { rows: rows.rows, total, page, limit };
  },

  async getInvoiceById(id: string) {
    const invRes = await pool.query(
      `SELECT inv.*, c.name as customer_name, c.business_name as customer_business_name,
              ch.challan_number, u.name as created_by_name
       FROM invoices inv
       JOIN customers c ON c.id = inv.customer_id
       LEFT JOIN challans ch ON ch.id = inv.challan_id
       LEFT JOIN users u ON u.id = inv.created_by
       WHERE inv.id = $1`,
      [id]
    );
    if (!invRes.rows[0]) throw new ApiError(404, 'Invoice not found');
    const invoice = invRes.rows[0];

    const paymentsRes = await pool.query(
      `SELECT p.*, u.name as created_by_name
       FROM payments p
       LEFT JOIN users u ON u.id = p.created_by
       WHERE p.invoice_id = $1
       ORDER BY p.created_at DESC`,
      [id]
    );

    return { ...invoice, payments: paymentsRes.rows };
  },

  async createInvoice(data: Record<string, unknown>, userId: string) {
    const { invoice_number, challan_id, customer_id, total_amount, due_date } = data;

    // Check duplicate invoice number
    const dupRes = await pool.query('SELECT id FROM invoices WHERE invoice_number = $1', [invoice_number]);
    if (dupRes.rows[0]) throw new ApiError(400, 'Invoice number already exists');

    const result = await pool.query(
      `INSERT INTO invoices (invoice_number, challan_id, customer_id, total_amount, paid_amount, outstanding_amount, status, due_date, created_by)
       VALUES ($1, $2, $3, $4, 0, $4, 'pending', $5, $6)
       RETURNING *`,
      [invoice_number, challan_id ?? null, customer_id, total_amount, due_date ?? null, userId]
    );
    return result.rows[0];
  },

  async recordPayment(data: Record<string, unknown>, userId: string) {
    const { invoice_id, amount, payment_method, reference_number, notes } = data;
    const paymentAmount = parseFloat(amount as string);
    if (isNaN(paymentAmount) || paymentAmount <= 0) throw new ApiError(400, 'Invalid payment amount');

    // Get invoice
    const invRes = await pool.query('SELECT * FROM invoices WHERE id = $1', [invoice_id]);
    const invoice = invRes.rows[0];
    if (!invoice) throw new ApiError(404, 'Invoice not found');

    const total = parseFloat(invoice.total_amount);
    const prevPaid = parseFloat(invoice.paid_amount);
    const nextPaid = prevPaid + paymentAmount;
    if (nextPaid > total) throw new ApiError(400, 'Payment amount exceeds outstanding balance');

    const nextOutstanding = total - nextPaid;
    const nextStatus = nextOutstanding === 0 ? 'paid' : 'partially_paid';

    // Insert payment record
    const payRes = await pool.query(
      `INSERT INTO payments (invoice_id, amount, payment_method, reference_number, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [invoice_id, paymentAmount, payment_method, reference_number ?? null, notes ?? null, userId]
    );

    // Update invoice balance
    await pool.query(
      `UPDATE invoices
       SET paid_amount = $1, outstanding_amount = $2, status = $3, updated_at = NOW()
       WHERE id = $4`,
      [nextPaid, nextOutstanding, nextStatus, invoice_id]
    );

    return payRes.rows[0];
  },

  async getFinancialSummary() {
    const summaryRes = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(paid_amount), 0) as total_paid,
        COALESCE(SUM(outstanding_amount), 0) as total_outstanding,
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'partially_paid' THEN 1 END) as partial_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
      FROM invoices
    `);
    
    const recentPaymentsRes = await pool.query(`
      SELECT p.*, inv.invoice_number, c.name as customer_name
      FROM payments p
      JOIN invoices inv ON inv.id = p.invoice_id
      JOIN customers c ON c.id = inv.customer_id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    return {
      ...summaryRes.rows[0],
      recentPayments: recentPaymentsRes.rows
    };
  }
};
