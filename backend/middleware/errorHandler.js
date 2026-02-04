const ApiError = require('../utils/ApiError');

// Middleware de gestion des erreurs
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur:', err);

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

// Middleware pour les routes non trouvées
const notFound = (req, res, next) => {
  next(ApiError.notFound(`La route ${req.originalUrl} n'existe pas`));
};

module.exports = { errorHandler, notFound };
