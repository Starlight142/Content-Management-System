const Team = require('../../database/models/Team');
const User = require('../../database/models/User');
const Task = require('../../database/models/Task');
const Content = require('../../database/models/Content');
const TeamActivity = require('../../database/models/TeamActivity');
const teamService = require('../../services/team.service');

// @route GET /api/teams
// @access Private
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('members.user', 'username email firstName lastName position role workingStatus isOnline lastActiveAt')
      .sort({ createdAt: -1 });

    res.status(200).json(teams);
  } catch (error) {
    console.error('getAllTeams error:', error);
    res.status(500).json({ message: 'Server error retrieving teams' });
  }
};

// @route GET /api/teams/my-team or /api/teams/my
// @access Private
const getMyTeam = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    let team = await Team.findOne({ 'members.user': userId })
      .populate('members.user', 'username email firstName lastName position role workingStatus isOnline lastActiveAt');

    if (!team) {
      const user = await User.findById(userId);
      if (user && user.teamId) {
        team = await Team.findById(user.teamId)
          .populate('members.user', 'username email firstName lastName position role workingStatus isOnline lastActiveAt');
      }
    }

    if (!team) {
      if (req.user.role === 'ADMIN' || req.user.role === 'MANAGER') {
        team = await Team.findOne()
          .populate('members.user', 'username email firstName lastName position role workingStatus isOnline lastActiveAt');
      }
    }

    if (!team) {
      return res.status(404).json({ message: 'No team workspace found for this user' });
    }

    res.status(200).json(team);
  } catch (error) {
    console.error('getMyTeam error:', error);
    res.status(500).json({ message: 'Server error retrieving user team' });
  }
};

// @route POST /api/teams/join
// @access Private
const joinTeam = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { joinCode } = req.body;

    const result = await teamService.joinTeamByCode(userId, joinCode);
    res.status(200).json(result);
  } catch (error) {
    console.error('joinTeam error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// @route POST /api/teams/:id/regenerate-code
// @access Private (Manager/Admin)
const regenerateCode = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;
    const userRole = req.user.role;

    const result = await teamService.regenerateJoinCode(id, userId, userRole);
    res.status(200).json({
      message: 'สร้างรหัสเข้าร่วมทีมใหม่สำเร็จ',
      ...result,
    });
  } catch (error) {
    console.error('regenerateCode error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// @route GET /api/teams/:teamId/dashboard
// @access Private (Team Member or Admin)
const getTeamDashboard = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.userId || req.user.id;

    const dashboard = await teamService.getTeamDashboard(teamId, userId);
    res.status(200).json(dashboard);
  } catch (error) {
    console.error('getTeamDashboard error:', error.message);
    res.status(500).json({ message: error.message || 'Server error retrieving team dashboard' });
  }
};

// @route GET /api/teams/:teamId/tasks
// @access Private (Team Member or Admin)
const getTeamTasks = async (req, res) => {
  try {
    const { teamId } = req.params;
    const tasks = await Task.find({ teamId })
      .populate('contentId', 'title platform status progress')
      .populate('assignedTo', 'username firstName lastName position workingStatus')
      .sort({ dueDate: 1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('getTeamTasks error:', error);
    res.status(500).json({ message: 'Server error retrieving team tasks' });
  }
};

// @route GET /api/teams/:teamId/contents
// @access Private (Team Member or Admin)
const getTeamContents = async (req, res) => {
  try {
    const { teamId } = req.params;
    const contents = await Content.find({ teamId })
      .populate('createdBy', 'username firstName lastName position')
      .sort({ createdAt: -1 });

    res.status(200).json(contents);
  } catch (error) {
    console.error('getTeamContents error:', error);
    res.status(500).json({ message: 'Server error retrieving team contents' });
  }
};

// @route GET /api/teams/:teamId/activity
// @access Private (Team Member or Admin)
const getTeamActivity = async (req, res) => {
  try {
    const { teamId } = req.params;
    const activities = await TeamActivity.find({ teamId })
      .populate('actor', 'username firstName lastName position role')
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json(activities);
  } catch (error) {
    console.error('getTeamActivity error:', error);
    res.status(500).json({ message: 'Server error retrieving team activities' });
  }
};

// @route GET /api/teams/:teamId/members
// @access Private (Team Member or Admin)
const getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId)
      .populate('members.user', 'username email firstName lastName position role workingStatus isOnline lastActiveAt');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json(team.members || []);
  } catch (error) {
    console.error('getTeamMembers error:', error);
    res.status(500).json({ message: 'Server error retrieving team members' });
  }
};

// @route POST /api/teams
// @access Private (Admin/Manager)
const createTeam = async (req, res) => {
  try {
    const { name, description, code } = req.body;
    const leaderId = req.user.userId || req.user.id;

    const newTeam = await teamService.createTeam({
      name,
      description,
      leaderId,
      code,
    });

    res.status(201).json({ message: 'Team created successfully', team: newTeam });
  } catch (error) {
    console.error('createTeam error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// @route POST /api/teams/:id/members
// @access Private (Admin/Manager)
const addMemberToTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, roleInTeam } = req.body;

    const team = await Team.findByIdAndUpdate(
      id,
      { $push: { members: { user: userId, roleInTeam: roleInTeam || 'MEMBER' } } },
      { new: true }
    ).populate('members.user', 'username email firstName lastName position workingStatus');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    await User.findByIdAndUpdate(userId, { teamId: id });

    res.status(200).json({ message: 'Member added to team', team });
  } catch (error) {
    console.error('addMemberToTeam error:', error);
    res.status(500).json({ message: 'Server error adding member to team' });
  }
};

// @route DELETE /api/teams/:id
// @access Private (Admin)
const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findByIdAndDelete(id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('deleteTeam error:', error);
    res.status(500).json({ message: 'Server error deleting team' });
  }
};

module.exports = {
  getAllTeams,
  getMyTeam,
  joinTeam,
  regenerateCode,
  getTeamDashboard,
  getTeamTasks,
  getTeamContents,
  getTeamActivity,
  getTeamMembers,
  createTeam,
  addMemberToTeam,
  deleteTeam,
};
