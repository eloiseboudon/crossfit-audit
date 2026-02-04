const MarketBenchmark = require('../models/MarketBenchmark');
const ApiError = require('../utils/ApiError');

/**
 * @desc Récupère les benchmarks de marché.
 * @route GET /api/market-benchmarks
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const getMarketBenchmarks = async (req, res, next) => {
  try {
    const benchmarks = await MarketBenchmark.findAll();

    res.json({
      success: true,
      count: benchmarks.length,
      data: benchmarks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Crée un benchmark de marché.
 * @route POST /api/market-benchmarks
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const createMarketBenchmark = async (req, res, next) => {
  try {
    const { benchmark_code, name, value } = req.body;

    if (!benchmark_code || !name || value === undefined) {
      throw ApiError.badRequest('Le code, le nom et la valeur sont requis');
    }

    const existing = await MarketBenchmark.findByCode(benchmark_code);
    if (existing) {
      throw new ApiError(409, 'Un benchmark avec ce code existe déjà');
    }

    const created = await MarketBenchmark.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Benchmark créé avec succès',
      data: created
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Met à jour un benchmark de marché.
 * @route PUT /api/market-benchmarks/:id
 * @access Private
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const updateMarketBenchmark = async (req, res, next) => {
  try {
    const benchmark = await MarketBenchmark.findById(req.params.id);

    if (!benchmark) {
      throw ApiError.notFound('Ce benchmark n\'existe pas');
    }

    const updated = await MarketBenchmark.update(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Benchmark mis à jour avec succès',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMarketBenchmarks,
  createMarketBenchmark,
  updateMarketBenchmark
};
