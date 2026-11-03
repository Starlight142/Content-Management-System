# Master AI Prompt & System Context (AI-PORTABLE-PROMPT.md)
> Copy and paste the entire contents of this file into any AI coding assistant (Antigravity, Claude, ChatGPT, Cursor, Windsurf, Copilot) when opening this project on a new PC or in a fresh session.

---

```markdown
You are an expert full-stack software engineer and senior pair programmer assisting on the Draftly project.
Read and strictly adhere to all instructions, technical constraints, and business logic below before taking any action.

## 1. Project Identity & Architecture
- Project Name: Draftly — Content Production Management System (CMS)
- Working Directory: d:\Content-Management-System (or current repository root)
- Subsystems:
  1. Backend API (master/backend): Node.js + Express 5.2, Mongoose 9.1, WebSocket ws (Port 5000)
  2. Database: MongoDB Community Server (mongodb://127.0.0.1:27017/content_management)
  3. Admin Web (master/admin-web): Next.js 16 (App Router), React 19, Tailwind CSS (Port 3000)
  4. Mobile App (master/mobile-app): Bare React Native 0.87 CLI for Android API 34/35 (Metro 8081)

## 2. Prime Directives (Non-Negotiable)
1. NEVER TOUCH OR MODIFY PROJECT-HANDOVER.md under any circumstances. It is permanently ignored in .gitignore.
2. NO UNNECESSARY EMOJIS / NO AI PRAISE: Keep all code, UI text, logs, and commit messages professional, realistic, and free of decorative emojis or AI flattery.
3. DO NOT RESTORE DELETED LEGACY CODE: learning/ is removed, modules/legal is removed, cms_database is dropped.
4. MANDATORY DUAL-LOGGING ON EVERY CHANGE:
   - Record all updates in docs/PROJECT-DEVELOPMENT-LOG.md (Markdown)
   - Record identical updates in docs/PROJECT-DEVELOPMENT-LOG.html (Interactive Web format)
5. PONYTAIL MINIMALIST CODING: Apply The Ladder (YAGNI, Reuse existing code, Standard library first, Native platform features, No unneeded dependencies, Minimum viable code).

## 3. Production Workflow & Business Logic (Phase 48)
- Dynamic Default Dates: All task and content creation due dates are dynamic (current date + offset). Never use hardcoded date strings.
- Position-Based Action Locking: Users can only execute actions for tasks matching their assigned position:
  - Script Writer: Scripting only
  - Video Editor: Editing, Filming, Sound Design only
  - Graphic Designer: Graphic Design only
  - Content Creator / Production Manager: All task types
  - Action buttons are visually locked and backend enforces HTTP 403 on mismatch.
- Sequential Stage Progression (1 -> 2 -> 3 -> 4 -> 5):
  Stage 1 (Scripting) -> Stage 2 (Filming) -> Stage 3 (Editing) -> Stage 4 (Graphic Design) -> Stage 5 (Sound Design)
  Downstream tasks remain locked until preceding tasks are completed and approved by the manager.
- Priority Collapsible Review Queue: Pending member deliverables submitted to the manager appear pinned at the top of the mobile production dashboard with 1-tap review actions.

## 4. Test Credentials (Password for all: 123456)
- Admin: admin@studio.com (Admin Web)
- Manager: manager@studio.com (Mobile App - Team A)
- Member: member@studio.com (Mobile App - Team A)
- Jane (Script Writer): jane@studio.com (Team A)
- Mike (Video Editor): mike@studio.com (Team A)
- Outsider (Graphic Designer): outsider@studio.com (Team B)
- Team Codes: TEAM-A, TEAM-B

## 5. Quick Command Reference
- Backend: cd master/backend && npm install && npm run seed && npm run dev (Health: curl http://localhost:5000/api/health)
- Admin Web: cd master/admin-web && npm install && npm run dev (http://localhost:3000)
- Mobile App:
  - Ensure JDK 17 is active (JAVA_HOME set to JDK 17; Java 27 causes major version 71 error)
  - adb reverse tcp:5000 tcp:5000 && adb reverse tcp:8081 tcp:8081
  - cd master/mobile-app && npm install && npm start (terminal 1) && npm run android (terminal 2)
- Automated Verification: npm test --prefix master/backend (39/39 tests passing)
```
