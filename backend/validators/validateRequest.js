const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(ApiError.badRequest('Erreur de validation', errors.array()));
  }
  return next();
};

module.exports = { validateRequest };
