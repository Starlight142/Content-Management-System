# Project: Draftly Production Workflow & Stage Approval System

## Architecture
Draftly is a media production management system comprising three subsystems:
1. **master/backend**: Express.js REST API, Mongoose ODM on MongoDB `content_management`, WebSocket service, and workflow state machine (`workflow.service.js`).
2. **master/admin-web**: Next.js 16 (React 19) web dashboard for system administration, team oversight, content scheduling, and tasks master.
3. **master/mobile-app**: React Native 0.87 (Android/iOS) mobile client for Studio Managers and Content Creators (Members).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Dynamic Default Dates (Backend) | Replace static date strings in seeds, add dynamic schema defaults in Task & Content | M1 | Survey |
| 2 | Position-Based Action Locking (Backend) | Validate member position against taskType in workflow service, rejecting invalid actions with 403 | M1 | Survey |
| 3 | Sequential Workflow Stage Pipeline (Backend) | Enforce 1 -> 2 -> 3 -> 4 -> 5 stage ordering with predecessor gate checks | M1 | Survey |
| 4 | Manager Stage Review & Step Progression (Backend) | Fix review approval to advance only current stage without mass-completing downstream tasks | M1 | Survey |
| 5 | Deliverable Metadata & Reply Synchronization (Backend) | Expose submission URLs, notes, and replyNotes across task and content review endpoints | M1 | Survey |
| 6 | Dynamic Default Dates (Admin Web) | Replace hardcoded dates ('2026-09-30', '2026-10-05') in contents & tasks pages with dynamic offsets | M2 | Survey |
| 7 | Admin Web Build & Interface Conformance | Ensure Next.js admin-web builds cleanly with updated dynamic date state | M2 | Survey |
| 8 | Dynamic Default Dates (Mobile) | Replace static dates ('2026-10-15', '2026-09-30') in ManagerDashboard forms and fallbacks | M3 | Survey |
| 9 | Collapsible Production Dashboard (Mobile) | Zero-dependency collapsible/expandable sections using native LayoutAnimation | M3 | Survey |
| 10 | Prioritized Top Review Queue (Mobile) | Render deliverables awaiting manager inspection at top of dashboard with URLs & reply notes | M3 | Survey |
| 11 | Position-Based Action Locking (Mobile) | Disable/lock action buttons for tasks outside member's position (e.g. Script Writer vs Editing) | M3 | Survey |
| 12 | Sequential Stage Locking & UI Progression (Mobile) | Disable actions for downstream tasks until predecessor stage is approved, displaying stage notices | M3 | Survey |
| 13 | Role-Consistent Review State Sync (Mobile) | Synchronize submission status, URLs, revision notes, and replies between Manager and Member | M3 | Survey |
| 14 | E2E Automated Verification Test Suite | Zero-dependency Node.js native test suite validating all workflow, position, date, and sync rules | M4 / E2E Track | Survey |
| 15 | Traceability & Dual Logging | Document updates in docs/PROJECT-DEVELOPMENT-LOG.md and .html; preserve PROJECT-HANDOVER.md | M4 | Survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend Workflow & Dynamic Dates | master/backend: models, seed, workflow.service, controllers | none | DONE |
| M2 | Admin Web Dynamic Dates | master/admin-web: contents/page, tasks/page | none | DONE |
| M3 | Mobile Production Dashboard & Stage Locking | master/mobile-app: ManagerDashboard, MemberTaskList | M1 | DONE |
| M4 | Final Milestone: E2E Verification & Delivery | E2E automated test execution, dual logging, git commit & push | M1, M2, M3 | IN_PROGRESS |

## Interface Contracts
### Workflow Service ↔ Task Controller & Routes
- `POSITION_TASK_MAP`:
  - `'Script Writer'`: `['Scripting']`
  - `'Content Creator'`: `['Filming', 'Scripting', 'Editing', 'Graphic Design', 'Sound Design', 'Other']`
  - `'Video Editor'`: `['Editing', 'Filming', 'Sound Design']`
  - `'Graphic Designer'`: `['Graphic Design']`
  - `'Production Manager'`: `['Scripting', 'Filming', 'Editing', 'Graphic Design', 'Sound Design', 'Other']`
  - `'Other'`: `['Scripting', 'Filming', 'Editing', 'Graphic Design', 'Sound Design', 'Other']`
- `STAGE_ORDER`:
  - `Scripting`: 1
  - `Filming`: 2
  - `Editing`: 3
  - `Graphic Design`: 4
  - `Sound Design`: 5
  - `Other`: 5
- Predecessor Stage Rule: For any task of stage $N > 1$, all predecessor tasks ($< N$) for the same `contentId` must have `status === 'DONE'`. Otherwise, transition is blocked.
- Review Rule: Manager review approval transitions only the reviewed task to `DONE`, unlocking stage $N+1$.

### Backend ↔ Mobile App / Admin Web
- Dates format: ISO YYYY-MM-DD generated dynamically via `new Date(Date.now() + offset).toISOString().split('T')[0]`.
- Task Review Metadata: `submissionUrl`, `notes`, `revisionNotes`, `replyNotes` returned in task objects.

## Code Layout
- `master/backend/src/database/models/`: `Task.js`, `Content.js`
- `master/backend/src/database/seed.js`
- `master/backend/src/services/workflow.service.js`
- `master/backend/src/modules/contents/contents.controller.js`
- `master/backend/src/modules/tasks/tasks.controller.js`
- `master/backend/tests/automated_verification.test.js`
- `master/admin-web/src/app/contents/page.jsx`
- `master/admin-web/src/app/tasks/page.jsx`
- `master/mobile-app/src/features/dashboard/ManagerDashboard.jsx`
- `master/mobile-app/src/features/tasks/MemberTaskList.jsx`
- `docs/PROJECT-DEVELOPMENT-LOG.md`
- `docs/PROJECT-DEVELOPMENT-LOG.html`
