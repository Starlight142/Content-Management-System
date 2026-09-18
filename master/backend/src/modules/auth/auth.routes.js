const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { verifyToken } = require('../../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Example of a protected route to test JWT
router.get('/me', verifyToken, (req, res) => {
  res.json({ message: 'You have access to this protected route!', user: req.user });
});

module.exports = router;

