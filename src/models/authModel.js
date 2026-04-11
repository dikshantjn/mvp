const { query } = require("../db/pool");

async function findActiveBuyerByMobile(mobileNumber) {
  const result = await query(
    `SELECT id, full_name, email, mobile_number, status
     FROM buyer_users
     WHERE mobile_number = $1 AND status = 'active'`,
    [mobileNumber]
  );
  return result.rows[0] || null;
}

async function findAdminByEmail(email) {
  const result = await query(
    `SELECT id, full_name, email, password_hash, is_active
     FROM admin_users
     WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

async function getLatestOtpRequestForBuyer(buyerUserId) {
  const result = await query(
    `SELECT *
     FROM otp_requests
     WHERE buyer_user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [buyerUserId]
  );
  return result.rows[0] || null;
}

async function createOtpRequest(data) {
  const result = await query(
    `INSERT INTO otp_requests (
      id,
      buyer_user_id,
      mobile_number,
      otp_code_hash,
      expires_at,
      verified_at,
      attempt_count
     ) VALUES ($1, $2, $3, $4, $5, NULL, 0)
     RETURNING *`,
    [data.id, data.buyerUserId, data.mobileNumber, data.otpCodeHash, data.expiresAt]
  );
  return result.rows[0];
}

async function findOtpRequestById(id) {
  const result = await query(`SELECT * FROM otp_requests WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function updateOtpAttempt(id, attemptCount) {
  await query(
    `UPDATE otp_requests
     SET attempt_count = $2, updated_at = NOW()
     WHERE id = $1`,
    [id, attemptCount]
  );
}

async function invalidateOtpRequest(id) {
  await query(
    `UPDATE otp_requests
     SET expires_at = NOW(), updated_at = NOW()
     WHERE id = $1`,
    [id]
  );
}

async function verifyOtpRequest(id) {
  await query(
    `UPDATE otp_requests
     SET verified_at = NOW(), updated_at = NOW()
     WHERE id = $1`,
    [id]
  );
}

async function updateBuyerLastLogin(id) {
  await query(
    `UPDATE buyer_users
     SET last_login_at = NOW(), updated_at = NOW()
     WHERE id = $1`,
    [id]
  );
}

async function insertRefreshToken(data) {
  await query(
    `INSERT INTO refresh_tokens (
      id,
      user_type,
      buyer_user_id,
      admin_user_id,
      token_hash,
      expires_at
     ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [data.id, data.userType, data.buyerUserId, data.adminUserId, data.tokenHash, data.expiresAt]
  );
}

async function findRefreshToken(tokenHash) {
  const result = await query(
    `SELECT *
     FROM refresh_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  );
  return result.rows[0] || null;
}

async function revokeRefreshToken(id) {
  await query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW(), updated_at = NOW()
     WHERE id = $1`,
    [id]
  );
}

async function getBuyerById(id) {
  const result = await query(
    `SELECT id, full_name, email, mobile_number, status
     FROM buyer_users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function getAdminById(id) {
  const result = await query(
    `SELECT id, full_name, email, is_active
     FROM admin_users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  createOtpRequest,
  findActiveBuyerByMobile,
  findAdminByEmail,
  findOtpRequestById,
  findRefreshToken,
  getAdminById,
  getBuyerById,
  getLatestOtpRequestForBuyer,
  insertRefreshToken,
  invalidateOtpRequest,
  revokeRefreshToken,
  updateBuyerLastLogin,
  updateOtpAttempt,
  verifyOtpRequest
};
