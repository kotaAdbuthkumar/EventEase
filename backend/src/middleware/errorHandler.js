export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Resource not found at ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error occurred';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
