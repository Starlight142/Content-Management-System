const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const { verifyToken, verifyRole } = require('../../middleware/auth');

// Only logged-in users can access these routes
router.use(verifyToken);

// Real-time online users
router.get('/online', usersController.getOnlineUsers);

// Admin or Manager can get all users
router.get('/', verifyRole(['ADMIN', 'MANAGER']), usersController.getAllUsers);

// Create user
router.post('/', verifyRole(['ADMIN', 'MANAGER']), usersController.createUser);

// Any authenticated user can get a specific user profile
router.get('/:id', usersController.getUserById);

// Admin operations
router.patch('/:id/role', verifyRole(['ADMIN']), usersController.updateUserRole);
router.delete('/:id', verifyRole(['ADMIN']), usersController.deleteUser);

module.exports = router;
