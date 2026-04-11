const ApiError = require("../utils/apiError");

function notFoundHandler(_req, _res, next) {
  next(new ApiError(404, "NOT_FOUND", "Resource not found", {}));
}

function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const code = error.code || "INTERNAL_SERVER_ERROR";
  const message = error.message || "Something went wrong";
  const details = error.details || {};

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details
    }
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
