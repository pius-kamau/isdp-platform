const AppError = require('./AppError');

/**
 * Validation Error
 * Thrown when input validation fails
 */
class ValidationError extends AppError {
  constructor(message, errors = null) {
    super(message, 422);
    this.errors = errors;
    this.name = 'ValidationError';
  }
}

module.exports = ValidationError;