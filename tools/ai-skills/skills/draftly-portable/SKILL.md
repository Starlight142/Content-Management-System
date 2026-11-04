---
name: draftly-portable
description: Complete portable machine-migration and environment bootstrap skill for the Draftly Content Production Management System. Use this skill when moving the repository to a new PC, initializing a fresh AI session, verifying services (MongoDB, Express API, Next.js Admin Web, React Native Mobile App), or running end-to-end health checks.
---

# Draftly Portable Machine Migration & Setup Skill

Use this skill whenever the user moves the project to a new PC, starts a fresh session, or asks to set up, verify, or run the Draftly Content Production Management System (`com.draftly`).

---

## 1. Non-Negotiable Project Invariants

1. **NEVER TOUCH `PROJECT-HANDOVER.md`**: It is permanently git-ignored (`!! PROJECT-HANDOVER.md`). Never create, edit, or stage it.
2. **NO EMOJIS / NO AI PRAISE**: Keep all code, UI text, logs, and commit messages clean, objective, and free of decorative emojis.
3. **ACTIVE DATABASE ONLY (`content_management`)**: Never restore `cms_database`, `learning/`, `modules/legal/`, `year4-extensions/`, or `integrations/`.
4. **MANDATORY DUAL-LOGGING**: Record every change with explicit code diffs (`-` removed / `+` added) in BOTH `docs/PROJECT-DEVELOPMENT-LOG.md` and `docs/PROJECT-DEVELOPMENT-LOG.html`.
5. **AUTO-VERSIONING & GITHUB PUSH**: Run `node tools/version/bump_version.js` (or rely on `.git/hooks/pre-commit`) so `package.json` and `build.gradle` version (`1.5.<commitCount>`) stay synced with GitHub commits, then commit and push to `origin/main`.

---

## 2. Core Domain & Workflow Architecture

- **5 Studio Positions (Strict Enum)**:
  1. `Production Manager`
  2. `Video Editor`
  3. `Script Writer`
  4. `Graphic Designer`
  5. `Content Creator`
- **Automatic Sequential Pipeline (`1 -> 2 -> 3 -> 4 -> 5`)**:
  - Stage 1 (`Scripting`): Auto-assigned to `Script Writer`
  - Stage 2 (`Filming`): Auto-assigned to `Video Editor`
  - Stage 3 (`Editing`): Auto-assigned to `Video Editor`
  - Stage 4 (`Graphic Design`): Auto-assigned to `Graphic Designer`
  - Stage 5 (`Sound Design`): Auto-assigned to `Video Editor`
  - Stage $N > 1$ is locked until Stage $N - 1$ is approved (`DONE`) by the Manager.
- **Idea Brainstorming Permissions**:
  - Anyone in the team can propose and upvote ideas.
  - Only `ADMIN`, `MANAGER`, or the member who created the topic (`proposedBy`) can delete an idea (`DELETE /api/ideas/:id`).

---

## 3. Step-by-Step New Machine Bootstrap

### Step 1: Install AI Skills & Git Pre-Commit Hook
```powershell
powershell -ExecutionPolicy Bypass -File .\tools\ai-skills\install-skills-to-machine.ps1
node tools/version/bump_version.js
```

### Step 2: Backend & MongoDB (`Port 5000`)
```powershell
cd master/backend
npm install
# Ensure MongoDB is running on mongodb://127.0.0.1:27017/content_management
npm run seed
npm run dev
```
- Verify health & live version: `curl http://localhost:5000/api/health`
- Run backend native test suite (39/39 tests): `npm test --prefix master/backend`

### Step 3: Admin Web (`Port 3000`)
```powershell
cd master/admin-web
npm install
npm run lint
npm run build
npm run dev
```

### Step 4: Mobile App (`com.draftly` / `Draftly`, `Port 8081`)
- Ensure **JDK 17** is active in `JAVA_HOME`.
- Bind ports for all connected Android devices/emulators:
  ```powershell
  adb devices
  # For single device:
  adb reverse tcp:5000 tcp:5000
  adb reverse tcp:8081 tcp:8081
  # If multiple devices are attached (e.g. emulator-5554):
  adb -s emulator-5554 reverse tcp:5000 tcp:5000
  adb -s emulator-5554 reverse tcp:8081 tcp:8081
  ```
- Launch app (`com.draftly`):
  ```powershell
  cd master/mobile-app
  npm install
  npm run android
  # Or launch directly via ADB:
  adb shell am start -n com.draftly/.MainActivity
  ```
