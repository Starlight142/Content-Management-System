const express = require('express');
const router = express.Router();
const teamsController = require('./teams.controller');
const { verifyToken, verifyRole, verifyTeamAccess } = require('../../middleware/auth');

router.use(verifyToken);

// All logged-in users can fetch their own team
router.get('/my-team', teamsController.getMyTeam);

// All logged-in users can list all teams (metadata)
router.get('/', teamsController.getAllTeams);

// Team-level workspace routes (Guarded by verifyTeamAccess)
router.get('/:teamId/dashboard', verifyTeamAccess, teamsController.getTeamDashboard);
router.get('/:teamId/tasks', verifyTeamAccess, teamsController.getTeamTasks);
router.get('/:teamId/contents', verifyTeamAccess, teamsController.getTeamContents);
router.get('/:teamId/activity', verifyTeamAccess, teamsController.getTeamActivity);
router.get('/:teamId/members', verifyTeamAccess, teamsController.getTeamMembers);

// Only Admin/Manager can create teams or add members
router.post('/', verifyRole(['ADMIN', 'MANAGER']), teamsController.createTeam);
router.post('/:id/members', verifyRole(['ADMIN', 'MANAGER']), teamsController.addMemberToTeam);
router.delete('/:id', verifyRole(['ADMIN']), teamsController.deleteTeam);

module.exports = router;
