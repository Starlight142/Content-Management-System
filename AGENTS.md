# Agent Instructions & Operational Guidelines (AGENTS.md)

Welcome, AI Agent. This repository contains the **Draftly Content Production Management System**.
Before performing any action, read [AI-MEMORY.md](./AI-MEMORY.md) for complete technical architecture, operational quirks, and database references.

---

## 1. Prime Directives (Non-Negotiable Rules)

1. **NEVER TOUCH OR MODIFY `PROJECT-HANDOVER.md`**:
   - This file is permanently locked and ignored in `.gitignore`. Do not create, edit, rewrite, or attempt to track it in Git.
2. **NO UNNECESSARY EMOJIS / NO AI PRAISE**:
   - Keep all code, UI text, logs, and commit messages professional, simple, and realistic.
   - Do not use decorative emojis.
   - Avoid conversational flattery or AI-generated exaggerations.
3. **DO NOT RESTORE DELETED LEGACY CODE**:
   - `learning/` directory is deleted.
   - `master/backend/src/year4-extensions/` is deleted.
   - `master/backend/src/integrations/` is deleted.
   - 12 empty mobile feature directories are deleted.
   - `cms_database` MongoDB database was dropped. Active DB is `content_management`.
4. **DOCUMENT ALL CHANGES IN BOTH LOGS**:
   - Every single task or update must be recorded in BOTH:
     - `docs/PROJECT-DEVELOPMENT-LOG.md` (Markdown format)
     - `docs/PROJECT-DEVELOPMENT-LOG.html` (Interactive Web format)
5. **COMMIT AND PUSH TO GITHUB EVERY TIME**:
   - After completing tasks, stage changed files, commit cleanly, and push to `origin/main`.

---

## 2. Quick Command Reference

- **Backend**:
  - Location: `master/backend`
  - Seed: `npm run seed`
  - Start: `npm run dev` (Port 5000)
  - Health: `curl http://localhost:5000/api/health`
- **Admin Web**:
  - Location: `master/admin-web`
  - Start: `npm run dev` (Port 3000)
  - Lint: `npm run lint`
  - Build: `npm run build`
- **Mobile App**:
  - Location: `master/mobile-app`
  - Reverse Ports: `adb reverse tcp:5000 tcp:5000` & `adb reverse tcp:8081 tcp:8081`
  - Metro: `npm start`
  - Android: `npm run android`

---

## 3. Key Credentials & Configurations

- **Database**: `mongodb://127.0.0.1:27017/content_management`
- **Test Accounts** (Password: `123456`):
  - Admin: `admin@studio.com` (Admin Web)
  - Manager: `manager@studio.com` (Mobile App - Team A)
  - Member: `member@studio.com` (Mobile App - Team A)
- **Team Code**: `TEAM-A` (Content Team A), `TEAM-B` (Beta Studio)
