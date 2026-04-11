const { v4: uuidv4 } = require("uuid");

const env = require("../config/env");
const { getAbsoluteStoragePath } = require("../config/storage");
const documentModel = require("../models/documentModel");
const fileModel = require("../models/fileModel");
const ApiError = require("../utils/apiError");

class DocumentService {
  static async listBuyerDocuments(buyerUserId, page, pageSize) {
    const result = await documentModel.listDocumentsByBuyer(buyerUserId, page, pageSize);
    return {
      items: result.items.map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        uploadedAt: item.uploaded_at,
        fileName: item.file_name,
        downloadUrl: `/api/v1/me/documents/${item.id}/download`
      })),
      page,
      pageSize,
      total: result.total
    };
  }

  static async getBuyerDocumentForDownload(documentId, buyerUserId) {
    const document = await documentModel.getDocumentByIdForBuyer(documentId, buyerUserId);
    if (!document) {
      throw new ApiError(404, "NOT_FOUND", "Document not found", {});
    }

    return {
      absolutePath: getAbsoluteStoragePath(document.storage_path),
      fileName: document.original_file_name,
      mimeType: document.mime_type
    };
  }

  static async createAdminDocument(adminUserId, payload, file) {
    if (!file) {
      throw new ApiError(400, "VALIDATION_ERROR", "File is required", { file: "File is required" });
    }

    const fileObject = await fileModel.createFileObject({
      id: uuidv4(),
      storageProvider: env.STORAGE_PROVIDER,
      storagePath: file.path,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size
    });

    return documentModel.createDocument({
      id: uuidv4(),
      buyerUserId: payload.buyerId,
      title: payload.title,
      type: payload.type,
      fileObjectId: fileObject.id,
      uploadedByAdminId: adminUserId
    });
  }
}

module.exports = DocumentService;
