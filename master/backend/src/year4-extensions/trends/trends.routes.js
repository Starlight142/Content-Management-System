const express = require('express');
const router = express.Router();
const trendsController = require('./trends.controller');
const { verifyToken, verifyRole } = require('../../middleware/auth');

router.use(verifyToken);
router.use(verifyRole(['ADMIN', 'MANAGER']));

router.get('/', trendsController.getTrendingTopics);

module.exports = router;

