const MarketBenchmark = require('../models/MarketBenchmark');

// @desc    Get all market benchmarks
// @route   GET /api/market-benchmarks
// @access  Private
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

// @desc    Create market benchmark
// @route   POST /api/market-benchmarks
// @access  Private
const createMarketBenchmark = async (req, res, next) => {
  try {
    const { benchmark_code, name, value } = req.body;

    if (!benchmark_code || !name || value === undefined) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Le code, le nom et la valeur sont requis'
      });
    }

    const existing = await MarketBenchmark.findByCode(benchmark_code);
    if (existing) {
      return res.status(409).json({
        error: 'Benchmark déjà existant',
        message: 'Un benchmark avec ce code existe déjà'
      });
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

// @desc    Update market benchmark
// @route   PUT /api/market-benchmarks/:id
// @access  Private
const updateMarketBenchmark = async (req, res, next) => {
  try {
    const benchmark = await MarketBenchmark.findById(req.params.id);

    if (!benchmark) {
      return res.status(404).json({
        error: 'Benchmark non trouvé',
        message: 'Ce benchmark n\'existe pas'
      });
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
