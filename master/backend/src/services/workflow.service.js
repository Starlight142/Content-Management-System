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
  },
  REVISION: {
    IN_PROGRESS: ['ADMIN', 'MANAGER', 'MEMBER'],
    REVIEW: ['ADMIN', 'MANAGER', 'MEMBER'],
  },
  APPROVED: {
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

/**
 * Validates task transition and ownership
 */
const validateTaskTransition = (task, targetStatus, userId, userRole) => {
  const currentStatus = task.status;
  const assigneeId = (task.assignedTo && (task.assignedTo._id || task.assignedTo.id))
    ? (task.assignedTo._id || task.assignedTo.id).toString()
    : (task.assignedTo ? task.assignedTo.toString() : null);
  const isAssigned = Boolean(assigneeId && assigneeId === userId.toString());

  // 1. Ownership & Role check: Member can ONLY edit their own task
  if (userRole === 'MEMBER' && !isAssigned) {
    throw new Error('ไม่อนุญาต: สมาชิกสามารถแก้ไขได้เฉพาะงานที่ได้รับมอบหมายให้ตนเองเท่านั้น');
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

module.exports = {
  validateContentTransition,
  validateTaskTransition,
  CONTENT_TRANSITIONS,
  TASK_TRANSITIONS,
};
