const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Non autorisé',
        message: 'Token manquant'
      });
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
    return res.status(401).json({
      error: 'Non autorisé',
      message: 'Token invalide'
    });
  }
};

// Middleware pour vérifier le rôle admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Accès interdit',
      message: 'Vous n\'avez pas les droits nécessaires' 
    });
  }
  next();
};

// Middleware optionnel pour les routes qui peuvent être accessibles sans auth
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
