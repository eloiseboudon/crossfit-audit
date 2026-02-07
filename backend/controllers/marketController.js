const { Competitor, MarketZone, GymOffer } = require('../models/Market');
const Audit = require('../models/Audit');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getGymAccess } = require('../middleware/gymAccessMiddleware');
const { PRICE_LEVEL } = require('../constants');

/**
 * Charge une entité par ID et vérifie qu'elle existe.
 *
 * @param {Function} findFn - Fonction Model.findById.
 * @param {string} id - Identifiant de l'entité.
 * @param {string} label - Nom pour le message d'erreur.
 * @returns {Promise<object>} L'entité trouvée.
 * @throws {ApiError} Si l'entité n'existe pas.
 */
const findOrFail = async (findFn, id, label) => {
  const entity = await findFn(id);
  if (!entity) {
    throw ApiError.notFound(`${label} n'existe pas`);
  }
  return entity;
};

// ============================================
// COMPETITORS
// ============================================

/**
 * @desc Récupère les concurrents d'une salle.
 * @route GET /api/competitors?gym_id=xxx
 * @access Private
 */
const getCompetitors = asyncHandler(async (req, res) => {
  const { gym_id } = req.query;

  if (!gym_id) {
    throw ApiError.badRequest('L\'ID de la salle est requis');
  }

  await getGymAccess({ gymId: gym_id, user: req.user });

  const competitors = await Competitor.findByGymId(gym_id);

  res.json({
    success: true,
    count: competitors.length,
    data: competitors
  });
});

/**
 * @desc Récupère un concurrent par identifiant.
 * @route GET /api/competitors/:id
 * @access Private
 */
const getCompetitor = asyncHandler(async (req, res) => {
  const competitor = await findOrFail(Competitor.findById, req.params.id, 'Ce concurrent');

  await getGymAccess({ gymId: competitor.gym_id, user: req.user });

  res.json({
    success: true,
    data: competitor
  });
});

/**
 * @desc Crée un concurrent.
 * @route POST /api/competitors
 * @access Private
 */
const createCompetitor = asyncHandler(async (req, res) => {
  const { gym_id, name } = req.body;

  if (!gym_id || !name) {
    throw ApiError.badRequest('L\'ID de la salle et le nom sont requis');
  }

  await getGymAccess({ gymId: gym_id, user: req.user, write: true });

  const competitor = await Competitor.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Concurrent créé avec succès',
    data: competitor
  });
});

/**
 * @desc Met à jour un concurrent.
 * @route PUT /api/competitors/:id
 * @access Private
 */
const updateCompetitor = asyncHandler(async (req, res) => {
  const competitor = await findOrFail(Competitor.findById, req.params.id, 'Ce concurrent');

  await getGymAccess({ gymId: competitor.gym_id, user: req.user, write: true });

  const updated = await Competitor.update(req.params.id, req.body);

  res.json({
    success: true,
    message: 'Concurrent mis à jour avec succès',
    data: updated
  });
});

/**
 * @desc Supprime un concurrent (désactivation).
 * @route DELETE /api/competitors/:id
 * @access Private
 */
const deleteCompetitor = asyncHandler(async (req, res) => {
  const competitor = await findOrFail(Competitor.findById, req.params.id, 'Ce concurrent');

  await getGymAccess({ gymId: competitor.gym_id, user: req.user, write: true });

  await Competitor.delete(req.params.id);

  res.json({
    success: true,
    message: 'Concurrent supprimé avec succès'
  });
});

// ============================================
// MARKET ZONES
// ============================================

/**
 * @desc Liste les zones de marché.
 * @route GET /api/market-zones
 * @access Private
 */
const getMarketZones = asyncHandler(async (req, res) => {
  const zones = await MarketZone.findAll();

  res.json({
    success: true,
    count: zones.length,
    data: zones
  });
});

/**
 * @desc Récupère une zone de marché.
 * @route GET /api/market-zones/:id
 * @access Private
 */
const getMarketZone = asyncHandler(async (req, res) => {
  const zone = await findOrFail(MarketZone.findById, req.params.id, 'Cette zone marché');

  res.json({
    success: true,
    data: zone
  });
});

/**
 * @desc Crée une zone de marché.
 * @route POST /api/market-zones
 * @access Private
 */
const createMarketZone = asyncHandler(async (req, res) => {
  const { name, price_level, avg_subscription_min, avg_subscription_max } = req.body;

  if (!name || !price_level || !avg_subscription_min || !avg_subscription_max) {
    throw ApiError.badRequest('Nom, niveau de prix et fourchettes sont requis');
  }

  if (!Object.values(PRICE_LEVEL).includes(price_level)) {
    throw ApiError.badRequest('Niveau de prix invalide');
  }

  const zone = await MarketZone.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Zone marché créée avec succès',
    data: zone
  });
});

/**
 * @desc Met à jour une zone de marché.
 * @route PUT /api/market-zones/:id
 * @access Private
 */
const updateMarketZone = asyncHandler(async (req, res) => {
  await findOrFail(MarketZone.findById, req.params.id, 'Cette zone marché');

  if (req.body.price_level && !Object.values(PRICE_LEVEL).includes(req.body.price_level)) {
    throw ApiError.badRequest('Niveau de prix invalide');
  }

  const updated = await MarketZone.update(req.params.id, req.body);

  res.json({
    success: true,
    message: 'Zone marché mise à jour avec succès',
    data: updated
  });
});

/**
 * @desc Supprime une zone de marché (désactivation).
 * @route DELETE /api/market-zones/:id
 * @access Private
 */
const deleteMarketZone = asyncHandler(async (req, res) => {
  await findOrFail(MarketZone.findById, req.params.id, 'Cette zone marché');

  await MarketZone.delete(req.params.id);

  res.json({
    success: true,
    message: 'Zone marché supprimée avec succès'
  });
});

// ============================================
// GYM OFFERS
// ============================================

/**
 * @desc Récupère les offres d'une salle ou d'un audit.
 * @route GET /api/gym-offers?gym_id=xxx&audit_id=xxx
 * @access Private
 */
const getGymOffers = asyncHandler(async (req, res) => {
  const { gym_id, audit_id, include_inactive } = req.query;
  const includeInactive = include_inactive === '1' || include_inactive === 'true';
  let offers;

  if (gym_id) {
    await getGymAccess({ gymId: gym_id, user: req.user });
    offers = await GymOffer.findByGymId(gym_id, includeInactive);
  } else if (audit_id) {
    const audit = await findOrFail(Audit.findById, audit_id, 'Cet audit');
    await getGymAccess({ gymId: audit.gym_id, user: req.user });
    offers = await GymOffer.findByAuditId(audit_id, includeInactive);
  } else {
    throw ApiError.badRequest('L\'ID de la salle ou de l\'audit est requis');
  }

  res.json({
    success: true,
    count: offers.length,
    data: offers
  });
});

/**
 * @desc Récupère une offre commerciale.
 * @route GET /api/gym-offers/:id
 * @access Private
 */
const getGymOffer = asyncHandler(async (req, res) => {
  const offer = await findOrFail(GymOffer.findById, req.params.id, 'Cette offre');

  await getGymAccess({ gymId: offer.gym_id, user: req.user });

  res.json({
    success: true,
    data: offer
  });
});

/**
 * @desc Crée une offre commerciale.
 * @route POST /api/gym-offers
 * @access Private
 */
const createGymOffer = asyncHandler(async (req, res) => {
  const { gym_id, offer_type, offer_name, price, currency, duration_months, commitment_months } = req.body;

  if (!gym_id || !offer_type || !offer_name || !price || !currency || !duration_months || !commitment_months) {
    throw ApiError.badRequest('Tous les champs requis doivent être fournis');
  }

  await getGymAccess({ gymId: gym_id, user: req.user, write: true });

  const offer = await GymOffer.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Offre créée avec succès',
    data: offer
  });
});

/**
 * @desc Met à jour une offre commerciale.
 * @route PUT /api/gym-offers/:id
 * @access Private
 */
const updateGymOffer = asyncHandler(async (req, res) => {
  const offer = await findOrFail(GymOffer.findById, req.params.id, 'Cette offre');

  await getGymAccess({ gymId: offer.gym_id, user: req.user, write: true });

  const updated = await GymOffer.update(req.params.id, req.body);

  res.json({
    success: true,
    message: 'Offre mise à jour avec succès',
    data: updated
  });
});

/**
 * @desc Supprime une offre commerciale (désactivation).
 * @route DELETE /api/gym-offers/:id
 * @access Private
 */
const deleteGymOffer = asyncHandler(async (req, res) => {
  const offer = await findOrFail(GymOffer.findById, req.params.id, 'Cette offre');

  await getGymAccess({ gymId: offer.gym_id, user: req.user, write: true });

  await GymOffer.delete(req.params.id);

  res.json({
    success: true,
    message: 'Offre supprimée avec succès'
  });
});

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
