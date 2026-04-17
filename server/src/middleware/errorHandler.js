import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  
  // Structured logging for production observability
  logger.error({
    err: {
      message: err.message,
      name: err.name,
      code: err.code,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    request: {
      method: req.method,
      url: req.url,
      userId: req.user?._id,
    },
  }, '💥 Error handled in global middleware');

  // Handle specific database/validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ status: 'error', message: 'Validation failed', details: messages });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ status: 'error', message: `${field} already exists` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ status: 'error', message: 'Invalid ID format' });
  }

  // Production safe messages
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'An internal system error occurred.'
    : err.message;

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;

