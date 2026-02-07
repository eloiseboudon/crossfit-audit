/**
 * @module validators/validateRequest
 * @description Middleware de validation des requêtes via express-validator.
 */

const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware vérifiant les erreurs de validation express-validator.
 * Si des erreurs existent, renvoie une ApiError 400 avec les détails.
 *
 * @param {import('express').Request} req - Requête Express.
 * @param {import('express').Response} res - Réponse Express.
 * @param {import('express').NextFunction} next - Fonction suivante.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(ApiError.badRequest('Erreur de validation', errors.array()));
  }
  return next();
};

module.exports = { validateRequest };
