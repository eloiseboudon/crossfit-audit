const Gym = require('../models/Gym');
const GymAccess = require('../models/GymAccess');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { ACCESS_LEVELS, ROLES } = require('../constants');

/**
 * @desc Récupère toutes les salles accessibles.
 * @route GET /api/gyms
 * @access Private
 */
const getGyms = asyncHandler(async (req, res) => {
  const gyms = (!req.user || req.user.role === ROLES.ADMIN)
    ? await Gym.findAll()
    : await Gym.findAllForUser(req.user.id);

  res.json({
    success: true,
    count: gyms.length,
    data: gyms
  });
});

/**
 * @desc Récupère une salle avec statistiques.
 * @route GET /api/gyms/:id
 * @access Private
 */
const getGym = asyncHandler(async (req, res) => {
  const gym = await Gym.getWithStats(req.params.id);
  if (!gym) {
    throw ApiError.notFound('Cette salle n\'existe pas');
  }

  res.json({
    success: true,
    data: gym
  });
});

/**
 * @desc Crée une nouvelle salle.
 * @route POST /api/gyms
 * @access Private
 */
const createGym = asyncHandler(async (req, res) => {
  const gym = await Gym.create(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Salle créée avec succès',
    data: gym
  });
});

/**
 * @desc Met à jour une salle.
 * @route PUT /api/gyms/:id
 * @access Private
 */
const updateGym = asyncHandler(async (req, res) => {
  const updatedGym = await Gym.update(req.params.id, req.body);

  res.json({
    success: true,
    message: 'Salle mise à jour avec succès',
    data: updatedGym
  });
});

/**
 * @desc Supprime une salle.
 * @route DELETE /api/gyms/:id
 * @access Private
 */
const deleteGym = asyncHandler(async (req, res) => {
  await Gym.delete(req.params.id);

  res.json({
    success: true,
    message: 'Salle supprimée avec succès'
  });
});

/**
 * @desc Ajoute ou met à jour l'accès d'un utilisateur à une salle.
 * @route POST /api/gyms/:id/access
 * @access Private
 */
const addGymAccess = asyncHandler(async (req, res) => {
  const access = req.gymAccess;
  if (!access.isOwner && req.user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Seul le propriétaire peut gérer les accès');
  }

  const { user_id, email, access_level } = req.body;
  if (!access_level || ![ACCESS_LEVELS.READ, ACCESS_LEVELS.WRITE].includes(access_level)) {
    throw ApiError.badRequest('Le niveau d\'accès doit être "read" ou "write"');
  }

  let targetUserId = user_id;
  if (!targetUserId && email) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw ApiError.notFound('Aucun utilisateur avec cet email');
    }
    targetUserId = user.id;
  }

  if (!targetUserId) {
    throw ApiError.badRequest('L\'ID ou l\'email de l\'utilisateur est requis');
  }

  if (access.gym.user_id === targetUserId) {
    throw ApiError.badRequest('Le propriétaire a déjà accès à cette salle');
  }

  const savedAccess = await GymAccess.upsert(access.gym.id, targetUserId, access_level);

  res.json({
    success: true,
    message: 'Accès mis à jour avec succès',
    data: savedAccess
  });
});

/**
 * @desc Supprime l'accès d'un utilisateur à une salle.
 * @route DELETE /api/gyms/:id/access/:userId
 * @access Private
 */
const removeGymAccess = asyncHandler(async (req, res) => {
  const access = req.gymAccess;
  if (!access.isOwner && req.user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Seul le propriétaire peut gérer les accès');
  }

  if (access.gym.user_id === req.params.userId) {
    throw ApiError.badRequest('Impossible de retirer l\'accès du propriétaire');
  }

  await GymAccess.remove(access.gym.id, req.params.userId);

  res.json({
    success: true,
    message: 'Accès supprimé avec succès'
  });
});

module.exports = {
  getGyms,
  getGym,
  createGym,
  updateGym,
  deleteGym,
  addGymAccess,
  removeGymAccess
};
