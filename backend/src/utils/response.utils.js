class ResponseUtils {
  success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  }

  error(res, message = 'An error occurred', statusCode = 500, errors = null) {
    const response = {
      status: 'error',
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    if (process.env.NODE_ENV === 'development') {
      response.stack = new Error().stack;
    }

    return res.status(statusCode).json(response);
  }

  created(res, data, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  badRequest(res, message = 'Bad request', errors = null) {
    return this.error(res, message, 400, errors);
  }

  unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  conflict(res, message = 'Conflict', errors = null) {
    return this.error(res, message, 409, errors);
  }

  validationError(res, errors) {
    return this.error(res, 'Validation failed', 422, errors);
  }
}

module.exports = new ResponseUtils();