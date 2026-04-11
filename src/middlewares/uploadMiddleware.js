const multer = require("multer");
const path = require("path");

const { ensureUploadPath } = require("../config/storage");

function buildStorage(directoryName) {
  return multer.diskStorage({
    destination(_req, _file, callback) {
      callback(null, ensureUploadPath(directoryName));
    },
    filename(_req, file, callback) {
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      callback(null, `${timestamp}-${safeName}`);
    }
  });
}

const csvUpload = multer({
  storage: buildStorage("imports"),
  fileFilter(_req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, extension === ".csv");
  }
});

const documentUpload = multer({
  storage: buildStorage("documents"),
  limits: { fileSize: 15 * 1024 * 1024 }
});

const progressUpload = multer({
  storage: buildStorage("progress"),
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = {
  csvUpload,
  documentUpload,
  progressUpload
};
