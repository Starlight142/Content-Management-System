const Task = require('../../database/models/Task');
const Content = require('../../database/models/Content');

// @route GET /api/tasks
// @access Private
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'username email firstName lastName role')
      .populate('contentId', 'title platform status')
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
    const { title, contentId, taskType, assignedTo, dueDate, notes } = req.body;

    const newTask = await Task.create({
      title,
      contentId: contentId || null,
      taskType: taskType || 'Editing',
      assignedTo: assignedTo || null,
      dueDate,
      notes,
      status: 'TODO',
    });

    const populated = await newTask.populate([
      { path: 'assignedTo', select: 'username email firstName lastName' },
      { path: 'contentId', select: 'title platform' },
    ]);

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
    const { status, submissionUrl } = req.body;

    const updateFields = { status };
    if (submissionUrl !== undefined) {
      updateFields.submissionUrl = submissionUrl;
    }

    const task = await Task.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'username email').populate('contentId', 'title status');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
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
            submittedBy: req.user.userId,
            submittedAt: new Date(),
          });
        }
        await parentContent.save();
      }
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
