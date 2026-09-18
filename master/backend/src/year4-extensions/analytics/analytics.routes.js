const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const { verifyToken, verifyRole } = require('../../middleware/auth');

router.use(verifyToken);
router.use(verifyRole(['ADMIN', 'MANAGER']));

router.get('/overview', analyticsController.getAnalyticsOverview);

module.exports = router;

