const Audit = require('../models/Audit');
const Answer = require('../models/Answer');
const { KPI, Score, Recommendation } = require('../models/AuditData');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getGymAccess } = require('../middleware/gymAccessMiddleware');
const { AUDIT_STATUS, ROLES } = require('../constants');

/**
 * Valide que la valeur est un tableau, sinon lève une erreur.
 *
 * @param {*} value - Valeur à vérifier.
 * @param {string} label - Nom du champ pour le message d'erreur.
 * @throws {ApiError} Si la valeur n'est pas un tableau.
 */
const requireArray = (value, label) => {
  if (!Array.isArray(value)) {
    throw ApiError.badRequest(`${label} doivent être un tableau`);
  }
};

/**
 * Valide l'accès à un audit et retourne le contexte d'accès.
 *
 * @async
 * @param {{ write?: boolean }} [options] - Options d'accès.
 * @returns {Promise<{audit: object, access: object} | null>} Audit et droits si autorisé.
 */
const ensureAuditAccess = async (req, { write = false } = {}) => {
  const audit = await Audit.findById(req.params.id);
  if (!audit) {
    throw ApiError.notFound('Cet audit n\'existe pas');
  }

  const access = await getGymAccess({ gymId: audit.gym_id, user: req.user, write });

  return { audit, access };
};

/**
 * @desc Récupère la liste des audits accessibles.
 * @route GET /api/audits
 * @access Private
 */
const getAudits = asyncHandler(async (req, res) => {
  const { gym_id } = req.query;

  const audits = (!req.user || req.user.role === ROLES.ADMIN)
    ? await Audit.findAll(gym_id)
    : await Audit.findAllForUser(req.user.id, gym_id);

  res.json({
    success: true,
    count: audits.length,
    data: audits
  });
});

/**
 * @desc Récupère un audit par identifiant.
 * @route GET /api/audits/:id
 * @access Private
 */
const getAudit = asyncHandler(async (req, res) => {
  const { audit } = await ensureAuditAccess(req);

  res.json({
    success: true,
    data: audit
  });
});

/**
 * @desc Récupère un audit complet avec réponses, KPIs, scores et recommandations.
 * @route GET /api/audits/:id/complete
 * @access Private
 */
const getCompleteAudit = asyncHandler(async (req, res) => {
  await ensureAuditAccess(req);
  const audit = await Audit.getComplete(req.params.id);

  res.json({
    success: true,
    data: audit
  });
});

/**
 * @desc Crée un nouvel audit pour une salle.
 * @route POST /api/audits
 * @access Private
 */
const createAudit = asyncHandler(async (req, res) => {
  const { gym_id } = req.body;

  if (!gym_id) {
    throw ApiError.badRequest('L\'ID de la salle est requis');
  }

  if (req.user) {
    await getGymAccess({ gymId: gym_id, user: req.user, write: true });
  }

  const audit = await Audit.create({
    ...req.body,
    status: req.body.status || AUDIT_STATUS.DRAFT
  });

  res.status(201).json({
    success: true,
    message: 'Audit créé avec succès',
    data: audit
  });
});

/**
 * @desc Met à jour un audit existant.
 * @route PUT /api/audits/:id
 * @access Private
 */
const updateAudit = asyncHandler(async (req, res) => {
  await ensureAuditAccess(req, { write: true });

  const updatedAudit = await Audit.update(req.params.id, req.body);

  res.json({
    success: true,
    message: 'Audit mis à jour avec succès',
    data: updatedAudit
  });
});

/**
 * @desc Supprime un audit.
 * @route DELETE /api/audits/:id
 * @access Private
 */
const deleteAudit = asyncHandler(async (req, res) => {
  await ensureAuditAccess(req, { write: true });

  await Audit.delete(req.params.id);

  res.json({
    success: true,
    message: 'Audit supprimé avec succès'
  });
});

/**
 * @desc Enregistre les réponses d'un audit.
 * @route POST /api/audits/:id/answers
 * @access Private
 */
const saveAnswers = asyncHandler(async (req, res) => {
  await ensureAuditAccess(req, { write: true });
  const { answers } = req.body;
  requireArray(answers, 'Les réponses');

  const savedAnswers = await Answer.bulkUpsert(req.params.id, answers);
  await Audit.updateCompletionPercentage(req.params.id);

  res.json({
    success: true,
    message: 'Réponses enregistrées avec succès',
    data: savedAnswers
  });
});

/**
 * @desc Récupère les réponses d'un audit.
 * @route GET /api/audits/:id/answers
 * @access Private
 */
const getAnswers = asyncHandler(async (req, res) => {
  await ensureAuditAccess(req);
  const answers = await Answer.findByAuditId(req.params.id);

  res.json({
    success: true,
    count: answers.length,
    data: answers
  });
});

/**
 * @desc Enregistre les KPIs d'un audit.
 * @route POST /api/audits/:id/kpis
 * @access Private
 */
const saveKPIs = asyncHandler(async (req, res) => {
  await ensureAuditAccess(req, { write: true });
  const { kpis } = req.body;
  requireArray(kpis, 'Les KPIs');

  const savedKPIs = await KPI.bulkUpsert(req.params.id, kpis);

  res.json({
    success: true,
    message: 'KPIs enregistrés avec succès',
    data: savedKPIs
  });
});

/**
 * @desc Enregistre les scores d'un audit.
 * @route POST /api/audits/:id/scores
 * @access Private
 */
const saveScores = asyncHandler(async (req, res) => {
  await ensureAuditAccess(req, { write: true });
  const { scores } = req.body;
  requireArray(scores, 'Les scores');

  const savedScores = await Score.bulkUpsert(req.params.id, scores);

  res.json({
    success: true,
    message: 'Scores enregistrés avec succès',
    data: savedScores
  });
});

/**
 * @desc Récupère le score global d'un audit.
 * @route GET /api/audits/:id/global-score
 * @access Private
 */
const getGlobalScore = asyncHandler(async (req, res) => {
  await ensureAuditAccess(req);
  const globalScore = await Score.getGlobalScore(req.params.id);

  if (!globalScore) {
    throw ApiError.notFound('Aucun score n\'a été calculé pour cet audit');
  }

  res.json({
    success: true,
    data: globalScore
  });
});

/**
 * @desc Enregistre les recommandations d'un audit.
 * @route POST /api/audits/:id/recommendations
 * @access Private
 */
const saveRecommendations = asyncHandler(async (req, res) => {
  await ensureAuditAccess(req, { write: true });
  const { recommendations } = req.body;
  requireArray(recommendations, 'Les recommandations');

  const savedRecs = await Recommendation.bulkCreate(req.params.id, recommendations);

  res.json({
    success: true,
    message: 'Recommandations enregistrées avec succès',
    data: savedRecs
  });
});

/**
 * @desc Récupère les recommandations d'un audit.
 * @route GET /api/audits/:id/recommendations
 * @access Private
 */
const getRecommendations = asyncHandler(async (req, res) => {
  await ensureAuditAccess(req);
  const recommendations = await Recommendation.findByAuditId(req.params.id);

  res.json({
    success: true,
    count: recommendations.length,
    data: recommendations
  });
});

module.exports = {
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
};
