const express = require('express');
const router = express.Router();
const ideasController = require('./ideas.controller');
const { verifyToken } = require('../../middleware/auth');

router.use(verifyToken);

// Anyone can view and propose ideas
router.get('/', ideasController.getAllIdeas);
router.post('/', ideasController.createIdea);

module.exports = router;

