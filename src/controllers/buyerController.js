const BuyerService = require("../services/BuyerService");
const DocumentService = require("../services/DocumentService");
const PaymentService = require("../services/PaymentService");
const ProgressService = require("../services/ProgressService");
const TicketService = require("../services/TicketService");
const { sendSuccess } = require("../utils/responses");

async function getMe(req, res) {
  const data = await BuyerService.getProfile(req.auth.userId);
  sendSuccess(res, data);
}

async function getMyUnit(req, res) {
  const data = await BuyerService.getUnit(req.auth.userId);
  sendSuccess(res, data);
}

async function getPaymentSummary(req, res) {
  const data = await PaymentService.getSummary(req.auth.userId);
  sendSuccess(res, data);
}

async function getPayments(req, res) {
  const data = await PaymentService.listBuyerPayments(req.auth.userId, req.pagination.page, req.pagination.pageSize);
  sendSuccess(res, data);
}

async function getPaymentSchedule(req, res) {
  const data = await PaymentService.listBuyerPaymentSchedule(req.auth.userId, req.pagination.page, req.pagination.pageSize);
  sendSuccess(res, data);
}

async function getDocuments(req, res) {
  const data = await DocumentService.listBuyerDocuments(req.auth.userId, req.pagination.page, req.pagination.pageSize);
  sendSuccess(res, data);
}

async function downloadDocument(req, res) {
  const file = await DocumentService.getBuyerDocumentForDownload(req.params.documentId, req.auth.userId);
  res.type(file.mimeType);
  res.download(file.absolutePath, file.fileName);
}

async function getProgress(req, res) {
  const data = await ProgressService.listBuyerProgress(req.auth.userId, req.pagination.page, req.pagination.pageSize);
  sendSuccess(res, data);
}

async function getProgressImage(req, res) {
  const file = await ProgressService.getProgressImage(req.params.progressId, req.auth.userId);
  res.type(file.mimeType);
  res.sendFile(file.absolutePath);
}

async function getTickets(req, res) {
  const data = await TicketService.listBuyerTickets(req.auth.userId, req.pagination.page, req.pagination.pageSize);
  sendSuccess(res, data);
}

async function createTicket(req, res) {
  const data = await TicketService.createBuyerTicket(req.auth.userId, req.body);
  sendSuccess(res, data);
}

async function getTicketById(req, res) {
  const data = await TicketService.getBuyerTicket(req.params.ticketId, req.auth.userId);
  sendSuccess(res, data);
}

module.exports = {
  createTicket,
  downloadDocument,
  getDocuments,
  getMe,
  getMyUnit,
  getPaymentSchedule,
  getPaymentSummary,
  getPayments,
  getProgress,
  getProgressImage,
  getTicketById,
  getTickets
};
