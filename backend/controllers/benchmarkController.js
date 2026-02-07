const MarketBenchmark = require('../models/MarketBenchmark');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc Récupère les benchmarks de marché.
 * @route GET /api/market-benchmarks
 * @access Private
 */
const getMarketBenchmarks = asyncHandler(async (req, res) => {
  const benchmarks = await MarketBenchmark.findAll();

  res.json({
    success: true,
    count: benchmarks.length,
    data: benchmarks
  });
});

/**
 * @desc Crée un benchmark de marché.
 * @route POST /api/market-benchmarks
 * @access Private
 */
const createMarketBenchmark = asyncHandler(async (req, res) => {
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
});

/**
 * @desc Met à jour un benchmark de marché.
 * @route PUT /api/market-benchmarks/:id
 * @access Private
 */
const updateMarketBenchmark = asyncHandler(async (req, res) => {
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
});

module.exports = {
  getMarketBenchmarks,
  createMarketBenchmark,
  updateMarketBenchmark
};
