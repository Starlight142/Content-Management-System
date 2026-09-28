const express = require('express');
const router = express.Router();
const logsController = require('./logs.controller');
const { verifyToken, verifyRole } = require('../../middleware/auth');

router.use(verifyToken);

// All authenticated admins/managers can view logs
router.get('/', verifyRole(['ADMIN', 'MANAGER']), logsController.getAllLogs);

// Admin can purge / clear logs
router.delete('/', verifyRole(['ADMIN']), logsController.clearLogs);

// Internal/Admin manual log entry creation
router.post('/', verifyRole(['ADMIN', 'MANAGER']), logsController.createLog);

module.exports = router;
