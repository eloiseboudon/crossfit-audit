const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../constants');

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
 * Formate un objet utilisateur pour la réponse API (sans mot de passe).
 *
 * @param {object} user - Utilisateur brut.
 * @returns {object} Utilisateur formaté.
 */
const formatUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});

/**
 * @desc Inscrit un nouvel utilisateur.
 * @route POST /api/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw ApiError.badRequest('Email, mot de passe et nom sont requis');
  }

  if (password.length < 6) {
    throw ApiError.badRequest('Le mot de passe doit contenir au moins 6 caractères');
  }

  let user;
  try {
    user = await User.create({ email, password, name, role: ROLES.USER });
  } catch (err) {
    if (err.message === 'Cet email est déjà utilisé') {
      throw ApiError.conflict('Email déjà utilisé');
    }
    throw err;
  }

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'Compte créé avec succès',
    user: formatUser(user),
    token
  });
});

/**
 * @desc Authentifie un utilisateur existant.
 * @route POST /api/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Email et mot de passe sont requis');
  }

  const user = await User.findByEmail(email);
  if (!user) {
    throw ApiError.unauthorized('Email ou mot de passe incorrect');
  }

  const isPasswordValid = await User.verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Email ou mot de passe incorrect');
  }

  if (!user.is_active) {
    throw ApiError.forbidden('Votre compte a été désactivé');
  }

  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Connexion réussie',
    user: formatUser(user),
    token
  });
});

/**
 * @desc Récupère le profil de l'utilisateur connecté.
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw ApiError.notFound('Votre compte n\'existe plus');
  }

  res.json({
    success: true,
    user: {
      ...formatUser(user),
      created_at: user.created_at
    }
  });
});

/**
 * @desc Met à jour le mot de passe de l'utilisateur.
 * @route PUT /api/auth/password
 * @access Private
 */
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest('Mot de passe actuel et nouveau mot de passe requis');
  }

  if (newPassword.length < 6) {
    throw ApiError.badRequest('Le nouveau mot de passe doit contenir au moins 6 caractères');
  }

  const user = await User.findByEmail(req.user.email);
  const isValid = await User.verifyPassword(currentPassword, user.password);

  if (!isValid) {
    throw ApiError.unauthorized('Le mot de passe actuel est incorrect');
  }

  await User.updatePassword(req.user.id, newPassword);

  res.json({
    success: true,
    message: 'Mot de passe mis à jour avec succès'
  });
});

module.exports = {
  register,
  login,
  getMe,
  updatePassword
};
