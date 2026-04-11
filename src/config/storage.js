const fs = require("fs");
const path = require("path");

const env = require("./env");

function ensureUploadPath(...segments) {
  const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);
  const targetDir = path.join(uploadRoot, ...segments);
  fs.mkdirSync(targetDir, { recursive: true });
  return targetDir;
}

function getAbsoluteStoragePath(relativePath) {
  return path.resolve(process.cwd(), relativePath);
}

module.exports = {
  ensureUploadPath,
  getAbsoluteStoragePath
};
