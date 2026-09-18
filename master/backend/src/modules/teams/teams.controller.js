const Team = require('../../database/models/Team');

// @route GET /api/teams
// @access Private
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('members.user', 'username email firstName lastName role')
      .sort({ createdAt: -1 });

    res.status(200).json(teams);
  } catch (error) {
    console.error('getAllTeams error:', error);
    res.status(500).json({ message: 'Server error retrieving teams' });
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
    ).populate('members.user', 'username email firstName lastName');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

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
  createTeam,
  addMemberToTeam,
  deleteTeam,
};
