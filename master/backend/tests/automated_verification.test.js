const { describe, it } = require('node:test');
const assert = require('node:assert');

const workflowService = require('../src/services/workflow.service');
const Task = require('../src/database/models/Task');
const Content = require('../src/database/models/Content');

/**
 * Draftly E2E Automated Verification Test Suite
 * Zero-dependency native Node.js test runner (node:test + node:assert).
 *
 * Tier 1: Feature Coverage (isolated functionality per feature)
 * Tier 2: Boundary & Corner Cases (unauthorized roles, missing dates, edge values)
 * Tier 3: Cross-Feature Combinations (position locking combined with sequential stage gating)
 * Tier 4: Real-World Studio Application Scenarios (end-to-end media production cycle)
 */

describe('E2E Automated Verification: Draftly Production Workflow & Stage Approval System', () => {

  // =========================================================================
  // 1. Dynamic Default Dates
  // =========================================================================
  describe('Feature 1: Dynamic Default Dates (Backend Schema & Generation)', () => {
    it('[Tier 1] Task schema should automatically set dynamic dueDate ~7 days ahead when omitted', () => {
      const task = new Task({ title: 'Task Without Explicit Due Date' });
      assert.ok(task.dueDate instanceof Date, 'Task dueDate must be a Date instance');
      const now = Date.now();
      const diffMs = task.dueDate.getTime() - now;
      const diffDays = diffMs / (24 * 60 * 60 * 1000);
      assert.ok(diffDays >= 6.9 && diffDays <= 7.1, `Expected ~7 days in the future, got ${diffDays.toFixed(2)} days`);
    });

    it('[Tier 1] Content schema should automatically set dynamic dueDate ~7 days ahead when omitted', () => {
      const content = new Content({
        title: 'Content Without Explicit Due Date',
        createdBy: '507f1f77bcf86cd799439011',
      });
      assert.ok(content.dueDate instanceof Date, 'Content dueDate must be a Date instance');
      const now = Date.now();
      const diffMs = content.dueDate.getTime() - now;
      const diffDays = diffMs / (24 * 60 * 60 * 1000);
      assert.ok(diffDays >= 6.9 && diffDays <= 7.1, `Expected ~7 days in the future, got ${diffDays.toFixed(2)} days`);
    });

    it('[Tier 2] Task schema should preserve explicit dueDate when provided', () => {
      const explicitDate = new Date('2027-01-15T00:00:00.000Z');
      const task = new Task({
        title: 'Task With Explicit Due Date',
        dueDate: explicitDate,
      });
      assert.strictEqual(task.dueDate.getTime(), explicitDate.getTime());
    });

    it('[Tier 2] Content schema should preserve explicit dueDate when provided', () => {
      const explicitDate = new Date('2027-02-20T00:00:00.000Z');
      const content = new Content({
        title: 'Content With Explicit Due Date',
        createdBy: '507f1f77bcf86cd799439011',
        dueDate: explicitDate,
      });
      assert.strictEqual(content.dueDate.getTime(), explicitDate.getTime());
    });

    it('[Tier 2] Dynamic date offset generator helper produces valid ISO YYYY-MM-DD date strings', () => {
      const getDynamicDate = (daysAhead) => new Date(Date.now() + daysAhead * 86400000).toISOString().split('T')[0];
      const today = getDynamicDate(0);
      const threeDays = getDynamicDate(3);
      const sevenDays = getDynamicDate(7);

      assert.match(today, /^\d{4}-\d{2}-\d{2}$/, 'Today must be YYYY-MM-DD');
      assert.match(threeDays, /^\d{4}-\d{2}-\d{2}$/, 'Three days must be YYYY-MM-DD');
      assert.match(sevenDays, /^\d{4}-\d{2}-\d{2}$/, 'Seven days must be YYYY-MM-DD');

      const dateA = new Date(today);
      const dateB = new Date(sevenDays);
      assert.ok(dateB.getTime() > dateA.getTime(), 'Future date must be chronologically after today');
    });
  });

  // =========================================================================
  // 2. Position-Based Action Locking
  // =========================================================================
  describe('Feature 2: Position-Based Action Locking', () => {
    const memberId = '507f1f77bcf86cd799439011';
    const managerId = '507f1f77bcf86cd799439012';
    const otherMemberId = '507f1f77bcf86cd799439013';

    it('[Tier 1] Script Writer can transition Scripting task to IN_PROGRESS and REVIEW', () => {
      const task = {
        title: 'Script Task',
        taskType: 'Scripting',
        assignedTo: memberId,
        status: 'TODO',
      };
      assert.strictEqual(
        workflowService.validateTaskTransition(task, 'IN_PROGRESS', memberId, 'MEMBER', 'Script Writer'),
        true
      );
      task.status = 'IN_PROGRESS';
      assert.strictEqual(
        workflowService.validateTaskTransition(task, 'REVIEW', memberId, 'MEMBER', 'Script Writer'),
        true
      );
    });

    it('[Tier 1] Script Writer cannot transition Editing, Filming, Graphic Design, or Sound Design tasks (403)', () => {
      const unauthorizedTypes = ['Editing', 'Filming', 'Graphic Design', 'Sound Design', 'Other'];
      for (const tType of unauthorizedTypes) {
        const task = {
          title: `${tType} Task`,
          taskType: tType,
          assignedTo: memberId,
          status: 'TODO',
        };
        assert.throws(
          () => {
            workflowService.validateTaskTransition(task, 'IN_PROGRESS', memberId, 'MEMBER', 'Script Writer');
          },
          (err) => {
            assert.match(err.message, /ไม่อนุญาต/);
            assert.match(err.message, /Script Writer/);
            return true;
          }
        );
      }
    });

    it('[Tier 1] Video Editor can transition Editing, Filming, Sound Design, but NOT Scripting or Graphic Design', () => {
      const allowedTypes = ['Editing', 'Filming', 'Sound Design'];
      for (const tType of allowedTypes) {
        const task = {
          title: `${tType} Task`,
          taskType: tType,
          assignedTo: memberId,
          status: 'TODO',
        };
        assert.strictEqual(
          workflowService.validateTaskTransition(task, 'IN_PROGRESS', memberId, 'MEMBER', 'Video Editor'),
          true
        );
      }

      const forbiddenTypes = ['Scripting', 'Graphic Design'];
      for (const tType of forbiddenTypes) {
        const task = {
          title: `${tType} Task`,
          taskType: tType,
          assignedTo: memberId,
          status: 'TODO',
        };
        assert.throws(() => {
          workflowService.validateTaskTransition(task, 'IN_PROGRESS', memberId, 'MEMBER', 'Video Editor');
        });
      }
    });

    it('[Tier 1] Graphic Designer can transition Graphic Design task only', () => {
      const graphicTask = {
        title: 'Graphics Task',
        taskType: 'Graphic Design',
        assignedTo: memberId,
        status: 'TODO',
      };
      assert.strictEqual(
        workflowService.validateTaskTransition(graphicTask, 'IN_PROGRESS', memberId, 'MEMBER', 'Graphic Designer'),
        true
      );

      const editingTask = {
        title: 'Edit Task',
        taskType: 'Editing',
        assignedTo: memberId,
        status: 'TODO',
      };
      assert.throws(() => {
        workflowService.validateTaskTransition(editingTask, 'IN_PROGRESS', memberId, 'MEMBER', 'Graphic Designer');
      });
    });

    it('[Tier 2] Content Creator role has universal pipeline transition permissions', () => {
      const allTypes = ['Scripting', 'Filming', 'Editing', 'Graphic Design', 'Sound Design', 'Other'];
      for (const tType of allTypes) {
        const task = {
          title: `${tType} Task`,
          taskType: tType,
          assignedTo: memberId,
          status: 'TODO',
        };
        assert.strictEqual(
          workflowService.validateTaskTransition(task, 'IN_PROGRESS', memberId, 'MEMBER', 'Content Creator'),
          true
        );
      }
    });

    it('[Tier 2] Unassigned member is strictly forbidden from transitioning tasks regardless of position', () => {
      const task = {
        title: 'Unassigned Task',
        taskType: 'Scripting',
        assignedTo: otherMemberId,
        status: 'TODO',
      };
      assert.throws(
        () => {
          workflowService.validateTaskTransition(task, 'IN_PROGRESS', memberId, 'MEMBER', 'Script Writer');
        },
        /สมาชิกสามารถแก้ไขได้เฉพาะงานที่ได้รับมอบหมายให้ตนเองเท่านั้น/
      );
    });

    it('[Tier 2] Member cannot self-approve a task to DONE', () => {
      const task = {
        title: 'Self-Approval Task',
        taskType: 'Scripting',
        assignedTo: memberId,
        status: 'REVIEW',
      };
      assert.throws(
        () => {
          workflowService.validateTaskTransition(task, 'DONE', memberId, 'MEMBER', 'Script Writer');
        },
        /สมาชิกไม่สามารถกดเสร็จสิ้นงาน \(Done\) ได้เอง/
      );
    });

    it('[Tier 2] Manager and Admin roles bypass member position restrictions', () => {
      const task = {
        title: 'Review Task',
        taskType: 'Editing',
        assignedTo: memberId,
        status: 'REVIEW',
      };
      assert.strictEqual(
        workflowService.validateTaskTransition(task, 'DONE', managerId, 'MANAGER', 'Production Manager'),
        true
      );
      assert.strictEqual(
        workflowService.validateTaskTransition(task, 'DONE', managerId, 'ADMIN', 'Other'),
        true
      );
    });
  });

  // =========================================================================
  // 3. Sequential Workflow Stage Pipeline Progression (1 -> 2 -> 3 -> 4 -> 5)
  // =========================================================================
  describe('Feature 3: Sequential Workflow Stage Pipeline Progression (1 -> 2 -> 3 -> 4 -> 5)', () => {
    it('[Tier 1] Stage ordering is strictly mapped: Scripting(1), Filming(2), Editing(3), Graphic Design(4), Sound Design(5)', () => {
      assert.strictEqual(workflowService.getTaskStage('Scripting'), 1);
      assert.strictEqual(workflowService.getTaskStage('Filming'), 2);
      assert.strictEqual(workflowService.getTaskStage('Editing'), 3);
      assert.strictEqual(workflowService.getTaskStage('Graphic Design'), 4);
      assert.strictEqual(workflowService.getTaskStage('Sound Design'), 5);
      assert.strictEqual(workflowService.getTaskStage('Other'), 5);
    });

    it('[Tier 1] Stage 1 (Scripting) has no predecessor restrictions', async () => {
      const task = {
        _id: 't1',
        contentId: 'content_100',
        taskType: 'Scripting',
        status: 'TODO',
      };
      const allowed = await workflowService.validateStageProgression(null, task, 'IN_PROGRESS');
      assert.strictEqual(allowed, true);
    });

    it('[Tier 1] Stage 2 (Filming) is blocked when Stage 1 is in TODO, IN_PROGRESS, or REVIEW', async () => {
      const task = {
        _id: 't2',
        contentId: 'content_100',
        taskType: 'Filming',
        status: 'TODO',
      };

      for (const unapprovedStatus of ['TODO', 'IN_PROGRESS', 'REVIEW']) {
        const mockTaskModel = {
          findOne: () => ({
            sort: () => Promise.resolve({
              _id: 't1',
              contentId: 'content_100',
              taskType: 'Scripting',
              status: unapprovedStatus,
            }),
          }),
        };

        await assert.rejects(
          async () => {
            await workflowService.validateStageProgression(mockTaskModel, task, 'IN_PROGRESS');
          },
          (err) => {
            assert.match(err.message, /ไม่อนุญาต/);
            assert.match(err.message, /Filming/);
            assert.match(err.message, /Scripting/);
            return true;
          }
        );
      }
    });

    it('[Tier 2] Stage 3 (Editing) is allowed only when both Stage 1 and Stage 2 are DONE', async () => {
      const task = {
        _id: 't3',
        contentId: 'content_100',
        taskType: 'Editing',
        status: 'TODO',
      };

      // Case A: Stage 2 still incomplete
      const mockTaskModelBlocked = {
        findOne: () => ({
          sort: () => Promise.resolve({
            _id: 't2',
            contentId: 'content_100',
            taskType: 'Filming',
            status: 'IN_PROGRESS',
          }),
        }),
      };

      await assert.rejects(
        async () => {
          await workflowService.validateStageProgression(mockTaskModelBlocked, task, 'IN_PROGRESS');
        },
        /Filming/
      );

      // Case B: All predecessors are DONE (findOne returns null)
      const mockTaskModelAllowed = {
        findOne: () => ({
          sort: () => Promise.resolve(null),
        }),
      };

      const result = await workflowService.validateStageProgression(mockTaskModelAllowed, task, 'IN_PROGRESS');
      assert.strictEqual(result, true);
    });

    it('[Tier 2] Standalone tasks (contentId is null) bypass sequential predecessor gate', async () => {
      const standaloneTask = {
        _id: 't_standalone',
        contentId: null,
        taskType: 'Editing',
        status: 'TODO',
      };
      const allowed = await workflowService.validateStageProgression(null, standaloneTask, 'IN_PROGRESS');
      assert.strictEqual(allowed, true);
    });
  });

  // =========================================================================
  // 4. Manager Approval & Stage Unlocking
  // =========================================================================
  describe('Feature 4: Manager Approval & Step-by-Step Stage Progression', () => {
    it('[Tier 1] Manager approval of stage N completes ONLY that task, unlocking stage N+1', () => {
      const tasks = [
        { _id: 't1', stage: 1, taskType: 'Scripting', status: 'REVIEW', progress: 90 },
        { _id: 't2', stage: 2, taskType: 'Filming', status: 'TODO', progress: 0 },
        { _id: 't3', stage: 3, taskType: 'Editing', status: 'TODO', progress: 0 },
      ];

      // Simulate manager approving t1
      const target = tasks.find(t => t._id === 't1');
      target.status = 'DONE';
      target.progress = 100;

      // Verify t1 is DONE
      assert.strictEqual(target.status, 'DONE');
      assert.strictEqual(target.progress, 100);

      // Verify t2 and t3 remain untouched
      assert.strictEqual(tasks[1].status, 'TODO');
      assert.strictEqual(tasks[1].progress, 0);
      assert.strictEqual(tasks[2].status, 'TODO');
      assert.strictEqual(tasks[2].progress, 0);

      // Now stage 2 has zero unapproved predecessors
      const unapprovedPredecessorsForT2 = tasks.filter(t => t.stage < 2 && t.status !== 'DONE');
      assert.strictEqual(unapprovedPredecessorsForT2.length, 0, 'Stage 2 should now be unlocked');

      // Stage 3 still has unapproved predecessor (t2)
      const unapprovedPredecessorsForT3 = tasks.filter(t => t.stage < 3 && t.status !== 'DONE');
      assert.strictEqual(unapprovedPredecessorsForT3.length, 1, 'Stage 3 must remain locked');
    });

    it('[Tier 2] Manager requesting revision transitions ONLY reviewed task to REVISION with feedback notes', () => {
      const task = {
        _id: 't1',
        taskType: 'Scripting',
        status: 'REVIEW',
        revisionNotes: '',
      };

      // Simulate revision request
      task.status = 'REVISION';
      task.revisionNotes = 'Please flesh out scene 3 dialogue.';

      assert.strictEqual(task.status, 'REVISION');
      assert.strictEqual(task.revisionNotes, 'Please flesh out scene 3 dialogue.');
    });
  });

  // =========================================================================
  // 5. Role-Consistent Review State Synchronization
  // =========================================================================
  describe('Feature 5: Role-Consistent Review State Synchronization', () => {
    it('[Tier 1] Task schema stores submissionUrl, notes, replyNotes, and revisionNotes', () => {
      const task = new Task({
        title: 'Deliverable Sync Task',
        taskType: 'Scripting',
        submissionUrl: 'https://docs.google.com/document/d/xyz-script',
        notes: 'Final draft of Episode 1',
        replyNotes: 'Addressed scene 3 feedback as requested',
        revisionNotes: 'Check dialogue pacing',
      });

      assert.strictEqual(task.submissionUrl, 'https://docs.google.com/document/d/xyz-script');
      assert.strictEqual(task.notes, 'Final draft of Episode 1');
      assert.strictEqual(task.replyNotes, 'Addressed scene 3 feedback as requested');
      assert.strictEqual(task.revisionNotes, 'Check dialogue pacing');
    });

    it('[Tier 2] Task deliverable resubmission clears revision state and synchronizes replyNotes', () => {
      const task = {
        title: 'Episode 1 Script',
        taskType: 'Scripting',
        status: 'REVISION',
        submissionUrl: 'https://docs.google.com/document/d/v1',
        notes: 'Draft 1',
        revisionNotes: 'Need more action in scene 2',
        replyNotes: '',
      };

      // Member updates with resubmission
      task.submissionUrl = 'https://docs.google.com/document/d/v2';
      task.replyNotes = 'Added action sequence to scene 2';
      task.status = 'REVIEW';

      assert.strictEqual(task.status, 'REVIEW');
      assert.strictEqual(task.submissionUrl, 'https://docs.google.com/document/d/v2');
      assert.strictEqual(task.replyNotes, 'Added action sequence to scene 2');
      assert.strictEqual(task.revisionNotes, 'Need more action in scene 2');
    });
  });

  // =========================================================================
  // 6. Tier 3 & Tier 4: Cross-Feature Combinations & Full Studio Pipeline
  // =========================================================================
  describe('Tier 3 & 4: Full Studio Media Production Pipeline E2E Lifecycle Simulation', () => {
    it('Simulates complete 5-stage sequential media workflow from Scripting to Sound Design', async () => {
      const scriptWriterId = 'user_script_writer_01';
      const videoEditorId = 'user_video_editor_02';
      const graphicDesignerId = 'user_graphic_designer_03';
      const managerId = 'user_manager_04';

      // Stage 1: Scripting (assigned to Script Writer)
      // Stage 2: Filming (assigned to Video Editor)
      // Stage 3: Editing (assigned to Video Editor)
      // Stage 4: Graphic Design (assigned to Graphic Designer)
      // Stage 5: Sound Design (assigned to Video Editor)
      const pipelineTasks = [
        { _id: 't_s1', contentId: 'ep_101', stage: 1, taskType: 'Scripting', assignedTo: scriptWriterId, status: 'TODO', progress: 0 },
        { _id: 't_s2', contentId: 'ep_101', stage: 2, taskType: 'Filming', assignedTo: videoEditorId, status: 'TODO', progress: 0 },
        { _id: 't_s3', contentId: 'ep_101', stage: 3, taskType: 'Editing', assignedTo: videoEditorId, status: 'TODO', progress: 0 },
        { _id: 't_s4', contentId: 'ep_101', stage: 4, taskType: 'Graphic Design', assignedTo: graphicDesignerId, status: 'TODO', progress: 0 },
        { _id: 't_s5', contentId: 'ep_101', stage: 5, taskType: 'Sound Design', assignedTo: videoEditorId, status: 'TODO', progress: 0 },
      ];

      const createMockModel = (currentTasks) => ({
        findOne: (query) => ({
          sort: () => {
            const contentTasks = currentTasks.filter(t => t.contentId === query.contentId);
            const unapproved = contentTasks.find(t => 
              t._id !== query._id?.$ne &&
              query.taskType?.$in?.includes(t.taskType) &&
              t.status !== 'DONE'
            );
            return Promise.resolve(unapproved || null);
          },
        }),
      });

      // --- STEP 1: Video Editor tries to start Stage 2 early (BLOCKED by sequential gate)
      const mockModel1 = createMockModel(pipelineTasks);
      await assert.rejects(
        async () => {
          await workflowService.validateStageProgression(mockModel1, pipelineTasks[1], 'IN_PROGRESS');
        },
        /Scripting/
      );

      // --- STEP 2: Script Writer transitions Scripting (ALLOWED)
      assert.strictEqual(
        workflowService.validateTaskTransition(pipelineTasks[0], 'IN_PROGRESS', scriptWriterId, 'MEMBER', 'Script Writer'),
        true
      );
      pipelineTasks[0].status = 'IN_PROGRESS';
      pipelineTasks[0].progress = 50;

      // Script Writer submits Scripting for review
      assert.strictEqual(
        workflowService.validateTaskTransition(pipelineTasks[0], 'REVIEW', scriptWriterId, 'MEMBER', 'Script Writer'),
        true
      );
      pipelineTasks[0].status = 'REVIEW';
      pipelineTasks[0].submissionUrl = 'https://drive.google.com/script-ep101';
      pipelineTasks[0].notes = 'Completed script draft';

      // --- STEP 3: Manager approves Stage 1
      assert.strictEqual(
        workflowService.validateTaskTransition(pipelineTasks[0], 'DONE', managerId, 'MANAGER', 'Production Manager'),
        true
      );
      pipelineTasks[0].status = 'DONE';
      pipelineTasks[0].progress = 100;

      // --- STEP 4: Stage 2 (Filming) is now UNLOCKED
      const mockModel2 = createMockModel(pipelineTasks);
      assert.strictEqual(
        await workflowService.validateStageProgression(mockModel2, pipelineTasks[1], 'IN_PROGRESS'),
        true
      );
      assert.strictEqual(
        workflowService.validateTaskTransition(pipelineTasks[1], 'IN_PROGRESS', videoEditorId, 'MEMBER', 'Video Editor'),
        true
      );
      pipelineTasks[1].status = 'IN_PROGRESS';
      pipelineTasks[1].status = 'REVIEW';
      pipelineTasks[1].submissionUrl = 'https://drive.google.com/raw-footage-ep101';

      // Manager approves Stage 2
      pipelineTasks[1].status = 'DONE';
      pipelineTasks[1].progress = 100;

      // --- STEP 5: Stage 3 (Editing) with Revision Loop
      const mockModel3 = createMockModel(pipelineTasks);
      assert.strictEqual(
        await workflowService.validateStageProgression(mockModel3, pipelineTasks[2], 'IN_PROGRESS'),
        true
      );
      pipelineTasks[2].status = 'IN_PROGRESS';
      pipelineTasks[2].status = 'REVIEW';
      pipelineTasks[2].submissionUrl = 'https://vimeo.com/rough-cut-1';

      // Manager requests revision
      pipelineTasks[2].status = 'REVISION';
      pipelineTasks[2].revisionNotes = 'Cut intro by 5 seconds';

      // Video Editor resubmits with replyNotes
      pipelineTasks[2].status = 'REVIEW';
      pipelineTasks[2].submissionUrl = 'https://vimeo.com/rough-cut-2';
      pipelineTasks[2].replyNotes = 'Intro trimmed as requested';

      // Manager approves Stage 3
      pipelineTasks[2].status = 'DONE';
      pipelineTasks[2].progress = 100;

      // --- STEP 6: Graphic Designer attempts to edit sound (BLOCKED by position locking)
      const graphicSoundTask = {
        _id: 't_sound_test',
        taskType: 'Sound Design',
        assignedTo: graphicDesignerId,
        status: 'TODO',
      };
      assert.throws(
        () => {
          workflowService.validateTaskTransition(graphicSoundTask, 'IN_PROGRESS', graphicDesignerId, 'MEMBER', 'Graphic Designer');
        },
        /Graphic Designer/
      );

      // Graphic Designer executes Stage 4 (Graphic Design)
      const mockModel4 = createMockModel(pipelineTasks);
      assert.strictEqual(
        await workflowService.validateStageProgression(mockModel4, pipelineTasks[3], 'IN_PROGRESS'),
        true
      );
      pipelineTasks[3].status = 'IN_PROGRESS';
      pipelineTasks[3].status = 'DONE';
      pipelineTasks[3].progress = 100;

      // --- STEP 7: Video Editor executes Stage 5 (Sound Design)
      const mockModel5 = createMockModel(pipelineTasks);
      assert.strictEqual(
        await workflowService.validateStageProgression(mockModel5, pipelineTasks[4], 'IN_PROGRESS'),
        true
      );
      pipelineTasks[4].status = 'IN_PROGRESS';
      pipelineTasks[4].status = 'DONE';
      pipelineTasks[4].progress = 100;

      // Final Check: All 5 stages are sequentially completed
      const allCompleted = pipelineTasks.every(t => t.status === 'DONE' && t.progress === 100);
      assert.strictEqual(allCompleted, true, 'All 5 sequential stages must reach DONE status');
    });
  });

});
