const { Competitor, MarketZone, GymOffer } = require('../models/Market');

// ============================================
// COMPETITORS
// ============================================

// @desc    Get competitors by gym
// @route   GET /api/competitors?gym_id=xxx
// @access  Private
const getCompetitors = async (req, res, next) => {
  try {
    const { gym_id } = req.query;
    
    if (!gym_id) {
      return res.status(400).json({ 
        error: 'Paramètre manquant',
        message: 'L\'ID de la salle est requis' 
      });
    }

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

// @desc    Get single competitor
// @route   GET /api/competitors/:id
// @access  Private
const getCompetitor = async (req, res, next) => {
  try {
    const competitor = await Competitor.findById(req.params.id);
    
    if (!competitor) {
      return res.status(404).json({ 
        error: 'Concurrent non trouvé',
        message: 'Ce concurrent n\'existe pas' 
      });
    }

    res.json({
      success: true,
      data: competitor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create competitor
// @route   POST /api/competitors
// @access  Private
const createCompetitor = async (req, res, next) => {
  try {
    const { gym_id, name } = req.body;
    
    if (!gym_id || !name) {
      return res.status(400).json({ 
        error: 'Données manquantes',
        message: 'L\'ID de la salle et le nom sont requis' 
      });
    }

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

// @desc    Update competitor
// @route   PUT /api/competitors/:id
// @access  Private
const updateCompetitor = async (req, res, next) => {
  try {
    const competitor = await Competitor.findById(req.params.id);
    
    if (!competitor) {
      return res.status(404).json({ 
        error: 'Concurrent non trouvé',
        message: 'Ce concurrent n\'existe pas' 
      });
    }

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

// @desc    Delete competitor
// @route   DELETE /api/competitors/:id
// @access  Private
const deleteCompetitor = async (req, res, next) => {
  try {
    const competitor = await Competitor.findById(req.params.id);
    
    if (!competitor) {
      return res.status(404).json({ 
        error: 'Concurrent non trouvé',
        message: 'Ce concurrent n\'existe pas' 
      });
    }

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

// @desc    Get all market zones
// @route   GET /api/market-zones
// @access  Private
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

// @desc    Get single market zone
// @route   GET /api/market-zones/:id
// @access  Private
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

// @desc    Create market zone
// @route   POST /api/market-zones
// @access  Private
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

// @desc    Update market zone
// @route   PUT /api/market-zones/:id
// @access  Private
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

// @desc    Delete market zone
// @route   DELETE /api/market-zones/:id
// @access  Private
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

// @desc    Get gym offers
// @route   GET /api/gym-offers?gym_id=xxx&audit_id=xxx
// @access  Private
const getGymOffers = async (req, res, next) => {
  try {
    const { gym_id, audit_id } = req.query;
    let offers;
    
    if (gym_id) {
      offers = await GymOffer.findByGymId(gym_id);
    } else if (audit_id) {
      offers = await GymOffer.findByAuditId(audit_id);
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

// @desc    Get single gym offer
// @route   GET /api/gym-offers/:id
// @access  Private
const getGymOffer = async (req, res, next) => {
  try {
    const offer = await GymOffer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ 
        error: 'Offre non trouvée',
        message: 'Cette offre n\'existe pas' 
      });
    }

    res.json({
      success: true,
      data: offer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create gym offer
// @route   POST /api/gym-offers
// @access  Private
const createGymOffer = async (req, res, next) => {
  try {
    const { gym_id, offer_type, offer_name, price, currency, duration_months, commitment_months } = req.body;
    
    if (!gym_id || !offer_type || !offer_name || !price || !currency || !duration_months || !commitment_months) {
      return res.status(400).json({ 
        error: 'Données manquantes',
        message: 'Tous les champs requis doivent être fournis' 
      });
    }

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

// @desc    Update gym offer
// @route   PUT /api/gym-offers/:id
// @access  Private
const updateGymOffer = async (req, res, next) => {
  try {
    const offer = await GymOffer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ 
        error: 'Offre non trouvée',
        message: 'Cette offre n\'existe pas' 
      });
    }

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

// @desc    Delete gym offer
// @route   DELETE /api/gym-offers/:id
// @access  Private
const deleteGymOffer = async (req, res, next) => {
  try {
    const offer = await GymOffer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ 
        error: 'Offre non trouvée',
        message: 'Cette offre n\'existe pas' 
      });
    }

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
