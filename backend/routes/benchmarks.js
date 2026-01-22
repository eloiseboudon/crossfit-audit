const express = require('express');
const router = express.Router();
const {
  getMarketBenchmarks,
  createMarketBenchmark,
  updateMarketBenchmark
} = require('../controllers/benchmarkController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.route('/')
  .get(getMarketBenchmarks)
  .post(createMarketBenchmark);

router.route('/:id')
  .put(updateMarketBenchmark);

module.exports = router;
