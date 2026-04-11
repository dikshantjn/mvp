const ApiError = require("../utils/apiError");

module.exports = function roleGuard(expectedRole) {
  return function guard(req, _res, next) {
    if (!req.auth || req.auth.role !== expectedRole) {
      return next(new ApiError(403, "FORBIDDEN", "You are not allowed to access this resource", {}));
    }
    return next();
  };
};
