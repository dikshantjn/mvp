const { documentTypes, paymentStatuses, ticketCategories, ticketPriorities, ticketStatuses, unitStatuses } = require("../utils/enums");
const { hasEnumValue, isPositiveNumber, isRequired } = require("./commonValidators");

function createUnit(payload) {
  const errors = {};
  if (!isRequired(payload.projectId)) {
    errors.projectId = "projectId is required";
  }
  if (!isRequired(payload.unitNumber)) {
    errors.unitNumber = "unitNumber is required";
  }
  if (!isRequired(payload.type)) {
    errors.type = "type is required";
  }
  if (!hasEnumValue(payload.status, unitStatuses)) {
    errors.status = "status is invalid";
  }
  if (payload.areaSqFt !== undefined && !isPositiveNumber(Number(payload.areaSqFt))) {
    errors.areaSqFt = "areaSqFt must be a positive number";
  }
  return errors;
}

function updateUnit(payload) {
  const errors = {};
  if (!hasEnumValue(payload.status, unitStatuses)) {
    errors.status = "status is invalid";
  }
  return errors;
}

function createPayment(payload) {
  const errors = {};
  if (!isRequired(payload.buyerId)) {
    errors.buyerId = "buyerId is required";
  }
  if (!isRequired(payload.title)) {
    errors.title = "title is required";
  }
  if (!isPositiveNumber(Number(payload.amount))) {
    errors.amount = "amount must be a positive number";
  }
  if (!hasEnumValue(payload.status, paymentStatuses)) {
    errors.status = "status is invalid";
  }
  return errors;
}

function listPayments(payload) {
  const errors = {};
  if (!isRequired(payload.buyerId)) {
    errors.buyerId = "buyerId is required";
  }
  return errors;
}

function createDocument(payload) {
  const errors = {};
  if (!isRequired(payload.buyerId)) {
    errors.buyerId = "buyerId is required";
  }
  if (!isRequired(payload.title)) {
    errors.title = "title is required";
  }
  if (!hasEnumValue(payload.type, documentTypes)) {
    errors.type = "type is invalid";
  }
  return errors;
}

function createProgress(payload) {
  const errors = {};
  if (!isRequired(payload.projectId)) {
    errors.projectId = "projectId is required";
  }
  if (!isRequired(payload.title)) {
    errors.title = "title is required";
  }
  if (!isRequired(payload.description)) {
    errors.description = "description is required";
  }
  if (!isRequired(payload.publishedAt)) {
    errors.publishedAt = "publishedAt is required";
  }
  return errors;
}

function listTickets(payload) {
  const errors = {};
  if (payload.status !== undefined && !hasEnumValue(payload.status, ticketStatuses)) {
    errors.status = "status is invalid";
  }
  return errors;
}

function updateTicket(payload) {
  const errors = {};
  if (!hasEnumValue(payload.status, ticketStatuses)) {
    errors.status = "status is invalid";
  }
  if (!hasEnumValue(payload.priority, ticketPriorities)) {
    errors.priority = "priority is invalid";
  }
  if (!isRequired(payload.resolutionNote)) {
    errors.resolutionNote = "resolutionNote is required";
  }
  return errors;
}

module.exports = {
  createDocument,
  createPayment,
  createProgress,
  createUnit,
  listPayments,
  listTickets,
  updateTicket,
  updateUnit
};
