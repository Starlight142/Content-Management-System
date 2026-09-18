const express = require('express');
const router = express.Router();
const tasksController = require('./tasks.controller');
const { verifyToken, verifyRole } = require('../../middleware/auth');

router.use(verifyToken);

router.get('/', tasksController.getAllTasks);

// Manager/Admin assign tasks
router.post('/', verifyRole(['ADMIN', 'MANAGER']), tasksController.createTask);

// Members update their task status
router.patch('/:id/status', tasksController.updateTaskStatus);

module.exports = router;

