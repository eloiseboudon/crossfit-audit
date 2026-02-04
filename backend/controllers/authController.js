const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

/**
 * Génère un token JWT pour un utilisateur.
 *
 * @param {object} user - Utilisateur authentifié.
 * @param {string} user.id - Identifiant utilisateur.
 * @param {string} user.email - Email utilisateur.
 * @param {string} user.role - Rôle utilisateur.
 * @returns {string} Token JWT signé.
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * @desc Inscrit un nouvel utilisateur.
 * @route POST /api/auth/register
 * @access Public
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      throw ApiError.badRequest('Email, mot de passe et nom sont requis');
    }

    if (password.length < 6) {
      throw ApiError.badRequest('Le mot de passe doit contenir au moins 6 caractères');
    }

    // Créer l'utilisateur
    const user = await User.create({ email, password, name });
    
    // Générer le token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    if (error.message === 'Cet email est déjà utilisé') {
      return next(new ApiError(409, error.message));
    }
    next(error);
  }
};

/**
 * @desc Authentifie un utilisateur existant.
 * @route POST /api/auth/login
 * @access Public
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw ApiError.badRequest('Email et mot de passe sont requis');
    }

    // Trouver l'utilisateur
    const user = await User.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Email ou mot de passe incorrect');
    }

    // Vérifier si le compte est actif
    if (!user.is_active) {
      throw ApiError.forbidden('Votre compte a été désactivé');
    }

    // Générer le token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Récupère le profil de l'utilisateur connecté.
 * @route GET /api/auth/me
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      throw ApiError.notFound('Votre compte n\'existe plus');
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Met à jour le mot de passe de l'utilisateur.
 * @route PUT /api/auth/password
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw ApiError.badRequest('Mot de passe actuel et nouveau mot de passe requis');
    }

    if (newPassword.length < 6) {
      throw ApiError.badRequest('Le nouveau mot de passe doit contenir au moins 6 caractères');
    }

    // Vérifier le mot de passe actuel
    const user = await User.findByEmail(req.user.email);
    const isValid = await User.verifyPassword(currentPassword, user.password);
    
    if (!isValid) {
      throw ApiError.unauthorized('Le mot de passe actuel est incorrect');
    }

    // Mettre à jour le mot de passe
    await User.updatePassword(req.user.id, newPassword);

    res.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updatePassword
};
