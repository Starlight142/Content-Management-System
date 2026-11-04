const Task = require('../../database/models/Task');
const Content = require('../../database/models/Content');
const User = require('../../database/models/User');
const TeamActivity = require('../../database/models/TeamActivity');
const { broadcast } = require('../../services/presence.service');
const workflowService = require('../../services/workflow.service');

// @route GET /api/tasks
// @access Private
const getAllTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.user && req.user.role !== 'ADMIN' && req.user.teamId) {
      filter.teamId = req.user.teamId;
    }
    if (req.query && req.query.contentId) {
      filter.contentId = req.query.contentId;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'username email firstName lastName position role workingStatus')
      .populate('contentId', 'title platform status progress')
      .populate('teamId', 'name code')
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
    const { title, contentId, taskType, assignedTo, dueDate, notes, teamId, progress, submissionUrl, replyNotes, revisionNotes, autoAssign } = req.body;

    // If teamId not explicitly passed, inherit from content or user
    let resolvedTeamId = teamId || req.user?.teamId || null;
    let contentDoc = null;
    if (contentId) {
      contentDoc = await Content.findById(contentId);
      if (contentDoc && contentDoc.teamId) {
        resolvedTeamId = contentDoc.teamId;
      }
    }

    let finalTaskType = taskType;
    let finalAssignedTo = assignedTo;
    let finalTitle = title ? String(title).trim() : '';

    // Auto-resolve sequential stage (1 -> 2 -> 3 -> 4 -> 5) and assignee by studio position
    if (autoAssign || !finalTaskType || !finalAssignedTo) {
      const existingTasks = contentId ? await Task.find({ contentId }) : [];
      const teamFilter = resolvedTeamId ? { teamId: resolvedTeamId } : {};
      let teamUsers = await User.find(teamFilter);
      if (!teamUsers || teamUsers.length === 0) {
        teamUsers = await User.find();
      }

      const autoResolved = workflowService.resolveAutoTaskAssignment(
        existingTasks,
        teamUsers,
        contentDoc?.title || ''
      );

      if (autoAssign || !finalTaskType) {
        finalTaskType = autoResolved.taskType;
      }
      if (autoAssign || !finalAssignedTo) {
        const stageSpec =
          workflowService.PIPELINE_SEQUENCE.find((s) => s.taskType === finalTaskType) ||
          workflowService.PIPELINE_SEQUENCE[0];
        const matchedMember = workflowService.findAssigneeForStage(stageSpec, teamUsers);
        finalAssignedTo = matchedMember ? matchedMember._id : autoResolved.assignedTo;
      }
      if (!finalTitle) {
        finalTitle = autoResolved.defaultTitle;
      }
    }

    if (!finalTitle) {
      return res.status(400).json({ message: 'กรุณาระบุชื่องานย่อย (Task title is required)' });
    }

    const newTask = await Task.create({
      title: finalTitle,
      contentId: contentId || null,
      taskType: finalTaskType || 'Scripting',
      assignedTo: finalAssignedTo || null,
      teamId: resolvedTeamId || null,
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000),
      notes: notes || '',
      submissionUrl: submissionUrl || '',
      replyNotes: replyNotes || '',
      revisionNotes: revisionNotes || '',
      progress: progress || 0,
      status: 'TODO',
    });

    const populated = await newTask.populate([
      { path: 'assignedTo', select: 'username email firstName lastName position role workingStatus' },
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
        title: `${actorName} มอบหมายงาน "${finalTitle}" (${newTask.taskType}) ให้ ${assigneeName}`,
        entityId: newTask._id,
        entityModel: 'Task',
      });
      broadcast('ACTIVITY_CREATED', { teamId: resolvedTeamId });
    }

    broadcast('TASK_CREATED', { task: populated });

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
    const { status, submissionUrl, progress, notes, replyNotes, revisionNotes } = req.body;
    const userId = req.user.userId || req.user.id;

    // Check existing task
    const existingTask = await Task.findById(id).populate('assignedTo');
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (
      status === 'REVIEW' &&
      (!submissionUrl || String(submissionUrl).trim() === '') &&
      (!replyNotes || String(replyNotes).trim() === '') &&
      (!existingTask.submissionUrl || String(existingTask.submissionUrl).trim() === '')
    ) {
      return res.status(400).json({
        message: 'กรุณาระบุลิงก์ผลงาน (submissionUrl) หรือข้อความตอบกลับก่อนส่งตรวจสอบ',
      });
    }

    // Sequential stage progression check: Stage N > 1 requires all stages < N to be DONE
    if (status === 'IN_PROGRESS' || status === 'REVIEW') {
      try {
        await workflowService.validateStageProgression(Task, existingTask, status);
      } catch (stageErr) {
        return res.status(403).json({ message: stageErr.message });
      }
    }

    // Role-based protection & Workflow transition validation
    if (status !== undefined) {
      try {
        workflowService.validateTaskTransition(
          existingTask,
          status,
          userId,
          req.user.role || 'MEMBER',
          req.user.position
        );
      } catch (wfErr) {
        return res.status(403).json({ message: wfErr.message });
      }
    } else if (req.user.role === 'MEMBER') {
      const assigneeId = (existingTask.assignedTo && (existingTask.assignedTo._id || existingTask.assignedTo.id))
        ? (existingTask.assignedTo._id || existingTask.assignedTo.id).toString()
        : (existingTask.assignedTo ? existingTask.assignedTo.toString() : null);
      const isAssigned = Boolean(assigneeId && assigneeId === userId.toString());
      if (!isAssigned) {
        return res.status(403).json({
          message: 'Permission denied: Members can only update their own assigned tasks',
        });
      }
      if (req.user.position && !workflowService.isPositionAllowedForTask(req.user.position, existingTask.taskType)) {
        return res.status(403).json({
          message: `ไม่อนุญาต: ตำแหน่งงานของคุณ (${req.user.position}) ไม่สามารถดำเนินการในประเภทงาน ${existingTask.taskType} ได้`,
        });
      }
    }

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (submissionUrl !== undefined) updateFields.submissionUrl = submissionUrl;
    if (notes !== undefined) updateFields.notes = notes;
    if (replyNotes !== undefined) updateFields.replyNotes = replyNotes;
    if (revisionNotes !== undefined) updateFields.revisionNotes = revisionNotes;
    if (progress !== undefined) updateFields.progress = Math.min(100, Math.max(0, Number(progress)));
    else if (status === 'DONE') updateFields.progress = 100;
    else if (status === 'IN_PROGRESS' && existingTask.progress === 0) updateFields.progress = 25;

    const task = await Task.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'username firstName lastName email position role workingStatus')
      .populate('contentId', 'title status platform')
      .populate('teamId', 'name');

    // Update user's working status
    if (task.assignedTo) {
      let newWorkingStatus = 'IDLE';
      if (task.status === 'IN_PROGRESS') newWorkingStatus = 'WORKING';
      else if (task.status === 'REVIEW') newWorkingStatus = 'REVIEWING';
      await User.findByIdAndUpdate(task.assignedTo._id, { workingStatus: newWorkingStatus });
    }

    // If task is submitted for review and parent content is IN_PROGRESS, auto-promote to REVIEW
    if (status === 'REVIEW' && task.contentId) {
      const parentContent = await Content.findById(task.contentId._id || task.contentId);
      if (parentContent && (parentContent.status === 'IN_PROGRESS' || parentContent.status === 'PRODUCTION' || parentContent.status === 'REVISION' || parentContent.status === 'PLANNING')) {
        parentContent.status = 'REVIEW';
        if (submissionUrl) {
          const nextVer = (parentContent.versions?.length || 0) + 1;
          parentContent.versions.push({
            versionNumber: nextVer,
            fileUrl: submissionUrl,
            changelog: `Delivered by task: ${task.title}${replyNotes ? ` - ตอบกลับ: ${replyNotes}` : ''}`,
            submittedBy: userId,
            submittedAt: new Date(),
          });
        }
        await parentContent.save();
      }
    }

    // If task is completed, check if next sequential stage (1->5) should be auto-created or if all 5 stages are DONE
    if (status === 'DONE' && task.contentId) {
      const cId = task.contentId._id || task.contentId;
      const parentContent = await Content.findById(cId);
      const currentStageNum = workflowService.getTaskStage(task.taskType);

      if (currentStageNum < 5) {
        const nextStageSpec = workflowService.PIPELINE_SEQUENCE.find((s) => s.stage === currentStageNum + 1);
        if (nextStageSpec) {
          const existingNext = await Task.findOne({ contentId: cId, taskType: nextStageSpec.taskType });
          if (!existingNext) {
            const teamFilter = (task.teamId?._id || task.teamId || parentContent?.teamId)
              ? { teamId: task.teamId?._id || task.teamId || parentContent?.teamId }
              : {};
            let teamUsers = await User.find(teamFilter);
            if (!teamUsers || teamUsers.length === 0) teamUsers = await User.find();
            const matchedNextUser = workflowService.findAssigneeForStage(nextStageSpec, teamUsers);
            const nextTask = await Task.create({
              title: `${nextStageSpec.titlePrefix}: ${parentContent?.title || task.contentId?.title || ''}`,
              contentId: cId,
              teamId: task.teamId?._id || task.teamId || parentContent?.teamId || null,
              taskType: nextStageSpec.taskType,
              assignedTo: matchedNextUser ? matchedNextUser._id : null,
              dueDate: new Date(Date.now() + (6 - nextStageSpec.stage) * 86400000),
              notes: `รับส่งต่ออัตโนมัติจากขั้นตอนที่ ${currentStageNum}/5 (${task.taskType})`,
              progress: 0,
              status: 'TODO',
            });
            broadcast('TASK_CREATED', { task: nextTask });
          }
        }
      }

      const allContentTasks = await Task.find({ contentId: cId });
      const doneCount = allContentTasks.filter((t) => t.status === 'DONE').length;
      const remainingUnfinished = allContentTasks.filter((t) => t.status !== 'DONE').length;
      const newContentProgress = Math.min(100, Math.round((doneCount / 5) * 100));

      if (remainingUnfinished === 0 && doneCount >= 5) {
        await Content.findByIdAndUpdate(cId, {
          status: 'APPROVED',
          progress: 100,
        });
        broadcast('CONTENT_UPDATED', { contentId: cId, status: 'APPROVED' });
      } else {
        await Content.findByIdAndUpdate(cId, {
          status: 'IN_PROGRESS',
          progress: newContentProgress,
        });
        broadcast('CONTENT_UPDATED', { contentId: cId, status: 'IN_PROGRESS' });
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
        details: replyNotes
          ? `ตอบกลับ: ${replyNotes}${submissionUrl ? ` | ลิงก์: ${submissionUrl}` : ''}`
          : (submissionUrl ? `ลิงก์ส่งงาน: ${submissionUrl}` : ''),
        entityId: task._id,
        entityModel: 'Task',
      });
      broadcast('ACTIVITY_CREATED', { teamId: teamIdToLog });
    }

    broadcast('TASK_UPDATED', { task });
    if (status === 'REVIEW' && task.contentId) {
      broadcast('CONTENT_UPDATED', { contentId: task.contentId._id, status: 'REVIEW' });
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

    try {
      const actorId = req.user?.userId || req.user?.id;
      const actorName = req.user?.firstName || req.user?.username || 'ผู้ดูแลระบบ';
      await TeamActivity.create({
        teamId: task.teamId || null,
        actor: actorId || null,
        actionType: 'TASK_DELETED',
        title: `${actorName} ลบงาน "${task.title}"`,
        entityId: task._id,
        entityModel: 'Task',
      });
      broadcast('ACTIVITY_CREATED', { teamId: task.teamId });
    } catch (logErr) {
      console.warn('Logging deleteTask failed:', logErr.message);
    }

    broadcast('TASK_DELETED', { taskId: id });

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
