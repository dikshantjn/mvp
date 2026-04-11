const fs = require("fs");
const { parse } = require("csv-parse/sync");
const { v4: uuidv4 } = require("uuid");

const env = require("../config/env");
const adminModel = require("../models/adminModel");
const fileModel = require("../models/fileModel");
const paymentModel = require("../models/paymentModel");
const ApiError = require("../utils/apiError");
const { makeProjectCode } = require("../utils/filePaths");

const REQUIRED_CSV_COLUMNS = [
  "full_name",
  "email",
  "mobile_number",
  "project_name",
  "unit_number",
  "tower",
  "floor",
  "unit_type",
  "area_sq_ft",
  "agreement_value",
  "booking_date"
];

class AdminService {
  static async importBuyers(adminUserId, file) {
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

    const content = fs.readFileSync(file.path, "utf8");
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const headers = Object.keys(records[0] || {});
    for (const column of REQUIRED_CSV_COLUMNS) {
      if (!headers.includes(column)) {
        throw new ApiError(400, "VALIDATION_ERROR", "CSV headers are invalid", {
          missingColumn: column
        });
      }
    }

    const errors = [];
    let successRows = 0;

    for (let index = 0; index < records.length; index += 1) {
      const row = records[index];
      try {
        if (!row.full_name || !row.mobile_number || !row.project_name || !row.unit_number || !row.unit_type || !row.agreement_value) {
          throw new Error("Required columns are missing values.");
        }

        await adminModel.upsertBuyerImportRow({
          ...row,
          projectId: uuidv4(),
          buyerUserId: uuidv4(),
          unitId: uuidv4(),
          assignmentId: uuidv4(),
          projectCode: makeProjectCode(row.project_name)
        });
        successRows += 1;
      } catch (error) {
        errors.push({
          rowNumber: index + 2,
          message: error.message
        });
      }
    }

    const failedRows = errors.length;
    const status = failedRows > 0 ? "failed" : "done";

    const importJob = await adminModel.createImportJob({
      id: uuidv4(),
      status,
      uploadedByAdminId: adminUserId,
      fileObjectId: fileObject.id,
      totalRows: records.length,
      successRows,
      failedRows,
      errorReport: errors
    });

    return {
      importId: importJob.id,
      totalRows: records.length,
      successRows,
      failedRows,
      errors
    };
  }

  static async listBuyers(search, page, pageSize) {
    const result = await adminModel.listBuyers(search, page, pageSize);
    return {
      items: result.items.map((item) => ({
        buyerId: item.buyer_id,
        fullName: item.full_name,
        email: item.email,
        mobileNumber: item.mobile_number,
        projectName: item.project_name,
        unitNumber: item.unit_number,
        status: item.status
      })),
      page,
      pageSize,
      total: result.total
    };
  }

  static async getBuyerDetail(buyerId) {
    const buyer = await adminModel.getBuyerDetail(buyerId);
    if (!buyer) {
      throw new ApiError(404, "NOT_FOUND", "Buyer not found", {});
    }

    const paymentSummary = await paymentModel.getPaymentSummary(buyerId);

    return {
      buyerId: buyer.buyer_id,
      fullName: buyer.full_name,
      email: buyer.email,
      mobileNumber: buyer.mobile_number,
      status: buyer.status,
      unit: {
        assignmentId: buyer.assignment_id,
        projectId: buyer.project_id,
        projectName: buyer.project_name,
        unitId: buyer.unit_id,
        unitNumber: buyer.unit_number,
        tower: buyer.tower,
        floor: buyer.floor,
        type: buyer.type,
        areaSqFt: buyer.area_sq_ft ? Number(buyer.area_sq_ft) : 0,
        agreementValue: buyer.agreement_value ? Number(buyer.agreement_value) : 0,
        bookingDate: buyer.booking_date
      },
      paymentSummary: {
        totalAmount: Number(paymentSummary.total_amount),
        paidAmount: Number(paymentSummary.paid_amount),
        dueAmount: Number(paymentSummary.due_amount),
        overdueAmount: Number(paymentSummary.overdue_amount)
      }
    };
  }

  static async createUnit(payload) {
    await this.assertProjectExists(payload.projectId);
    return adminModel.createUnit({
      id: uuidv4(),
      projectId: payload.projectId,
      unitNumber: payload.unitNumber,
      tower: payload.tower || null,
      floor: payload.floor || null,
      type: payload.type,
      areaSqFt: payload.areaSqFt || null,
      status: payload.status
    });
  }

  static async updateUnit(unitId, payload) {
    const unit = await adminModel.updateUnit(unitId, payload.status);
    if (!unit) {
      throw new ApiError(404, "NOT_FOUND", "Unit not found", {});
    }
    return unit;
  }

  static async listAdminPayments(buyerId, page, pageSize) {
    const buyer = await adminModel.getBuyerById(buyerId);
    if (!buyer) {
      throw new ApiError(404, "NOT_FOUND", "Buyer not found", {});
    }

    const result = await paymentModel.listPaymentsByBuyer(buyerId, page, pageSize);
    return {
      items: result.items.map((item) => ({
        id: item.id,
        title: item.title,
        amount: Number(item.amount),
        status: item.status,
        dueDate: item.due_date,
        paidDate: item.paid_date,
        referenceNumber: item.reference_number
      })),
      page,
      pageSize,
      total: result.total
    };
  }

  static async listProjects() {
    const projects = await adminModel.listProjects();
    return {
      items: projects.map((project) => ({
        id: project.id,
        name: project.name,
        code: project.code,
        location: project.location
      }))
    };
  }

  static async assertBuyerExists(buyerId) {
    const buyer = await adminModel.getBuyerById(buyerId);
    if (!buyer) {
      throw new ApiError(404, "NOT_FOUND", "Buyer not found", {});
    }
    return buyer;
  }

  static async assertProjectExists(projectId) {
    const project = await adminModel.getProjectById(projectId);
    if (!project) {
      throw new ApiError(404, "NOT_FOUND", "Project not found", {});
    }
    return project;
  }
}

module.exports = AdminService;
