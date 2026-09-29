# 📋 เอกสารสรุปบริบทและสถานะโปรเจกต์ (Project Handover Document)

> 🕒 **ปรับปรุงล่าสุด:** 29 กันยายน 2026 (Phase 26)  
> 📁 **Repository Path:** `d:\VsCode\Project\Content-Management-System`  
> 🌿 **Git Branch:** `main`

---

## 1. ข้อมูลพื้นฐานและโครงสร้างระบบ (System Overview & Architecture)

ระบบบริหารกระบวนการผลิต Content (**Draftly - Content Production Management System**) พัฒนาขึ้นเพื่อแก้ปัญหาการสื่อสารที่กระจัดกระจายและกระบวนการทำงานที่ไร้มาตรฐานในสตูดิโอผลิตสื่อ โดยครอบคลุมทั้ง **Web Application สำหรับผู้ดูแลระบบ** และ **Mobile Application สำหรับทีมงาน (ผู้จัดการและสมาชิก)**

### โครงสร้าง Monorepo:
1. **`master/backend` (Backend REST API & WebSocket)**
   - **เทคโนโลยี:** Node.js, Express, MongoDB (Mongoose), JSON Web Token (JWT), `ws` (WebSocket Presence & Live Sync), `bcryptjs`
   - **Port:** `5000` (API: `http://localhost:5000/api`, WebSocket: `ws://localhost:5000`)
2. **`master/admin-web` (Web Application สำหรับผู้ดูแลระบบ)**
   - **เทคโนโลยี:** Next.js 14/16 (App Router), React 19, Tailwind CSS v4, Lucide React
   - **Port:** `3000` (`http://localhost:3000`)
3. **`master/mobile-app` (Mobile Application สำหรับผู้ใช้งาน)**
   - **เทคโนโลยี:** React Native, Expo SDK 54, React Navigation (Native Stack & Bottom Tabs)
   - **พอร์ต / Tool:** Expo Metro Bundler (Port `8081`)
4. **`docs/` (เอกสารกำกับระบบและคู่มือวิชาการ)**
   - `docs/PROJECT-DEVELOPMENT-LOG.md`: บันทึกประวัติการพัฒนาและแก้ไขระบบอย่างละเอียดทุกเฟส (Phase 1 ถึง Phase 26)
   - `docs/academic/`: เอกสารวิชาการสถาปัตยกรรมระบบ 8 ฉบับ (Use Case, Activity, Sequence, Class, State, ER, Architecture Diagrams และ Figma Design Tokens)

---

## 2. ขอบเขตความต้องการของระบบ (System Scope & Requirements)

### 2.1 ผู้ดูแลระบบ (Admin) บน Web Application (ครบ 100%):
1. **เข้าสู่ระบบ & Route Guard (เริ่มต้นเว็บที่หน้า Login ทุกครั้ง):** ยืนยันตัวตนด้วย JWT, บังคับเปิดหน้า Login (`/login`) เสมอเมื่อเริ่มต้นเข้าสู่เว็บไซต์ใหม่หรือเปิดเบราว์เซอร์ใหม่ ผ่าน Next.js Middleware (HTTP 307 Redirect) ร่วมกับ AdminShell Auth Guard, จัดเก็บ Session ในระดับ Session Cookie และ `sessionStorage` เพื่อความปลอดภัยสูงสุด พร้อมปุ่มกรอกข้อมูลทดสอบด่วน (`admin@studio.com`) และ Master Key Bypass (`x-admin-key: cms-master-2026`)
2. **จัดการข้อมูลผู้ใช้งานและทีม:** ดูรายชื่อผู้ใช้งานทั้งหมด, เพิ่มผู้ใช้ใหม่, ปรับเปลี่ยนบทบาท (Role: `ADMIN`, `MANAGER`, `MEMBER`), สร้างทีม และจัดการเพิ่ม/ย้ายสมาชิกในทีม
3. **จัดการข้อมูลพื้นฐานของ Content:** ดูคลังคอนเทนต์ทั้งหมด, สร้างคอนเทนต์ใหม่, ลบคอนเทนต์, และแก้ไขข้อมูลพื้นฐาน (ชื่อ Content, แพลตฟอร์ม, กำหนดส่ง, หมวดหมู่, รายละเอียด) บันทึกลงฐานข้อมูล MongoDB จริงผ่าน `PATCH /api/contents/:id`
4. **จัดการข้อมูลประเภท Task:**
   - **แท็บ 1 (All Tasks):** ติดตามงานทั้งหมดในระบบ ดึงข้อมูลจริงจาก `/api/tasks`, เปลี่ยนสถานะงานด่วน (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`), ลบงาน, และปุ่ม "+ มอบหมายงานใหม่" บันทึกลง MongoDB
   - **แท็บ 2 (Task Types Master):** จัดการประเภทงานมาตรฐาน (Scripting, Filming, Editing, Graphic Design, Sound Design, SEO) บันทึกลงใน `localStorage` (`admin_master_task_types`) ถาวร
5. **ตรวจสอบข้อมูลและสถานะการทำงานของระบบ:** แสดงสถานะ Express API, MongoDB, และ WebSocket พร้อมสถิติข้อมูลจริงในคอลเลกชัน (จำนวนผู้ใช้งาน, คอนเทนต์, งาน, บันทึก Logs) และเครื่องมือ Ping วัด Latency
6. **ตรวจสอบประวัติการดำเนินงานของผู้ใช้งาน (System Audit Logs):** ดึงกิจกรรมจริงจาก MongoDB (`TeamActivity`), แสดงการ์ดสถิติ 4 ด้าน, กรองหมวดหมู่ (All, Content, Tasks, Users & Auth, System), ส่งออก CSV รองรับภาษาไทยสมบูรณ์ (UTF-8 BOM), และปุ่มล้าง Logs ออกจาก MongoDB จริง
7. **ดู Dashboard สรุปข้อมูลการใช้งานระบบ:** KPI Cards ภาพรวม, กราฟวงกลมแสดงสัดส่วนแพลตฟอร์ม, ท่อส่งงาน (Pipeline Funnel), และสถานะประสิทธิภาพทีม

### 2.2 ผู้ใช้งาน (User: Manager & Member) บน Mobile Application (ครบ 100%):
1. **ลงทะเบียนผู้ใช้งาน:** สมัครบัญชีใหม่พร้อมระบุบทบาท (MANAGER / MEMBER) และรหัสเข้าร่วมทีม (Team Code เช่น `TEAM-A`, `TEAM-B`) เพื่อเชื่อมโยงเข้าสังกัดทีมอัตโนมัติ
2. **เข้าสู่ระบบ & ตั้งค่า Server:** Login แยกหน้าจอตามบทบาท พร้อมระบบ Server Config Modal (สลับ Wi-Fi LAN 192.168.0.104, USB ADB Reverse, Cloudflare Tunnel, Custom URL แตะเปลี่ยนได้ใน 1 คลิก พร้อมเช็ค Latency สด) และซ่อนปุ่ม Demo Accounts ไว้อย่างเป็นระเบียบ
3. **จัดการบัญชีส่วนตัว:** แก้ไขชื่อ-นามสกุล และอัปเดตโปรไฟล์
4. **จัดการทีมและสมาชิก:** ดูรายชื่อเพื่อนร่วมทีม, สถานะออนไลน์สด (Live Presence Dot), และสถานะการทำงาน (Working Status: IDLE / WORKING / BUSY)
5. **จัดการ Idea:** เสนอไอเดียใหม่, กดโหวต Upvote ไอเดีย, แปลงไอเดียสู่แผนงานผลิต
6. **จัดการ Content:** สร้างและติดตามชิ้นงานใน Pipeline ครบ 5 สถานะ (`PLANNING`, `PRODUCTION`, `REVIEW`, `APPROVED`, `PUBLISHED`)
7. **จัดการ Task และกระบวนการทำงาน:** มอบหมายงานย่อย, สมาชิกกดเริ่มงาน, อัปเดตความคืบหน้า (%), และแนบลิงก์ส่งงาน
8. **ตรวจสอบกระบวนการผลิต Content:** ติดตามความคืบหน้าแบบเรียลไทม์
9. **ตรวจสอบและอนุมัติ Content:** ตรวจเช็กลิสต์ลิขสิทธิ์และกฎหมาย 3 ข้อ และกดอนุมัติงาน
10. **จัดการการแก้ไขและส่งกลับมาตรวจสอบ (Revision Loop):** Manager ระบุข้อคิดเห็นสั่งแก้ไข (`REVISION`), Member เห็นการ์ดงานขึ้น Action Required พร้อมส่งงานซ้ำและระบุบันทึกการปรับปรุง (Reply Notes)
11. **จัดการกำหนดการเผยแพร่ Content:** กำหนดวันเวลาเผยแพร่ และปุ่มกดเผยแพร่ทันที
12. **ดู Dashboard และติดตามสถานะ:** สรุปตัวเลข KPI ภาพรวม พร้อมแถบความคืบหน้า
13. **รับการแจ้งเตือน:** แจ้งเตือนเมื่อได้รับมอบหมายงานใหม่, เมื่อมีงานส่งตรวจ, หรือเมื่อถูกสั่งแก้ไข
14. **ดูประวัติการดำเนินงาน:** ติดตามประวัติกิจกรรมใน Team Activity Timeline

### 2.3 Non-Functional Requirements (ครบ 100%):
1. ยืนยันตัวตนก่อนเข้าใช้งาน (Authentication Guard ทุก Route)
2. กำหนดสิทธิ์การเข้าถึงข้อมูลตามบทบาท (RBAC & Team Isolation)
3. จัดเก็บรหัสผ่านในรูปแบบที่ปลอดภัย (bcryptjs Salt Rounds 10)
4. ตรวจสอบความถูกต้องของข้อมูลก่อนบันทึก (Validation ทุก Layer)
5. จัดเก็บประวัติการดำเนินงานเพื่อให้สามารถตรวจสอบย้อนหลังได้ (Audit Trail ใน `TeamActivity`)

---

## 3. ข้อมูลบัญชีสำหรับทดสอบระบบ (Test Accounts & Credentials)

> 🔑 **รหัสผ่านสำหรับทุกบัญชีในระบบคือ:** `123456`

| บทบาท (Role) | อีเมล (Email) | ชื่อ-นามสกุล | วัตถุประสงค์ในการทดสอบ |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@studio.com` | สมชาย ดูแลระบบ | ใช้งานระบบ Admin Web (`localhost:3000`) ดูแลระบบทั้งหมด |
| **MANAGER** | `manager@studio.com` | สมศรี จัดการทีม | ใช้งาน Mobile App ในฐานะหัวหน้าทีม A ตรวจสอบและอนุมัติงาน |
| **MEMBER** | `member@studio.com` | John Editor | ใช้งาน Mobile App ในฐานะสมาชิกตัดต่อวิดีโอ ส่งงานและแก้ไขงาน |
| **MEMBER** | `mike@studio.com` | Mike Graphic | ใช้งาน Mobile App ในฐานะสมาชิกออกแบบกราฟิก |
| **MEMBER** | `jane@studio.com` | Jane Script | ใช้งาน Mobile App ในฐานะสมาชิกเขียนบทคอนเทนต์ |

---

## 4. คำสั่งสำหรับรันระบบ (Running Commands)

เปิด PowerShell หรือ Terminal แยกตามแต่ละบริการ:

```powershell
# 1. รัน Backend API & WebSocket Server (Port 5000)
cd master/backend
npm run dev

# 2. รัน Admin Web Application (Port 3000)
cd master/admin-web
npm run dev

# 3. รัน Mobile Application (Expo Metro Bundler)
cd master/mobile-app
npx expo start
```

*หมายเหตุ: หากต้องการ Seed ข้อมูลตัวอย่างลง MongoDB ใหม่ สามารถรัน `node src/database/seed.js` ในโฟลเดอร์ `master/backend` ได้ตลอดเวลา*

---

## 5. ผลการตรวจสอบคุณภาพล่าสุด (Quality Verification)

- **Backend Syntax Check:** ผ่าน `node -c` ทุกไฟล์ $\rightarrow$ **0 syntax errors**
- **Admin Web Linter:** ผ่าน `npm run lint` ใน Next.js 14 $\rightarrow$ **0 errors, 0 warnings**
- **Admin Web Production Build:** ผ่าน `npm run build` $\rightarrow$ **Compiled successfully (100% Validated)**
- **Mobile Unit Test:** ผ่าน `npm test -- --watchAll=false` $\rightarrow$ **1 passed, 1 total (100%)**
- **Git Repository:** ทำการ Commit และ Push ขึ้น GitHub (`origin/main`) เรียบร้อยสมบูรณ์ (Commit ล่าสุด: `ca2f3b9`)

---

## 6. คำแนะนำสำหรับเริ่มต้นในแชทใหม่ (Prompt Recommendation for New Chat)

เมื่อเปิดแชทใหม่ คุณสามารถพิมพ์ข้อความเริ่มต้นดังนี้ได้เลยครับ:

> *"สวัสดีครับ ผมกำลังพัฒนาโปรเจกต์ Content Production Management System (Draftly) โดยสามารถอ่านสรุปบริบท ความต้องการ และสถานะล่าสุดได้จากไฟล์ [PROJECT-HANDOVER.md](file:///d:/VsCode/Project/Content-Management-System/PROJECT-HANDOVER.md) ในโฟลเดอร์หลักของโปรเจกต์ได้เลยครับ [ระบุสิ่งที่คุณต้องการทำต่อ เช่น ปรับแต่งหน้าจอ, เพิ่มฟีเจอร์, หรือทำเอกสารรายงาน]*"
