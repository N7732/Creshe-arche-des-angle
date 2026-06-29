const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Parse and validate the request body against the Zod schema
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      // If validation fails, return a 400 Bad Request with the errors
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
  };
};

module.exports = { validateRequest };
