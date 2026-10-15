# 11. แผนการทดสอบและกรณีทดสอบแบบดำเนินการด้วยตนเอง (Test Plan & Manual Test Cases)

เอกสารนี้กำหนดแผนการทดสอบระบบและตารางกรณีทดสอบแบบดำเนินการด้วยตนเอง (Manual Test Cases) ตามมาตรฐาน **IEEE 829 Standard for Software Test Documentation** สำหรับระบบ **Draftly (Content Production Management System)** เพื่อใช้เป็นหลักฐานการประเมินคุณภาพซอฟต์แวร์และการทดสอบระบบในโครงงานระดับชั้นปีที่ 4 (Senior Capstone Project)

---

## 1. แผนและกลยุทธ์การทดสอบ (Test Plan & Strategy)

### 1.1 วัตถุประสงค์ของการทดสอบ (Objectives)
1. ตรวจสอบความถูกต้องของการทำงานตามขอบเขตทั้ง **12 Use Cases** ที่กำหนดไว้ใน [01-Use-Case-Diagram.md](./01-Use-Case-Diagram.md)
2. ยืนยันความถูกต้องของวงจรสถานะการผลิต (Content & Task State Machine Workflow) ตั้งแต่ขั้นตอนสร้างงานจนถึงการเผยแพร่
3. ตรวจสอบความปลอดภัยของระบบด้านการควบคุมสิทธิ์ตามบทบาท (Role-Based Access Control - RBAC) และการแบ่งแยกข้อมูลข้ามทีม (Team Isolation Guard)
4. ยืนยันความถูกต้องของการบันทึกประวัติการดำเนินงาน (Audit Logs) และการแจ้งเตือนกิจกรรมทีมแบบเรียลไทม์ (Real-time Team Activities)

### 1.2 สภาพแวดล้อมที่ใช้ในการทดสอบ (Test Environment)
- **Database Server:** MongoDB Community Server 7.0 (ฐานข้อมูล `content_management`)
- **Application Server (Backend):** Node.js 20.x, Express 4.x, Socket.io (Port `:5000`)
- **Web Portal (Admin Client):** Next.js 14, React 18, Tailwind CSS (Port `:3000`)
- **Mobile Application (Manager / Member Client):** React Native 0.74 (Android บนอุปกรณ์จริง Xiaomi 13 Pro และ Android Emulator)

### 1.3 บัญชีผู้ใช้มาตรฐานสำหรับการทดสอบ (Pre-seeded Test Accounts)
> รหัสผ่านมาตรฐานของทุกบัญชีทดสอบ: `123456`

| บทบาท (Role) | อีเมล (Email) | สังกัดทีม (Team) | แพลตฟอร์มที่ใช้ทดสอบ | วัตถุประสงค์การทดสอบ |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@studio.com` | ส่วนกลาง (Global) | Web Portal | การจัดการผู้ใช้ สิทธิ์ และกำกับดูแลระบบ |
| **Manager** | `manager@studio.com` | `TEAM-A` (Content Team A) | Mobile App | การบริหารทีม มอบหมายงาน และตรวจรับอนุมัติ |
| **Member** | `member@studio.com` | `TEAM-A` (Content Team A) | Mobile App | การปฏิบัติงานตามที่ได้รับมอบหมายและส่งมอบงาน |
| **Outsider** | `outsider@studio.com` | `TEAM-B` (Beta Studio) | Mobile App | การทดสอบความปลอดภัยป้องกันการเข้าถึงข้ามทีม |

---

## 2. ตารางกรณีทดสอบแบบดำเนินการด้วยตนเอง (Manual Test Cases Matrix)

### หมวดที่ 1: การยืนยันตัวตนและการจัดการบัญชี (Authentication & Profile — UC-01)

| รหัสกรณีทดสอบ | Use Case | บทบาท | รายละเอียดและขั้นตอนการทดสอบ | ข้อมูลนำเข้า (Test Data) | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบ | สถานะ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | UC-01 | ทุกบทบาท | **เข้าสู่ระบบสำเร็จ (Positive Test):**<br/>1. เปิดหน้า Login<br/>2. กรอกอีเมลและรหัสผ่านที่ถูกต้อง<br/>3. กดปุ่ม "เข้าสู่ระบบ" | Email: `manager@studio.com`<br/>Password: `123456` | เข้าสู่ระบบสำเร็จ ได้รับ JWT Token และเปลี่ยนเส้นทางไปยังหน้า Dashboard ตามสิทธิ์ | เข้าสู่ระบบสำเร็จและแสดงหน้าจอหลัก | **PASS** |
| **TC-AUTH-02** | UC-01 | ทุกบทบาท | **เข้าสู่ระบบไม่สำเร็จด้วยรหัสผ่านผิด (Negative Test):**<br/>1. กรอกอีเมลถูกต้อง<br/>2. กรอกรหัสผ่านผิด<br/>3. กดปุ่ม "เข้าสู่ระบบ" | Email: `manager@studio.com`<br/>Password: `wrongpass` | ระบบปฏิเสธการเข้าถึง แสดงข้อความ "Invalid credentials" (HTTP 401) | แสดงข้อความเตือนและไม่อนุญาตเข้าสู่ระบบ | **PASS** |
| **TC-AUTH-03** | UC-01 | Member | **การเรียกดูข้อมูลโปรไฟล์และสถานะ (Profile Fetch):**<br/>1. เข้าสู่ระบบ<br/>2. เรียกดูหน้าโปรไฟล์ของตนเอง | JWT Bearer Token | แสดงชื่อ, นามสกุล, บทบาท, ตำแหน่งงาน และทีมที่สังกัดถูกต้อง | ข้อมูลแสดงผลตรงตามฐานข้อมูล | **PASS** |

---

### หมวดที่ 2: การเข้าร่วมทีมและการจัดโครงสร้างทีม (Team Operations — UC-02, UC-06)

| รหัสกรณีทดสอบ | Use Case | บทบาท | รายละเอียดและขั้นตอนการทดสอบ | ข้อมูลนำเข้า (Test Data) | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบ | สถานะ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-TEAM-01** | UC-02 | Member | **เข้าร่วมทีมด้วยรหัสทีมถูกต้อง (Positive Test):**<br/>1. เข้าเมนูเข้าร่วมทีม<br/>2. ระบุ Team Code ที่มีอยู่จริง<br/>3. กดยืนยัน | Team Code: `TEAM-A` | ผู้ใช้ถูกผูกเข้ากับทีมสำเร็จ และระบบนำทางไปยังหน้าจอ Team Workspace | เข้าร่วมทีมสำเร็จและแสดงข้อมูล Team A | **PASS** |
| **TC-TEAM-02** | UC-02 | Member | **เข้าร่วมทีมด้วยรหัสทีมไม่ถูกต้อง (Negative Test):**<br/>1. ระบุ Team Code ที่ไม่มีในระบบ<br/>2. กดยืนยัน | Team Code: `INVALID99` | ระบบแจ้งเตือน "Team not found with this code" (HTTP 404) | แสดง Alert แจ้งเตือนรหัสทีมไม่ถูกต้อง | **PASS** |
| **TC-TEAM-03** | UC-06 | Manager | **กำหนดตำแหน่งงานให้แก่สมาชิก (Position Assignment):**<br/>1. Manager เปิดหน้ารายชื่อสมาชิกในทีม<br/>2. เลือกสมาชิกและเปลี่ยนตำแหน่ง<br/>3. กดยืนยันบันทึก | Member: `member@studio.com`<br/>Position: `Video Editor` | ตำแหน่งของสมาชิกในทีมถูกอัปเดต และบันทึกกิจกรรมลง Team Feed | ตำแหน่งเปลี่ยนเป็น Video Editor สำเร็จ | **PASS** |

---

### หมวดที่ 3: วงจรการผลิตคอนเทนต์และส่งมอบงาน (Production Workflow — UC-03, UC-07, UC-08, UC-09)

| รหัสกรณีทดสอบ | Use Case | บทบาท | รายละเอียดและขั้นตอนการทดสอบ | ข้อมูลนำเข้า (Test Data) | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบ | สถานะ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-PROD-01** | UC-07 | Manager | **สร้างชิ้นงานคอนเทนต์และมอบหมายงานย่อย:**<br/>1. กดปุ่ม "+ สร้าง Content"<br/>2. กรอกชื่อและแพลตฟอร์ม<br/>3. เพิ่มงานย่อยและระบุผู้รับผิดชอบ<br/>4. กดยืนยันการสร้าง | Title: `รีวิวสมาร์ตโฟน 2026`<br/>Platform: `YouTube`<br/>Task: `ตัดต่อวิดีโอ`<br/>Assignee: `member@studio.com` | Content ถูกสร้างในสถานะ `PLANNING` และ Task ถูกสร้างในสถานะ `TODO` | Content และ Task ปรากฏในระบบถูกต้อง | **PASS** |
| **TC-PROD-02** | UC-03 | Member | **เริ่มปฏิบัติงานและส่งมอบผลงาน (Submit Deliverable):**<br/>1. Member เปิดดูงานใน My Tasks<br/>2. ปรับสถานะเป็น `IN_PROGRESS`<br/>3. วาง Submission URL<br/>4. กดส่งตรวจงาน | Task Status: `IN_PROGRESS`<br/>Submission URL: `https://drive.google.com/test-cut` | Task เปลี่ยนเป็นสถานะ `REVIEW` และ Content เปลี่ยนเป็น `REVIEW` พร้อมแจ้งเตือน Manager | Task ปรับเป็น REVIEW และส่งเข้าคิวตรวจ | **PASS** |
| **TC-PROD-03** | UC-08 | Manager | **ตรวจงานและสั่งแก้ไข (Request Revision):**<br/>1. Manager เปิดดูงานที่ส่งตรวจ<br/>2. กดปุ่ม "ส่งกลับแก้ไข"<br/>3. ระบุข้อความ Revision Notes<br/>4. กดยืนยัน | Decision: `REVISION`<br/>Notes: `กรุณาปรับลดระดับเสียงเพลงประกอบลง 20%` | Content และ Task เปลี่ยนสถานะเป็น `REVISION` พร้อมบันทึกลง Review History | ระบบเปลี่ยนสถานะและแสดงข้อความสั่งแก้ | **PASS** |
| **TC-PROD-04** | UC-03 | Member | **ส่งงานรอบแก้ไขพร้อมข้อความชี้แจง (Revision Reply):**<br/>1. Member เปิดดูงานที่มีข้อความสั่งแก้<br/>2. พิมพ์ Reply Notes ชี้แจง<br/>3. แนบลิงก์ไฟล์งานใหม่<br/>4. กดส่งตรวจซ้ำ | Reply Notes: `ปรับลดระดับเสียงตามคำแนะนำแล้วครับ`<br/>Submission URL: `https://drive.google.com/test-cut-v2` | Task เปลี่ยนกลับเป็นสถานะ `REVIEW` พร้อมบันทึก Reply Notes ให้ Manager เห็น | ข้อมูลบันทึกครบถ้วนและส่งตรวจซ้ำ | **PASS** |
| **TC-PROD-05** | UC-08 | Manager | **อนุมัติชิ้นงานโดยตรง (1-Tap Approval):**<br/>1. Manager ตรวจผลงานรอบแก้ไข<br/>2. กดปุ่ม "อนุมัติชิ้นงาน (Approve)" | Decision: `APPROVED` | Content เปลี่ยนเป็น `APPROVED` และ Tasks ย่อยทั้งหมดเปลี่ยนเป็น `DONE` (ความคืบหน้า 100%) อัตโนมัติ | Content ได้รับการอนุมัติ และ Task ปิดสมบูรณ์ | **PASS** |
| **TC-PROD-06** | UC-09 | Manager | **เผยแพร่ผลงานสู่สาธารณะ (Publish Content):**<br/>1. เลือก Content สถานะ `APPROVED`<br/>2. ระบุ URL ผลงานจริง<br/>3. กดปุ่ม "เผยแพร่ผลงาน" | Status: `PUBLISHED`<br/>Published URL: `https://youtube.com/watch?v=live123` | Content เปลี่ยนสถานะเป็น `PUBLISHED` และบันทึก `publishedAt` เป็นเวลาปัจจุบัน | ชิ้นงานแสดงสถานะเผยแพร่เรียบร้อย | **PASS** |

---

### หมวดที่ 4: การระดมความคิดและกิจกรรมทีม (Ideas & Real-time Tracking — UC-04, UC-05)

| รหัสกรณีทดสอบ | Use Case | บทบาท | รายละเอียดและขั้นตอนการทดสอบ | ข้อมูลนำเข้า (Test Data) | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบ | สถานะ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-IDEA-01** | UC-04 | Member | **เสนอแนวคิดคอนเทนต์ใหม่ (Pitch Idea):**<br/>1. เข้าหน้า Idea Board<br/>2. กดปุ่ม "+ เสนอไอเดีย"<br/>3. กรอกชื่อและคำอธิบาย<br/>4. กดยืนยัน | Title: `เจาะลึกฟีเจอร์ AI 2026`<br/>Platform: `TikTok`<br/>Category: `Tech` | ไอเดียถูกบันทึกในสถานะ `DRAFT` และปรากฏบนบอร์ดของทีม | ไอเดียแสดงบนบอร์ดพร้อมให้ทีมมีส่วนร่วม | **PASS** |
| **TC-TRK-01** | UC-05 | ทุกสมาชิกทีม | **ติดตามความคืบหน้าและกิจกรรมสดของทีม (Team Activity Feed):**<br/>1. เปิดหน้าแท็บ "ทีมของฉัน"<br/>2. ตรวจสอบแถบ Progress และฟีดกิจกรรม | Team ID: `TEAM-A` | แสดงเปอร์เซ็นต์ความคืบหน้ารวมของทีม และบันทึกเหตุการณ์ล่าสุดสดจากฐานข้อมูล | แสดงความคืบหน้าและฟีดตามเวลาจริง | **PASS** |

---

### หมวดที่ 5: การบริหารจัดการระบบและความปลอดภัย (Admin & Security — UC-10, UC-11, UC-12)

| รหัสกรณีทดสอบ | Use Case | บทบาท | รายละเอียดและขั้นตอนการทดสอบ | ข้อมูลนำเข้า (Test Data) | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบ | สถานะ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-ADM-01** | UC-10 | Admin | **การเรียกดูและจัดการผู้ใช้งาน (User Administration):**<br/>1. เข้าสู่ระบบ Admin Web<br/>2. เปิดเมนู User Management<br/>3. ตรวจสอบรายชื่อผู้ใช้ทั้งหมดในระบบ | Admin Token | แสดงตารางรายชื่อผู้ใช้ทุกคน พร้อมบทบาทและทีมที่สังกัด | รายชื่อแสดงผลครบถ้วน 7 บัญชี | **PASS** |
| **TC-ADM-02** | UC-11 | Admin | **กำกับดูแลคอนเทนต์ภาพรวมระบบ (Global CMS):**<br/>1. เปิดเมนู Content Management<br/>2. เรียกดูและกรองคอนเทนต์จากทุกทีม | Filter: `All Teams` | แสดงรายการคอนเทนต์ทั้งหมดข้ามทีม พร้อมสถานะแบบภาพรวมส่วนกลาง | ข้อมูลคอนเทนต์ทุกทีมแสดงครบถ้วน | **PASS** |
| **TC-ADM-03** | UC-12 | Admin | **ตรวจสอบสุขภาพระบบและ Audit Logs (System Health & Logs):**<br/>1. เปิดหน้า System Health & Logs<br/>2. ตรวจสอบสถานะการเชื่อมต่อและบันทึกประวัติ | HTTP Request `/api/health` และ `/api/logs` | แสดงสถานะ Database: Connected, API: Online และรายการบันทึกประวัติการกระทำ | ข้อมูลสุขภาพระบบและบันทึกแสดงผลสมบูรณ์ | **PASS** |
| **TC-SEC-01** | ความปลอดภัย | Member | **การป้องกันการเข้าถึงข้อมูลข้ามทีม (Team Isolation Guard):**<br/>1. ผู้ใช้สังกัด Team A พยายามเรียกดูข้อมูล Dashboard ของ Team B ผ่าน API | Request: `GET /api/teams/:teamB_Id/dashboard`<br/>User: Team A Member | ระบบปฏิเสธคำขอด้วยรหัส `HTTP 403 Forbidden` พร้อมข้อความแจ้งเตือนสิทธิ์ | ได้รับ HTTP 403 ป้องกันการละเมิดสิทธิ์สำเร็จ | **PASS** |

---

## 3. สรุปผลการทดสอบแบบดำเนินการด้วยตนเอง (Manual Testing Summary)

- **จำนวนกรณีทดสอบทั้งหมด:** 15 กรณีทดสอบ (ครอบคลุมทั้ง Positive, Negative, Workflow Lifecycle, และ Security Isolation)
- **ผลการทดสอบผ่าน (PASS):** 15 / 15 (คิดเป็น **100%**)
- **ข้อผิดพลาดตกค้าง (Defects / Bugs):** 0 รายการ
- **สรุปภาพรวม:** ระบบมีความพร้อมในการใช้งานตามข้อกำหนดเชิงวิศวกรรมซอฟต์แวร์ และมีความสอดคล้องกับ [01-Use-Case-Diagram.md](./01-Use-Case-Diagram.md) และ [10-Workflow-Diagram.md](./10-Workflow-Diagram.md) อย่างสมบูรณ์

> **ตารางกรณีทดสอบรูปแบบสเปรดชีต (Excel Spreadsheet):**  
> เอกสารฉบับทางการรวมตารางกรณีทดสอบทั้ง Manual และ Automated พร้อม Requirements Traceability Matrix (RTM) จัดเก็บอยู่ที่: [Draftly-System-Test-Cases.xlsx](./Draftly-System-Test-Cases.xlsx)

