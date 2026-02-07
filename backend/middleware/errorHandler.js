/**
 * @module middleware/errorHandler
 * @description Middlewares de gestion globale des erreurs et routes non trouvées.
 */

const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Middleware global de gestion des erreurs Express.
 * Gère les erreurs ApiError, ValidationError, SQLite et JWT avec des réponses JSON adaptées.
 * En production, les messages d'erreur internes sont masqués.
 *
 * @param {Error} err - Erreur interceptée.
 * @param {import('express').Request} req - Requête Express.
 * @param {import('express').Response} res - Réponse Express.
 * @param {import('express').NextFunction} next - Fonction suivante.
 */
const errorHandler = (err, req, res, next) => {
  logger.error('❌ Erreur:', err);

  if (err.name === 'ApiError') {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      ...(err.details ? { details: err.details } : {})
    });
  }

  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: err.message,
      details: err.errors
    });
  }

  // Erreur SQL
  if (err.code && err.code.startsWith('SQLITE_')) {
    return res.status(500).json({
      error: 'Erreur de base de données',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide',
      message: 'Authentification échouée'
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Une erreur est survenue';

  res.status(statusCode).json({
    error: err.name || 'ServerError',
    message: process.env.NODE_ENV === 'development' ? message : 'Une erreur est survenue',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware interceptant les routes non trouvées.
 * Crée une erreur 404 et la transmet au error handler.
 *
 * @param {import('express').Request} req - Requête Express.
 * @param {import('express').Response} res - Réponse Express.
 * @param {import('express').NextFunction} next - Fonction suivante.
 */
const notFound = (req, res, next) => {
  next(ApiError.notFound(`La route ${req.originalUrl} n'existe pas`));
};

module.exports = { errorHandler, notFound };
