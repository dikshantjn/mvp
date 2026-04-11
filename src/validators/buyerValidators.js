const { ticketCategories } = require("../utils/enums");
const { hasEnumValue, isRequired } = require("./commonValidators");

function createTicket(payload) {
  const errors = {};
  if (!isRequired(payload.subject)) {
    errors.subject = "subject is required";
  }
  if (!hasEnumValue(payload.category, ticketCategories)) {
    errors.category = "category is invalid";
  }
  if (!isRequired(payload.description)) {
    errors.description = "description is required";
  }
  return errors;
}

module.exports = {
  createTicket
};
