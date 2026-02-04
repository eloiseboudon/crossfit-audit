const { Competitor, MarketZone, GymOffer } = require('../models/Market');
const Gym = require('../models/Gym');
const Audit = require('../models/Audit');
const { resolveGymAccess } = require('../utils/gymAccess');

/**
 * Valide l'accès à une salle pour les routes marché.
 *
 * @async
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {string} gymId - Identifiant de la salle.
 * @param {{ write?: boolean }} [options] - Options d'accès.
 * @returns {Promise<object | null>} Contexte d'accès ou null si refus.
 */
const ensureGymAccess = async (req, res, gymId, { write = false } = {}) => {
  if (!req.user) {
    const gym = await Gym.findById(gymId);
    if (!gym) {
      res.status(404).json({ 
        error: 'Gym non trouvée',
        message: 'Cette salle n\'existe pas' 
      });
      return null;
    }

    if (write) {
      res.status(401).json({ 
        error: 'Accès non autorisé',
        message: 'Token manquant' 
      });
      return null;
    }

    return { gym, canRead: true, canWrite: false, accessLevel: 'guest', isOwner: false };
  }

  const access = await resolveGymAccess({ gymId, user: req.user });
  if (!access.gym) {
    res.status(404).json({ 
      error: 'Gym non trouvée',
      message: 'Cette salle n\'existe pas' 
    });
    return null;
  }

  if (!access.canRead) {
    res.status(403).json({ 
      error: 'Accès interdit',
      message: 'Vous n\'avez pas accès à cette salle' 
    });
    return null;
  }

  if (write && !access.canWrite) {
    res.status(403).json({ 
      error: 'Accès interdit',
      message: 'Vous ne pouvez pas modifier cette salle' 
    });
    return null;
  }

  return access;
};

// ============================================
// COMPETITORS
// ============================================

/**
 * @desc Récupère les concurrents d'une salle.
 * @route GET /api/competitors?gym_id=xxx
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const getCompetitors = async (req, res, next) => {
  try {
    const { gym_id } = req.query;
    
    if (!gym_id) {
      return res.status(400).json({ 
        error: 'Paramètre manquant',
        message: 'L\'ID de la salle est requis' 
      });
    }

    const access = await ensureGymAccess(req, res, gym_id);
    if (!access) return;

    const competitors = await Competitor.findByGymId(gym_id);
    
    res.json({
      success: true,
      count: competitors.length,
      data: competitors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Récupère un concurrent par identifiant.
 * @route GET /api/competitors/:id
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const getCompetitor = async (req, res, next) => {
  try {
    const competitor = await Competitor.findById(req.params.id);
    
    if (!competitor) {
      return res.status(404).json({ 
        error: 'Concurrent non trouvé',
        message: 'Ce concurrent n\'existe pas' 
      });
    }

    const access = await ensureGymAccess(req, res, competitor.gym_id);
    if (!access) return;

    res.json({
      success: true,
      data: competitor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Crée un concurrent.
 * @route POST /api/competitors
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const createCompetitor = async (req, res, next) => {
  try {
    const { gym_id, name } = req.body;
    
    if (!gym_id || !name) {
      return res.status(400).json({ 
        error: 'Données manquantes',
        message: 'L\'ID de la salle et le nom sont requis' 
      });
    }

    const access = await ensureGymAccess(req, res, gym_id, { write: true });
    if (!access) return;

    const competitor = await Competitor.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Concurrent créé avec succès',
      data: competitor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Met à jour un concurrent.
 * @route PUT /api/competitors/:id
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const updateCompetitor = async (req, res, next) => {
  try {
    const competitor = await Competitor.findById(req.params.id);
    
    if (!competitor) {
      return res.status(404).json({ 
        error: 'Concurrent non trouvé',
        message: 'Ce concurrent n\'existe pas' 
      });
    }

    const access = await ensureGymAccess(req, res, competitor.gym_id, { write: true });
    if (!access) return;

    const updated = await Competitor.update(req.params.id, req.body);
    
    res.json({
      success: true,
      message: 'Concurrent mis à jour avec succès',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Supprime un concurrent (désactivation).
 * @route DELETE /api/competitors/:id
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const deleteCompetitor = async (req, res, next) => {
  try {
    const competitor = await Competitor.findById(req.params.id);
    
    if (!competitor) {
      return res.status(404).json({ 
        error: 'Concurrent non trouvé',
        message: 'Ce concurrent n\'existe pas' 
      });
    }

    const access = await ensureGymAccess(req, res, competitor.gym_id, { write: true });
    if (!access) return;

    await Competitor.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Concurrent supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// MARKET ZONES
// ============================================

/**
 * @desc Liste les zones de marché.
 * @route GET /api/market-zones
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const getMarketZones = async (req, res, next) => {
  try {
    const zones = await MarketZone.findAll();
    
    res.json({
      success: true,
      count: zones.length,
      data: zones
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Récupère une zone de marché.
 * @route GET /api/market-zones/:id
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const getMarketZone = async (req, res, next) => {
  try {
    const zone = await MarketZone.findById(req.params.id);
    
    if (!zone) {
      return res.status(404).json({ 
        error: 'Zone non trouvée',
        message: 'Cette zone marché n\'existe pas' 
      });
    }

    res.json({
      success: true,
      data: zone
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Crée une zone de marché.
 * @route POST /api/market-zones
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const createMarketZone = async (req, res, next) => {
  try {
    const { name, price_level, avg_subscription_min, avg_subscription_max } = req.body;
    
    if (!name || !price_level || !avg_subscription_min || !avg_subscription_max) {
      return res.status(400).json({ 
        error: 'Données manquantes',
        message: 'Nom, niveau de prix et fourchettes sont requis' 
      });
    }

    const zone = await MarketZone.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Zone marché créée avec succès',
      data: zone
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Met à jour une zone de marché.
 * @route PUT /api/market-zones/:id
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const updateMarketZone = async (req, res, next) => {
  try {
    const zone = await MarketZone.findById(req.params.id);
    
    if (!zone) {
      return res.status(404).json({ 
        error: 'Zone non trouvée',
        message: 'Cette zone marché n\'existe pas' 
      });
    }

    const updated = await MarketZone.update(req.params.id, req.body);
    
    res.json({
      success: true,
      message: 'Zone marché mise à jour avec succès',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Supprime une zone de marché (désactivation).
 * @route DELETE /api/market-zones/:id
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const deleteMarketZone = async (req, res, next) => {
  try {
    const zone = await MarketZone.findById(req.params.id);
    
    if (!zone) {
      return res.status(404).json({ 
        error: 'Zone non trouvée',
        message: 'Cette zone marché n\'existe pas' 
      });
    }

    await MarketZone.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Zone marché supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GYM OFFERS
// ============================================

/**
 * @desc Récupère les offres d'une salle ou d'un audit.
 * @route GET /api/gym-offers?gym_id=xxx&audit_id=xxx
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const getGymOffers = async (req, res, next) => {
  try {
    const { gym_id, audit_id, include_inactive } = req.query;
    const includeInactive = include_inactive === '1' || include_inactive === 'true';
    let offers;
    
    if (gym_id) {
      const access = await ensureGymAccess(req, res, gym_id);
      if (!access) return;
      offers = await GymOffer.findByGymId(gym_id, includeInactive);
    } else if (audit_id) {
      const audit = await Audit.findById(audit_id);
      if (!audit) {
        return res.status(404).json({ 
          error: 'Audit non trouvé',
          message: 'Cet audit n\'existe pas' 
        });
      }
      const access = await ensureGymAccess(req, res, audit.gym_id);
      if (!access) return;
      offers = await GymOffer.findByAuditId(audit_id, includeInactive);
    } else {
      return res.status(400).json({ 
        error: 'Paramètre manquant',
        message: 'L\'ID de la salle ou de l\'audit est requis' 
      });
    }
    
    res.json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Récupère une offre commerciale.
 * @route GET /api/gym-offers/:id
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const getGymOffer = async (req, res, next) => {
  try {
    const offer = await GymOffer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ 
        error: 'Offre non trouvée',
        message: 'Cette offre n\'existe pas' 
      });
    }

    const access = await ensureGymAccess(req, res, offer.gym_id);
    if (!access) return;

    res.json({
      success: true,
      data: offer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Crée une offre commerciale.
 * @route POST /api/gym-offers
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const createGymOffer = async (req, res, next) => {
  try {
    const { gym_id, offer_type, offer_name, price, currency, duration_months, commitment_months } = req.body;
    
    if (!gym_id || !offer_type || !offer_name || !price || !currency || !duration_months || !commitment_months) {
      return res.status(400).json({ 
        error: 'Données manquantes',
        message: 'Tous les champs requis doivent être fournis' 
      });
    }

    const access = await ensureGymAccess(req, res, gym_id, { write: true });
    if (!access) return;

    const offer = await GymOffer.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Offre créée avec succès',
      data: offer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Met à jour une offre commerciale.
 * @route PUT /api/gym-offers/:id
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const updateGymOffer = async (req, res, next) => {
  try {
    const offer = await GymOffer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ 
        error: 'Offre non trouvée',
        message: 'Cette offre n\'existe pas' 
      });
    }

    const access = await ensureGymAccess(req, res, offer.gym_id, { write: true });
    if (!access) return;

    const updated = await GymOffer.update(req.params.id, req.body);
    
    res.json({
      success: true,
      message: 'Offre mise à jour avec succès',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Supprime une offre commerciale (désactivation).
 * @route DELETE /api/gym-offers/:id
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const deleteGymOffer = async (req, res, next) => {
  try {
    const offer = await GymOffer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ 
        error: 'Offre non trouvée',
        message: 'Cette offre n\'existe pas' 
      });
    }

    const access = await ensureGymAccess(req, res, offer.gym_id, { write: true });
    if (!access) return;

    await GymOffer.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Offre supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompetitors,
  getCompetitor,
  createCompetitor,
  updateCompetitor,
  deleteCompetitor,
  getMarketZones,
  getMarketZone,
  createMarketZone,
  updateMarketZone,
  deleteMarketZone,
  getGymOffers,
  getGymOffer,
  createGymOffer,
  updateGymOffer,
  deleteGymOffer
};
