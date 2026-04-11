const AdminService = require("../services/AdminService");
const DocumentService = require("../services/DocumentService");
const PaymentService = require("../services/PaymentService");
const ProgressService = require("../services/ProgressService");
const { runSeed } = require("../services/SeedService");
const TicketService = require("../services/TicketService");
const ApiError = require("../utils/apiError");
const { sendSuccess } = require("../utils/responses");

async function importBuyers(req, res) {
  const data = await AdminService.importBuyers(req.auth.userId, req.file);
  sendSuccess(res, data);
}

async function listBuyers(req, res) {
  const data = await AdminService.listBuyers(req.query.search || null, req.pagination.page, req.pagination.pageSize);
  sendSuccess(res, data);
}

async function getBuyerDetail(req, res) {
  const data = await AdminService.getBuyerDetail(req.params.buyerId);
  sendSuccess(res, data);
}

async function createUnit(req, res) {
  const data = await AdminService.createUnit(req.body);
  sendSuccess(res, data);
}

async function updateUnit(req, res) {
  const data = await AdminService.updateUnit(req.params.unitId, req.body);
  sendSuccess(res, data);
}

async function createPayment(req, res) {
  await AdminService.assertBuyerExists(req.body.buyerId);
  const data = await PaymentService.createPayment(req.auth.userId, req.body, true);
  sendSuccess(res, data);
}

async function listPayments(req, res) {
  const data = await AdminService.listAdminPayments(req.query.buyerId, req.pagination.page, req.pagination.pageSize);
  sendSuccess(res, data);
}

async function createDocument(req, res) {
  await AdminService.assertBuyerExists(req.body.buyerId);
  const data = await DocumentService.createAdminDocument(req.auth.userId, req.body, req.file);
  sendSuccess(res, data);
}

async function createProgress(req, res) {
  await AdminService.assertProjectExists(req.body.projectId);
  const data = await ProgressService.createProgress(req.auth.userId, req.body, req.file);
  sendSuccess(res, data);
}

async function listTickets(req, res) {
  const data = await TicketService.listAdminTickets(req.query.status || null, req.pagination.page, req.pagination.pageSize);
  sendSuccess(res, data);
}

async function updateTicket(req, res) {
  const data = await TicketService.updateAdminTicket(req.params.ticketId, req.body);
  sendSuccess(res, data);
}

async function listProjects(req, res) {
  const data = await AdminService.listProjects();
  sendSuccess(res, data);
}

async function runDevSeed(req, res) {
  const seedKey = req.headers["x-seed-key"];
  const expectedSeedKey = process.env.SEED_KEY || process.env.SEED_SECRET || process.env.SEED_API_KEY;
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && (!expectedSeedKey || seedKey !== expectedSeedKey)) {
    throw new ApiError(403, "FORBIDDEN", "Valid x-seed-key header is required", {});
  }

  await runSeed();
  res.json({
    success: true,
    message: "Seed completed"
  });
}

module.exports = {
  createDocument,
  createPayment,
  createProgress,
  createUnit,
  getBuyerDetail,
  importBuyers,
  listBuyers,
  listPayments,
  listProjects,
  listTickets,
  runDevSeed,
  updateTicket,
  updateUnit
};
