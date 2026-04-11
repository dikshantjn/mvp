const { query } = require("../db/pool");

async function createFileObject(data) {
  const result = await query(
    `INSERT INTO file_objects (
      id,
      storage_provider,
      storage_path,
      original_file_name,
      mime_type,
      size_bytes
     ) VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      data.id,
      data.storageProvider,
      data.storagePath,
      data.originalFileName,
      data.mimeType,
      data.sizeBytes
    ]
  );
  return result.rows[0];
}

module.exports = {
  createFileObject
};
