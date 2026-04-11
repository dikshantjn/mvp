const express = require("express");

const authController = require("../controllers/authController");
const asyncHandler = require("../middlewares/asyncHandler");
const validateRequest = require("../middlewares/validateRequest");
const authValidators = require("../validators/authValidators");

const router = express.Router();

router.post("/auth/request-otp", validateRequest(authValidators.requestOtp), asyncHandler(authController.requestOtp));
router.post("/auth/verify-otp", validateRequest(authValidators.verifyOtp), asyncHandler(authController.verifyOtp));
router.post("/auth/refresh", validateRequest(authValidators.refreshToken), asyncHandler(authController.refreshBuyerToken));
router.post("/admin/auth/login", validateRequest(authValidators.adminLogin), asyncHandler(authController.adminLogin));
router.post("/admin/auth/refresh", validateRequest(authValidators.refreshToken), asyncHandler(authController.refreshAdminToken));

module.exports = router;
