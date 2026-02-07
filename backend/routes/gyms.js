/**
 * @module routes/gyms
 * @description Routes CRUD des salles et gestion des accès utilisateurs.
 */

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
const { requireGymAccess } = require('../middleware/gymAccessMiddleware');
const { createGymValidation, updateGymValidation, gymAccessValidation } = require('../validators/gymValidator');
const { validateRequest } = require('../validators/validateRequest');

// Lecture possible sans authentification
router.use(optionalAuth);

router.route('/')
  .get(getGyms)
  .post(auth, createGymValidation, validateRequest, createGym);

router.route('/:id')
  .get(requireGymAccess({ paramKey: 'id' }), getGym)
  .put(auth, requireGymAccess({ write: true, paramKey: 'id' }), updateGymValidation, validateRequest, updateGym)
  .delete(auth, requireGymAccess({ write: true, paramKey: 'id' }), deleteGym);

router.route('/:id/access')
  .post(auth, requireGymAccess({ paramKey: 'id' }), gymAccessValidation, validateRequest, addGymAccess);

router.route('/:id/access/:userId')
  .delete(auth, requireGymAccess({ paramKey: 'id' }), removeGymAccess);

module.exports = router;
