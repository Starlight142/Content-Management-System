# AI Context & Project Memory (AI-MEMORY.md)
> This document is the primary knowledge base and system context for AI coding assistants working on the Draftly Content Production Management System. When transferred to a new PC or opened in a new AI session, read this document first to gain full, accurate understanding of the project without missing any context.

---

## 1. Project Overview & Identity

- **Project Name**: Draftly — Content Production Management System (CMS)
- **Mobile Application Package**: `com.draftly` (`Draftly`, module `"draftly-mobile"`)
- **Domain**: Media Production Workflow & Digital Studio Operations
- **Core Purpose**: Streamline the end-to-end media creation lifecycle in content studios:
  1. **Idea Stage**: Submit, upvote, approve, or delete video concepts (delete restricted to `ADMIN`, `MANAGER`, or the topic creator `proposedBy`).
  2. **Automatic Sequential Production Pipeline (`1 -> 2 -> 3 -> 4 -> 5`)**: Auto-assign and track stage-based tasks across the 5 studio positions (`Production Manager`, `Video Editor`, `Script Writer`, `Graphic Designer`, `Content Creator`).
  3. **Review & Revision Loop**: Managers review submissions, issue revision notes, and creators respond with reply notes.
  4. **Direct Approval & Publishing**: 1-tap direct approval and publishing across YouTube, TikTok, and Instagram.

---

## 2. Invariant Project Rules & Anti-Patterns (Golden Rules for AI)

Every AI working on this repository MUST strictly follow these rules:

1. **NEVER TOUCH OR MODIFY `PROJECT-HANDOVER.md`**:
   - This file is permanently locked and excluded from Git tracking via `.gitignore`. Do not create, edit, rewrite, or attempt to re-track it under any circumstances.
2. **DO NOT RESTORE DELETED LEGACY CODE**:
   - `learning/` directory was completely removed.
   - `master/backend/src/year4-extensions/` and `master/backend/src/integrations/` were removed.
   - 12 empty mobile feature directories were removed.
   - MongoDB database `cms_database` was dropped. Only `content_management` is active.
   - Collection `legalarticles`, model `LegalArticle.js`, and `master/backend/src/modules/legal/` were removed.
3. **KEEP IT SIMPLE, PROFESSIONAL & EMOJI-FREE**:
   - Code, UI text, logs, and documentation must reflect realistic human software engineering standards.
   - Avoid decorative emojis in UI buttons, headings, badges, and console logs.
   - Strictly avoid AI praise, sycophancy, or exaggerated claims.
4. **MANDATORY DUAL-LOGGING WITH EXPLICIT CODE DIFFS ON EVERY CHANGE**:
   - Every single modification or development phase must be recorded with explicit code diffs (`-` removed / `+` added) in BOTH:
     - `docs/PROJECT-DEVELOPMENT-LOG.md` (Markdown format)
     - `docs/PROJECT-DEVELOPMENT-LOG.html` (Interactive Web format)
5. **AUTO-VERSIONING, COMMIT & PUSH TO GITHUB**:
   - Version numbers (`1.5.<commitCount>`) automatically increment on every commit via `tools/version/bump_version.js` and `.git/hooks/pre-commit`.
   - After completing any modification, run quality checks, stage changed files, commit cleanly, and push directly to `origin/main`.

---

## 3. Technology Stack & Runtime Specifications

| Subsystem | Framework / Library | Package Name | Port / Runtime | Key Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Backend API** | Node.js / Express.js `^5.2.1` | `draftly-backend` | Port `5000` | REST API, JWT Auth, Mongoose ODM, WebSocket Server, Auto-Versioning |
| **Database** | MongoDB Community Server | `content_management` | Port `27017` | Persistent storage (6 collections, 33 canonical records) |
| **Realtime Engine**| `ws` (WebSocket) `^8.21.3` | Shared with Backend | Port `5000` | Presence tracking, live activity broadcast |
| **Admin Web** | Next.js `16.3.5` (Webpack) / React `19.2.8` | `draftly-admin` | Port `3000` | Admin dashboard, user/team management, audit logs |
| **Mobile App** | Bare React Native CLI `0.87.1` | `draftly-mobile` (`com.draftly`) | Metro `8081` | Manager & Member mobile interface (`Draftly`) |

---

## 4. Sequential Pipeline (`1 -> 2 -> 3 -> 4 -> 5`) & Studio Positions

### 4.1 The 5 Strict Studio Positions
- `Production Manager`
- `Video Editor`
- `Script Writer`
- `Graphic Designer`
- `Content Creator`

### 4.2 Automatic Sequential Stage Assignment (`workflow.service.js`)
When creating content from UI (`autoCreateTasks: true`) or adding a subtask (`autoAssign: true`), the system automatically assigns the stage and responsible team member in strict order without manual selection:
1. **Stage 1 (`Scripting`)**: เขียนบทและสคริปต์ $\rightarrow$ Auto-assigned to `Script Writer`
2. **Stage 2 (`Filming`)**: ถ่ายทำฟุตเทจหลัก $\rightarrow$ Auto-assigned to `Video Editor`
3. **Stage 3 (`Editing`)**: ตัดต่อวิดีโอหลัก $\rightarrow$ Auto-assigned to `Video Editor`
4. **Stage 4 (`Graphic Design`)**: ออกแบบภาพปกและกราฟิก $\rightarrow$ Auto-assigned to `Graphic Designer`
5. **Stage 5 (`Sound Design`)**: มิกซ์เสียงและดนตรีประกอบ $\rightarrow$ Auto-assigned to `Video Editor`

---

## 5. Transfer to a New PC: Complete Setup Guide

### 5.1 One-Click AI Skills & Hook Setup
```powershell
powershell -ExecutionPolicy Bypass -File .\tools\ai-skills\install-skills-to-machine.ps1
node tools/version/bump_version.js
```
Installs `ponytail`, `diagram-design`, and `draftly-portable` skills plus the `.git/hooks/pre-commit` auto-versioning hook.

### 5.2 Step 1: Backend Setup (`Port 5000`)
```powershell
cd master/backend
npm install
npm run seed
npm run dev
```
- **Health & Version Verification**: `curl http://localhost:5000/api/health`
- **Native Test Suite (39/39 tests)**: `npm test --prefix master/backend`

### 5.3 Step 2: Admin Web Setup (`Port 3000`)
```powershell
cd master/admin-web
npm install
npm run lint
npm run build
npm run dev
```

### 5.4 Step 3: Mobile App Setup (`com.draftly` / `Draftly`, `Port 8081`)
1. Ensure **JDK 17** is active (`JAVA_HOME`).
2. Reverse ports for connected Android emulator/device:
   ```powershell
   adb devices
   adb reverse tcp:5000 tcp:5000
   adb reverse tcp:8081 tcp:8081
   # Or if multiple devices are attached:
   adb -s emulator-5554 reverse tcp:5000 tcp:5000
   adb -s emulator-5554 reverse tcp:8081 tcp:8081
   ```
3. Run the app:
   ```powershell
   cd master/mobile-app
   npm install
   npm run android
   # Launch directly via ADB:
   adb shell am start -n com.draftly/.MainActivity
   ```

---

## 6. Database Reference & Seeded Accounts (`content_management`)

- **Pre-seeded Test Accounts** (Password for all: `123456`):
  | Role | Position | Email | Password | Team |
  | :--- | :--- | :--- | :--- | :--- |
  | **Admin** | `Production Manager` | `admin@studio.com` | `123456` | System Administrator |
  | **Manager (สมศรี)** | `Production Manager` | `manager@studio.com` | `123456` | Content Team A (`TEAM-A`) |
  | **Member (John Editor)** | `Video Editor` | `member@studio.com` | `123456` | Content Team A (`TEAM-A`) |
  | **Member (Jane Script)** | `Script Writer` | `jane@studio.com` | `123456` | Content Team A (`TEAM-A`) |
  | **Member (Mike Graphic)** | `Graphic Designer` | `mike@studio.com` | `123456` | Content Team A (`TEAM-A`) |
  | **Member (Bow Graphic)** | `Graphic Designer` | `bow@studio.com` | `123456` | Content Team A (`TEAM-A`) |
  | **Manager B (กานดา)** | `Production Manager` | `manager.b@studio.com` | `123456` | Beta Studio (`TEAM-B`) |
  | **Member B (Outsider)** | `Content Creator` | `outsider@studio.com` | `123456` | Beta Studio (`TEAM-B`) |

---

## 7. Organized Directory Structure

```text
Content-Management-System/
├── AI-MEMORY.md                      # Primary AI memory and system context
├── AI-PORTABLE-PROMPT.md             # Ready-to-copy master prompt for any AI assistant on another PC
├── AGENTS.md                         # Operational rules and prime directives
├── PROJECT.md                        # System overview and architecture summary
├── README.md                         # Human-facing project README
├── PROJECT-HANDOVER.md               # Locked local file (permanently git-ignored, DO NOT TOUCH)
│
├── .agents/                          # Workspace AI skills & rules
│   ├── rules/ponytail.md
│   └── skills/
│       ├── ponytail/SKILL.md
│       ├── diagram-design/SKILL.md
│       └── draftly-portable/SKILL.md
│
├── docs/                             # All documentation & academic deliverables
│   ├── academic/                     # Formal SRS documents, Draw.io diagrams, Word reports, Excel sheets
│   ├── testing/                      # TEST_INFRA.md & TEST_READY.md test attestations
│   ├── master/                       # Detailed subsystem technical guides
│   ├── screenshots/                  # Admin Web & Mobile App screenshots
│   ├── videos/                       # Automated E2E demo videos
│   ├── PROJECT-DEVELOPMENT-LOG.md    # Master development history with code diffs (Markdown)
│   └── PROJECT-DEVELOPMENT-LOG.html  # Master development history with code diffs (Interactive HTML)
│
├── master/                           # Core application source code
│   ├── backend/                      # Express 5 REST API + WebSocket Server (Port 5000)
│   ├── admin-web/                    # Next.js 16 Admin Web Dashboard (Port 3000)
│   ├── mobile-app/                   # React Native 0.87 Mobile App (com.draftly / Draftly)
│   └── database/                     # Portable MongoDB dumps & Compass JSON exports
│
├── tests/                            # Automated Robot Framework E2E test suite (28/28 tests)
└── tools/                            # Automation & portability utilities
    ├── ai-skills/                    # 1-click portable skill installers (.ps1 / .bat)
    ├── version/bump_version.js       # GitHub commit-based auto-versioning script
    ├── word/                         # Word SRS document generators
    ├── excel/                        # Excel test case & DB export generators
    ├── screenshots/                  # Screenshot & video capture scripts
    └── tunnel/                       # Cloudflare Tunnel scripts
```
