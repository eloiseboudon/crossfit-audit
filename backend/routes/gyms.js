const express = require('express');
const router = express.Router();
const {
  getGyms,
  getGym,
  createGym,
  updateGym,
  deleteGym
} = require('../controllers/gymController');
const { auth } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification
router.use(auth);

router.route('/')
  .get(getGyms)
  .post(createGym);

router.route('/:id')
  .get(getGym)
  .put(updateGym)
  .delete(deleteGym);

module.exports = router;
