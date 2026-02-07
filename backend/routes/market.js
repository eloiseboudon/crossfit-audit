/**
 * @module routes/market
 * @description Routes marché : concurrents, zones de marché et offres commerciales.
 */

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
const { auth, optionalAuth } = require('../middleware/auth');

// Lecture possible sans authentification
router.use(optionalAuth);

// ============================================
// COMPETITORS ROUTES
// ============================================
router.route('/competitors')
  .get(getCompetitors)
  .post(auth, createCompetitor);

router.route('/competitors/:id')
  .get(getCompetitor)
  .put(auth, updateCompetitor)
  .delete(auth, deleteCompetitor);

// ============================================
// MARKET ZONES ROUTES
// ============================================
router.route('/market-zones')
  .get(getMarketZones)
  .post(auth, createMarketZone);

router.route('/market-zones/:id')
  .get(getMarketZone)
  .put(auth, updateMarketZone)
  .delete(auth, deleteMarketZone);

// ============================================
// GYM OFFERS ROUTES
// ============================================
router.route('/gym-offers')
  .get(getGymOffers)
  .post(auth, createGymOffer);

router.route('/gym-offers/:id')
  .get(getGymOffer)
  .put(auth, updateGymOffer)
  .delete(auth, deleteGymOffer);

module.exports = router;
