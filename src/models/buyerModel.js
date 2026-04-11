const { query } = require("../db/pool");

async function getBuyerProfile(buyerUserId) {
  const result = await query(
    `SELECT id, full_name, email, mobile_number, status
     FROM buyer_users
     WHERE id = $1`,
    [buyerUserId]
  );
  return result.rows[0] || null;
}

async function getBuyerUnitAssignment(buyerUserId) {
  const result = await query(
    `SELECT bua.id AS assignment_id,
            bua.agreement_value,
            bua.booking_date,
            p.id AS project_id,
            p.name AS project_name,
            u.id AS unit_id,
            u.unit_number,
            u.tower,
            u.floor,
            u.type,
            u.area_sq_ft,
            u.status
     FROM buyer_unit_assignments bua
     INNER JOIN units u ON u.id = bua.unit_id
     INNER JOIN projects p ON p.id = u.project_id
     WHERE bua.buyer_user_id = $1`,
    [buyerUserId]
  );
  return result.rows[0] || null;
}

async function getBuyerProjectId(buyerUserId) {
  const result = await query(
    `SELECT u.project_id
     FROM buyer_unit_assignments bua
     INNER JOIN units u ON u.id = bua.unit_id
     WHERE bua.buyer_user_id = $1`,
    [buyerUserId]
  );
  return result.rows[0]?.project_id || null;
}

module.exports = {
  getBuyerProfile,
  getBuyerProjectId,
  getBuyerUnitAssignment
};
