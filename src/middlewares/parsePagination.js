const ApiError = require("../utils/apiError");

module.exports = function parsePagination(req, _res, next) {
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1) {
    return next(new ApiError(400, "VALIDATION_ERROR", "Pagination params are invalid", {
      page: "page must be a positive integer",
      pageSize: "pageSize must be a positive integer"
    }));
  }

  req.pagination = { page, pageSize };
  return next();
};
