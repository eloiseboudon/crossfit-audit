const express = require('express');
const router = express.Router();
const {
  getGyms,
  getGym,
  createGym,
  updateGym,
  deleteGym,
  addGymAccess,
  removeGymAccess
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

router.route('/:id/access')
  .post(addGymAccess);

router.route('/:id/access/:userId')
  .delete(removeGymAccess);

module.exports = router;
