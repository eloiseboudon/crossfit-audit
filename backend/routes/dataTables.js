/**
 * @module routes/dataTables
 * @description Routes d'exploration des tables de la base de données.
 */

const express = require('express');
const router = express.Router();
const { listDataTables, getDataTable } = require('../controllers/dataTablesController');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);

router.route('/')
  .get(listDataTables);

router.route('/:name')
  .get(getDataTable);

module.exports = router;
