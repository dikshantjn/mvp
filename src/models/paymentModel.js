const { query } = require("../db/pool");

async function getPaymentSummary(buyerUserId) {
  const result = await query(
    `SELECT COALESCE(SUM(amount), 0) AS total_amount,
            COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS paid_amount,
            COALESCE(SUM(CASE WHEN status = 'due' THEN amount ELSE 0 END), 0) AS due_amount,
            COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END), 0) AS overdue_amount,
            MAX(paid_date) AS last_payment_date
     FROM payments
     WHERE buyer_user_id = $1`,
    [buyerUserId]
  );
  return result.rows[0];
}

async function listPaymentsByBuyer(buyerUserId, page, pageSize, statuses = null) {
  const params = [buyerUserId];
  let statusFilter = "";

  if (statuses && statuses.length > 0) {
    params.push(statuses);
    statusFilter = ` AND status = ANY($${params.length})`;
  }

  params.push(pageSize, (page - 1) * pageSize);

  const countParams = params.slice(0, statuses && statuses.length > 0 ? 2 : 1);

  const countResult = await query(
    `SELECT COUNT(*)::INT AS total
     FROM payments
     WHERE buyer_user_id = $1${statusFilter}`,
    countParams
  );

  const itemsResult = await query(
    `SELECT id, title, amount, status, due_date, paid_date, reference_number
     FROM payments
     WHERE buyer_user_id = $1${statusFilter}
     ORDER BY COALESCE(due_date, created_at) DESC, created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return {
    items: itemsResult.rows,
    total: countResult.rows[0].total
  };
}

async function createPayment(data) {
  const result = await query(
    `INSERT INTO payments (
      id,
      buyer_user_id,
      title,
      amount,
      status,
      due_date,
      paid_date,
      reference_number,
      created_by_admin_id
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      data.id,
      data.buyerUserId,
      data.title,
      data.amount,
      data.status,
      data.dueDate,
      data.paidDate,
      data.referenceNumber,
      data.createdByAdminId
    ]
  );
  return result.rows[0];
}

module.exports = {
  createPayment,
  getPaymentSummary,
  listPaymentsByBuyer
};
