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
const { auth, optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);

router.route('/')
  .get(getMarketBenchmarks)
  .post(auth, createMarketBenchmark);

router.route('/:id')
  .put(auth, updateMarketBenchmark);

module.exports = router;
