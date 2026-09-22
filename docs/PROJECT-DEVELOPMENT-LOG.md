# 📜 บันทึกประวัติการพัฒนาระบบ (Project Development & Engineering Log)
> **โครงการ:** Draftly — Content Production Management System (ระบบจัดการกระบวนการผลิตสื่อครบวงจร)  
> **เส้นทางโปรเจกต์:** `d:\Content-Management-System`  
> **ผู้พัฒนา:** คุณ (Developer) & Antigravity (Senior AI Mentor / Pair Programmer)  
> **อัปเดตล่าสุด:** 22 กันยายน 2026 เวลา 15:15 น.  

---

## 📌 สารบัญภาพรวมตามไทม์ไลน์ (Timeline Index)

| ช่วงเวลา | หัวข้อบันทึก | สถานะ |
| :--- | :--- | :--- |
| **17 ก.ย. 2026 (10:00 - 18:30 น.)** | [Phase 1: Backend Foundation (PostgreSQL สู่ MongoDB)](#phase-1-backend-foundation) | สำเร็จ ✅ |
| **18 ก.ย. 2026 (09:30 - 16:45 น.)** | [Phase 2: Admin Web Development (Next.js .jsx + 100% Interactivity)](#phase-2-admin-web-development) | สำเร็จ ✅ |
| **18 ก.ย. 2026 (17:00 - 21:30 น.)** | [Phase 3: Mobile App Development (React Native CLI + Role Navigation)](#phase-3-mobile-app-development) | สำเร็จ ✅ |
| **18 ก.ย. 2026 (21:45 - 22:15 น.)** | [Phase 4: การจัดระเบียบโครงสร้าง Master vs Learning](#phase-4-การจัดระเบียบโครงสร้าง-master-vs-learning) | สำเร็จ ✅ |
| **18 ก.ย. 2026 (22:15 - 23:50 น.)** | [Phase 5: บันทึกบทเรียนการลงมือเขียนโค้ดด้วยตัวเอง (Learning Progress)](#phase-5-บันทึกบทเรียนการลงมือเขียนโค้ดด้วยตัวเอง) | บทที่ 1-2 ✅ / บทที่ 3 ⏳ |
| **19 ก.ย. 2026 (00:15 - 01:10 น.)** | [Phase 6: การยกระดับสู่ Senior Capstone & 8 เอกสารวิชาการ UML](#phase-6-การยกระดับสู่-senior-capstone--8-เอกสารวิชาการ-uml) | สำเร็จ ✅ |
| **19 ก.ย. 2026 (01:15 - 01:20 น.)** | [Phase 7: การจัดแยกโฟลเดอร์สำหรับโครงงานปี 4 (Year 4 Scoping & Isolation)](#phase-7-การจัดแยกโฟลเดอร์สำหรับโครงงานปี-4-year-4-scoping--isolation) | สำเร็จ ✅ |
| **19 ก.ย. 2026 (01:40 - 01:48 น.)** | [Phase 8: การจัดการ Git Branching & ปรับปรุงหน้า GitHub Repository สู่มาตรฐานวิชาการ](#phase-8-การจัดการ-git-branching--ปรับปรุงหน้า-github-repository-สู่มาตรฐานวิชาการ-academic-clean-presentation) | สำเร็จ ✅ |
| **21 ก.ย. 2026 (22:50 - 23:00 น.)** | [Phase 9: การปรับปรุงอัตลักษณ์และเปลี่ยนชื่อระบบสู่ "Draftly" (Application Rebranding)](#phase-9-การปรับปรุงอัตลักษณ์และเปลี่ยนชื่อระบบสู่-draftly-application-rebranding) | สำเร็จ ✅ |
| **21 ก.ย. 2026 (23:10 - 23:20 น.)** | [Phase 10: ปรับปรุงประสบการณ์ผู้ใช้ (UI/UX Refinement) & คุมโทนสีตาม Semantic States](#phase-10-ปรับปรุงประสบการณ์ผู้ใช้-uiux-refinement--คุมโทนสีตาม-semantic-states) | สำเร็จ ✅ |
| **21 ก.ย. 2026 (23:30 - 23:45 น.)** | [Phase 11: เพิ่มระบบคอมเมนต์ตรวจงานของ Manager, ออกแบบ Custom Single-Tone Tab Icons](#phase-11-เพิ่มระบบคอมเมนต์ตรวจงานของ-manager-ออกแบบ-custom-single-tone-tab-icons-และลดไอคอนฟุ่มเฟือย) | สำเร็จ ✅ |
| **22 ก.ย. 2026 (00:00 - 00:15 น.)** | [Phase 12: การเชื่อมต่อระบบและการทำงานครบวงจร 100% (Full End-to-End System Integration)](#phase-12-การเชื่อมต่อระบบและการทำงานครบวงจร-100-full-end-to-end-system-integration) | สำเร็จ ✅ |
| **22 ก.ย. 2026 (14:05 - 14:30 น.)** | [Phase 13: การย้ายสู่เครื่องพัฒนาเครื่องใหม่ & การตั้งค่า Android Environment](#phase-13-การย้ายสู่เครื่องพัฒนาเครื่องใหม่--การตั้งค่า-android-environment-fresh-machine-migration) | สำเร็จ ✅ |
| **22 ก.ย. 2026 (14:45 - 15:15 น.)** | [Phase 14: การยกระดับสถาปัตยกรรมสู่ Team-Based Workspace & การยกเลิก Mock Data สู่ MongoDB 100%](#phase-14-การยกระดับสถาปัตยกรรมสู่-team-based-workspace--การยกเลิก-mock-data-สู่-mongodb-100) | สำเร็จ ✅ |
| **23 ก.ย. 2026 (02:00 - 02:25 น.)** | [Phase 15: ระบบสลับโหมด Dark Mode และ Light Mode (Dynamic Theming System)](#phase-15-ระบบสลับโหมด-dark-mode-และ-light-mode-dynamic-theming-system) | สำเร็จ ✅ |
| **23 ก.ย. 2026 (02:25 น.)** | [แผนที่ไฟล์และดัชนีเอกสารทั้งหมด (Documentation Catalog)](#แผนที่ไฟล์และดัชนีเอกสารทั้งหมด) | ปัจจุบัน 📍 |

---

## 1. จุดเริ่มต้นและวิสัยทัศน์ของระบบ (System Vision)
> 🕒 **บันทึกเมื่อ:** 17 กันยายน 2026 (10:00 น.)

ระบบถูกออกแบบขึ้นเพื่อบริหารกระบวนการผลิตสื่อตั้งแต่ต้นจนจบ (End-to-End Media Pipeline):
$$\text{Idea} \rightarrow \text{Planning} \rightarrow \text{Task Assignment} \rightarrow \text{Production} \rightarrow \text{Legal Check} \rightarrow \text{Review} \rightarrow \text{Revision} \circlearrowleft \rightarrow \text{Approval} \rightarrow \text{Schedule} \rightarrow \text{Publish} \rightarrow \text{Analytics}$$

### 4 เสาหลักของระบบ (4 Core Pillars):
1. **Content Production Management**: วงจรงานสร้างสรรค์, การแตก Task ย่อย, การตรวจงาน และคิวงาน
2. **Content Intelligence**: เก็บสถิติ Performance จาก YouTube Data API v3 และ TikTok API
3. **Recommendation Engine**: วิเคราะห์แนวโน้มเพื่อแนะนำหัวข้อและเวลาโพสต์ที่เหมาะสม
4. **Legal & Compliance Gatekeeper**: ระบบ Checklist ตรวจสอบลิขสิทธิ์เพลง, PDPA, เครื่องหมายการค้า และกฎชุมชน 100% ก่อนเผยแพร่

---

## Phase 1: Backend Foundation
> 🕒 **ช่วงเวลาดำเนินงาน:** 17 กันยายน 2026 (10:30 - 18:30 น.)

### 1.1 เริ่มต้นด้วย Relational Database (PostgreSQL) — [17 ก.ย. 2026 \| 10:30 น.]
- ออกแบบฐานข้อมูลแบบ Relational ในไฟล์ `database/schema.sql`
- กำหนดตารางมาตรฐาน: `users`, `user_role`, `team`, `content`, `task`, `legal_article`
- ติดตั้ง Express.js, เชื่อมต่อผ่านไลบรารี `pg` (Connection Pool)
- สร้างระบบ JWT Authentication และ Middleware ตรวจสอบสิทธิ์ (RBAC: Admin, Manager, Member)

### 1.2 การปรับเปลี่ยนครั้งสำคัญ: สู่ MongoDB + Mongoose (NoSQL) — [17 ก.ย. 2026 \| 15:00 น.]
- ผู้พัฒนาสั่งการให้เปลี่ยนฐานข้อมูลเป็น MongoDB เพื่อความคล่องตัวในการเก็บข้อมูลมีเดียและ Time-series metrics
- ถอดไลบรารี `pg` ออก และติดตั้ง `mongoose`
- สร้าง Mongoose Models (`src/database/models/`):
  - `User.js`: รองรับ Role `ADMIN`, `MANAGER`, `MEMBER` พร้อม Password Hash
  - `Content.js`: รองรับฝัง Subdocuments สำหรับ `metrics` (ยอดวิว, ยอดแชร์) และ `legalChecklist`
  - `Task.js`: บันทึกงานย่อย, ลิงก์ส่งงาน (`submissionUrl`), และสถานะ
  - `Idea.js`, `Team.js`, `LegalArticle.js`
- ปรับปรุง Controllers ทั้งหมดเป็นคำสั่ง Mongoose (`.find()`, `.create()`, `.findByIdAndUpdate()`, `.populate()`)
- **สร้าง Seed Script (`npm run seed`) [17 ก.ย. 2026 \| 18:00 น.]**: สั่งจำลองข้อมูลทั้งระบบอัตโนมัติด้วยคำสั่งเดียว

---

## Phase 2: Admin Web Development (Next.js)
> 🕒 **ช่วงเวลาดำเนินงาน:** 18 กันยายน 2026 (09:30 - 16:45 น.)

### 2.1 ปรับภาษาเป็น JavaScript (`.jsx`) ล้วน — [18 ก.ย. 2026 \| 09:30 น.]
- แปลงไฟล์จาก TypeScript (`.tsx`) เป็น **JavaScript (`.jsx`) 100%** เพื่อความคล่องตัวในการพัฒนา
- เคลียร์แคช `.next` และแก้ปัญหา Typings เก่าตกค้าง

### 2.2 ปรับแก้ Dark Mode Conflict สู่ Light Clean Theme — [18 ก.ย. 2026 \| 11:15 น.]
- ตรวจพบปัญหาหน้าจอดำจากเบราว์เซอร์ Dark Mode ในภาพถ่ายหน้าจอ
- แก้ไข `globals.css` ถอด `@media (prefers-color-scheme: dark)` ออก
- กำหนดโทนสีพื้นหลัง **`bg-slate-100`** ผสานการ์ดตารางสีขาว คมชัด สบายตา

### 2.3 ทำให้ปุ่มทุกปุ่มในระบบใช้งานได้จริง 100% (Full Interactivity) — [18 ก.ย. 2026 \| 14:00 - 16:45 น.]
- **Dashboard (`/`)**: กรองช่วงเวลา (วันนี้, 7 วัน, 30 วัน), Progress Bar สถานะงาน, Quick Actions
- **Contents (`/contents`)**: ค้นหา Real-time, กรอง Status, Modal สร้าง Content ใหม่, ดูรายละเอียด (Eye Modal), ปุ่มลบงาน, Custom SVG Icons (YouTube, Instagram, TikTok)
- **Users & Teams (`/users`)**: ค้นหาพนักงาน, Modal เพิ่มสมาชิก, **ปุ่มสลับ Role อัจฉริยะ (`MEMBER ⟳`)** คลิกเพื่อวนตำแหน่งทันที
- **Legal Database (`/legal`)**: Category Filter Pills, Modal เพิ่ม/แก้ไขกฎหมาย, อ่านฉบับเต็ม
- **Task Types (`/tasks`)**: บริหารหมวดหมู่งานผลิต (Scripting, Editing ฯลฯ) พร้อมระยะเวลาเริ่มต้น
- **System Logs (`/logs`)**: Audit Trail, **ปุ่ม Export CSV ดาวน์โหลดลงเครื่องได้จริง**, ปุ่ม Clear Logs
- **Settings (`/settings`)**: ปรับชื่อสตูดิโอ, สวิตช์ 2FA, บันทึก API Keys
- **Topbar**: เมนูกระดิ่งแจ้งเตือน และ Modal ยืนยันการออกจากระบบ

---

## Phase 3: Mobile App Development (React Native CLI)
> 🕒 **ช่วงเวลาดำเนินงาน:** 18 กันยายน 2026 (17:00 - 21:30 น.)

### 3.1 วางโครงสร้างแอปด้วย React Native Community CLI — [18 ก.ย. 2026 \| 17:00 น.]
- ใช้โครงสร้าง React Native CLI สำหรับเปิดใน Android Studio
- ปรับโค้ดทุกหน้าเป็น JavaScript XML (`.jsx`) ล้วน
- โฟลเดอร์: `src/features/`, `src/navigation/`, `src/services/api.js`

### 3.2 สร้างระบบ Role-Based Screen Switcher — [18 ก.ย. 2026 \| 19:30 น.]
- **`App.jsx`**: ตรวจสอบ Role เพื่อแสดงหน้าต่าง Manager หรือ Member
- **`LoginScreen.jsx`**: เพิ่ม Fast Role Switcher สำหรับกดทดสอบสลับบทบาทได้ทันที
- **`ManagerDashboard.jsx`**: หน้าคิว Review งาน, ปุ่ม Approve, ปุ่ม Revision
- **`MemberTaskList.jsx`**: หน้าดูงานที่ตนเองได้รับมอบหมาย พร้อมช่องแนบ Submission URL
- **`IdeaListScreen.jsx`**: หน้ากระดานไอเดียคอนเทนต์
- **`LegalChecklistScreen.jsx`**: หน้าระบบตรวจสอบข้อกำหนดกฎหมาย 5 ข้อ

### 3.3 เคลียร์ปัญหา Gradle Path & SafeAreaProvider — [18 ก.ย. 2026 \| 21:00 น.]
- เคลียร์ Cache ใน `android/build` และ `.cxx` แก้ปัญหา `react-native-safe-area-context` path mismatch
- ห่อหุ้ม `<SafeAreaProvider>` ใน `App.jsx` แก้ปัญหาขอบบนทับกับ Status Bar / Notch

---

## Phase 4: การจัดระเบียบโครงสร้าง Master vs Learning
> 🕒 **ช่วงเวลาดำเนินงาน:** 18 กันยายน 2026 (21:45 - 22:15 น.)

เพื่อเปิดโอกาสให้ผู้พัฒนาได้ลงมือเขียนโค้ดด้วยตนเองโดยมี AI เป็น Mentor จึงแยกโฟลเดอร์:
```text
D:\VsCode\Project\Content-Management-System\
├── master/                      <-- [ระบบเต็มฉบับสมบูรณ์] โค้ดอ้างอิงและตัวเฉลย
│   ├── backend/                 <-- Node.js + MongoDB API
│   ├── admin-web/               <-- Next.js Admin Dashboard (.jsx)
│   ├── mobile-app/              <-- React Native (.jsx) สำหรับ Android Studio
│   └── database/                <-- SQL Schema ดั้งเดิม
│
├── learning/                    <-- [พื้นที่ฝึกฝน] ลงมือพิมพ์โค้ดเองทีละบรรทัด
│   └── backend/                 <-- ปัจจุบันอยู่ที่บทเรียน Backend
│
└── docs/                        <-- คลังเอกสารและรายงานโครงงานทั้งหมด
```

---

## Phase 5: บันทึกบทเรียนการลงมือเขียนโค้ดด้วยตัวเอง
> 🕒 **ช่วงเวลาดำเนินงาน:** 18 กันยายน 2026 (22:15 - 23:50 น.)

### 🟢 Lesson 1: Server Setup & First Express Route — [18 ก.ย. 2026 \| 22:15 น.] ✅
- ติดตั้ง `express`, สร้าง `server.js` ด้วยมือตัวเอง
- เขียน `app.get('/')`, `app.listen(5000)` และรันผ่านฉลุยบน `http://localhost:5000`

### 🟢 Lesson 2: Nodemon, .env และ Middleware — [18 ก.ย. 2026 \| 22:50 น.] ✅
- ติดตั้ง `nodemon`, `dotenv` และเซตคำสั่ง `"dev": "nodemon src/server.js"`
- สร้าง `.env` กำหนด `PORT=5000`
- เสียบ Middleware `express.json()` อ่านข้อมูล POST Body

### 🟡 Lesson 3: MongoDB & Mongoose Database Layer — [18 ก.ย. 2026 \| 23:30 น.] ⏳
- ติดตั้ง `mongoose` (`^9.10.1`), สร้างตัวเชื่อมต่อ `src/config/db.js` เชื่อมต่อสำเร็จ
- สร้าง Model แรก: `src/database/models/User.js`
- ยกระดับสู่ Modular Architecture: แยก `users.routes.js`, `users.controller.js` และคลีน `server.js` เหลือ 27 บรรทัด

---

## Phase 6: การยกระดับสู่ Senior Capstone & 8 เอกสารวิชาการ UML
> 🕒 **ช่วงเวลาดำเนินงาน:** 19 กันยายน 2026 (00:15 - 01:10 น.)

### 6.1 จัดทำ 8 เอกสารวิชาการมาตรฐานสากล (`docs/academic/`) — [19 ก.ย. 2026 \| 00:30 น.]
จัดทำเอกสารเพื่อส่งอาจารย์และเตรียมขึ้น Figma 1:1:
1. **[`01-Use-Case-Diagram.md`](file:///d:/VsCode/Project/Content-Management-System/docs/academic/01-Use-Case-Diagram.md)**: Use Case Diagram ครอบคลุม 3 Actors + Platform APIs
2. **[`02-Use-Case-Descriptions.md`](file:///d:/VsCode/Project/Content-Management-System/docs/academic/02-Use-Case-Descriptions.md)**: Fully Dressed Use Case Specification (Cockburn/IEEE) 6 เวิร์กโฟลว์หลัก
3. **[`03-Activity-Diagram.md`](file:///d:/VsCode/Project/Content-Management-System/docs/academic/03-Activity-Diagram.md)**: Activity Swimlanes 4 เลน + Finite State Machine Lifecycle
4. **[`04-Domain-Class-Diagram.md`](file:///d:/VsCode/Project/Content-Management-System/docs/academic/04-Domain-Class-Diagram.md)**: Class Diagram 11 โดเมนเอนทิตี พร้อม Visibility, Attributes, Multiplicities, Methods
5. **[`05-Sequence-Diagrams.md`](file:///d:/VsCode/Project/Content-Management-System/docs/academic/05-Sequence-Diagrams.md)**: 3 Sequence Diagrams บน Critical Paths (Task Assignment, Revision, Legal Gatekeeper)
6. **[`06-Entity-Relationship-Diagram.md`](file:///d:/VsCode/Project/Content-Management-System/docs/academic/06-Entity-Relationship-Diagram.md)**: Crow's Foot Relational ERD + คำอธิบายสถาปัตยกรรม Hybrid (SQL + NoSQL)
7. **[`07-Data-Dictionary.md`](file:///d:/VsCode/Project/Content-Management-System/docs/academic/07-Data-Dictionary.md)**: พจนานุกรมข้อมูลครบถ้วน 12 ตารางหลัก
8. **[`08-Figma-Design-Tokens-And-Wireframes.md`](file:///d:/VsCode/Project/Content-Management-System/docs/academic/08-Figma-Design-Tokens-And-Wireframes.md)**: Design Tokens (Colors, Typography, Spacing 8pt Grid) และพิมพ์เขียวผังหน้าจอ

### 6.2 บังคับใช้ Finite State Machine Guard ใน Backend — [19 ก.ย. 2026 \| 00:50 น.]
- ใน [`contents.controller.js`](file:///d:/VsCode/Project/Content-Management-System/master/backend/src/modules/contents/contents.controller.js): เพิ่ม `ALLOWED_TRANSITIONS` ป้องกันการข้ามสถานะโดยพลการ (ห้าม `PLANNING` $\rightarrow$ `PUBLISHED`)
- **Legal Gatekeeper Engine**: เพิ่ม Endpoint `PUT /api/contents/:id/legal-check` และ `POST /api/contents/:id/review` โดยจะบล็อกการอนุมัติหาก Checklist กฎหมาย 5 ข้อไม่ผ่าน 100%
- ใน [`tasks.controller.js`](file:///d:/VsCode/Project/Content-Management-System/master/backend/src/modules/tasks/tasks.controller.js): เมื่อส่งงาน (`submissionUrl`) ระบบจะบันทึกเวอร์ชันและขยับ Content แม่เป็น `REVIEW` อัตโนมัติ

### 6.3 ปรับปรุง Mobile Navigation สู่ Bottom Tab Bar เต็มรูปแบบ — [19 ก.ย. 2026 \| 01:05 น.]
- ใน [`ManagerNavigator.jsx`](file:///d:/VsCode/Project/Content-Management-System/master/mobile-app/src/navigation/ManagerNavigator.jsx): เพิ่มแถบเมนูด้านล่าง 4 แท็บ (`[📊 Pipeline]`, `[💡 Idea Board]`, `[⚖️ Legal Audit]`, `[🚪 ออกระบบ]`) สลับไปมาได้ลื่นไหล ไม่เจอปัญหาหน้าจอตัน
- ใน [`MemberNavigator.jsx`](file:///d:/VsCode/Project/Content-Management-System/master/mobile-app/src/navigation/MemberNavigator.jsx): เพิ่มแถบเมนูด้านล่าง 3 แท็บ (`[📋 My Tasks]`, `[💡 Idea Board]`, `[🚪 ออกระบบ]`)
- ใน [`LegalChecklistScreen.jsx`](file:///d:/VsCode/Project/Content-Management-System/master/mobile-app/src/features/legal/LegalChecklistScreen.jsx): เชื่อมต่อข้อมูล `targetContent` จาก Dashboard และบันทึกผลลง MongoDB จริง
- ใน [`ManagerDashboard.jsx`](file:///d:/VsCode/Project/Content-Management-System/master/mobile-app/src/features/dashboard/ManagerDashboard.jsx): เพิ่มปุ่ม `[⚖️ ตรวจ Legal]`, `[🔄 ส่งกลับแก้]`, `[✅ อนุมัติ]` และ `[🚀 เผยแพร่ทันที (Publish)]`

---

## แผนที่ไฟล์และดัชนีเอกสารทั้งหมด
> 🕒 **สถานะปัจจุบัน:** 19 กันยายน 2026 (01:12 น.)

### 📁 หมวดหมู่ที่ 1: `docs/master/` (เอกสารสถาปัตยกรรมระบบเต็ม)
1. `Phase-1-Backend.md` - สรุปสถาปัตยกรรม Backend
2. `Phase-2-AdminWeb.md` - สรุปหน้าเว็บ Admin Web
3. `Phase-3-MobileApp.md` - สรุปแอปมือถือ
4. `Phase-4-ContentIntelligence.md` - สรุประบบ AI และ Metrics
5. `How-It-Works-Database.md` - การทำงานของฐานข้อมูล
6. `How-It-Works-Backend-API.md` - Request Lifecycle ของ Express
7. `How-It-Works-AdminWeb.md` - การทำงานของ Next.js Layout
8. `How-It-Works-Admin-Users-Page.md` - หน้า Users Data Table
9. `How-It-Works-Admin-Contents-Legal.md` - หน้า Contents & Legal
10. `How-It-Works-Admin-Logs-Tasks.md` - หน้า Logs & Task Types
11. `How-It-Works-UI-Design-And-Interactivity.md` - การแก้ปัญหาสีและ Dark Mode
12. `How-It-Works-All-Interactive-Buttons.md` - คู่มือปุ่มตอบโต้ทั้งหมดในระบบ
13. `How-It-Works-Mobile-App.md` - โครงสร้างแอปมือถือ React Native (.jsx)
14. `How-To-Run-In-Android-Studio.md` - คู่มือการเปิดและรันบน Android Studio
15. `How-It-Works-MongoDB.md` - โครงสร้าง Mongoose Models และการย้ายสู่ MongoDB

### 📁 หมวดหมู่ที่ 2: `docs/learning/` (บทเรียนเจาะลึกที่คุณกำลังเขียนโค้ดด้วยตัวเอง)
1. [`Lesson-01-Server-Setup.md`](file:///d:/VsCode/Project/Content-Management-System/docs/learning/Lesson-01-Server-Setup.md) - สถาปัตยกรรม Server สู่ Express Route แรก
2. [`Lesson-02-Nodemon-Dotenv-Middleware.md`](file:///d:/VsCode/Project/Content-Management-System/docs/learning/Lesson-02-Nodemon-Dotenv-Middleware.md) - เบื้องหลัง Process Watcher, Twelve-Factor Config, Middleware Parsing
3. [`Lesson-03-MongoDB-Mongoose.md`](file:///d:/VsCode/Project/Content-Management-System/docs/learning/Lesson-03-MongoDB-Mongoose.md) - สถาปัตยกรรมฐานข้อมูล NoSQL, Mongoose ODM, และ Modular Architecture

### 📁 หมวดหมู่ที่ 3: `docs/academic/` (เอกสารสถาปัตยกรรม & ไดอะแกรมสำหรับส่งอาจารย์และขึ้น Figma)
1. [`01-Use-Case-Diagram.md`](file:///d:/VsCode/Project/Content-Management-System/docs/academic/01-Use-Case-Diagram.md) - แผนภาพ Use Case Diagram (UML) ครอบคลุม 3 Actors + Platform APIs
2. [`02-Use-Case-Descriptions.md`](file:///d:/VsCode/Project/Content-Management-System/docs/academic/02-Use-Case-Descriptions.md) - Fully Dressed Use Case Specification (Cockburn/IEEE)
3. [`03-Activity-Diagram.md`](file:///d:/VsCode/Project/Content-Management-System/docs/academic/03-Activity-Diagram.md) - Activity Swimlanes 4 เลน + State Machine Lifecycle
4. [`04-Domain-Class-Diagram.md`](file:///d:/VsCode/Project/Content-Management-System/docs/academic/04-Domain-Class-Diagram.md) - Class Diagram 11 โดเมนเอนทิตี
5. [`05-Sequence-Diagrams.md`](file:///d:/VsCode/Project/Content-Management-System/docs/academic/05-Sequence-Diagrams.md) - 3 Sequence Diagrams บน Critical Paths
6. [`06-Entity-Relationship-Diagram.md`](file:///d:/VsCode/Project/Content-Management-System/docs/academic/06-Entity-Relationship-Diagram.md) - Crow's Foot Relational ERD + คำอธิบายสถาปัตยกรรม Hybrid (SQL + NoSQL)
7. [`07-Data-Dictionary.md`](file:///d:/VsCode/Project/Content-Management-System/docs/academic/07-Data-Dictionary.md) - พจนานุกรมข้อมูลครบถ้วน 12 ตารางหลัก
8. [`08-Figma-Design-Tokens-And-Wireframes.md`](file:///d:/VsCode/Project/Content-Management-System/docs/academic/08-Figma-Design-Tokens-And-Wireframes.md) - Design Tokens และพิมพ์เขียวผังหน้าจอสำหรับขึ้น Figma 1:1

---

### 📁 หมวดหมู่ที่ 4: `docs/year-4-capstone/` (พิมพ์เขียวและสถาปัตยกรรมสำหรับโครงงานปริญญานิพนธ์ปี 4)
1. [`01-Scope-And-Phasing-Matrix.md`](file:///d:/VsCode/Project/Content-Management-System/docs/year-4-capstone/01-Scope-And-Phasing-Matrix.md) - การแบ่งขอบเขตงานระบบหลัก (ปัจจุบัน) vs ระบบอัจฉริยะ (ปี 4) พร้อมเหตุผลทางวิศวกรรม
2. [`02-Content-Intelligence-Specification.md`](file:///d:/VsCode/Project/Content-Management-System/docs/year-4-capstone/02-Content-Intelligence-Specification.md) - สเปกการเชื่อมต่อ YouTube Data API v3 & TikTok Display API และ Ingestion Worker
3. [`03-Recommendation-Engine-Architecture.md`](file:///d:/VsCode/Project/Content-Management-System/docs/year-4-capstone/03-Recommendation-Engine-Architecture.md) - สถาปัตยกรรมระบบแนะนำ: จาก Rule-based Scoring สู่ Machine Learning Clustering
4. [`04-Automated-Legal-AI-Audit.md`](file:///d:/VsCode/Project/Content-Management-System/docs/year-4-capstone/04-Automated-Legal-AI-Audit.md) - ระบบตรวจสอบข้อกฎหมายอัตโนมัติ (Audio Fingerprinting, Face/PDPA Detection, OCR Logo)
5. [`05-Cloud-Object-Storage-Pipeline.md`](file:///d:/VsCode/Project/Content-Management-System/docs/year-4-capstone/05-Cloud-Object-Storage-Pipeline.md) - สถาปัตยกรรม Direct-to-Cloud Upload ด้วย Presigned URLs (AWS S3 / Cloud Storage)
6. [`06-PostgreSQL-Prisma-Migration-Schema.md`](file:///d:/VsCode/Project/Content-Management-System/docs/year-4-capstone/06-PostgreSQL-Prisma-Migration-Schema.md) - ไฟล์ Prisma Schema (`schema.prisma`) 100% สำหรับการย้ายฐานข้อมูลสู่ PostgreSQL ในปี 4

---

## Phase 7: การจัดแยกโฟลเดอร์สำหรับโครงงานปี 4 (Year 4 Scoping & Isolation)
> 🕒 **ช่วงเวลาดำเนินงาน:** 19 กันยายน 2026 (01:15 - 01:20 น.)

เพื่อรักษาความเสถียรของระบบ Core ที่ต้องส่งอาจารย์ในเทอมปัจจุบัน และป้องกันไม่ให้โค้ดส่วนต่อขยายสร้างผลข้างเคียง (Side Effects):
1. **จัดสรรเอกสารพิมพ์เขียวปี 4**: รวบรวมไว้ใน `docs/year-4-capstone/` ทั้งหมด 6 ฉบับ
2. **แยกโฟลเดอร์ใน Backend**: สร้าง `master/backend/src/year4-extensions/` สำหรับ `analytics`, `recommendations`, `trends`
3. **จัดทำ Integrations Client Template**: สร้าง `master/backend/src/integrations/` สำหรับ `youtube` และ `tiktok` พร้อมทำงานในรูปแบบ Mock จนกว่าจะเชื่อมต่อจริงในปี 4

---

## Phase 8: การจัดการ Git Branching & ปรับปรุงหน้า GitHub Repository สู่มาตรฐานวิชาการ (Academic Clean Presentation)
> 🕒 **ช่วงเวลาดำเนินงาน:** 19 กันยายน 2026 (01:40 - 01:48 น.)

เพื่อให้หน้า GitHub Repository สะอาด เรียบร้อย ไม่โอ้อวดฟีเจอร์เกินจริง และตรงตามเกณฑ์การตรวจให้คะแนนของอาจารย์อย่างเป็นระเบียบ:
1. **การจัดสรร Git Branch**:
   - สร้าง Branch `feature/year4-capstone` และ Push ขึ้นสู่ Remote Origin เพื่อเก็บพิมพ์เขียวและแผนสถาปัตยกรรมปี 4 แยกไว้อย่างชัดเจน
   - คง Branch `main` ไว้เป็นแกนหลักสำหรับส่งมอบงานในรายวิชาปัจจุบัน
2. **การปรับปรุง Root README.md**:
   - ปรับโทนข้อความเป็นวิชาการ สุภาพ เรียบร้อย และกระชับ
   - จัดหมวดหมู่เอกสารอิงตามหัวข้อที่อาจารย์ระบุในเกณฑ์ 7 รายการหลัก (2.1 Use Case Diagram จนถึง 2.7 Data Dictionary) พร้อมลิงก์เข้าดูไฟล์ใน `docs/academic/` ได้ทันที
   - ระบุ Tech Stack, วิธีการติดตั้ง และบัญชีทดสอบทั้ง 3 บทบาท (Admin, Manager, Member) ไว้อย่างชัดเจน
3. **การรักษาความปลอดภัยของโค้ด**:
   - เพิ่ม `.gitignore` ที่ Root Directory ครอบคลุม `node_modules`, `.env`, build caches, Gradle artifacts ป้องกันข้อมูลหลุดหรือไฟล์ขยะขึ้น Git Repository

---

## Phase 9: การปรับปรุงอัตลักษณ์และเปลี่ยนชื่อระบบสู่ "Draftly" (Application Rebranding)
> 🕒 **ช่วงเวลาดำเนินงาน:** 21 กันยายน 2026 (22:50 - 23:00 น.)

เปลี่ยนชื่อแอปพลิเคชันและระบบเป็น **"Draftly"** (Content Production Management System) เพื่อสร้างอัตลักษณ์ที่จดจำง่าย ทันสมัย สไตล์สตูดิโอครีเอเตอร์ยุคใหม่:
1. **ความหมายและแนวคิดของชื่อ**:
   - สะท้อนกระบวนการทำงานตั้งแต่การ "Draft" ไอเดียเบื้องต้น, มอบหมายงานและส่งดราฟต์ตรวจ (Draft Submission), การสั่งแก้ไข (Revision Loops) จนถึง Final ชิ้นงานที่ผ่านการตรวจสอบสิทธิ์กฎหมายและเผยแพร่อย่างสมบูรณ์
2. **การอัปเดตระบบ Mobile Application**:
   - ปรับ `displayName` ใน `master/mobile-app/app.json` เป็น `"Draftly"`
   - ปรับชื่อแอปพลิเคชันบนระบบปฏิบัติการ Android (`strings.xml`) เป็น `"Draftly"`
   - ปรับแต่งหน้าเข้าสู่ระบบ (`LoginScreen.jsx`) ให้แสดงโลโก้สัญลักษณ์และชื่อแบรนด์ `"Draftly"`
   - ปรับแต่ง Dashboard ของ Manager ให้ระบุ `"Draftly Production Management"`
3. **การอัปเดต Admin Web Dashboard**:
   - ปรับแต่ง Metadata ชื่อหน้าเว็บ (`layout.jsx`) เป็น `"Draftly - Content Admin Dashboard"`
   - ปรับแถบเมนูด้านข้าง (`Sidebar.jsx`) ให้แสดงโลโก้และชื่อ `"Draftly Admin"`
4. **การอัปเดตเอกสารโครงการ**:
   - ปรับหัวข้อและคำอธิบายใน `README.md` เป็น `"Draftly — Content Production Management System"`

---

## Phase 10: ปรับปรุงประสบการณ์ผู้ใช้ (UI/UX Refinement) & คุมโทนสีตาม Semantic States
> 🕒 **ช่วงเวลาดำเนินงาน:** 21 กันยายน 2026 (23:10 - 23:20 น.)

ปรับปรุงอินเทอร์เฟซผู้ใช้งานของแอปพลิเคชันมือถือให้สะอาด คลีน ลดความรก คุมโทนสีสุภาพ และลดขอบเขตตัวกฎให้เหมาะสมกับโปรเจกต์นักศึกษา:
1. **ย้ายปุ่มออกจากระบบไปยังหน้า "ข้อมูลส่วนตัว / โปรไฟล์" (Profile & Settings)**:
   - สร้างคอมโพเนนต์ [`ProfileScreen.jsx`](file:///d:/VsCode/Project/Content-Management-System/master/mobile-app/src/features/profile/ProfileScreen.jsx) รวบรวมข้อมูลผู้ใช้งาน รหัสผู้ใช้ สังกัดทีม สถานะบัญชี ข้อมูลระบบ และวางปุ่ม "ออกจากระบบ" พร้อมหน้าต่างยืนยัน (Confirmation Alert)
   - อัปเดตเมนูด้านล่างของทั้ง Manager และ Member เป็นแท็บ `[👤 โปรไฟล์]` แทนปุ่มออกระบบเดิม
2. **ลดความแน่นและความซับซ้อนของหน้าแรกดำเนินงาน (Manager Dashboard)**:
   - นำ Lifecycle Stepper แถบยาวที่ทำให้หน้าจอดูแน่นออก
   - นำการ์ด Feature Hub Shortcuts ที่ซ้ำซ้อนกับแท็บนำทางด้านล่างออก
   - สรุปตัวเลขสถิติ KPI เหลือเพียง 3 สถานะสำคัญ: รอตรวจทาน, กำลังผลิต, และผ่าน/อนุมัติ
   - แสดงปุ่ม Action ตามบริบทของสถานะงานจริง (ชิ้นงานที่รอตรวจจะมีปุ่มตรวจความถูกต้องและส่งกลับแก้ ชิ้นงานที่อนุมัติแล้วจะมีปุ่มเผยแพร่)
3. **การคุมโทนสีและการใช้สีเฉพาะขั้นตอนสถานะงาน (Semantic Progression Colors)**:
   - เปลี่ยนโทนสีหลักเป็น Dark Slate / Monochrome สุภาพ คลีน สบายตา
   - ไอคอนและป้ายกำกับ Platform ใช้สีนิวทรัลโทนเดียวกันทั้งหมด
   - กำหนดการใช้สีเด่นเฉพาะสถานะกระบวนการทำงาน:
     - 🟢 **สีเขียว (`#16A34A`)**: ผ่านการอนุมัติ / เผยแพร่แล้ว (Approved / Published)
     - 🔴 **สีแดง (`#DC2626`)**: ไม่ผ่าน / ส่งกลับแก้ไข (Revision / Rejected)
     - 🟡 **สีเหลือง/ส้ม (`#D97706`)**: รอตรวจสอบ / กำลังดำเนินการ (Review / In Progress)
     - ⚪ **สีเทา (`#64748B`)**: คิวงานใหม่ / วางแผน (Todo / Planning)
4. **ลดขอบเขตตัวกฎ (Legal & Compliance Checklist)**:
   - ลดความซับซ้อนจาก 5 ข้อเหลือ **3 ข้อหลักที่สมจริงสำหรับงานผลิตสื่อ**:
     1. ลิขสิทธิ์เสียงและเพลงประกอบ (Audio & Music License)
     2. ลิขสิทธิ์ภาพและฟุตเทจ (Footage & Image Copyright)
     3. ความเหมาะสมของเนื้อหาและข้อกำหนด (Content Guidelines)
   - อัปเดตเกณฑ์ตรวจสอบของ Backend API ใน [`contents.controller.js`](file:///d:/VsCode/Project/Content-Management-System/master/backend/src/modules/contents/contents.controller.js) ให้สอดคล้องกัน (เกณฑ์ผ่าน $\ge 3$ ข้อ)

---

## Phase 11: เพิ่มระบบคอมเมนต์ตรวจงานของ Manager, ออกแบบ Custom Single-Tone Tab Icons, และลดไอคอนฟุ่มเฟือย
> 🕒 **ช่วงเวลาดำเนินงาน:** 21 กันยายน 2026 (23:30 - 23:45 น.)

ยกระดับความยืดหยุ่นในกระบวนการตรวจงานจริงของหัวหน้าทีม พร้อมทั้งขัดเกลาการออกแบบตามหลัก Visual Hierarchy:
1. **ระบบคอมเมนต์ตรวจงานเจาะลึกเฉพาะแต่ละคลิป (Detailed Review Commenting)**:
   - ใน [`LegalChecklistScreen.jsx`](file:///d:/VsCode/Project/Content-Management-System/master/mobile-app/src/features/legal/LegalChecklistScreen.jsx): เพิ่มช่องกรอกความคิดเห็นเฉพาะเจาะจงในแต่ละข้อตรวจสอบ (เช่น ข้อเพลง, ข้อภาพ, ข้อเนื้อหา) เพื่อให้ Manager สามารถระบุ Timestamp หรือจุดที่ต้องปรับแก้ได้ตามลักษณะของแต่ละคลิป
   - เพิ่มพื้นที่ข้อความสำหรับ "คำแนะนำภาพรวมถึงสมาชิกในทีม" (General Feedback Notes)
   - เพิ่มปุ่ม "ส่งกลับแก้ไขพร้อมคอมเมนต์" (Request Revision) เพื่อบันทึกผลและส่งคอมเมนต์กลับไปให้สมาชิกปรับปรุงงานได้ทันที
2. **ออกแบบ Custom TabIcon คุมสีโทนเดียวกัน 100% (Single-Tone Navigation)**:
   - สร้างคอมโพเนนต์ [`TabIcon.jsx`](file:///d:/VsCode/Project/Content-Management-System/master/mobile-app/src/components/TabIcon.jsx) โดยใช้ Pure React Native View Geometry แก้ปัญหา Emoji ที่แสดงผลหลากสีกลายเป็นไอคอนสีโมโนโครม
   - ควบคุมสีไอคอนและตัวหนังสือให้เป็นโทน Slate เดียวกัน (`#0F172A` เมื่อ Active, `#94A3B8` เมื่อ Inactive) ในทั้ง [`ManagerNavigator.jsx`](file:///d:/VsCode/Project/Content-Management-System/master/mobile-app/src/navigation/ManagerNavigator.jsx) และ [`MemberNavigator.jsx`](file:///d:/VsCode/Project/Content-Management-System/master/mobile-app/src/navigation/MemberNavigator.jsx)
3. **ลดการใช้ไอคอนและอีโมจิฟุ่มเฟือย (Minimalist & Professional Design)**:
   - ปรับหน้า [`MemberTaskList.jsx`](file:///d:/VsCode/Project/Content-Management-System/master/mobile-app/src/features/tasks/MemberTaskList.jsx) นำไอคอนบนปุ่มออก เหลือเฉพาะปุ่มข้อความที่ชัดเจน ("เริ่มทำงาน", "ส่งมอบงานให้ตรวจสอบ")
   - คงไว้เฉพาะสัญลักษณ์ที่สื่อความหมายโดยตรง เช่น สัญลักษณ์แนบลิงก์ (🔗) เพื่อให้ช่องแนบไฟล์ผลงานดูชัดเจนและเข้าใจง่าย
   - นำอีโมจิออกจากปุ่มสลับสิทธิ์ใน [`LoginScreen.jsx`](file:///d:/VsCode/Project/Content-Management-System/master/mobile-app/src/features/auth/LoginScreen.jsx) และหน้าโปรไฟล์ ให้ภาพรวมดูเป็นระบบวิศวกรรมซอฟต์แวร์จริง

---

## Phase 12: การเชื่อมต่อระบบและการทำงานครบวงจร 100% (Full End-to-End System Integration)
> 🕒 **ช่วงเวลาดำเนินงาน:** 22 กันยายน 2026 (00:00 - 00:15 น.)

เชื่อมต่อและทดสอบการทำงานของระบบกระบวนการผลิตคอนเทนต์ให้ทำงานได้ครบวงจร 100% ตั้งแต่ต้นจนจบ พร้อมรองรับการทำงานร่วมกันระหว่าง Mobile App และ Express/MongoDB Backend:
1. **แก้ไข Mongoose Enum & Database Seeding**:
   - ปรับ `taskType` ใน [`seed.js`](file:///d:/VsCode/Project/Content-Management-System/master/backend/src/database/seed.js) ให้ตรงกับ Enum ใน [`Task.js`](file:///d:/VsCode/Project/Content-Management-System/master/backend/src/database/models/Task.js) (`'Sound Design'`) ทำให้ Seed ฐานข้อมูลจำลอง User, Team, Idea, Content, Task และ Legal Article ได้สำเร็จ 100%
2. **แก้ไขการ Parse ข้อมูล API Response แบบ Array**:
   - แก้ไข [`ManagerDashboard.jsx`](file:///d:/VsCode/Project/Content-Management-System/master/mobile-app/src/features/dashboard/ManagerDashboard.jsx), [`MemberTaskList.jsx`](file:///d:/VsCode/Project/Content-Management-System/master/mobile-app/src/features/tasks/MemberTaskList.jsx) และ [`IdeaListScreen.jsx`](file:///d:/VsCode/Project/Content-Management-System/master/mobile-app/src/features/ideas/IdeaListScreen.jsx) ให้รองรับข้อมูล Array ที่ส่งตรงจาก Controller ทำให้การแสดงผลเปลี่ยนจาก Mock Data เป็นข้อมูลสดจากฐานข้อมูล MongoDB ทันที
3. **เติมเต็ม Action ควบคุมวงจรชีวิตชิ้นงาน (Full Lifecycle Transitions)**:
   - เพิ่มปุ่ม Action ครบทุกสถานะงานใน [`ManagerDashboard.jsx`](file:///d:/VsCode/Project/Content-Management-System/master/mobile-app/src/features/dashboard/ManagerDashboard.jsx):
     - `PLANNING` ➔ ปุ่ม "เริ่มขั้นตอนผลิต" (Start Production)
     - `PRODUCTION` ➔ ปุ่ม "ส่งเข้าสู่การตรวจสอบ" (Move to Review)
     - `REVIEW` ➔ ปุ่ม "ส่งกลับแก้ไข" (Request Revision) & "ตรวจความถูกต้อง" (Inspect)
     - `APPROVED` ➔ ปุ่ม "เผยแพร่ชิ้นงาน" (Publish Now)
     - `PUBLISHED` ➔ แถบสถานะ "เผยแพร่สู่สาธารณะเรียบร้อยแล้ว"
     - `REVISION` ➔ ปุ่ม "เริ่มผลิตซ้ำ" หรือ "ส่งตรวจอีกครั้ง"
4. **การรีเฟรชข้อมูลอัตโนมัติ (Live Refresh & State Synchronization)**:
   - เพิ่ม `dashboardRefreshKey` ใน [`ManagerNavigator.jsx`](file:///d:/VsCode/Project/Content-Management-System/master/mobile-app/src/navigation/ManagerNavigator.jsx) เพื่อให้ Dashboard ดึงข้อมูลอัปเดตจากฐานข้อมูลทันทีเมื่อผู้จัดการตรวจสอบเสร็จสิ้น
   - เพิ่มระบบ Pull-to-Refresh (`RefreshControl`) ในทุกหน้าจอเพื่อดึงข้อมูลสดได้ตลอดเวลา
5. **การจัดการ Session และ Token Cleanup**:
   - เพิ่ม `setAuthToken(null)` ใน [`App.jsx`](file:///d:/VsCode/Project/Content-Management-System/master/mobile-app/App.jsx) เมื่อออกจากระบบ เพื่อเคลียร์ Token ป้องกันสิทธิ์ผู้ใช้ชนกันเมื่อสลับบัญชี
6. **การทดสอบยืนยันผล 100% (End-to-End Automated Verification)**:
   - เขียนและรันสคริปต์ทดสอบครบวงจร (Login ➔ Pipeline Fetch ➔ Production Start ➔ Deliverable Submit ➔ Legal Audit ➔ Approve ➔ Publish) ผ่านฉลากครบ 100% ทุกขั้นตอน

---

## Phase 13: การย้ายสู่เครื่องพัฒนาเครื่องใหม่ & การตั้งค่า Android Environment (Fresh Machine Migration)
> 🕒 **ช่วงเวลาดำเนินงาน:** 22 กันยายน 2026 (14:05 - 14:30 น.)

ย้ายโปรเจกต์มาพัฒนาต่อบนเครื่องคอมพิวเตอร์เครื่องใหม่ พร้อมทั้งวินิจฉัยและเซ็ตอัปสภาพแวดล้อมการทำงานของระบบ Mobile Application (React Native):
1. **การสำรวจสถานะภาพรวมของโปรเจกต์ (Project Discovery)**:
   - ตรวจสอบโครงสร้างโปรเจกต์ที่โฟลเดอร์ปลายทางใหม่ (`d:\Content-Management-System`)
   - ตรวจสอบความพร้อมของฐานข้อมูล MongoDB และโครงสร้างโค้ดทั้งฝั่ง Master (ระบบเต็ม 100%) และฝั่ง Learning (ค้างอยู่ที่ Lesson 3 Mongoose ODM)
2. **การวินิจฉัยและสร้างไฟล์คอนฟิก Android SDK (`local.properties`)**:
   - ตรวจพบว่าไฟล์ `local.properties` ถูกละเว้นตาม `.gitignore` ทำให้ Gradle บนเครื่องใหม่ไม่ทราบตำแหน่งของ Android SDK
   - สร้างไฟล์ [`local.properties`](file:///d:/Content-Management-System/master/mobile-app/android/local.properties) โดยกำหนด `sdk.dir=C:/Users/Gigachad/AppData/Local/Android/Sdk` ทำให้ Gradle และ Android Studio ตรวจพบ SDK อัตโนมัติ
3. **การแก้ไขข้อผิดพลาดคำสั่งรัน React Native CLI**:
   - วินิจฉัยข้อผิดพลาดจากคำสั่ง `npm react-native start-android` และ `npx.cmd react-native start-android` (ไม่พบคำสั่งในระบบ)
   - ชี้แจงและจัดระเบียบคำสั่งมาตรฐาน:
     - ใช้ `npm start` สำหรับการบูต Metro Bundler
     - ใช้ `npm run android` (หรือ `npx react-native run-android`) สำหรับการ Build APK และรันเข้าสู่ Emulator
4. **ผลลัพธ์การรันแอปพลิเคชัน**:
   - ผู้พัฒนาสามารถรันแอปพลิเคชัน React Native ขึ้นสู่หน้าจอ Android Emulator สำเร็จ 100% ("ได้แล้วๆๆๆๆๆ")

---

### Phase 14: สถาปัตยกรรม Team-Based Workspace & การยกเลิก Mock Data สู่ MongoDB 100%
> 🕒 **ช่วงเวลาดำเนินงาน:** 22 กันยายน 2026 (14:45 - 15:45 น.)

ขยายขอบเขตสถาปัตยกรรมระบบจาก "ระบบติดตามงานส่วนบุคคล" สู่ **"ระบบบริหารจัดการกระบวนการผลิตสื่อแบบทีม (Team-Based Content Production Management System)"** พร้อมบังคับใช้นโยบาย Real Data Integration สำเร็จสมบูรณ์ 100%:

1. **การปรับเปลี่ยนวิสัยทัศน์สู่ Team Workspace Paradigm**:
   - สมาชิก (Member) และหัวหน้าทีม (Manager) มีหน้า **"ทีมของฉัน (Team Overview)"**
   - แสดงภาพรวมของทีมครบถ้วน: ชื่องานทั้งหมดของทีม, ผู้รับผิดชอบ, สถานะงาน, เปอร์เซ็นต์ความคืบหน้า (Progress 0-100%), กำหนดส่งมอบ (Deadline), รายชื่อสมาชิกและสถานะการทำงานสด (`กำลังทำงาน`, `รอตรวจ`, `ว่าง`, `ออฟไลน์`)
   - แสดง **Team Activity Feed**: ไทม์ไลน์บันทึกเหตุการณ์สดของทีม เช่น การส่งงานตรวจ, การอัปโหลดไฟล์, การสั่งแก้ไข, การเปลี่ยนสถานะงาน พร้อมระบุเวลาและผู้ดำเนินการ
2. **นโยบายความปลอดภัยและขอบเขตสิทธิ์ (Team-Level Authorization Guard)**:
   - สร้าง Middleware `verifyTeamAccess` ใน [`master/backend/src/middleware/auth.js`](file:///d:/Content-Management-System/master/backend/src/middleware/auth.js): บล็อกการเข้าถึงข้อมูลข้ามทีม (Member ของ Team A ไม่สามารถเข้าถึงหรือดูข้อมูลของ Team B ได้ หากฝ่าฝืนจะถูกปฏิเสธด้วย HTTP 403 Forbidden)
   - Member สามารถ **ดู (Read-only)** งานและภาพรวมของเพื่อนร่วมทีมได้ แต่ **แก้ไขได้เฉพาะงานที่ได้รับมอบหมายของตนเอง** เท่านั้น (ป้องกันใน `tasks.controller.js`)
3. **การกำจัด Mock Data ออกจากระบบ 100% (Zero-Mock Policy)**:
   - ล้าง Initial State Mock Data ทั้งหมดใน Mobile App:
     - [`MemberTaskList.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/features/tasks/MemberTaskList.jsx): เริ่มต้นจาก State ว่าง โหลดงานจริงของสมาชิกจาก MongoDB
     - [`ManagerDashboard.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/features/dashboard/ManagerDashboard.jsx): เริ่มต้นจาก State ว่าง โหลด Pipeline ชิ้นงานจริง
     - [`IdeaListScreen.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/features/ideas/IdeaListScreen.jsx): เริ่มต้นจาก State ว่าง โหลดไอเดียจริงจาก MongoDB
     - มี Loading Spinner และ Empty State UI รองรับทุกหน้าจอ
4. **การพัฒนา Backend & Database**:
   - สร้างโมเดลใหม่ [`TeamActivity.js`](file:///d:/Content-Management-System/master/backend/src/database/models/TeamActivity.js)
   - อัปเกรด Schema ใน [`User.js`](file:///d:/Content-Management-System/master/backend/src/database/models/User.js) (เพิ่ม `teamId`, `workingStatus`), [`Content.js`](file:///d:/Content-Management-System/master/backend/src/database/models/Content.js) (เพิ่ม `teamId`, `progress`), และ [`Task.js`](file:///d:/Content-Management-System/master/backend/src/database/models/Task.js) (เพิ่ม `teamId`, `progress`)
   - พัฒนา REST Endpoints ครบชุดใน [`teams.routes.js`](file:///d:/Content-Management-System/master/backend/src/modules/teams/teams.routes.js):
     - `GET /api/teams/my-team`
     - `GET /api/teams/:teamId/dashboard`
     - `GET /api/teams/:teamId/tasks`
     - `GET /api/teams/:teamId/contents`
     - `GET /api/teams/:teamId/activity`
     - `GET /api/teams/:teamId/members`
   - เพิ่มระบบบันทึก `TeamActivity` อัตโนมัติเมื่อมีการสร้าง Content, อัปเดต Task, ส่งงานตรวจ, ตรวจอนุมัติ หรือส่งกลับแก้ไข
   - อัปเกรด [`seed.js`](file:///d:/Content-Management-System/master/backend/src/database/seed.js) จำลองข้อมูล Team A ("Content Team A": Somsri, John, Jane, Mike) และ Team B พร้อม Content, Tasks, และ Team Activities ที่สมจริง
5. **การพัฒนา Mobile Application**:
   - เพิ่ม `teamApi` ใน [`api.js`](file:///d:/Content-Management-System/master/mobile-app/src/services/api.js)
   - เพิ่มไอคอน `'team'` ใน [`TabIcon.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/components/TabIcon.jsx)
   - สร้างหน้าจอใหม่ [`TeamOverviewScreen.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/features/team/TeamOverviewScreen.jsx) ครบ 4 ส่วน: Header KPI & Team Progress Bar, สมาชิกและ Working Status, งานของทีมพร้อม Progress Bar, และไทม์ไลน์ Team Activity Feed พร้อม Pull-to-Refresh
   - ปรับแท็บนำทางใน [`MemberNavigator.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/navigation/MemberNavigator.jsx) และ [`ManagerNavigator.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/navigation/ManagerNavigator.jsx) ให้เชื่อมต่อหน้าจอทีมเป็นแท็บหลัก
6. **การอัปเดตเอกสารวิชาการ 7 ฉบับ (Academic Documentation Alignment)**:
   - [`01-Use-Case-Diagram.md`](file:///d:/Content-Management-System/docs/academic/01-Use-Case-Diagram.md): เพิ่ม UC-19 (ดูภาพรวมทีม) และ UC-20 (ดูฟีดกิจกรรมทีม)
   - [`02-Use-Case-Descriptions.md`](file:///d:/Content-Management-System/docs/academic/02-Use-Case-Descriptions.md): บันทึกข้อกำหนด IEEE/Cockburn สำหรับ UC-19 และ UC-20
   - [`03-Activity-Diagram.md`](file:///d:/Content-Management-System/docs/academic/03-Activity-Diagram.md): เพิ่ม Swimlane การทำงานระดับทีม, การตรวจสิทธิ์ และการกระจาย Activity
   - [`04-Domain-Class-Diagram.md`](file:///d:/Content-Management-System/docs/academic/04-Domain-Class-Diagram.md): เพิ่ม Class `TeamActivity` และเชื่อมโยงความสัมพันธ์
   - [`05-Sequence-Diagrams.md`](file:///d:/Content-Management-System/docs/academic/05-Sequence-Diagrams.md): เพิ่ม Sequence Diagram 4: Team Workspace Access & Event Dispatching
   - [`06-Entity-Relationship-Diagram.md`](file:///d:/Content-Management-System/docs/academic/06-Entity-Relationship-Diagram.md): เพิ่ม Entity `TEAM_ACTIVITIES` และเชื่อมโยง Foreign Keys
   - [`07-Data-Dictionary.md`](file:///d:/Content-Management-System/docs/academic/07-Data-Dictionary.md): เพิ่มตารางที่ 13 `team_activities` และฟิลด์ใหม่ในตาราง `users`, `contents`, `tasks`

---

### Phase 15: ระบบสลับโหมด Dark Mode และ Light Mode (Dynamic Theming System)
> 🕒 **ช่วงเวลาดำเนินงาน:** 23 กันยายน 2026 (02:00 - 02:25 น.)

พัฒนาระบบสลับโหมดการแสดงผลแบบไดนามิก (Dark Mode / Light Mode Theme Switching) ทั่วทั้งแอปพลิเคชันมือถือ (React Native Mobile App) เพื่อยกระดับประสบการณ์ผู้ใช้งาน (Accessibility & Ergonomics) รองรับการใช้งานในสภาวะแสงน้อย และสอดคล้องกับมาตรฐาน Material You / iOS Human Interface Guidelines:

1. **สถาปัตยกรรม Context API & Semantic Design Tokens**:
   - สร้างโมดูล [`ThemeContext.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/theme/ThemeContext.jsx) พร้อม Context Provider และ Custom Hook `useTheme()`
   - กำหนดชุดคู่สี Semantic Tokens ทั้งฝั่ง `lightColors` และ `darkColors`:
     - **Light Mode Palette**: `background: #F8FAFC`, `surface: #FFFFFF`, `surfaceSubtle: #F1F5F9`, `textPrimary: #0F172A`, `textSecondary: #64748B`, `border: #E2E8F0`
     - **Dark Mode Palette (Midnight/Slate Aesthetic)**: `background: #0B0F17`, `surface: #1E293B`, `surfaceSubtle: #334155`, `textPrimary: #F8FAFC`, `textSecondary: #94A3B8`, `border: #334155`
     - **Status Badges Palette**: คำนวณคอนทราสต์สูงสำหรับสภาวะมืด (Approved `#064E3B`/`#4ADE80`, Review `#78350F`/`#FBBF24`, Revision `#7F1D1D`/`#F87171`)
2. **การผสานเข้ากับ Root Application (`App.jsx`)**:
   - ห่อหุ้ม Navigation Container ด้วย `<ThemeProvider>`
   - ควบคุม React Native `<StatusBar>` แบบไดนามิกตามธีม (`barStyle: light-content | dark-content`, `backgroundColor: colors.background`)
3. **การออกแบบจุดควบคุมการเปิด/ปิดธีม (Settings Switch)**:
   - ติดตั้งสวิตช์ Toggle พร้อมการแสดงผลโหมดปัจจุบันในหน้า [`ProfileScreen.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/features/profile/ProfileScreen.jsx) ภายใต้ส่วน "การแสดงผลและธีม (Appearance & Theme)"
   - สลับธีมได้ทันทีแบบ Real-time โดยไม่ต้องรีโหลดแอปพลิเคชัน
4. **การปรับแต่งธีมครอบคลุมทุกหน้าจอ 100%**:
   - [`ManagerNavigator.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/navigation/ManagerNavigator.jsx) & [`MemberNavigator.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/navigation/MemberNavigator.jsx): Tab bar, ขอบ, และสีปุ่ม Active ปรับตามธีม
   - [`TabIcon.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/components/TabIcon.jsx): สีเวกเตอร์ไอคอนโมโนโครมเปลี่ยนตามธีม (`colors.tabIconActive`, `colors.tabIconInactive`)
   - [`ManagerDashboard.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/features/dashboard/ManagerDashboard.jsx): หัวตาราง, การ์ด KPI, ชิปตัวกรอง, และการ์ดชิ้นงาน
   - [`MemberTaskList.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/features/tasks/MemberTaskList.jsx): การ์ดงาน, ช่องกรอกส่งงาน URL, และปุ่มบันทึก
   - [`IdeaListScreen.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/features/ideas/IdeaListScreen.jsx): การ์ดไอเดีย, ปุ่ม Upvote, และ Modal ป้อนไอเดียใหม่
   - [`TeamOverviewScreen.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/features/team/TeamOverviewScreen.jsx): บอร์ดสรุปทีม, รายชื่อสมาชิก, สถานะสด, ทาสก์ทีม, และ Activity Feed
   - [`LegalChecklistScreen.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/features/legal/LegalChecklistScreen.jsx): หัวเรื่องตรวจงาน, เช็กลิสต์ 3 กฎ, ช่องกรอกคอมเมนต์รายข้อ, และคอมเมนต์ภาพรวม
   - [`LoginScreen.jsx`](file:///d:/Content-Management-System/master/mobile-app/src/features/auth/LoginScreen.jsx): หน้าจอเข้าสู่ระบบ ปรับโทนสีเข้ม/สว่างตามธีม
5. **การทดสอบความถูกต้องและคุณภาพโค้ด (Quality Assurance)**:
   - ผ่านการตรวจสอบความถูกต้องด้วย ESLint (`npm run lint`): **0 errors**
   - ปรับแต่ง Jest Config (`jest.config.js`) ให้รองรับการแปลง JSX: **100% Pass** (`App.test.js`)
