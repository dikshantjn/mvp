const { v4: uuidv4 } = require("uuid");

const env = require("../config/env");
const { getAbsoluteStoragePath } = require("../config/storage");
const buyerModel = require("../models/buyerModel");
const fileModel = require("../models/fileModel");
const progressModel = require("../models/progressModel");
const ApiError = require("../utils/apiError");

class ProgressService {
  static async listBuyerProgress(buyerUserId, page, pageSize) {
    const projectId = await buyerModel.getBuyerProjectId(buyerUserId);
    if (!projectId) {
      return {
        items: [],
        page,
        pageSize,
        total: 0
      };
    }

    const result = await progressModel.listProgressByProject(projectId, page, pageSize);
    return {
      items: result.items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        publishedAt: item.published_at,
        imageUrl: item.image_file_object_id ? `/api/v1/me/progress/${item.id}/image` : null
      })),
      page,
      pageSize,
      total: result.total
    };
  }

  static async getProgressImage(progressId, buyerUserId) {
    const projectId = await buyerModel.getBuyerProjectId(buyerUserId);
    if (!projectId) {
      throw new ApiError(404, "NOT_FOUND", "Progress update not found", {});
    }

    const image = await progressModel.getProgressImageById(progressId, projectId);
    if (!image) {
      throw new ApiError(404, "NOT_FOUND", "Progress update not found", {});
    }

    return {
      absolutePath: getAbsoluteStoragePath(image.storage_path),
      fileName: image.original_file_name,
      mimeType: image.mime_type
    };
  }

  static async createProgress(adminUserId, payload, file) {
    let imageFileObjectId = null;
    if (file) {
      const fileObject = await fileModel.createFileObject({
        id: uuidv4(),
        storageProvider: env.STORAGE_PROVIDER,
        storagePath: file.path,
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size
      });
      imageFileObjectId = fileObject.id;
    }

    return progressModel.createProgressUpdate({
      id: uuidv4(),
      projectId: payload.projectId,
      title: payload.title,
      description: payload.description,
      imageFileObjectId,
      publishedAt: payload.publishedAt,
      createdByAdminId: adminUserId
    });
  }
}

module.exports = ProgressService;
