// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err)

  // Sequelize validation errors
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      error: "Validation error",
      details: err.errors.map((e) => e.message),
    })
  }

  // Sequelize unique constraint errors
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      error: "Resource already exists",
      details: err.errors.map((e) => e.message),
    })
  }

  // Sequelize foreign key constraint errors
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      error: "Invalid reference",
      details: "Referenced resource does not exist",
    })
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  })
}
