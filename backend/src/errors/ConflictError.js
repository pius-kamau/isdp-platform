const AppError = require('./AppError');

/**
 * Conflict Error
 * Thrown when there is a conflict (e.g., duplicate data)
 */
class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

module.exports = ConflictError;