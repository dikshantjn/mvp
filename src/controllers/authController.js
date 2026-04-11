const AuthService = require("../services/AuthService");
const { sendSuccess } = require("../utils/responses");

async function requestOtp(req, res) {
  const data = await AuthService.requestOtp(req.body.mobileNumber);
  sendSuccess(res, data);
}

async function verifyOtp(req, res) {
  const data = await AuthService.verifyOtp(req.body);
  sendSuccess(res, data);
}

async function refreshBuyerToken(req, res) {
  const data = await AuthService.refresh(req.body.refreshToken, "buyer");
  sendSuccess(res, data);
}

async function adminLogin(req, res) {
  const data = await AuthService.loginAdmin(req.body);
  sendSuccess(res, data);
}

async function refreshAdminToken(req, res) {
  const data = await AuthService.refresh(req.body.refreshToken, "admin");
  sendSuccess(res, data);
}

module.exports = {
  adminLogin,
  refreshAdminToken,
  refreshBuyerToken,
  requestOtp,
  verifyOtp
};
