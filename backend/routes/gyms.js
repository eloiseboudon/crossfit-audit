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
const { auth, optionalAuth } = require('../middleware/auth');

// Lecture possible sans authentification
router.use(optionalAuth);

router.route('/')
  .get(getGyms)
  .post(auth, createGym);

router.route('/:id')
  .get(getGym)
  .put(auth, updateGym)
  .delete(auth, deleteGym);

router.route('/:id/access')
  .post(auth, addGymAccess);

router.route('/:id/access/:userId')
  .delete(auth, removeGymAccess);

module.exports = router;
