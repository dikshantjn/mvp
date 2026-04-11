const ApiError = require("../utils/apiError");

module.exports = function validateRequest(validator, source = "body") {
  return function validationMiddleware(req, _res, next) {
    const payload = req[source] || {};
    const errors = validator(payload, req);
    if (errors && Object.keys(errors).length > 0) {
      return next(new ApiError(400, "VALIDATION_ERROR", "Validation failed", errors));
    }
    return next();
  };
};
