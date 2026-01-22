const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/marketController');
const { auth } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification
router.use(auth);

// ============================================
// COMPETITORS ROUTES
// ============================================
router.route('/competitors')
  .get(getCompetitors)
  .post(createCompetitor);

router.route('/competitors/:id')
  .get(getCompetitor)
  .put(updateCompetitor)
  .delete(deleteCompetitor);

// ============================================
// MARKET ZONES ROUTES
// ============================================
router.route('/market-zones')
  .get(getMarketZones)
  .post(createMarketZone);

router.route('/market-zones/:id')
  .get(getMarketZone)
  .put(updateMarketZone)
  .delete(deleteMarketZone);

// ============================================
// GYM OFFERS ROUTES
// ============================================
router.route('/gym-offers')
  .get(getGymOffers)
  .post(createGymOffer);

router.route('/gym-offers/:id')
  .get(getGymOffer)
  .put(updateGymOffer)
  .delete(deleteGymOffer);

module.exports = router;
