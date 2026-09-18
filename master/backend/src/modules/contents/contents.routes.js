const express = require('express');
const router = express.Router();
const contentsController = require('./contents.controller');
const { verifyToken, verifyRole } = require('../../middleware/auth');

router.use(verifyToken);

router.post('/', contentsController.createContent);
router.get('/', contentsController.getAllContents);
router.get('/:id', contentsController.getContentById);

// Status and Review Workflows (Admin / Manager)
router.patch('/:id/status', verifyRole(['ADMIN', 'MANAGER']), contentsController.updateContentStatus);
router.put('/:id/legal-check', verifyRole(['ADMIN', 'MANAGER']), contentsController.updateLegalChecklist);
router.post('/:id/review', verifyRole(['ADMIN', 'MANAGER']), contentsController.submitReview);

// Versioning & Assets
router.post('/:id/versions', contentsController.addContentVersion);

// Deletion
router.delete('/:id', verifyRole(['ADMIN', 'MANAGER']), contentsController.deleteContent);

module.exports = router;

