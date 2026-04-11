const jwt = require("jsonwebtoken");

const env = require("../config/env");
const ApiError = require("../utils/apiError");

function authenticate(req, _res, next) {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new ApiError(401, "UNAUTHORIZED", "Authorization header is missing", {}));
  }

  const token = authorization.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.auth = {
      userId: decoded.sub,
      role: decoded.role
    };
    return next();
  } catch (_error) {
    return next(new ApiError(401, "UNAUTHORIZED", "Access token is invalid", {}));
  }
}

module.exports = {
  authenticate
};
