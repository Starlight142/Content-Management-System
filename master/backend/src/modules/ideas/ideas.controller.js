const Idea = require('../../database/models/Idea');

// @route GET /api/ideas
// @access Private
const getAllIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find()
      .populate('proposedBy', 'username email firstName lastName role')
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
    const { title, description, category } = req.body;
    const proposedBy = req.user.userId;

    const newIdea = await Idea.create({
      title,
      description,
      category: category || 'General',
      proposedBy,
      status: 'DRAFT',
    });

    const populated = await newIdea.populate('proposedBy', 'username email firstName lastName');

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

    const idea = await Idea.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('proposedBy', 'username email');

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    res.status(200).json({ message: 'Idea status updated', idea });
  } catch (error) {
    console.error('updateIdeaStatus error:', error);
    res.status(500).json({ message: 'Server error updating idea status' });
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
};
