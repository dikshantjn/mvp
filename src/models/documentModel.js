const { query } = require("../db/pool");

async function listDocumentsByBuyer(buyerUserId, page, pageSize) {
  const countResult = await query(
    `SELECT COUNT(*)::INT AS total
     FROM documents
     WHERE buyer_user_id = $1`,
    [buyerUserId]
  );

  const itemsResult = await query(
    `SELECT d.id,
            d.title,
            d.type,
            d.created_at AS uploaded_at,
            fo.original_file_name AS file_name
     FROM documents d
     INNER JOIN file_objects fo ON fo.id = d.file_object_id
     WHERE d.buyer_user_id = $1
     ORDER BY d.created_at DESC
     LIMIT $2 OFFSET $3`,
    [buyerUserId, pageSize, (page - 1) * pageSize]
  );

  return {
    items: itemsResult.rows,
    total: countResult.rows[0].total
  };
}

async function getDocumentByIdForBuyer(documentId, buyerUserId) {
  const result = await query(
    `SELECT d.id,
            d.title,
            d.type,
            d.buyer_user_id,
            fo.id AS file_object_id,
            fo.storage_path,
            fo.original_file_name,
            fo.mime_type
     FROM documents d
     INNER JOIN file_objects fo ON fo.id = d.file_object_id
     WHERE d.id = $1 AND d.buyer_user_id = $2`,
    [documentId, buyerUserId]
  );
  return result.rows[0] || null;
}

async function createDocument(data) {
  const result = await query(
    `INSERT INTO documents (
      id,
      buyer_user_id,
      title,
      type,
      file_object_id,
      uploaded_by_admin_id
     ) VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [data.id, data.buyerUserId, data.title, data.type, data.fileObjectId, data.uploadedByAdminId]
  );
  return result.rows[0];
}

module.exports = {
  createDocument,
  getDocumentByIdForBuyer,
  listDocumentsByBuyer
};
