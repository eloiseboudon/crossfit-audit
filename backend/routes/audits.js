/**
 * @module routes/audits
 * @description Routes des audits : CRUD, réponses, KPIs, scores et recommandations.
 */

const express = require('express');
const router = express.Router();
const {
  getAudits,
  getAudit,
  getCompleteAudit,
  createAudit,
  updateAudit,
  deleteAudit,
  saveAnswers,
  getAnswers,
  saveKPIs,
  saveScores,
  getGlobalScore,
  saveRecommendations,
  getRecommendations
} = require('../controllers/auditController');
const { optionalAuth } = require('../middleware/auth');

// Lecture possible sans authentification
router.use(optionalAuth);

// Routes principales
router.route('/')
  .get(getAudits)
  .post(createAudit);

router.route('/:id')
  .get(getAudit)
  .put(updateAudit)
  .delete(deleteAudit);

// Audit complet avec toutes les données
router.get('/:id/complete', getCompleteAudit);

// Gestion des réponses
router.route('/:id/answers')
  .get(getAnswers)
  .post(saveAnswers);

// Gestion des KPIs
router.post('/:id/kpis', saveKPIs);

// Gestion des scores
router.post('/:id/scores', saveScores);
router.get('/:id/global-score', getGlobalScore);

// Gestion des recommandations
router.route('/:id/recommendations')
  .get(getRecommendations)
  .post(saveRecommendations);

module.exports = router;
