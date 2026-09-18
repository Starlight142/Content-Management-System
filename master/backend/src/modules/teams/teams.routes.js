const express = require('express');
const router = express.Router();
const teamsController = require('./teams.controller');
const { verifyToken, verifyRole } = require('../../middleware/auth');

router.use(verifyToken);

// All members can see teams
router.get('/', teamsController.getAllTeams);
// Only Admin/Manager can create teams
router.post('/', verifyRole(['ADMIN', 'MANAGER']), teamsController.createTeam);

module.exports = router;

