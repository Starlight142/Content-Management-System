const express = require('express');
const router = express.Router();
const recController = require('./recommendations.controller');
const { verifyToken, verifyRole } = require('../../middleware/auth');

router.use(verifyToken);
router.use(verifyRole(['ADMIN', 'MANAGER']));

router.get('/schedule', recController.getPostingScheduleRecommendation);

module.exports = router;

