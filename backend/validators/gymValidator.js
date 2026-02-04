const { body } = require('express-validator');
const { ACCESS_LEVELS } = require('../constants');

const createGymValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ max: 255 })
    .withMessage('Le nom ne doit pas dépasser 255 caractères'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ville ne doit pas dépasser 100 caractères'),
];

const updateGymValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Le nom ne peut pas être vide')
    .isLength({ max: 255 })
    .withMessage('Le nom ne doit pas dépasser 255 caractères'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ville ne doit pas dépasser 100 caractères'),
];

const gymAccessValidation = [
  body('access_level')
    .notEmpty()
    .withMessage('Le niveau d\'accès est requis')
    .isIn([ACCESS_LEVELS.READ, ACCESS_LEVELS.WRITE])
    .withMessage('Le niveau d\'accès doit être "read" ou "write"'),
  body('user_id')
    .optional()
    .isString()
    .withMessage('L\'ID utilisateur doit être une chaîne'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('L\'email doit être valide')
];

module.exports = {
  createGymValidation,
  updateGymValidation,
  gymAccessValidation
};
