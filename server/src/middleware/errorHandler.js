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
    return res.status(400).json({ 
      status: 'error', 
      error: 'Validation failed', // Compatibility
      message: 'Validation failed', 
      details: messages 
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const msg = `${field} already exists`;
    return res.status(409).json({ 
      status: 'error', 
      error: msg, // Compatibility
      message: msg 
    });
  }

  if (err.name === 'CastError') {
    const msg = 'Invalid ID format';
    return res.status(400).json({ 
      status: 'error', 
      error: msg, // Compatibility
      message: msg 
    });
  }

  // Production safe messages
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'An internal system error occurred.'
    : err.message;

  res.status(statusCode).json({
    status: 'error',
    error: message, // Compatibility field for existing UI
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });

};

export default errorHandler;

