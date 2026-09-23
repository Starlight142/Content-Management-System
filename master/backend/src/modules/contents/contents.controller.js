const mongoose = require('mongoose');
const Content = require('../../database/models/Content');
const User = require('../../database/models/User');
const Team = require('../../database/models/Team');
const TeamActivity = require('../../database/models/TeamActivity');
const Task = require('../../database/models/Task');
const { broadcast } = require('../../services/presence.service');

// @route POST /api/contents
// @access Private
const createContent = async (req, res) => {
  try {
    const { ideaId, title, description, category, platform, dueDate, teamId } = req.body;
    let createdBy = req.user?.userId;

    if (!createdBy || !mongoose.Types.ObjectId.isValid(createdBy)) {
      const adminUser = await User.findOne({ role: 'ADMIN' }) || await User.findOne();
      createdBy = adminUser?._id;
    }

    let resolvedTeamId = teamId;
    if (!resolvedTeamId && createdBy) {
      const creator = await User.findById(createdBy);
      if (creator && creator.teamId) {
        resolvedTeamId = creator.teamId;
      }
    }

    if (!resolvedTeamId) {
      const defaultTeam = await Team.findOne();
      if (defaultTeam) {
        resolvedTeamId = defaultTeam._id;
      }
    }

    const newContent = await Content.create({
      title,
      description,
      category: category || 'General',
      platform: platform || 'TikTok',
      status: 'PLANNING',
      createdBy,
      teamId: resolvedTeamId || null,
      dueDate,
      ideaId: ideaId || null,
    });

    const populated = await newContent.populate('createdBy', 'username email firstName lastName');

    if (resolvedTeamId) {
      const creatorName = populated.createdBy?.firstName || req.user.username || 'Creator';
      await TeamActivity.create({
        teamId: resolvedTeamId,
        actor: createdBy,
        actionType: 'CONTENT_CREATED',
        title: `${creatorName} เพิ่มแผนคอนเทนต์ใหม่: "${title}"`,
        entityId: newContent._id,
        entityModel: 'Content',
      });
      broadcast('ACTIVITY_CREATED', { teamId: resolvedTeamId });
    }

    broadcast('CONTENT_CREATED', { content: populated });

    res.status(201).json({
      message: 'Content created successfully',
      content: populated,
    });
  } catch (error) {
    console.error('createContent error:', error);
    res.status(500).json({ message: 'Server error creating content', error: error.message });
  }
};

// @route GET /api/contents
// @access Private
const getAllContents = async (req, res) => {
  try {
    const contents = await Content.find()
      .populate('createdBy', 'username email firstName lastName')
      .populate('ideaId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(contents);
  } catch (error) {
    console.error('getAllContents error:', error);
    res.status(500).json({ message: 'Server error retrieving contents' });
  }
};

// @route GET /api/contents/:id
// @access Private
const getContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findById(id)
      .populate('createdBy', 'username email firstName lastName')
      .populate('ideaId', 'title');

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.status(200).json(content);
  } catch (error) {
    console.error('getContentById error:', error);
    res.status(500).json({ message: 'Server error retrieving content' });
  }
};

const ALLOWED_TRANSITIONS = {
  PLANNING: ['PRODUCTION'],
  PRODUCTION: ['REVIEW'],
  REVIEW: ['REVISION', 'APPROVED'],
  REVISION: ['PRODUCTION', 'REVIEW'],
  APPROVED: ['SCHEDULED', 'PUBLISHED'],
  SCHEDULED: ['PUBLISHED'],
  PUBLISHED: [],
};

// @route PATCH /api/contents/:id/status
// @access Private (Manager/Admin)
const updateContentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    if (content.status === status) {
      return res.status(200).json({ message: 'Status is unchanged', content });
    }

    // State Machine Validation Guard
    const allowed = ALLOWED_TRANSITIONS[content.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `State Machine Error: Invalid transition from '${content.status}' to '${status}'. Allowed next states: [${allowed.join(', ')}]`,
      });
    }

    // Legal Gatekeeper check when transitioning to APPROVED or PUBLISHED
    if (status === 'APPROVED' || status === 'PUBLISHED') {
      const isLegalPassed = content.legalChecklist?.length >= 3 && content.legalChecklist.every((i) => i.passed);
      if (!isLegalPassed) {
        return res.status(400).json({
          message: 'Legal Gatekeeper Blocked: All compliance checklist items must pass before approving or publishing.',
        });
      }
    }

    content.status = status;
    if (status === 'PUBLISHED') {
      content.publishedAt = new Date();
    }

    await content.save();
    const populated = await content.populate('createdBy', 'username email firstName lastName');

    broadcast('CONTENT_UPDATED', { content: populated });

    res.status(200).json({
      message: `Content status transitioned to ${status}`,
      content: populated,
    });
  } catch (error) {
    console.error('updateContentStatus error:', error);
    res.status(500).json({ message: 'Server error updating content status', error: error.message });
  }
};

// @route PUT /api/contents/:id/legal-check
// @access Private (Manager/Admin)
const updateLegalChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body; // array of items: [{ ruleTitle, passed, note }]

    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    let userId = req.user?.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      const admin = await User.findOne({ role: 'ADMIN' }) || await User.findOne();
      userId = admin?._id;
    }
    const checkedAt = new Date();

    if (Array.isArray(items)) {
      content.legalChecklist = items.map((item) => ({
        ruleTitle: item.ruleTitle,
        passed: Boolean(item.passed),
        note: item.note || '',
        checkedBy: userId,
        checkedAt: item.passed ? checkedAt : null,
      }));
    }

    await content.save();

    res.status(200).json({
      message: 'Legal checklist updated successfully',
      legalChecklist: content.legalChecklist,
      allPassed: content.legalChecklist.length >= 3 && content.legalChecklist.every((i) => i.passed),
    });
  } catch (error) {
    console.error('updateLegalChecklist error:', error);
    res.status(500).json({ message: 'Server error updating legal checklist' });
  }
};

// @route POST /api/contents/:id/review
// @access Private (Manager/Admin)
const submitReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, notes } = req.body;
    let reviewerId = req.user?.userId;
    if (!reviewerId || !mongoose.Types.ObjectId.isValid(reviewerId)) {
      const admin = await User.findOne({ role: { $in: ['ADMIN', 'MANAGER'] } }) || await User.findOne();
      reviewerId = admin?._id;
    }

    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    if (content.status !== 'REVIEW') {
      return res.status(400).json({
        message: `Content must be in REVIEW status before submitting review (current: ${content.status})`,
      });
    }

    if (decision === 'REVISION') {
      const revNote = (notes && notes.trim() !== '') ? notes.trim() : 'ส่งกลับแก้ไขตามข้อคิดเห็นของผู้จัดการ';
      content.status = 'REVISION';
      content.reviewHistory.push({
        reviewerId,
        decision: 'REVISION',
        notes: revNote,
        reviewedAt: new Date(),
      });

      // Synchronize associated tasks to REVISION
      await Task.updateMany(
        { contentId: content._id },
        { status: 'REVISION', notes: revNote, revisionNotes: revNote }
      );
    } else if (decision === 'APPROVED') {
      content.status = 'APPROVED';
      content.reviewHistory.push({
        reviewerId,
        decision: 'APPROVED',
        notes: notes || 'ผ่านการตรวจสอบคุณภาพเรียบร้อย',
        reviewedAt: new Date(),
      });

      if (content.legalChecklist && content.legalChecklist.length > 0) {
        content.legalChecklist.forEach((i) => { i.passed = true; });
      }

      // Mark tasks under this content as completed
      await Task.updateMany(
        { contentId: content._id, status: { $ne: 'DONE' } },
        { status: 'DONE', progress: 100 }
      );
    } else {
      return res.status(400).json({ message: 'Invalid decision. Must be APPROVED or REVISION.' });
    }

    await content.save();

    if (content.teamId) {
      const reviewer = await User.findById(reviewerId);
      const reviewerName = reviewer ? (reviewer.firstName || reviewer.username) : 'Manager';
      const actionType = decision === 'APPROVED' ? 'CONTENT_APPROVED' : 'CONTENT_REVISED';
      const title = decision === 'APPROVED'
        ? `${reviewerName} อนุมัติคอนเทนต์ "${content.title}" เรียบร้อยแล้ว`
        : `${reviewerName} ส่งคอนเทนต์ "${content.title}" กลับไปแก้ไข`;

      await TeamActivity.create({
        teamId: content.teamId,
        actor: reviewerId,
        actionType,
        title,
        details: notes || '',
        entityId: content._id,
        entityModel: 'Content',
      });
      broadcast('ACTIVITY_CREATED', { teamId: content.teamId });
    }

    broadcast('CONTENT_UPDATED', { content });
    broadcast('TASK_UPDATED', { contentId: content._id });

    res.status(200).json({
      message: `Content marked as ${content.status}`,
      content,
    });
  } catch (error) {
    console.error('submitReview error:', error);
    res.status(500).json({ message: 'Server error submitting review' });
  }
};

// @route POST /api/contents/:id/versions
// @access Private
const addContentVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileUrl, changelog } = req.body;
    let submittedBy = req.user?.userId;
    if (!submittedBy || !mongoose.Types.ObjectId.isValid(submittedBy)) {
      const admin = await User.findOne({ role: 'ADMIN' }) || await User.findOne();
      submittedBy = admin?._id;
    }

    if (!fileUrl) {
      return res.status(400).json({ message: 'fileUrl is required' });
    }

    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    const nextVer = (content.versions?.length || 0) + 1;
    content.versions.push({
      versionNumber: nextVer,
      fileUrl,
      changelog: changelog || `Version ${nextVer} release`,
      submittedBy,
      submittedAt: new Date(),
    });

    if (content.status === 'REVISION') {
      content.status = 'REVIEW';
    }

    await content.save();

    broadcast('CONTENT_UPDATED', { content });

    res.status(201).json({
      message: `Version ${nextVer} recorded`,
      content,
    });
  } catch (error) {
    console.error('addContentVersion error:', error);
    res.status(500).json({ message: 'Server error recording version' });
  }
};

// @route DELETE /api/contents/:id
// @access Private (Admin/Manager)
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findByIdAndDelete(id);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    broadcast('CONTENT_DELETED', { contentId: id });

    res.status(200).json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('deleteContent error:', error);
    res.status(500).json({ message: 'Server error deleting content' });
  }
};

// @route POST /api/contents/:id/metrics
// @access Private (Cron / Integration)
const addMetricSnapshot = async (req, res) => {
  try {
    const { id } = req.params;
    const metricData = req.body;

    const content = await Content.findByIdAndUpdate(
      id,
      { $push: { metrics: metricData } },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.status(200).json({
      message: 'Metric snapshot recorded',
      metrics: content.metrics,
    });
  } catch (error) {
    console.error('addMetricSnapshot error:', error);
    res.status(500).json({ message: 'Server error adding metric snapshot' });
  }
};

module.exports = {
  createContent,
  getAllContents,
  getContentById,
  updateContentStatus,
  updateLegalChecklist,
  submitReview,
  addContentVersion,
  deleteContent,
  addMetricSnapshot,
};
