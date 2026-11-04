/**
 * Workflow State Machine Service for Content and Tasks
 */

// Permitted Content Transitions & Role Requirements
const CONTENT_TRANSITIONS = {
  IDEA: {
    PLANNING: ['ADMIN', 'MANAGER'],
  },
  PLANNING: {
    IN_PROGRESS: ['ADMIN', 'MANAGER', 'MEMBER'],
  },
  IN_PROGRESS: {
    REVIEW: ['ADMIN', 'MANAGER', 'MEMBER'],
    PLANNING: ['ADMIN', 'MANAGER'],
  },
  REVIEW: {
    APPROVED: ['ADMIN', 'MANAGER'],
    REVISION: ['ADMIN', 'MANAGER'],
    IN_PROGRESS: ['ADMIN', 'MANAGER'],
  },
  REVISION: {
    IN_PROGRESS: ['ADMIN', 'MANAGER', 'MEMBER'],
    REVIEW: ['ADMIN', 'MANAGER', 'MEMBER'],
  },
  APPROVED: {
    IN_PROGRESS: ['ADMIN', 'MANAGER'],
    SCHEDULED: ['ADMIN', 'MANAGER'],
    PUBLISHED: ['ADMIN', 'MANAGER'],
  },
  SCHEDULED: {
    PUBLISHED: ['ADMIN', 'MANAGER'],
  },
  PUBLISHED: {},
};

/**
 * Validates whether a content item can transition to targetStatus by the requesting user
 */
const validateContentTransition = (currentStatus, targetStatus, userRole) => {
  if (currentStatus === targetStatus) {
    return true;
  }

  const allowedNext = CONTENT_TRANSITIONS[currentStatus];
  if (!allowedNext || !allowedNext[targetStatus]) {
    throw new Error(
      `การเปลี่ยนสถานะจาก ${currentStatus} ไปเป็น ${targetStatus} ไม่อยู่ในขั้นตอนการทำงานที่ถูกต้อง (Invalid Workflow Transition)`
    );
  }

  const allowedRoles = allowedNext[targetStatus];
  if (!allowedRoles.includes(userRole)) {
    if (targetStatus === 'APPROVED') {
      throw new Error('ไม่อนุญาต: สมาชิกทั่วไปไม่สามารถอนุมัติ Content ได้ (เฉพาะ Manager หรือ Admin เท่านั้น)');
    }
    if (targetStatus === 'PUBLISHED') {
      throw new Error('ไม่อนุญาต: เฉพาะ Manager หรือ Admin เท่านั้นที่สามารถเผยแพร่ Content สู่สาธารณะได้');
    }
    throw new Error(`คุณไม่มีสิทธิ์ในการเปลี่ยนสถานะเป็น ${targetStatus} (ต้องมีสิทธิ์: ${allowedRoles.join('/')})`);
  }

  return true;
};

// Permitted Task Transitions & Role Requirements
const TASK_TRANSITIONS = {
  TODO: {
    IN_PROGRESS: ['ADMIN', 'MANAGER', 'MEMBER'],
  },
  IN_PROGRESS: {
    REVIEW: ['ADMIN', 'MANAGER', 'MEMBER'],
    TODO: ['ADMIN', 'MANAGER'],
  },
  REVIEW: {
    DONE: ['ADMIN', 'MANAGER'],
    REVISION: ['ADMIN', 'MANAGER'],
    IN_PROGRESS: ['ADMIN', 'MANAGER'],
  },
  REVISION: {
    IN_PROGRESS: ['ADMIN', 'MANAGER', 'MEMBER'],
    REVIEW: ['ADMIN', 'MANAGER', 'MEMBER'],
  },
  DONE: {
    REVIEW: ['ADMIN', 'MANAGER'],
  },
};

// Permitted Task Types by Member Position (Strict 5 Studio Positions)
const POSITION_TASK_MAP = {
  'Production Manager': ['Scripting', 'Filming', 'Editing', 'Graphic Design', 'Sound Design', 'Other'],
  'Video Editor': ['Editing', 'Filming', 'Sound Design'],
  'Script Writer': ['Scripting'],
  'Graphic Designer': ['Graphic Design'],
  'Content Creator': ['Scripting', 'Filming', 'Editing', 'Graphic Design', 'Sound Design', 'Other'],
};

const isPositionAllowedForTask = (position, taskType) => {
  if (!position) return true;
  const allowed = POSITION_TASK_MAP[position] || [];
  return allowed.includes(taskType);
};

// Sequential Workflow Stages Order
const STAGE_ORDER = {
  Scripting: 1,
  Filming: 2,
  Editing: 3,
  'Graphic Design': 4,
  'Sound Design': 5,
  Other: 5,
};

// Ordered 5-Stage Sequential Pipeline Specification for Auto-Assignment (1 -> 2 -> 3 -> 4 -> 5)
const PIPELINE_SEQUENCE = [
  {
    stage: 1,
    taskType: 'Scripting',
    titlePrefix: 'เขียนบทและสคริปต์',
    targetPositions: ['Script Writer', 'Content Creator', 'Production Manager'],
  },
  {
    stage: 2,
    taskType: 'Filming',
    titlePrefix: 'ถ่ายทำฟุตเทจหลัก',
    targetPositions: ['Video Editor', 'Content Creator', 'Production Manager'],
  },
  {
    stage: 3,
    taskType: 'Editing',
    titlePrefix: 'ตัดต่อวิดีโอหลัก',
    targetPositions: ['Video Editor', 'Content Creator', 'Production Manager'],
  },
  {
    stage: 4,
    taskType: 'Graphic Design',
    titlePrefix: 'ออกแบบภาพปกและกราฟิก',
    targetPositions: ['Graphic Designer', 'Content Creator', 'Production Manager'],
  },
  {
    stage: 5,
    taskType: 'Sound Design',
    titlePrefix: 'มิกซ์เสียงและดนตรีประกอบ',
    targetPositions: ['Video Editor', 'Content Creator', 'Production Manager'],
  },
];

const getTaskStage = (taskType) => STAGE_ORDER[taskType] || 5;

/**
 * Finds the best matching team member for a given stage based on studio position
 */
const findAssigneeForStage = (stageSpec, teamUsers = []) => {
  if (!Array.isArray(teamUsers) || teamUsers.length === 0) return null;
  const membersFirst = [
    ...teamUsers.filter((u) => u.role === 'MEMBER'),
    ...teamUsers.filter((u) => u.role !== 'MEMBER'),
  ];
  for (const pos of stageSpec.targetPositions) {
    const match = membersFirst.find((u) => u.position === pos);
    if (match) return match;
  }
  return membersFirst[0] || null;
};

/**
 * Automatically determines the next unassigned stage (1 -> 2 -> 3 -> 4 -> 5)
 * and resolves the responsible team member by position.
 */
const resolveAutoTaskAssignment = (existingTasks = [], teamUsers = [], contentTitle = '') => {
  const existingTypes = new Set((existingTasks || []).map((t) => t.taskType));
  const nextStageSpec =
    PIPELINE_SEQUENCE.find((s) => !existingTypes.has(s.taskType)) ||
    PIPELINE_SEQUENCE[0];

  const matchedUser = findAssigneeForStage(nextStageSpec, teamUsers);
  const cleanTitle = contentTitle ? `${nextStageSpec.titlePrefix}: ${contentTitle}` : nextStageSpec.titlePrefix;

  return {
    stage: nextStageSpec.stage,
    taskType: nextStageSpec.taskType,
    assignedTo: matchedUser ? (matchedUser._id || matchedUser.id) : null,
    assignee: matchedUser,
    defaultTitle: cleanTitle,
  };
};

/**
 * Validates task transition, ownership, and position authorization
 */
const validateTaskTransition = (task, targetStatus, userId, userRole, userPosition) => {
  const currentStatus = task.status;
  const assigneeId = (task.assignedTo && (task.assignedTo._id || task.assignedTo.id))
    ? (task.assignedTo._id || task.assignedTo.id).toString()
    : (task.assignedTo ? task.assignedTo.toString() : null);
  const isAssigned = Boolean(assigneeId && assigneeId === userId.toString());

  // 1. Ownership & Position check: Member can ONLY edit their own task and matching position
  if (userRole === 'MEMBER') {
    if (!isAssigned) {
      throw new Error('ไม่อนุญาต: สมาชิกสามารถแก้ไขได้เฉพาะงานที่ได้รับมอบหมายให้ตนเองเท่านั้น');
    }
    const resolvedPosition = userPosition || (task.assignedTo && task.assignedTo.position);
    if (resolvedPosition && !isPositionAllowedForTask(resolvedPosition, task.taskType)) {
      throw new Error(
        `ไม่อนุญาต: ตำแหน่งงานของคุณ (${resolvedPosition}) ไม่สามารถดำเนินการในประเภทงาน ${task.taskType} ได้`
      );
    }
  }

  if (currentStatus === targetStatus) {
    return true;
  }

  // 2. Transition rules
  const allowedNext = TASK_TRANSITIONS[currentStatus];
  if (!allowedNext || !allowedNext[targetStatus]) {
    throw new Error(
      `ไม่สามารถเปลี่ยนสถานะงานจาก ${currentStatus} ไปเป็น ${targetStatus} ได้ (Invalid Task State Transition)`
    );
  }

  const allowedRoles = allowedNext[targetStatus];
  if (!allowedRoles.includes(userRole)) {
    if (targetStatus === 'DONE') {
      throw new Error('ไม่อนุญาต: สมาชิกไม่สามารถกดเสร็จสิ้นงาน (Done) ได้เอง ต้องส่งงานให้ Manager ตรวจสอบก่อน');
    }
    throw new Error(`สิทธิ์ของคุณ (${userRole}) ไม่สามารถเปลี่ยนสถานะเป็น ${targetStatus} ได้`);
  }

  return true;
};

/**
 * Validates sequential stage progression: for task of stage N > 1, all predecessor
 * tasks (stage < N) under the same contentId must have status === 'DONE'.
 */
const validateStageProgression = async (TaskModel, task, targetStatus) => {
  if (targetStatus !== 'IN_PROGRESS' && targetStatus !== 'REVIEW') {
    return true;
  }

  const contentId = task.contentId?._id || task.contentId;
  if (!contentId || !TaskModel) {
    return true;
  }

  const currentStage = getTaskStage(task.taskType);
  if (currentStage <= 1) {
    return true;
  }

  const predecessorTaskTypes = Object.keys(STAGE_ORDER).filter(
    (type) => STAGE_ORDER[type] < currentStage
  );

  const unapprovedPredecessor = await TaskModel.findOne({
    contentId,
    _id: { $ne: task._id },
    taskType: { $in: predecessorTaskTypes },
    status: { $ne: 'DONE' },
  }).sort({ createdAt: 1 });

  if (unapprovedPredecessor) {
    const predStage = getTaskStage(unapprovedPredecessor.taskType);
    throw new Error(
      `ไม่อนุญาต: ขั้นตอน ${task.taskType} (Stage ${currentStage}) ถูกล็อค ต้องรอให้ขั้นตอนก่อนหน้า (${unapprovedPredecessor.taskType} - Stage ${predStage}) ได้รับการอนุมัติ (DONE) จากผู้จัดการก่อน`
    );
  }

  return true;
};

module.exports = {
  validateContentTransition,
  validateTaskTransition,
  validateStageProgression,
  isPositionAllowedForTask,
  getTaskStage,
  findAssigneeForStage,
  resolveAutoTaskAssignment,
  PIPELINE_SEQUENCE,
  POSITION_TASK_MAP,
  STAGE_ORDER,
  CONTENT_TRANSITIONS,
  TASK_TRANSITIONS,
};
