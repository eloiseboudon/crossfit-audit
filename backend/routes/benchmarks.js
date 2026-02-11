/**
 * @module routes/benchmarks
 * @description Routes des benchmarks de marché : lecture, création et mise à jour.
 */

const express = require('express');
const router = express.Router();
const {
  getMarketBenchmarks,
  createMarketBenchmark,
  updateMarketBenchmark
} = require('../controllers/benchmarkController');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);

router.route('/')
  .get(getMarketBenchmarks)
  .post(createMarketBenchmark);

router.route('/:id')
  .put(updateMarketBenchmark);

module.exports = router;
