const express = require("express");

const adminController = require("../controllers/adminController");
const asyncHandler = require("../middlewares/asyncHandler");
const { authenticate } = require("../middlewares/authMiddleware");
const parsePagination = require("../middlewares/parsePagination");
const roleGuard = require("../middlewares/roleGuard");
const { csvUpload, documentUpload, progressUpload } = require("../middlewares/uploadMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const adminValidators = require("../validators/adminValidators");

const router = express.Router();

router.use(authenticate, roleGuard("admin"));

router.post("/admin/dev/seed", asyncHandler(adminController.runDevSeed));
router.post("/admin/imports/buyers", csvUpload.single("file"), asyncHandler(adminController.importBuyers));
router.get("/admin/buyers", parsePagination, asyncHandler(adminController.listBuyers));
router.get("/admin/buyers/:buyerId", asyncHandler(adminController.getBuyerDetail));
router.post("/admin/units", validateRequest(adminValidators.createUnit), asyncHandler(adminController.createUnit));
router.put("/admin/units/:unitId", validateRequest(adminValidators.updateUnit), asyncHandler(adminController.updateUnit));
router.post("/admin/payments", validateRequest(adminValidators.createPayment), asyncHandler(adminController.createPayment));
router.get("/admin/payments", parsePagination, validateRequest(adminValidators.listPayments, "query"), asyncHandler(adminController.listPayments));
router.post("/admin/documents", documentUpload.single("file"), validateRequest(adminValidators.createDocument, "body"), asyncHandler(adminController.createDocument));
router.post("/admin/progress", progressUpload.single("file"), validateRequest(adminValidators.createProgress, "body"), asyncHandler(adminController.createProgress));
router.get("/admin/tickets", parsePagination, validateRequest(adminValidators.listTickets, "query"), asyncHandler(adminController.listTickets));
router.put("/admin/tickets/:ticketId", validateRequest(adminValidators.updateTicket), asyncHandler(adminController.updateTicket));
router.get("/admin/projects", asyncHandler(adminController.listProjects));

module.exports = router;
