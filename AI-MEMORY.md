# AI Context & Project Memory (AI-MEMORY.md)
> This document is the primary knowledge base and system context for AI coding assistants working on the Draftly Content Production Management System. When transferred to a new PC or opened in a new AI session, read this document first to gain full, accurate understanding of the project without missing any context.

---

## 1. Project Overview & Identity

- **Project Name**: Draftly — Content Production Management System (CMS)
- **Domain**: Media Production Workflow & Digital Studio Operations
- **Core Purpose**: Streamline the end-to-end media creation lifecycle in content studios:
  1. **Idea Stage**: Submit, evaluate, approve, or reject video concepts.
  2. **Production & Tasks**: Assign and track stage-based tasks (Scriptwriting, Shooting, Editing, Audio, Graphics).
  3. **Review & Revision Loop**: Managers review submissions, issue revision notes with specific timestamps, and creators respond with reply notes.
  4. **Direct Approval & Scheduling**: 1-tap direct approval and release scheduling across YouTube, TikTok, Facebook, and Instagram.
- **Academic Context**: University capstone/final course deliverable with 7 formal design specifications located in `docs/academic/`.

---

## 2. Invariant Project Rules & Anti-Patterns (Golden Rules for AI)

Every AI working on this repository MUST strictly follow these rules:

1. **NEVER TOUCH OR MODIFY `PROJECT-HANDOVER.md`**:
   - This file is permanently locked and excluded from Git tracking via `.gitignore`. Do not create, edit, rewrite, or attempt to re-track it under any circumstances.
2. **DO NOT RESTORE DELETED LEGACY CODE**:
   - `learning/` directory was completely removed (including obsolete node_modules).
   - `master/backend/src/year4-extensions/` was removed.
   - `master/backend/src/integrations/` was removed.
   - 12 empty mobile feature directories were removed (`features/analytics`, `calendar`, `contents`, `notifications`, `recommendations`, `review`, `trends`, `workflow`, `assets`, `hooks`, `store`, `utils`).
   - MongoDB database `cms_database` was dropped. Only `content_management` is active.
3. **KEEP IT SIMPLE, PROFESSIONAL & EMOJI-FREE**:
   - Code, UI text, logs, and documentation must reflect realistic human software engineering standards.
   - Avoid decorative emojis in UI buttons, headings, badges, and console logs.
   - Strictly avoid AI praise, sycophancy, or exaggerated claims. Provide direct, objective technical facts.
4. **MANDATORY DUAL-LOGGING ON EVERY CHANGE**:
   - Every single modification or development phase must be recorded in BOTH:
     - `docs/PROJECT-DEVELOPMENT-LOG.md` (Markdown format)
     - `docs/PROJECT-DEVELOPMENT-LOG.html` (Interactive Web format, keeping table of contents, sidebar nav, and content cards in sync)
5. **ALWAYS COMMIT & PUSH TO GITHUB**:
   - After completing any modification, run quality checks, stage changed files, commit with a concise descriptive message, and push directly to `origin/main`.

---

## 3. Technology Stack & Runtime Specifications

| Subsystem | Framework / Library | Version | Port / Runtime | Key Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Backend API** | Node.js / Express.js | Express `^5.2.1`, Node `>=20` | Port `5000` | REST API, JWT Auth, Mongoose ODM, WebSocket Server |
| **Database** | MongoDB Community Server | Mongoose `^9.10.1` | Port `27017` | Persistent storage (`content_management` DB) |
| **Realtime Engine**| `ws` (WebSocket) | `^8.21.3` | Port `5000` (shared HTTP) | Presence tracking, live activity broadcast |
| **Admin Web** | Next.js (App Router) / React | Next `16.3.5`, React `19.2.8` | Port `3000` | Admin dashboard, user/team management, audit logs |
| **Mobile App** | Bare React Native CLI (Android/iOS) | RN `0.87.1`, React `19.2.3` | Metro `8081` | Manager & Member mobile interface (Android target) |
| **Tunneling** | Cloudflare Tunnel (`cloudflared`) | Latest executable | Dynamic HTTPS URL | Remote testing on physical mobile over 4G/5G |

---

## 4. Transfer to a New PC: Complete Setup Guide

When transferring or cloning this repository onto a new machine:

### 4.1 Prerequisites
- **Node.js**: v20.x or v22.x LTS installed
- **MongoDB**: MongoDB Community Server running locally on `localhost:27017`
- **Git**: Installed and configured
- **Android Studio** (for Mobile App):
  - Android SDK Platform 34 or 35 installed
  - Android SDK Build-Tools, Platform-Tools (adb), and Emulator installed
  - Environment variables set: `ANDROID_HOME`, and `%ANDROID_HOME%\platform-tools` added to system `PATH`
  - A configured Android Virtual Device (AVD), e.g. Pixel 8 with API 34/35

### 4.2 Step 1: Backend Setup
```bash
cd master/backend
npm install

# Create environment configuration
copy .env.example .env
# Verify .env contents:
# PORT=5000
# MONGODB_URI=mongodb://127.0.0.1:27017/content_management
# JWT_SECRET=supersecretjwtkey_cms2026
# NODE_ENV=development

# Seed database with initial collections and test accounts
npm run seed

# Start backend server
npm run dev
# Or production mode: npm start
```
- **Health Verification**:
  ```bash
  curl http://localhost:5000/api/health
  ```
  Expected output: HTTP 200 with `"status": "healthy"`, `"database": { "status": "connected" }`.

### 4.3 Step 2: Admin Web Setup
```bash
cd master/admin-web
npm install

# Start Next.js development server
npm run dev
```
- **Access URL**: `http://localhost:3000`
- **Behavior**: Entering `http://localhost:3000` automatically redirects via HTTP 307 to `http://localhost:3000/login` if not authenticated.
- **Production Build Check**:
  ```bash
  npm run build
  ```

### 4.4 Step 3: Mobile App Setup (Android Emulator)
1. Start the Android Emulator from Android Studio or command line:
   ```bash
   emulator -list-avds
   emulator -avd <Your_AVD_Name>
   ```
2. In terminal:
   ```bash
   cd master/mobile-app
   npm install

   # Setup port forwarding for Android emulator
   adb reverse tcp:5000 tcp:5000
   adb reverse tcp:8081 tcp:8081

   # Start Metro bundler
   npm start

   # In a separate terminal, launch the Android app
   npm run android
   ```

---

## 5. Network, Port Conflicts & Operational Quirks

1. **Windows Port 5000 Binding Conflict**:
   - On some Windows machines, a background service (`SMTC-Bridge.exe` or system audio controller) may bind `127.0.0.1:5000` exclusively.
   - The Express backend handles this by listening on dual-stack (`0.0.0.0:5000` and `[::]:5000`).
   - In Admin Web, `presenceClient.js` includes an automatic fallback that tests IPv6 `[::1]:5000` if `localhost:5000` fails.
2. **Admin Web Authentication Guard**:
   - Implemented in `master/admin-web/src/middleware.js`.
   - Inspects the incoming request for the `admin_session` cookie. If missing, immediately returns `NextResponse.redirect('/login')` (HTTP 307).
   - Upon successful login, `admin_session=active` is written as a browser session cookie (cleared when the browser window closes).
   - JWT token and user profile are saved in `sessionStorage`.
3. **Mobile App Server Configuration Modes**:
   - Configurable in `master/mobile-app/src/components/ServerConfigModal.jsx`:
     - **Mode 1: Wi-Fi LAN**: `http://<LAN_IP>:5000/api` (for physical phones on the same Wi-Fi network).
     - **Mode 2: USB Cable / ADB**: `http://10.0.2.2:5000/api` or `http://localhost:5000/api` with `adb reverse tcp:5000 tcp:5000`.
     - **Mode 3: Cloudflare Tunnel**: Runs via `start-cloudflare-tunnel.ps1`, generating a public HTTPS URL without router port forwarding.
   - Network ping helper in `api.js` has a strict 2,500ms `AbortController` timeout to prevent UI blocking.
   - Real-time WebSocket dynamically updates via `presenceService.setCustomWsUrl(newWsUrl)`.

---

## 6. Database Reference & Seeded Accounts

- **Database Name**: `content_management` (on `mongodb://127.0.0.1:27017/`)
- **Active Collections (7)**:
  1. `users`: User profiles, hashed passwords, roles (`ADMIN`, `MANAGER`, `MEMBER`), team association, online presence.
  2. `teams`: Studio teams with unique team codes (`TEAM-A`, `TEAM-B`), leader ID, and member IDs.
  3. `contents`: Media production items with stages (`IDEA_SUBMITTED` -> `APPROVED` -> `PUBLISHED`), deadlines, review history.
  4. `tasks`: Subtasks assigned to members (`SCRIPT`, `SHOOTING`, `EDITING`, `AUDIO`, `GRAPHICS`), deliverables, and reply notes.
  5. `teamactivities`: Audit logs of all system events for activity feeds and analytics.
  6. `ideas`: Pitch proposals before formal production approval.
  7. `legalarticles`: Media law, copyright, and compliance reference library.

- **Pre-seeded Test Accounts** (Password for all: `123456`):
  | Role | Email | Password | Primary Interface | Team |
  | :--- | :--- | :--- | :--- | :--- |
  | **Manager** | `manager@studio.com` | `123456` | Mobile App | Content Team A (`TEAM-A`) |
  | **Member** | `member@studio.com` | `123456` | Mobile App | Content Team A (`TEAM-A`) |
  | **Admin** | `admin@studio.com` | `123456` | Admin Web | System Administrator |
  | **Member (Jane)** | `jane@studio.com` | `123456` | Mobile App | Content Team A (`TEAM-A`) |
  | **Member (Mike)** | `mike@studio.com` | `123456` | Mobile App | Content Team A (`TEAM-A`) |
  | **Member (Outsider)** | `outsider@studio.com` | `123456` | Mobile App | Beta Studio (`TEAM-B`) |

---

## 7. Directory Structure & Key Files Map

```text
Content-Management-System/
├── AI-MEMORY.md                      # THIS FILE: Primary AI memory and system context
├── AGENTS.md                         # Standard agent instructions for AI coding assistants
├── PROJECT-HANDOVER.md               # Local-only reference document (excluded from Git via .gitignore)
├── README.md                         # Human-facing project overview
├── start-cloudflare-tunnel.ps1       # Automated script to expose port 5000 via cloudflared
│
├── docs/                             # Project documentation
│   ├── academic/                     # 7 formal IEEE/Cockburn diagrams and data dictionary
│   ├── year-4-capstone/              # Future architecture expansion blueprints
│   ├── PROJECT-DEVELOPMENT-LOG.md    # Master development history log (Markdown)
│   └── PROJECT-DEVELOPMENT-LOG.html  # Master development history log (Interactive HTML)
│
├── master/
│   ├── backend/                      # Express REST API & WebSocket Server
│   │   ├── .env.example              # Environment variables template
│   │   ├── package.json              # Backend dependencies and scripts
│   │   └── src/
│   │       ├── app.js                # Express app setup and HTTP/WS server initialization
│   │       ├── config/db.js          # MongoDB connection handler
│   │       ├── database/
│   │       │   ├── models/           # Mongoose models (User, Team, Content, Task, etc.)
│   │       │   └── seed.js           # Database seeding script (npm run seed)
│   │       ├── middleware/auth.js    # JWT authentication and role authorization
│   │       ├── modules/              # Domain controllers and routes (auth, contents, tasks, users, etc.)
│   │       └── services/
│   │           └── presence.service.js # Real-time WebSocket presence server
│   │
│   ├── admin-web/                    # Next.js 14 Web Dashboard
│   │   ├── package.json              # Web dependencies (Next.js, React 19, Tailwind CSS v4)
│   │   └── src/
│   │       ├── middleware.js         # HTTP 307 route guard redirecting unauthenticated users to /login
│   │       ├── app/
│   │       │   ├── page.jsx          # Dashboard home (analytics, live counts)
│   │       │   ├── login/page.jsx    # Admin login screen
│   │       │   ├── contents/page.jsx # Content production manager with editing modal
│   │       │   ├── tasks/page.jsx    # Dual-tab task management & task types master
│   │       │   ├── users/page.jsx    # User management & team code configuration
│   │       │   ├── logs/page.jsx     # System activity audit logs & CSV export
│   │       │   └── settings/page.jsx # Studio settings & health latency monitor
│   │       ├── components/
│   │       │   ├── AdminShell.jsx    # Shell wrapper with client-side session validation
│   │       │   ├── Sidebar.jsx       # Navigation drawer
│   │       │   └── Topbar.jsx        # Top bar with live presence badge & notification bell
│   │       └── services/
│   │           └── presenceClient.js # WebSocket client with automatic fallback
│   │
│   └── mobile-app/                   # React Native CLI Android/iOS App
│       ├── package.json              # Mobile dependencies (RN 0.87.1)
│       └── src/
│           ├── components/
│           │   └── ServerConfigModal.jsx # 1-tap server switcher (Wi-Fi, USB, Tunnel)
│           ├── features/
│           │   ├── auth/LoginScreen.jsx  # Sign In / Sign Up with Team Code input
│           │   ├── dashboard/ManagerDashboard.jsx # Manager overview, action queue, 1-tap review
│           │   ├── ideas/IdeaListScreen.jsx       # Idea submission and approval
│           │   ├── profile/ProfileScreen.jsx      # Profile details and dynamic team display
│           │   ├── tasks/MemberTaskList.jsx       # Creator task list, deliverable links & reply notes
│           │   └── team/TeamOverviewScreen.jsx    # Team workspace with Team Code badge
│           ├── navigation/           # Role-based navigation navigators
│           ├── services/
│           │   ├── api.js            # Axios/Fetch client with server ping helper
│           │   └── presenceService.js # Mobile WebSocket presence service
│           └── theme/ThemeContext.jsx # Theme provider (Light/Dark mode)
```

---

## 8. Development Workflow & Verification Procedures

Before delivering any work, always execute the following quality checks:

1. **Backend Syntax Check**:
   ```bash
   node -c master/backend/src/app.js
   ```
2. **Admin Web Linter & Production Build**:
   ```bash
   cd master/admin-web
   npm run lint
   npm run build
   ```
3. **Log Synchronization**:
   - Append changes to `docs/PROJECT-DEVELOPMENT-LOG.md`.
   - Mirror changes in `docs/PROJECT-DEVELOPMENT-LOG.html` (including navigation sidebar and timeline index).
4. **Git Verification & Remote Synchronization**:
   ```bash
   git status
   # Ensure PROJECT-HANDOVER.md is NOT modified and NOT tracked
   git add <modified_files>
   git commit -m "<concise descriptive message>"
   git push origin main
   ```
