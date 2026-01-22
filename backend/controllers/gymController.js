const Gym = require('../models/Gym');

// @desc    Get all gyms
// @route   GET /api/gyms
// @access  Private
const getGyms = async (req, res, next) => {
  try {
    // Si pas admin, ne récupérer que les gyms de l'utilisateur
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const gyms = await Gym.findAll(userId);
    
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
    const gym = await Gym.getWithStats(req.params.id);
    
    if (!gym) {
      return res.status(404).json({ 
        error: 'Gym non trouvée',
        message: 'Cette salle n\'existe pas' 
      });
    }

    // Vérifier les droits d'accès
    if (req.user.role !== 'admin' && gym.user_id !== req.user.id) {
      return res.status(403).json({ 
        error: 'Accès interdit',
        message: 'Vous n\'avez pas accès à cette salle' 
      });
    }

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
    const gym = await Gym.findById(req.params.id);
    
    if (!gym) {
      return res.status(404).json({ 
        error: 'Gym non trouvée',
        message: 'Cette salle n\'existe pas' 
      });
    }

    // Vérifier les droits d'accès
    if (req.user.role !== 'admin' && gym.user_id !== req.user.id) {
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
    const gym = await Gym.findById(req.params.id);
    
    if (!gym) {
      return res.status(404).json({ 
        error: 'Gym non trouvée',
        message: 'Cette salle n\'existe pas' 
      });
    }

    // Vérifier les droits d'accès
    if (req.user.role !== 'admin' && gym.user_id !== req.user.id) {
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

module.exports = {
  getGyms,
  getGym,
  createGym,
  updateGym,
  deleteGym
};
