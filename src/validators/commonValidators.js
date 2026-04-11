function isRequired(value) {
  return value !== undefined && value !== null && value !== "";
}

function isPositiveNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isE164Phone(value) {
  return typeof value === "string" && /^\+[1-9]\d{7,14}$/.test(value);
}

function isEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function hasEnumValue(value, list) {
  return list.includes(value);
}

module.exports = {
  hasEnumValue,
  isE164Phone,
  isEmail,
  isPositiveNumber,
  isRequired
};
