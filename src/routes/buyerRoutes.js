const express = require("express");

const buyerController = require("../controllers/buyerController");
const asyncHandler = require("../middlewares/asyncHandler");
const { authenticate } = require("../middlewares/authMiddleware");
const parsePagination = require("../middlewares/parsePagination");
const roleGuard = require("../middlewares/roleGuard");
const validateRequest = require("../middlewares/validateRequest");
const buyerValidators = require("../validators/buyerValidators");

const router = express.Router();

router.use("/me", authenticate, roleGuard("buyer"));

router.get("/me", asyncHandler(buyerController.getMe));
router.get("/me/unit", asyncHandler(buyerController.getMyUnit));
router.get("/me/payments", parsePagination, asyncHandler(buyerController.getPayments));
router.get("/me/payments/schedule", parsePagination, asyncHandler(buyerController.getPaymentSchedule));
router.get("/me/payments/summary", asyncHandler(buyerController.getPaymentSummary));
router.get("/me/documents", parsePagination, asyncHandler(buyerController.getDocuments));
router.get("/me/documents/:documentId/download", asyncHandler(buyerController.downloadDocument));
router.get("/me/progress", parsePagination, asyncHandler(buyerController.getProgress));
router.get("/me/progress/:progressId/image", asyncHandler(buyerController.getProgressImage));
router.get("/me/tickets", parsePagination, asyncHandler(buyerController.getTickets));
router.post("/me/tickets", validateRequest(buyerValidators.createTicket), asyncHandler(buyerController.createTicket));
router.get("/me/tickets/:ticketId", asyncHandler(buyerController.getTicketById));

module.exports = router;
