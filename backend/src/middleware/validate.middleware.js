const responseUtils = require('../utils/response.utils');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body, query, and params
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!result.success) {
        // Format validation errors
        const errors = result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return responseUtils.validationError(res, errors);
      }

      // Replace request data with validated data
      req.body = result.data.body || req.body;
      req.query = result.data.query || req.query;
      req.params = result.data.params || req.params;

      next();
    } catch (error) {
      return responseUtils.error(res, 'Validation error', 422);
    }
  };
};

module.exports = validate;