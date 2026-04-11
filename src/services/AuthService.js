const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const env = require("../config/env");
const authModel = require("../models/authModel");
const ApiError = require("../utils/apiError");
const { addDurationToNow, generateOtpCode, generateRefreshToken, hashValue } = require("../utils/crypto");

class AuthService {
  static async requestOtp(mobileNumber) {
    const buyer = await authModel.findActiveBuyerByMobile(mobileNumber);
    if (!buyer) {
      throw new ApiError(404, "NOT_FOUND", "Buyer not found", {});
    }

    const lastRequest = await authModel.getLatestOtpRequestForBuyer(buyer.id);
    if (lastRequest) {
      const ageInSeconds = Math.floor((Date.now() - new Date(lastRequest.created_at).getTime()) / 1000);
      if (ageInSeconds < 30) {
        throw new ApiError(429, "OTP_RESEND_TOO_SOON", "OTP can be resent after 30 seconds", {});
      }
    }

    const otpCode = generateOtpCode();
    const requestId = uuidv4();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await authModel.createOtpRequest({
      id: requestId,
      buyerUserId: buyer.id,
      mobileNumber,
      otpCodeHash: hashValue(otpCode),
      expiresAt
    });

    console.log(`OTP for ${mobileNumber}: ${otpCode}`);

    return {
      requestId,
      expiresInSeconds: 300
    };
  }

  static async verifyOtp({ requestId, mobileNumber, otpCode }) {
    const otpRequest = await authModel.findOtpRequestById(requestId);
    if (!otpRequest || otpRequest.mobile_number !== mobileNumber) {
      throw new ApiError(400, "INVALID_OTP_REQUEST", "Invalid OTP request", {});
    }

    if (otpRequest.verified_at) {
      throw new ApiError(400, "OTP_ALREADY_USED", "OTP has already been used", {});
    }

    if (new Date(otpRequest.expires_at).getTime() < Date.now()) {
      throw new ApiError(400, "OTP_EXPIRED", "OTP has expired", {});
    }

    if (otpRequest.attempt_count >= 5) {
      throw new ApiError(400, "OTP_INVALIDATED", "OTP has been invalidated", {});
    }

    const matches = hashValue(otpCode) === otpRequest.otp_code_hash;
    if (!matches) {
      const nextAttemptCount = otpRequest.attempt_count + 1;
      await authModel.updateOtpAttempt(otpRequest.id, nextAttemptCount);
      if (nextAttemptCount >= 5) {
        await authModel.invalidateOtpRequest(otpRequest.id);
      }
      throw new ApiError(400, "INVALID_OTP", "Invalid OTP code", {});
    }

    const buyer = await authModel.getBuyerById(otpRequest.buyer_user_id);
    if (!buyer || buyer.status !== "active") {
      throw new ApiError(404, "NOT_FOUND", "Buyer not found", {});
    }

    await authModel.verifyOtpRequest(otpRequest.id);
    await authModel.updateBuyerLastLogin(buyer.id);

    return this.issueTokens({
      userType: "buyer",
      buyerUserId: buyer.id
    }, {
      id: buyer.id,
      fullName: buyer.full_name,
      mobileNumber: buyer.mobile_number,
      role: "buyer"
    });
  }

  static async loginAdmin({ email, password }) {
    const admin = await authModel.findAdminByEmail(email);
    if (!admin || !admin.is_active) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password", {});
    }

    const matches = await bcrypt.compare(password, admin.password_hash);
    if (!matches) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password", {});
    }

    return this.issueTokens(
      {
        userType: "admin",
        adminUserId: admin.id
      },
      {
        id: admin.id,
        fullName: admin.full_name,
        email: admin.email,
        role: "admin"
      },
      {
        userType: "admin",
        subjectKey: "admin"
      }
    );
  }

  static async refresh(refreshToken, expectedUserType = null) {
    const tokenHash = hashValue(refreshToken);
    const storedToken = await authModel.findRefreshToken(tokenHash);

    if (!storedToken || storedToken.revoked_at || new Date(storedToken.expires_at).getTime() < Date.now()) {
      throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid", {});
    }

    if (expectedUserType && storedToken.user_type !== expectedUserType) {
      throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid", {});
    }

    await authModel.revokeRefreshToken(storedToken.id);

    if (storedToken.user_type === "buyer") {
      const buyer = await authModel.getBuyerById(storedToken.buyer_user_id);
      if (!buyer) {
        throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid", {});
      }
      return this.issueTokens(
        { userType: "buyer", buyerUserId: buyer.id },
        null
      );
    }

    const admin = await authModel.getAdminById(storedToken.admin_user_id);
    if (!admin || !admin.is_active) {
      throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid", {});
    }

    return this.issueTokens(
      { userType: "admin", adminUserId: admin.id },
      null
    );
  }

  static async issueTokens(identity, userPayload = null, options = {}) {
    const userType = options.userType || identity.userType;
    const subject = identity.buyerUserId || identity.adminUserId;
    const accessToken = jwt.sign(
      {
        sub: subject,
        role: userType
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = generateRefreshToken();
    await authModel.insertRefreshToken({
      id: uuidv4(),
      userType,
      buyerUserId: identity.buyerUserId || null,
      adminUserId: identity.adminUserId || null,
      tokenHash: hashValue(refreshToken),
      expiresAt: addDurationToNow(env.REFRESH_TOKEN_TTL)
    });

    return {
      accessToken,
      refreshToken,
      expiresInSeconds: 3600,
      ...(userPayload ? { [options.subjectKey || "user"]: userPayload } : {})
    };
  }
}

module.exports = AuthService;
