const express = require('express');
const router = express.Router();
const contentsController = require('./contents.controller');
const { verifyToken, verifyRole } = require('../../middleware/auth');

router.use(verifyToken);

router.post('/', contentsController.createContent);
router.get('/', contentsController.getAllContents);
router.get('/:id', contentsController.getContentById);
router.patch('/:id', contentsController.updateContent);

// Status and Review Workflows (Workflow RBAC enforced in controller/service)
router.patch('/:id/status', contentsController.updateContentStatus);
router.post('/:id/review', verifyRole(['ADMIN', 'MANAGER']), contentsController.submitReview);

// Versioning & Assets
router.post('/:id/versions', contentsController.addContentVersion);

// Deletion
router.delete('/:id', verifyRole(['ADMIN', 'MANAGER']), contentsController.deleteContent);

module.exports = router;

