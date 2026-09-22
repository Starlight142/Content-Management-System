const Team = require('../../database/models/Team');
const User = require('../../database/models/User');
const Task = require('../../database/models/Task');
const Content = require('../../database/models/Content');
const TeamActivity = require('../../database/models/TeamActivity');

// @route GET /api/teams
// @access Private
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('members.user', 'username email firstName lastName role workingStatus')
      .sort({ createdAt: -1 });

    res.status(200).json(teams);
  } catch (error) {
    console.error('getAllTeams error:', error);
    res.status(500).json({ message: 'Server error retrieving teams' });
  }
};

// @route GET /api/teams/my-team
// @access Private
const getMyTeam = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    // Find team where user is a member
    let team = await Team.findOne({ 'members.user': userId })
      .populate('members.user', 'username email firstName lastName role workingStatus');

    if (!team) {
      // Fallback: check if user has teamId
      const user = await User.findById(userId);
      if (user && user.teamId) {
        team = await Team.findById(user.teamId)
          .populate('members.user', 'username email firstName lastName role workingStatus');
      }
    }

    if (!team) {
      // If still not found and user is admin or manager, return first available team
      if (req.user.role === 'ADMIN' || req.user.role === 'MANAGER') {
        team = await Team.findOne()
          .populate('members.user', 'username email firstName lastName role workingStatus');
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

// @route GET /api/teams/:teamId/dashboard
// @access Private (Team Member or Admin)
const getTeamDashboard = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.userId || req.user.id;

    const team = await Team.findById(teamId)
      .populate('members.user', 'username email firstName lastName role workingStatus');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Tasks stats
    const teamTasks = await Task.find({ teamId })
      .populate('contentId', 'title platform status progress')
      .populate('assignedTo', 'username firstName lastName workingStatus')
      .sort({ dueDate: 1 });

    const myTasks = teamTasks.filter(
      (t) => t.assignedTo && t.assignedTo._id.toString() === userId.toString()
    );

    const inProgressTasks = teamTasks.filter((t) => t.status === 'IN_PROGRESS');
    const reviewTasks = teamTasks.filter((t) => t.status === 'REVIEW');
    const doneTasks = teamTasks.filter((t) => t.status === 'DONE');

    // Calculate team progress percentage
    let teamProgress = 0;
    if (teamTasks.length > 0) {
      const totalProgress = teamTasks.reduce((acc, curr) => acc + (curr.progress || 0), 0);
      teamProgress = Math.round(totalProgress / teamTasks.length);
    }

    // Active members
    const activeMembers = (team.members || [])
      .map((m) => m.user)
      .filter((u) => u && (u.workingStatus === 'WORKING' || u.workingStatus === 'REVIEWING'));

    // Recent activity
    const recentActivities = await TeamActivity.find({ teamId })
      .populate('actor', 'username firstName lastName role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      team: {
        _id: team._id,
        name: team.name,
        description: team.description,
        totalMembers: team.members ? team.members.length : 0,
      },
      members: (team.members || []).map((m) => ({
        _id: m.user?._id,
        username: m.user?.username,
        firstName: m.user?.firstName,
        lastName: m.user?.lastName,
        role: m.user?.role,
        roleInTeam: m.roleInTeam,
        workingStatus: m.user?.workingStatus || 'IDLE',
      })),
      stats: {
        myTasksCount: myTasks.length,
        teamTasksCount: teamTasks.length,
        inProgressCount: inProgressTasks.length,
        reviewCount: reviewTasks.length,
        doneCount: doneTasks.length,
        teamProgress,
      },
      activeMembers: activeMembers.map((u) => ({
        _id: u._id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username,
        workingStatus: u.workingStatus,
      })),
      recentActivities,
      tasks: teamTasks,
    });
  } catch (error) {
    console.error('getTeamDashboard error:', error);
    res.status(500).json({ message: 'Server error retrieving team dashboard' });
  }
};

// @route GET /api/teams/:teamId/tasks
// @access Private (Team Member or Admin)
const getTeamTasks = async (req, res) => {
  try {
    const { teamId } = req.params;
    const tasks = await Task.find({ teamId })
      .populate('contentId', 'title platform status progress')
      .populate('assignedTo', 'username firstName lastName workingStatus')
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
      .populate('createdBy', 'username firstName lastName')
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
      .populate('actor', 'username firstName lastName role')
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
      .populate('members.user', 'username email firstName lastName role workingStatus');

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
    const { name, description, members } = req.body;

    const newTeam = await Team.create({
      name,
      description,
      members: members || [],
    });

    res.status(201).json({ message: 'Team created successfully', team: newTeam });
  } catch (error) {
    console.error('createTeam error:', error);
    res.status(500).json({ message: 'Server error creating team', error: error.message });
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
    ).populate('members.user', 'username email firstName lastName workingStatus');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Also update user's teamId
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
  getTeamDashboard,
  getTeamTasks,
  getTeamContents,
  getTeamActivity,
  getTeamMembers,
  createTeam,
  addMemberToTeam,
  deleteTeam,
};
