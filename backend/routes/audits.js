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
const { auth, optionalAuth } = require('../middleware/auth');

// Lecture possible sans authentification
router.use(optionalAuth);

// Routes principales
router.route('/')
  .get(getAudits)
  .post(createAudit);

router.route('/:id')
  .get(getAudit)
  .put(auth, updateAudit)
  .delete(auth, deleteAudit);

// Audit complet avec toutes les données
router.get('/:id/complete', getCompleteAudit);

// Gestion des réponses
router.route('/:id/answers')
  .get(getAnswers)
  .post(auth, saveAnswers);

// Gestion des KPIs
router.post('/:id/kpis', auth, saveKPIs);

// Gestion des scores
router.post('/:id/scores', auth, saveScores);
router.get('/:id/global-score', getGlobalScore);

// Gestion des recommandations
router.route('/:id/recommendations')
  .get(getRecommendations)
  .post(auth, saveRecommendations);

module.exports = router;
