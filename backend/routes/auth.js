const express = require('express');
const router = express.Router();
const { register, login, getMe, updatePassword } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Routes privées
router.get('/me', auth, getMe);
router.put('/password', auth, updatePassword);

module.exports = router;
