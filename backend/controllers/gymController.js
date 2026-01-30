const Gym = require('../models/Gym');
const GymAccess = require('../models/GymAccess');
const User = require('../models/User');
const { resolveGymAccess } = require('../utils/gymAccess');

// @desc    Get all gyms
// @route   GET /api/gyms
// @access  Private
const getGyms = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const gyms = await Gym.findAll();
      return res.json({
        success: true,
        count: gyms.length,
        data: gyms
      });
    }

    const gyms = await Gym.findAllForUser(req.user.id);
    
    res.json({
      success: true,
      count: gyms.length,
      data: gyms
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single gym
// @route   GET /api/gyms/:id
// @access  Private
const getGym = async (req, res, next) => {
  try {
    const access = await resolveGymAccess({ gymId: req.params.id, user: req.user });
    if (!access.gym) {
      return res.status(404).json({ 
        error: 'Gym non trouvée',
        message: 'Cette salle n\'existe pas' 
      });
    }

    if (!access.canRead) {
      return res.status(403).json({ 
        error: 'Accès interdit',
        message: 'Vous n\'avez pas accès à cette salle' 
      });
    }

    const gym = await Gym.getWithStats(req.params.id);

    res.json({
      success: true,
      data: gym
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new gym
// @route   POST /api/gyms
// @access  Private
const createGym = async (req, res, next) => {
  try {
    const gymData = req.body;
    
    // Validation
    if (!gymData.name) {
      return res.status(400).json({ 
        error: 'Données manquantes',
        message: 'Le nom de la salle est requis' 
      });
    }

    const gym = await Gym.create(gymData, req.user.id);
    
    res.status(201).json({
      success: true,
      message: 'Salle créée avec succès',
      data: gym
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update gym
// @route   PUT /api/gyms/:id
// @access  Private
const updateGym = async (req, res, next) => {
  try {
    const access = await resolveGymAccess({ gymId: req.params.id, user: req.user });
    if (!access.gym) {
      return res.status(404).json({ 
        error: 'Gym non trouvée',
        message: 'Cette salle n\'existe pas' 
      });
    }

    if (!access.canWrite) {
      return res.status(403).json({ 
        error: 'Accès interdit',
        message: 'Vous ne pouvez pas modifier cette salle' 
      });
    }

    const updatedGym = await Gym.update(req.params.id, req.body);
    
    res.json({
      success: true,
      message: 'Salle mise à jour avec succès',
      data: updatedGym
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete gym
// @route   DELETE /api/gyms/:id
// @access  Private
const deleteGym = async (req, res, next) => {
  try {
    const access = await resolveGymAccess({ gymId: req.params.id, user: req.user });
    if (!access.gym) {
      return res.status(404).json({ 
        error: 'Gym non trouvée',
        message: 'Cette salle n\'existe pas' 
      });
    }

    if (!access.canWrite) {
      return res.status(403).json({ 
        error: 'Accès interdit',
        message: 'Vous ne pouvez pas supprimer cette salle' 
      });
    }

    await Gym.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Salle supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update gym access for a user
// @route   POST /api/gyms/:id/access
// @access  Private (owner/admin)
const addGymAccess = async (req, res, next) => {
  try {
    const access = await resolveGymAccess({ gymId: req.params.id, user: req.user });
    if (!access.gym) {
      return res.status(404).json({ 
        error: 'Gym non trouvée',
        message: 'Cette salle n\'existe pas' 
      });
    }

    if (!access.isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Accès interdit',
        message: 'Seul le propriétaire peut gérer les accès' 
      });
    }

    const { user_id, email, access_level } = req.body;
    if (!access_level || !['read', 'write'].includes(access_level)) {
      return res.status(400).json({ 
        error: 'Données manquantes',
        message: 'Le niveau d\'accès doit être "read" ou "write"' 
      });
    }

    let targetUserId = user_id;
    if (!targetUserId && email) {
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ 
          error: 'Utilisateur non trouvé',
          message: 'Aucun utilisateur avec cet email' 
        });
      }
      targetUserId = user.id;
    }

    if (!targetUserId) {
      return res.status(400).json({ 
        error: 'Données manquantes',
        message: 'L\'ID ou l\'email de l\'utilisateur est requis' 
      });
    }

    if (access.gym.user_id === targetUserId) {
      return res.status(400).json({ 
        error: 'Action invalide',
        message: 'Le propriétaire a déjà accès à cette salle' 
      });
    }

    const savedAccess = await GymAccess.upsert(access.gym.id, targetUserId, access_level);

    res.json({
      success: true,
      message: 'Accès mis à jour avec succès',
      data: savedAccess
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove gym access for a user
// @route   DELETE /api/gyms/:id/access/:userId
// @access  Private (owner/admin)
const removeGymAccess = async (req, res, next) => {
  try {
    const access = await resolveGymAccess({ gymId: req.params.id, user: req.user });
    if (!access.gym) {
      return res.status(404).json({ 
        error: 'Gym non trouvée',
        message: 'Cette salle n\'existe pas' 
      });
    }

    if (!access.isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Accès interdit',
        message: 'Seul le propriétaire peut gérer les accès' 
      });
    }

    if (access.gym.user_id === req.params.userId) {
      return res.status(400).json({ 
        error: 'Action invalide',
        message: 'Impossible de retirer l\'accès du propriétaire' 
      });
    }

    await GymAccess.remove(access.gym.id, req.params.userId);

    res.json({
      success: true,
      message: 'Accès supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGyms,
  getGym,
  createGym,
  updateGym,
  deleteGym,
  addGymAccess,
  removeGymAccess
};
