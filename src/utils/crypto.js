const crypto = require("crypto");

function hashValue(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

function addDurationToNow(duration) {
  const match = /^(\d+)([dhm])$/.exec(duration);
  if (!match) {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return new Date(Date.now() + amount * multipliers[unit]);
}

module.exports = {
  addDurationToNow,
  generateOtpCode,
  generateRefreshToken,
  hashValue
};
