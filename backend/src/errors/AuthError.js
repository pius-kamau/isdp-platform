const AppError = require('./AppError');

/**
 * Authentication Error
 * Thrown when authentication fails
 */
class AuthError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthError';
  }
}

class UnauthorizedError extends AuthError {
  constructor(message = 'Unauthorized') {
    super(message);
    this.statusCode = 401;
  }
}

class ForbiddenError extends AuthError {
  constructor(message = 'Forbidden') {
    super(message);
    this.statusCode = 403;
  }
}

class TokenExpiredError extends AuthError {
  constructor(message = 'Token expired') {
    super(message);
    this.statusCode = 401;
  }
}

class InvalidTokenError extends AuthError {
  constructor(message = 'Invalid token') {
    super(message);
    this.statusCode = 401;
  }
}

module.exports = {
  AuthError,
  UnauthorizedError,
  ForbiddenError,
  TokenExpiredError,
  InvalidTokenError,
};