const Audit = require('../models/Audit');
const Answer = require('../models/Answer');
const { KPI, Score, Recommendation } = require('../models/AuditData');
const { resolveGymAccess } = require('../utils/gymAccess');

/**
 * Valide l'accès à un audit et retourne le contexte d'accès.
 *
 * @async
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {{ write?: boolean }} [options] - Options d'accès.
 * @returns {Promise<{audit: object, access: object} | null>} Audit et droits si autorisé.
 */
const ensureAuditAccess = async (req, res, { write = false } = {}) => {
  const audit = await Audit.findById(req.params.id);
  if (!audit) {
    res.status(404).json({ 
      error: 'Audit non trouvé',
      message: 'Cet audit n\'existe pas' 
    });
    return null;
  }

  if (!req.user) {
    return { audit, access: { canRead: true, canWrite: true } };
  }

  const access = await resolveGymAccess({ gymId: audit.gym_id, user: req.user });
  if (!access.canRead) {
    res.status(403).json({ 
      error: 'Accès interdit',
      message: 'Vous n\'avez pas accès à cet audit' 
    });
    return null;
  }

  if (write && !access.canWrite) {
    res.status(403).json({ 
      error: 'Accès interdit',
      message: 'Vous ne pouvez pas modifier cet audit' 
    });
    return null;
  }

  return { audit, access };
};

/**
 * @desc Récupère la liste des audits accessibles.
 * @route GET /api/audits
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const getAudits = async (req, res, next) => {
  try {
    const { gym_id } = req.query;
    let audits;

    if (!req.user) {
      audits = await Audit.findAll(gym_id);
    } else if (req.user.role === 'admin') {
      audits = await Audit.findAll(gym_id);
    } else {
      audits = await Audit.findAllForUser(req.user.id, gym_id);
    }
    
    res.json({
      success: true,
      count: audits.length,
      data: audits
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Récupère un audit par identifiant.
 * @route GET /api/audits/:id
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const getAudit = async (req, res, next) => {
  try {
    const result = await ensureAuditAccess(req, res);
    if (!result) return;
    const { audit } = result;

    res.json({
      success: true,
      data: audit
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Récupère un audit complet avec réponses, KPIs, scores et recommandations.
 * @route GET /api/audits/:id/complete
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const getCompleteAudit = async (req, res, next) => {
  try {
    const accessResult = await ensureAuditAccess(req, res);
    if (!accessResult) return;
    const audit = await Audit.getComplete(req.params.id);

    res.json({
      success: true,
      data: audit
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Crée un nouvel audit pour une salle.
 * @route POST /api/audits
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const createAudit = async (req, res, next) => {
  try {
    const { gym_id } = req.body;
    
    if (!gym_id) {
      return res.status(400).json({ 
        error: 'Données manquantes',
        message: 'L\'ID de la salle est requis' 
      });
    }

    const access = await resolveGymAccess({ gymId: gym_id, user: req.user });
    if (!access.gym) {
      return res.status(404).json({ 
        error: 'Gym non trouvée',
        message: 'Cette salle n\'existe pas' 
      });
    }

    if (!access.canWrite) {
      return res.status(403).json({ 
        error: 'Accès interdit',
        message: 'Vous ne pouvez pas créer un audit pour cette salle' 
      });
    }

    const audit = await Audit.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Audit créé avec succès',
      data: audit
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Met à jour un audit existant.
 * @route PUT /api/audits/:id
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const updateAudit = async (req, res, next) => {
  try {
    const result = await ensureAuditAccess(req, res, { write: true });
    if (!result) return;

    const updatedAudit = await Audit.update(req.params.id, req.body);
    
    res.json({
      success: true,
      message: 'Audit mis à jour avec succès',
      data: updatedAudit
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Supprime un audit.
 * @route DELETE /api/audits/:id
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const deleteAudit = async (req, res, next) => {
  try {
    const result = await ensureAuditAccess(req, res, { write: true });
    if (!result) return;

    await Audit.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Audit supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Enregistre les réponses d'un audit.
 * @route POST /api/audits/:id/answers
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const saveAnswers = async (req, res, next) => {
  try {
    const result = await ensureAuditAccess(req, res, { write: true });
    if (!result) return;
    const { answers } = req.body;
    
    if (!Array.isArray(answers)) {
      return res.status(400).json({ 
        error: 'Format invalide',
        message: 'Les réponses doivent être un tableau' 
      });
    }

    const savedAnswers = await Answer.bulkUpsert(req.params.id, answers);
    
    // Mettre à jour le pourcentage de complétion
    await Audit.updateCompletionPercentage(req.params.id);
    
    res.json({
      success: true,
      message: 'Réponses enregistrées avec succès',
      data: savedAnswers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Récupère les réponses d'un audit.
 * @route GET /api/audits/:id/answers
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const getAnswers = async (req, res, next) => {
  try {
    const result = await ensureAuditAccess(req, res);
    if (!result) return;
    const answers = await Answer.findByAuditId(req.params.id);
    
    res.json({
      success: true,
      count: answers.length,
      data: answers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Enregistre les KPIs d'un audit.
 * @route POST /api/audits/:id/kpis
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const saveKPIs = async (req, res, next) => {
  try {
    const result = await ensureAuditAccess(req, res, { write: true });
    if (!result) return;
    const { kpis } = req.body;
    
    if (!Array.isArray(kpis)) {
      return res.status(400).json({ 
        error: 'Format invalide',
        message: 'Les KPIs doivent être un tableau' 
      });
    }

    const savedKPIs = await KPI.bulkUpsert(req.params.id, kpis);
    
    res.json({
      success: true,
      message: 'KPIs enregistrés avec succès',
      data: savedKPIs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Enregistre les scores d'un audit.
 * @route POST /api/audits/:id/scores
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const saveScores = async (req, res, next) => {
  try {
    const result = await ensureAuditAccess(req, res, { write: true });
    if (!result) return;
    const { scores } = req.body;
    
    if (!Array.isArray(scores)) {
      return res.status(400).json({ 
        error: 'Format invalide',
        message: 'Les scores doivent être un tableau' 
      });
    }

    const savedScores = await Score.bulkUpsert(req.params.id, scores);
    
    res.json({
      success: true,
      message: 'Scores enregistrés avec succès',
      data: savedScores
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Récupère le score global d'un audit.
 * @route GET /api/audits/:id/global-score
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const getGlobalScore = async (req, res, next) => {
  try {
    const result = await ensureAuditAccess(req, res);
    if (!result) return;
    const globalScore = await Score.getGlobalScore(req.params.id);
    
    if (!globalScore) {
      return res.status(404).json({ 
        error: 'Scores non trouvés',
        message: 'Aucun score n\'a été calculé pour cet audit' 
      });
    }

    res.json({
      success: true,
      data: globalScore
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Enregistre les recommandations d'un audit.
 * @route POST /api/audits/:id/recommendations
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const saveRecommendations = async (req, res, next) => {
  try {
    const result = await ensureAuditAccess(req, res, { write: true });
    if (!result) return;
    const { recommendations } = req.body;
    
    if (!Array.isArray(recommendations)) {
      return res.status(400).json({ 
        error: 'Format invalide',
        message: 'Les recommandations doivent être un tableau' 
      });
    }

    const savedRecs = await Recommendation.bulkCreate(req.params.id, recommendations);
    
    res.json({
      success: true,
      message: 'Recommandations enregistrées avec succès',
      data: savedRecs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Récupère les recommandations d'un audit.
 * @route GET /api/audits/:id/recommendations
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const getRecommendations = async (req, res, next) => {
  try {
    const result = await ensureAuditAccess(req, res);
    if (!result) return;
    const recommendations = await Recommendation.findByAuditId(req.params.id);
    
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

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
