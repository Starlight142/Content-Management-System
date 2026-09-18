const express = require('express');
const router = express.Router();
const legalController = require('./legal.controller');
const { verifyToken, verifyRole } = require('../../middleware/auth');

router.use(verifyToken);

router.get('/', legalController.getAllArticles);
router.post('/', verifyRole(['ADMIN']), legalController.createArticle);
router.patch('/:id', verifyRole(['ADMIN']), legalController.updateArticle);
router.delete('/:id', verifyRole(['ADMIN']), legalController.deleteArticle);

module.exports = router;

