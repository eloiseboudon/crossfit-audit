/**
 * @module middleware/auth
 * @description Middlewares d'authentification et d'autorisation JWT.
 */

const jwt = require('jsonwebtoken');
const { ROLES } = require('../constants');

/**
 * Middleware d'authentification obligatoire.
 * Vérifie le token JWT dans le header Authorization et attache l'utilisateur à req.user.
 *
 * @param {import('express').Request} req - Requête Express.
 * @param {import('express').Response} res - Réponse Express.
 * @param {import('express').NextFunction} next - Fonction suivante.
 */
const auth = (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajouter les infos user à la requête
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

/**
 * Middleware vérifiant que l'utilisateur connecté possède le rôle admin.
 * Doit être utilisé après le middleware auth.
 *
 * @param {import('express').Request} req - Requête Express.
 * @param {import('express').Response} res - Réponse Express.
 * @param {import('express').NextFunction} next - Fonction suivante.
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Vous n\'avez pas les droits nécessaires' });
  }
  next();
};

/**
 * Middleware d'authentification optionnelle.
 * Tente de décoder le token JWT s'il est présent, mais ne bloque pas si absent ou invalide.
 * Permet aux routes publiques de bénéficier du contexte utilisateur quand disponible.
 *
 * @param {import('express').Request} req - Requête Express.
 * @param {import('express').Response} res - Réponse Express.
 * @param {import('express').NextFunction} next - Fonction suivante.
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
    }
  } catch (error) {
    // Ignorer les erreurs pour l'auth optionnelle
  }
  
  next();
};

module.exports = { auth, isAdmin, optionalAuth };
