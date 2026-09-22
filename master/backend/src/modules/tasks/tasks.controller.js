const Task = require('../../database/models/Task');
const Content = require('../../database/models/Content');
const User = require('../../database/models/User');
const TeamActivity = require('../../database/models/TeamActivity');

// @route GET /api/tasks
// @access Private
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'username email firstName lastName role workingStatus')
      .populate('contentId', 'title platform status progress')
      .populate('teamId', 'name')
      .sort({ dueDate: 1, createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('getAllTasks error:', error);
    res.status(500).json({ message: 'Server error retrieving tasks' });
  }
};

// @route POST /api/tasks
// @access Private (Manager/Admin)
const createTask = async (req, res) => {
  try {
    const { title, contentId, taskType, assignedTo, dueDate, notes, teamId, progress } = req.body;

    // If teamId not explicitly passed, inherit from content
    let resolvedTeamId = teamId;
    if (!resolvedTeamId && contentId) {
      const content = await Content.findById(contentId);
      if (content && content.teamId) {
        resolvedTeamId = content.teamId;
      }
    }

    const newTask = await Task.create({
      title,
      contentId: contentId || null,
      taskType: taskType || 'Editing',
      assignedTo: assignedTo || null,
      teamId: resolvedTeamId || null,
      dueDate,
      notes,
      progress: progress || 0,
      status: 'TODO',
    });

    const populated = await newTask.populate([
      { path: 'assignedTo', select: 'username email firstName lastName role workingStatus' },
      { path: 'contentId', select: 'title platform' },
      { path: 'teamId', select: 'name' },
    ]);

    // Record TeamActivity
    if (resolvedTeamId) {
      const actorName = req.user.username || 'Manager';
      const assigneeName = populated.assignedTo ? `${populated.assignedTo.firstName || populated.assignedTo.username}` : 'ทีมงาน';
      await TeamActivity.create({
        teamId: resolvedTeamId,
        actor: req.user.userId || req.user.id,
        actionType: 'TASK_ASSIGNED',
        title: `${actorName} มอบหมายงาน "${title}" ให้ ${assigneeName}`,
        entityId: newTask._id,
        entityModel: 'Task',
      });
    }

    res.status(201).json({ message: 'Task created successfully', task: populated });
  } catch (error) {
    console.error('createTask error:', error);
    res.status(500).json({ message: 'Server error creating task', error: error.message });
  }
};

// @route PATCH /api/tasks/:id/status
// @access Private
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, submissionUrl, progress, notes } = req.body;
    const userId = req.user.userId || req.user.id;

    // Check existing task
    const existingTask = await Task.findById(id).populate('assignedTo');
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Role-based protection: Member can only modify their own task
    if (req.user.role === 'MEMBER') {
      const isAssigned = existingTask.assignedTo && existingTask.assignedTo._id.toString() === userId.toString();
      if (!isAssigned) {
        return res.status(403).json({
          message: 'Permission denied: Members can only update their own assigned tasks',
        });
      }
    }

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (submissionUrl !== undefined) updateFields.submissionUrl = submissionUrl;
    if (notes !== undefined) updateFields.notes = notes;
    if (progress !== undefined) updateFields.progress = Math.min(100, Math.max(0, Number(progress)));
    else if (status === 'DONE') updateFields.progress = 100;
    else if (status === 'IN_PROGRESS' && existingTask.progress === 0) updateFields.progress = 25;

    const task = await Task.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'username firstName lastName email role workingStatus')
      .populate('contentId', 'title status platform')
      .populate('teamId', 'name');

    // Update user's working status
    if (task.assignedTo) {
      let newWorkingStatus = 'IDLE';
      if (task.status === 'IN_PROGRESS') newWorkingStatus = 'WORKING';
      else if (task.status === 'REVIEW') newWorkingStatus = 'REVIEWING';
      await User.findByIdAndUpdate(task.assignedTo._id, { workingStatus: newWorkingStatus });
    }

    // If task is submitted for review and parent content is in PRODUCTION, auto-promote to REVIEW
    if (status === 'REVIEW' && task.contentId) {
      const parentContent = await Content.findById(task.contentId._id);
      if (parentContent && (parentContent.status === 'PRODUCTION' || parentContent.status === 'REVISION')) {
        parentContent.status = 'REVIEW';
        if (submissionUrl) {
          const nextVer = (parentContent.versions?.length || 0) + 1;
          parentContent.versions.push({
            versionNumber: nextVer,
            fileUrl: submissionUrl,
            changelog: `Delivered by task: ${task.title}`,
            submittedBy: userId,
            submittedAt: new Date(),
          });
        }
        await parentContent.save();
      }
    }

    // Record TeamActivity
    const teamIdToLog = task.teamId?._id || task.teamId;
    if (teamIdToLog) {
      const actorUser = await User.findById(userId);
      const actorName = actorUser ? (actorUser.firstName || actorUser.username) : 'ทีมงาน';
      let actionType = 'TASK_STATUS_CHANGED';
      let activityTitle = `${actorName} อัปเดตงาน "${task.title}" เป็น ${task.status}`;

      if (submissionUrl || status === 'REVIEW') {
        actionType = 'TASK_SUBMITTED';
        activityTitle = `${actorName} ส่งงาน "${task.title}" ให้ตรวจสอบ`;
      } else if (status === 'IN_PROGRESS') {
        activityTitle = `${actorName} เปลี่ยน Task เป็น IN_PROGRESS (${task.progress}%)`;
      } else if (status === 'DONE') {
        activityTitle = `${actorName} ทำงาน "${task.title}" เสร็จสมบูรณ์แล้ว (100%)`;
      }

      await TeamActivity.create({
        teamId: teamIdToLog,
        actor: userId,
        actionType,
        title: activityTitle,
        details: submissionUrl ? `ลิงก์ส่งงาน: ${submissionUrl}` : '',
        entityId: task._id,
        entityModel: 'Task',
      });
    }

    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (error) {
    console.error('updateTaskStatus error:', error);
    res.status(500).json({ message: 'Server error updating task status' });
  }
};

// @route DELETE /api/tasks/:id
// @access Private (Manager/Admin)
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('deleteTask error:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};

module.exports = {
  getAllTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
};
