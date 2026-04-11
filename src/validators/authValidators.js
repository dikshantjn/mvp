const { isE164Phone, isEmail, isRequired } = require("./commonValidators");

function requestOtp(payload) {
  const errors = {};
  if (!isE164Phone(payload.mobileNumber)) {
    errors.mobileNumber = "mobileNumber must be a valid E.164 number";
  }
  return errors;
}

function verifyOtp(payload) {
  const errors = {};
  if (!isRequired(payload.requestId)) {
    errors.requestId = "requestId is required";
  }
  if (!isE164Phone(payload.mobileNumber)) {
    errors.mobileNumber = "mobileNumber must be a valid E.164 number";
  }
  if (!/^\d{6}$/.test(payload.otpCode || "")) {
    errors.otpCode = "otpCode must be a 6 digit code";
  }
  return errors;
}

function refreshToken(payload) {
  const errors = {};
  if (!isRequired(payload.refreshToken)) {
    errors.refreshToken = "refreshToken is required";
  }
  return errors;
}

function adminLogin(payload) {
  const errors = {};
  if (!isEmail(payload.email)) {
    errors.email = "email must be valid";
  }
  if (!isRequired(payload.password)) {
    errors.password = "password is required";
  }
  return errors;
}

module.exports = {
  adminLogin,
  refreshToken,
  requestOtp,
  verifyOtp
};
