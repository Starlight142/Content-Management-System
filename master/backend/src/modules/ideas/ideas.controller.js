const Idea = require('../../database/models/Idea');
const TeamActivity = require('../../database/models/TeamActivity');

// @route GET /api/ideas
// @access Private
const getAllIdeas = async (req, res) => {
  try {
    const filter = {};
    if (req.query.teamId) {
      filter.teamId = req.query.teamId;
    } else if (req.user?.role !== 'ADMIN' && req.user?.teamId) {
      filter.$or = [
        { teamId: req.user.teamId },
        { teamId: null },
        { teamId: { $exists: false } },
      ];
    }

    const ideas = await Idea.find(filter)
      .populate('proposedBy', 'username email firstName lastName role')
      .populate('teamId', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json(ideas);
  } catch (error) {
    console.error('getAllIdeas error:', error);
    res.status(500).json({ message: 'Server error retrieving ideas' });
  }
};

// @route POST /api/ideas
// @access Private
const createIdea = async (req, res) => {
  try {
    const { title, description, category, platform, teamId } = req.body;
    if (!title || String(title).trim() === '') {
      return res.status(400).json({ message: 'กรุณาระบุหัวข้อไอเดีย (Idea title is required)' });
    }
    const proposedBy = req.user.userId;
    const resolvedTeamId = teamId || req.user?.teamId || null;

    const newIdea = await Idea.create({
      title,
      description: description || '',
      category: category || 'General',
      platform: platform || 'YouTube',
      proposedBy,
      teamId: resolvedTeamId,
      status: 'DRAFT',
    });

    const populated = await newIdea.populate([
      { path: 'proposedBy', select: 'username email firstName lastName role' },
      { path: 'teamId', select: 'name code' },
    ]);

    // Non-fatally log TeamActivity
    try {
      await TeamActivity.create({
        teamId: resolvedTeamId,
        actor: proposedBy,
        actionType: 'IDEA_PROPOSED',
        title: `เสนอไอเดียใหม่: ${title}`,
        details: `หมวดหมู่: ${category || 'General'} | แพลตฟอร์ม: ${platform || 'YouTube'}`,
        entityId: newIdea._id,
        entityModel: 'Idea',
      });
    } catch (logErr) {
      console.warn('Logging idea proposed activity failed:', logErr.message);
    }

    res.status(201).json({ message: 'Idea created successfully', idea: populated });
  } catch (error) {
    console.error('createIdea error:', error);
    res.status(500).json({ message: 'Server error creating idea', error: error.message });
  }
};

// @route PATCH /api/ideas/:id/status
// @access Private (Manager/Admin)
const updateIdeaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // DRAFT, APPROVED, REJECTED

    if (!status || !['DRAFT', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        message: 'สถานะไม่ถูกต้อง ต้องเป็นหนึ่งใน: DRAFT, APPROVED, REJECTED',
      });
    }

    const idea = await Idea.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('proposedBy', 'username email firstName lastName role')
      .populate('teamId', 'name code');

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    res.status(200).json({ message: 'Idea status updated', idea });
  } catch (error) {
    console.error('updateIdeaStatus error:', error);
    res.status(500).json({ message: 'Server error updating idea status' });
  }
};

// @route POST /api/ideas/:id/upvote
// @access Private
const upvoteIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const idea = await Idea.findByIdAndUpdate(
      id,
      { $inc: { upvotes: 1 } },
      { new: true }
    )
      .populate('proposedBy', 'username email firstName lastName role')
      .populate('teamId', 'name code');

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    res.status(200).json({ message: 'Idea upvoted successfully', idea });
  } catch (error) {
    console.error('upvoteIdea error:', error);
    res.status(500).json({ message: 'Server error upvoting idea' });
  }
};

// @route DELETE /api/ideas/:id
// @access Private (Manager/Admin)
const deleteIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const idea = await Idea.findByIdAndDelete(id);

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    res.status(200).json({ message: 'Idea deleted successfully' });
  } catch (error) {
    console.error('deleteIdea error:', error);
    res.status(500).json({ message: 'Server error deleting idea' });
  }
};

module.exports = {
  getAllIdeas,
  createIdea,
  updateIdeaStatus,
  deleteIdea,
  upvoteIdea,
};
