export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error
  let error = {
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  // Apify API errors
  if (err.response?.data) {
    error.message =
      err.response.data.error?.message ||
      err.response.data.message ||
      "Apify API Error";
    error.details = err.response.data;
  }

  // Validation errors
  if (err.name === "ValidationError") {
    error.message = "Validation Error";
    error.details = Object.values(err.errors).map((val) => val.message);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid token";
  }

  // Mongoose cast errors
  if (err.name === "CastError") {
    error.message = "Invalid ID format";
  }

  // Duplicate key errors
  if (err.code === 11000) {
    error.message = "Duplicate field value";
  }

  const statusCode = err.statusCode || err.response?.status || 500;

  res.status(statusCode).json(error);
};
