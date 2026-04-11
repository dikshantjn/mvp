const { query } = require("../db/pool");

async function listTicketsByBuyer(buyerUserId, page, pageSize) {
  const countResult = await query(
    `SELECT COUNT(*)::INT AS total
     FROM support_tickets
     WHERE buyer_user_id = $1`,
    [buyerUserId]
  );

  const itemsResult = await query(
    `SELECT id, subject, category, status, priority, created_at, updated_at
     FROM support_tickets
     WHERE buyer_user_id = $1
     ORDER BY updated_at DESC
     LIMIT $2 OFFSET $3`,
    [buyerUserId, pageSize, (page - 1) * pageSize]
  );

  return {
    items: itemsResult.rows,
    total: countResult.rows[0].total
  };
}

async function createTicket(data) {
  const result = await query(
    `INSERT INTO support_tickets (
      id,
      buyer_user_id,
      subject,
      category,
      description,
      status,
      priority
     ) VALUES ($1, $2, $3, $4, $5, 'open', 'medium')
     RETURNING id, status`,
    [data.id, data.buyerUserId, data.subject, data.category, data.description]
  );
  return result.rows[0];
}

async function getTicketByIdForBuyer(ticketId, buyerUserId) {
  const result = await query(
    `SELECT id,
            subject,
            category,
            description,
            status,
            priority,
            resolution_note,
            created_at,
            updated_at
     FROM support_tickets
     WHERE id = $1 AND buyer_user_id = $2`,
    [ticketId, buyerUserId]
  );
  return result.rows[0] || null;
}

async function listTicketsForAdmin(status, page, pageSize) {
  const params = [];
  let where = "";
  if (status) {
    params.push(status);
    where = `WHERE st.status = $1`;
  }

  const countResult = await query(
    `SELECT COUNT(*)::INT AS total
     FROM support_tickets st
     ${where}`,
    params
  );

  params.push(pageSize, (page - 1) * pageSize);

  const itemsResult = await query(
    `SELECT st.id,
            bu.full_name AS buyer_name,
            st.subject,
            st.category,
            st.status,
            st.priority,
            st.created_at
     FROM support_tickets st
     INNER JOIN buyer_users bu ON bu.id = st.buyer_user_id
     ${where}
     ORDER BY st.updated_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return {
    items: itemsResult.rows,
    total: countResult.rows[0].total
  };
}

async function updateTicket(ticketId, updates) {
  const result = await query(
    `UPDATE support_tickets
     SET status = $2,
         priority = $3,
         resolution_note = $4,
         resolved_at = CASE WHEN $2 = 'resolved' THEN NOW() ELSE resolved_at END,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, status`,
    [ticketId, updates.status, updates.priority, updates.resolutionNote]
  );
  return result.rows[0] || null;
}

module.exports = {
  createTicket,
  getTicketByIdForBuyer,
  listTicketsByBuyer,
  listTicketsForAdmin,
  updateTicket
};
