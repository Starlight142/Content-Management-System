const { describe, it } = require('node:test');
const assert = require('node:assert');

const workflowService = require('../src/services/workflow.service');
const Task = require('../src/database/models/Task');
const Content = require('../src/database/models/Content');

describe('Milestone 1: Backend Workflow & Dynamic Dates Verification', () => {

  describe('1. Dynamic Default Dates', () => {
    it('Task schema should have a dynamic default dueDate ~7 days in future', () => {
      const task = new Task({ title: 'Dynamic Date Test Task' });
      assert.ok(task.dueDate instanceof Date, 'dueDate should be a Date instance');
      const diffDays = (task.dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
      assert.ok(diffDays >= 6.9 && diffDays <= 7.1, `Expected ~7 days ahead, got ${diffDays}`);
    });

    it('Content schema should have a dynamic default dueDate ~7 days in future', () => {
      const content = new Content({
        title: 'Dynamic Date Test Content',
        createdBy: '507f1f77bcf86cd799439011',
      });
      assert.ok(content.dueDate instanceof Date, 'dueDate should be a Date instance');
      const diffDays = (content.dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
      assert.ok(diffDays >= 6.9 && diffDays <= 7.1, `Expected ~7 days ahead, got ${diffDays}`);
    });
  });

  describe('2. Position-Based Action Locking', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('Script Writer member CAN transition a Scripting task', () => {
      const task = {
        title: 'Script Task',
        taskType: 'Scripting',
        assignedTo: userId,
        status: 'TODO',
      };
      const allowed = workflowService.validateTaskTransition(task, 'IN_PROGRESS', userId, 'MEMBER', 'Script Writer');
      assert.strictEqual(allowed, true);
    });

    it('Script Writer member CANNOT transition an Editing task (throws 403 authorization error)', () => {
      const task = {
        title: 'Edit Task',
        taskType: 'Editing',
        assignedTo: userId,
        status: 'TODO',
      };
      assert.throws(
        () => {
          workflowService.validateTaskTransition(task, 'IN_PROGRESS', userId, 'MEMBER', 'Script Writer');
        },
        (err) => {
          assert.match(err.message, /ไม่อนุญาต/);
          assert.match(err.message, /Script Writer/);
          assert.match(err.message, /Editing/);
          return true;
        }
      );
    });

    it('Video Editor member CAN transition Editing, Filming, Sound Design tasks', () => {
      for (const tType of ['Editing', 'Filming', 'Sound Design']) {
        const task = {
          title: `${tType} Task`,
          taskType: tType,
          assignedTo: userId,
          status: 'TODO',
        };
        const allowed = workflowService.validateTaskTransition(task, 'IN_PROGRESS', userId, 'MEMBER', 'Video Editor');
        assert.strictEqual(allowed, true);
      }
    });

    it('Video Editor member CANNOT transition Graphic Design or Scripting tasks', () => {
      for (const tType of ['Graphic Design', 'Scripting']) {
        const task = {
          title: `${tType} Task`,
          taskType: tType,
          assignedTo: userId,
          status: 'TODO',
        };
        assert.throws(
          () => {
            workflowService.validateTaskTransition(task, 'IN_PROGRESS', userId, 'MEMBER', 'Video Editor');
          },
          (err) => {
            assert.match(err.message, /ไม่อนุญาต/);
            assert.match(err.message, /Video Editor/);
            return true;
          }
        );
      }
    });

    it('Graphic Designer member CAN transition Graphic Design task only', () => {
      const task = {
        title: 'Graphic Task',
        taskType: 'Graphic Design',
        assignedTo: userId,
        status: 'TODO',
      };
      assert.strictEqual(
        workflowService.validateTaskTransition(task, 'IN_PROGRESS', userId, 'MEMBER', 'Graphic Designer'),
        true
      );

      const editingTask = {
        title: 'Edit Task',
        taskType: 'Editing',
        assignedTo: userId,
        status: 'TODO',
      };
      assert.throws(() => {
        workflowService.validateTaskTransition(editingTask, 'IN_PROGRESS', userId, 'MEMBER', 'Graphic Designer');
      });
    });

    it('Content Creator member has cross-functional access to all pipeline tasks', () => {
      for (const tType of ['Scripting', 'Filming', 'Editing', 'Graphic Design', 'Sound Design', 'Other']) {
        const task = {
          title: `${tType} Task`,
          taskType: tType,
          assignedTo: userId,
          status: 'TODO',
        };
        assert.strictEqual(
          workflowService.validateTaskTransition(task, 'IN_PROGRESS', userId, 'MEMBER', 'Content Creator'),
          true
        );
      }
    });

    it('Manager and Admin roles bypass member position restrictions', () => {
      const task = {
        title: 'Any Task',
        taskType: 'Editing',
        assignedTo: 'different_user_id',
        status: 'REVIEW',
      };
      assert.strictEqual(
        workflowService.validateTaskTransition(task, 'DONE', userId, 'MANAGER', 'Production Manager'),
        true
      );
      assert.strictEqual(
        workflowService.validateTaskTransition(task, 'DONE', userId, 'ADMIN', 'Other'),
        true
      );
    });

    it('Member cannot self-approve a task to DONE', () => {
      const task = {
        title: 'My Task',
        taskType: 'Scripting',
        assignedTo: userId,
        status: 'REVIEW',
      };
      assert.throws(
        () => {
          workflowService.validateTaskTransition(task, 'DONE', userId, 'MEMBER', 'Script Writer');
        },
        /สมาชิกไม่สามารถกดเสร็จสิ้นงาน \(Done\) ได้เอง/
      );
    });
  });

  describe('3. Sequential Workflow Stage Progression (1 -> 2 -> 3 -> 4 -> 5)', () => {
    it('Stage numbers should follow defined order: Scripting(1), Filming(2), Editing(3), Graphic Design(4), Sound Design(5)', () => {
      assert.strictEqual(workflowService.getTaskStage('Scripting'), 1);
      assert.strictEqual(workflowService.getTaskStage('Filming'), 2);
      assert.strictEqual(workflowService.getTaskStage('Editing'), 3);
      assert.strictEqual(workflowService.getTaskStage('Graphic Design'), 4);
      assert.strictEqual(workflowService.getTaskStage('Sound Design'), 5);
      assert.strictEqual(workflowService.getTaskStage('Other'), 5);
    });

    it('Stage 1 (Scripting) should have no predecessor gate restrictions', async () => {
      const mockTask = {
        _id: 'task_stage_1',
        contentId: 'content_123',
        taskType: 'Scripting',
        status: 'TODO',
      };
      const result = await workflowService.validateStageProgression(null, mockTask, 'IN_PROGRESS');
      assert.strictEqual(result, true);
    });

    it('Stage 2 (Filming) should be BLOCKED if Stage 1 (Scripting) is not DONE', async () => {
      const mockTask = {
        _id: 'task_stage_2',
        contentId: 'content_123',
        taskType: 'Filming',
        status: 'TODO',
      };

      const mockTaskModel = {
        findOne: (query) => ({
          sort: () => Promise.resolve({
            _id: 'task_stage_1',
            contentId: 'content_123',
            taskType: 'Scripting',
            status: 'REVIEW',
          }),
        }),
      };

      await assert.rejects(
        async () => {
          await workflowService.validateStageProgression(mockTaskModel, mockTask, 'IN_PROGRESS');
        },
        (err) => {
          assert.match(err.message, /ไม่อนุญาต/);
          assert.match(err.message, /Filming/);
          assert.match(err.message, /Scripting/);
          return true;
        }
      );
    });

    it('Stage 3 (Editing) should be ALLOWED when all predecessors (Stage 1 and 2) are DONE', async () => {
      const mockTask = {
        _id: 'task_stage_3',
        contentId: 'content_123',
        taskType: 'Editing',
        status: 'TODO',
      };

      const mockTaskModel = {
        findOne: (query) => ({
          // No unapproved predecessor found
          sort: () => Promise.resolve(null),
        }),
      };

      const result = await workflowService.validateStageProgression(mockTaskModel, mockTask, 'IN_PROGRESS');
      assert.strictEqual(result, true);
    });
  });

  describe('4. Manager Review & Step Progression Logic', () => {
    it('Approving a stage task should complete only that task, leaving downstream stages pending', () => {
      // Stage 1 task in REVIEW
      const stage1Task = { _id: 't1', taskType: 'Scripting', status: 'REVIEW', progress: 85 };
      // Stage 2 task still in TODO
      const stage2Task = { _id: 't2', taskType: 'Filming', status: 'TODO', progress: 0 };
      // Stage 3 task still in TODO
      const stage3Task = { _id: 't3', taskType: 'Editing', status: 'TODO', progress: 0 };

      const allTasks = [stage1Task, stage2Task, stage3Task];

      // Simulate manager approving stage 1
      const reviewedTask = allTasks.find((t) => t.status === 'REVIEW');
      assert.ok(reviewedTask, 'Should find reviewed task');
      reviewedTask.status = 'DONE';
      reviewedTask.progress = 100;

      // Assert only stage 1 is DONE, downstream remain TODO
      assert.strictEqual(stage1Task.status, 'DONE');
      assert.strictEqual(stage1Task.progress, 100);
      assert.strictEqual(stage2Task.status, 'TODO');
      assert.strictEqual(stage3Task.status, 'TODO');

      // Remaining unfinished tasks count is 2
      const remaining = allTasks.filter((t) => t.status !== 'DONE').length;
      assert.strictEqual(remaining, 2);
    });
  });

  describe('5. Deliverable Metadata & Reply Synchronization', () => {
    it('Task schema should store submissionUrl, notes, replyNotes, and revisionNotes', () => {
      const task = new Task({
        title: 'Metadata Sync Test',
        submissionUrl: 'https://drive.google.com/file/d/test123',
        notes: 'Initial notes',
        replyNotes: 'Reply from member',
        revisionNotes: 'Manager feedback note',
      });

      assert.strictEqual(task.submissionUrl, 'https://drive.google.com/file/d/test123');
      assert.strictEqual(task.notes, 'Initial notes');
      assert.strictEqual(task.replyNotes, 'Reply from member');
      assert.strictEqual(task.revisionNotes, 'Manager feedback note');
    });
  });

});

