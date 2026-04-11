const { query } = require("../db/pool");

async function listProgressByProject(projectId, page, pageSize) {
  const countResult = await query(
    `SELECT COUNT(*)::INT AS total
     FROM progress_updates
     WHERE project_id = $1`,
    [projectId]
  );

  const itemsResult = await query(
    `SELECT id, title, description, published_at, image_file_object_id
     FROM progress_updates
     WHERE project_id = $1
     ORDER BY published_at DESC
     LIMIT $2 OFFSET $3`,
    [projectId, pageSize, (page - 1) * pageSize]
  );

  return {
    items: itemsResult.rows,
    total: countResult.rows[0].total
  };
}

async function getProgressImageById(progressId, projectId) {
  const result = await query(
    `SELECT pu.id,
            pu.project_id,
            fo.storage_path,
            fo.original_file_name,
            fo.mime_type
     FROM progress_updates pu
     INNER JOIN file_objects fo ON fo.id = pu.image_file_object_id
     WHERE pu.id = $1 AND pu.project_id = $2 AND pu.image_file_object_id IS NOT NULL`,
    [progressId, projectId]
  );
  return result.rows[0] || null;
}

async function createProgressUpdate(data) {
  const result = await query(
    `INSERT INTO progress_updates (
      id,
      project_id,
      title,
      description,
      image_file_object_id,
      published_at,
      created_by_admin_id
     ) VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      data.id,
      data.projectId,
      data.title,
      data.description,
      data.imageFileObjectId,
      data.publishedAt,
      data.createdByAdminId
    ]
  );
  return result.rows[0];
}

module.exports = {
  createProgressUpdate,
  getProgressImageById,
  listProgressByProject
};
