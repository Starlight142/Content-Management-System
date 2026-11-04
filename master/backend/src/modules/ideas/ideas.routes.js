const express = require('express');
const router = express.Router();
const ideasController = require('./ideas.controller');
const { verifyToken, verifyRole } = require('../../middleware/auth');

router.use(verifyToken);

// Anyone can view, propose, and upvote ideas
router.get('/', ideasController.getAllIdeas);
router.post('/', ideasController.createIdea);
router.post('/:id/upvote', ideasController.upvoteIdea);

// Only Managers and Admins can update idea status; delete is allowed for Admin, Manager, or Topic Creator
router.patch('/:id/status', verifyRole(['ADMIN', 'MANAGER']), ideasController.updateIdeaStatus);
router.delete('/:id', ideasController.deleteIdea);

module.exports = router;


