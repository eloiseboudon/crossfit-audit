const Audit = require('../models/Audit');
const Gym = require('../models/Gym');
const Answer = require('../models/Answer');
const { KPI, Score, Recommendation } = require('../models/AuditData');

// @desc    Get all audits
// @route   GET /api/audits
// @access  Private
const getAudits = async (req, res, next) => {
  try {
    const { gym_id } = req.query;
    const audits = await Audit.findAll(gym_id);
    
    res.json({
      success: true,
      count: audits.length,
      data: audits
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single audit
// @route   GET /api/audits/:id
// @access  Private
const getAudit = async (req, res, next) => {
  try {
    const audit = await Audit.findById(req.params.id);
    
    if (!audit) {
      return res.status(404).json({ 
        error: 'Audit non trouvé',
        message: 'Cet audit n\'existe pas' 
      });
    }

    res.json({
      success: true,
      data: audit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete audit with all data
// @route   GET /api/audits/:id/complete
// @access  Private
const getCompleteAudit = async (req, res, next) => {
  try {
    const audit = await Audit.getComplete(req.params.id);
    
    if (!audit) {
      return res.status(404).json({ 
        error: 'Audit non trouvé',
        message: 'Cet audit n\'existe pas' 
      });
    }

    res.json({
      success: true,
      data: audit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new audit
// @route   POST /api/audits
// @access  Private
const createAudit = async (req, res, next) => {
  try {
    const { gym_id } = req.body;
    
    if (!gym_id) {
      return res.status(400).json({ 
        error: 'Données manquantes',
        message: 'L\'ID de la salle est requis' 
      });
    }

    // Vérifier que la gym existe
    const gym = await Gym.findById(gym_id);
    if (!gym) {
      return res.status(404).json({ 
        error: 'Gym non trouvée',
        message: 'Cette salle n\'existe pas' 
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

// @desc    Update audit
// @route   PUT /api/audits/:id
// @access  Private
const updateAudit = async (req, res, next) => {
  try {
    const audit = await Audit.findById(req.params.id);
    
    if (!audit) {
      return res.status(404).json({ 
        error: 'Audit non trouvé',
        message: 'Cet audit n\'existe pas' 
      });
    }

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

// @desc    Delete audit
// @route   DELETE /api/audits/:id
// @access  Private
const deleteAudit = async (req, res, next) => {
  try {
    const audit = await Audit.findById(req.params.id);
    
    if (!audit) {
      return res.status(404).json({ 
        error: 'Audit non trouvé',
        message: 'Cet audit n\'existe pas' 
      });
    }

    await Audit.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Audit supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save audit answers
// @route   POST /api/audits/:id/answers
// @access  Private
const saveAnswers = async (req, res, next) => {
  try {
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

// @desc    Get audit answers
// @route   GET /api/audits/:id/answers
// @access  Private
const getAnswers = async (req, res, next) => {
  try {
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

// @desc    Save audit KPIs
// @route   POST /api/audits/:id/kpis
// @access  Private
const saveKPIs = async (req, res, next) => {
  try {
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

// @desc    Save audit scores
// @route   POST /api/audits/:id/scores
// @access  Private
const saveScores = async (req, res, next) => {
  try {
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

// @desc    Get audit global score
// @route   GET /api/audits/:id/global-score
// @access  Private
const getGlobalScore = async (req, res, next) => {
  try {
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

// @desc    Save audit recommendations
// @route   POST /api/audits/:id/recommendations
// @access  Private
const saveRecommendations = async (req, res, next) => {
  try {
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

// @desc    Get audit recommendations
// @route   GET /api/audits/:id/recommendations
// @access  Private
const getRecommendations = async (req, res, next) => {
  try {
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
