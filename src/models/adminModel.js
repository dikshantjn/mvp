const { query, withTransaction } = require("../db/pool");

async function listBuyers(search, page, pageSize) {
  const params = [];
  let where = "";

  if (search) {
    params.push(`%${search}%`);
    where = `WHERE bu.full_name ILIKE $1 OR bu.email ILIKE $1 OR bu.mobile_number ILIKE $1`;
  }

  const countResult = await query(
    `SELECT COUNT(*)::INT AS total
     FROM buyer_users bu
     ${where}`,
    params
  );

  params.push(pageSize, (page - 1) * pageSize);

  const itemsResult = await query(
    `SELECT bu.id AS buyer_id,
            bu.full_name,
            bu.email,
            bu.mobile_number,
            bu.status,
            p.name AS project_name,
            u.unit_number
     FROM buyer_users bu
     LEFT JOIN buyer_unit_assignments bua ON bua.buyer_user_id = bu.id
     LEFT JOIN units u ON u.id = bua.unit_id
     LEFT JOIN projects p ON p.id = u.project_id
     ${where}
     ORDER BY bu.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return {
    items: itemsResult.rows,
    total: countResult.rows[0].total
  };
}

async function getBuyerDetail(buyerId) {
  const result = await query(
    `SELECT bu.id AS buyer_id,
            bu.full_name,
            bu.email,
            bu.mobile_number,
            bu.status,
            bua.id AS assignment_id,
            p.id AS project_id,
            p.name AS project_name,
            u.id AS unit_id,
            u.unit_number,
            u.tower,
            u.floor,
            u.type,
            u.area_sq_ft,
            bua.agreement_value,
            bua.booking_date
     FROM buyer_users bu
     LEFT JOIN buyer_unit_assignments bua ON bua.buyer_user_id = bu.id
     LEFT JOIN units u ON u.id = bua.unit_id
     LEFT JOIN projects p ON p.id = u.project_id
     WHERE bu.id = $1`,
    [buyerId]
  );
  return result.rows[0] || null;
}

async function listProjects() {
  const result = await query(
    `SELECT id, name, code, location
     FROM projects
     ORDER BY created_at DESC`
  );
  return result.rows;
}

async function createUnit(data) {
  const result = await query(
    `INSERT INTO units (
      id,
      project_id,
      unit_number,
      tower,
      floor,
      type,
      area_sq_ft,
      status
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [data.id, data.projectId, data.unitNumber, data.tower, data.floor, data.type, data.areaSqFt, data.status]
  );
  return result.rows[0];
}

async function updateUnit(unitId, status) {
  const result = await query(
    `UPDATE units
     SET status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, status`,
    [unitId, status]
  );
  return result.rows[0] || null;
}

async function getBuyerById(buyerId) {
  const result = await query(
    `SELECT id, full_name, email, mobile_number, status
     FROM buyer_users
     WHERE id = $1`,
    [buyerId]
  );
  return result.rows[0] || null;
}

async function getProjectById(projectId) {
  const result = await query(`SELECT id, name, code, location FROM projects WHERE id = $1`, [projectId]);
  return result.rows[0] || null;
}

async function createImportJob(data) {
  const result = await query(
    `INSERT INTO csv_import_jobs (
      id,
      status,
      uploaded_by_admin_id,
      file_object_id,
      total_rows,
      success_rows,
      failed_rows,
      error_report
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
     RETURNING id`,
    [
      data.id,
      data.status,
      data.uploadedByAdminId,
      data.fileObjectId,
      data.totalRows,
      data.successRows,
      data.failedRows,
      JSON.stringify(data.errorReport)
    ]
  );
  return result.rows[0];
}

async function upsertBuyerImportRow(row) {
  return withTransaction(async (client) => {
    const projectResult = await client.query(
      `SELECT id, name
       FROM projects
       WHERE name = $1`,
      [row.project_name]
    );

    let projectId = projectResult.rows[0]?.id;
    if (!projectId) {
      const projectInsert = await client.query(
        `INSERT INTO projects (id, name, code, location)
         VALUES ($1, $2, $3, NULL)
         RETURNING id`,
        [row.projectId, row.project_name, row.projectCode]
      );
      projectId = projectInsert.rows[0].id;
    }

    const buyerResult = await client.query(
      `INSERT INTO buyer_users (id, full_name, email, mobile_number, status)
       VALUES ($1, $2, $3, $4, 'active')
       ON CONFLICT (mobile_number)
       DO UPDATE SET
         full_name = EXCLUDED.full_name,
         email = EXCLUDED.email,
         status = 'active',
         updated_at = NOW()
       RETURNING id`,
      [row.buyerUserId, row.full_name, row.email || null, row.mobile_number]
    );
    const buyerUserId = buyerResult.rows[0].id;

    const unitResult = await client.query(
      `INSERT INTO units (
          id,
          project_id,
          unit_number,
          tower,
          floor,
          type,
          area_sq_ft,
          status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'booked')
       ON CONFLICT (project_id, unit_number)
       DO UPDATE SET
         tower = EXCLUDED.tower,
         floor = EXCLUDED.floor,
         type = EXCLUDED.type,
         area_sq_ft = EXCLUDED.area_sq_ft,
         status = 'booked',
         updated_at = NOW()
       RETURNING id`,
      [row.unitId, projectId, row.unit_number, row.tower || null, row.floor || null, row.unit_type, row.area_sq_ft || null]
    );
    const unitId = unitResult.rows[0].id;

    await client.query(
      `DELETE FROM buyer_unit_assignments
       WHERE buyer_user_id = $1 OR unit_id = $2`,
      [buyerUserId, unitId]
    );

    await client.query(
      `INSERT INTO buyer_unit_assignments (
          id,
          buyer_user_id,
          unit_id,
          agreement_value,
          booking_date
       ) VALUES ($1, $2, $3, $4, $5)`,
      [row.assignmentId, buyerUserId, unitId, row.agreement_value, row.booking_date || null]
    );

    return { buyerUserId, unitId, projectId };
  });
}

module.exports = {
  createImportJob,
  createUnit,
  getBuyerById,
  getBuyerDetail,
  getProjectById,
  listBuyers,
  listProjects,
  updateUnit,
  upsertBuyerImportRow
};
