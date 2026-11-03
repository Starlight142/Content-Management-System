const express = require('express');
const router = express.Router();
const ideasController = require('./ideas.controller');
const { verifyToken, verifyRole } = require('../../middleware/auth');

router.use(verifyToken);

// Anyone can view, propose, and upvote ideas
router.get('/', ideasController.getAllIdeas);
router.post('/', ideasController.createIdea);
router.post('/:id/upvote', ideasController.upvoteIdea);

// Only Managers and Admins can update idea status or delete ideas
router.patch('/:id/status', verifyRole(['ADMIN', 'MANAGER']), ideasController.updateIdeaStatus);
router.delete('/:id', verifyRole(['ADMIN', 'MANAGER']), ideasController.deleteIdea);

module.exports = router;


