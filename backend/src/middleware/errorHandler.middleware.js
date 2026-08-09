const logger = require('../config/logger');
const {
  AppError,
  ValidationError,
  AuthError,
  NotFoundError,
  ConflictError,
} = require('../errors');

/**
 * Global Error Handler Middleware
 * Catches all errors and sends appropriate response
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = null;

  // Handle specific error types
  if (err instanceof ValidationError) {
    statusCode = 422;
    message = err.message || 'Validation failed';
    errors = err.errors;
  }

  if (err instanceof AuthError) {
    statusCode = err.statusCode || 401;
    message = err.message || 'Authentication failed';
  }

  if (err instanceof NotFoundError) {
    statusCode = 404;
    message = err.message || 'Resource not found';
  }

  if (err instanceof ConflictError) {
    statusCode = 409;
    message = err.message || 'Conflict';
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = `Duplicate field value: ${err.meta?.target?.join(', ')}`;
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Send response
  const response = {
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Not Found Middleware
 * Handles routes that don't exist
 */
const notFoundHandler = (req, res, next) => {
  const err = new NotFoundError(`Route ${req.method} ${req.path} not found`);
  next(err);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};