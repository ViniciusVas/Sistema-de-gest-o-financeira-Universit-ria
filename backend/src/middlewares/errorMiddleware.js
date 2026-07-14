const AppError = require("../utils/AppError");

function notFoundMiddleware(req, _res, next) {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found.`, 404));
}

function errorMiddleware(error, _req, res, _next) {
  if (error.code === "P2002") {
    return res.status(409).json({
      message: "A record with these unique fields already exists."
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      message: "Record not found."
    });
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : "Internal server error.";

  if (statusCode === 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    message
  });
}

module.exports = {
  errorMiddleware,
  notFoundMiddleware
};
