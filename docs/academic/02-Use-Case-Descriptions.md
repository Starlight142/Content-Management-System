# 2. Use Case Descriptions — Formal Specifications

เอกสารนี้ระบุรายละเอียดข้อกำหนดการทำงานของ Use Case สำคัญในรูปแบบ **Fully Dressed Use Case Specification (Cockburn / IEEE Format)** สำหรับการประเมินวิชา Software Engineering และโครงงานปริญญานิพนธ์ โดยสอดคล้องกับ [01-Use-Case-Diagram.md](./01-Use-Case-Diagram.md) อย่างสมบูรณ์ 100%

---

## 📋 สารบัญ Use Cases (12 รายการ)
1. [UC-01: เข้าสู่ระบบและจัดการบัญชีผู้ใช้ (Authentication & Profile Management)](#uc-01-เข้าสู่ระบบและจัดการบัญชีผู้ใช้-authentication--profile-management)
2. [UC-02: เข้าร่วมทีมด้วยรหัสทีม (Join Team by Code)](#uc-02-เข้าร่วมทีมด้วยรหัสทีม-join-team-by-code)
3. [UC-03: จัดการและส่งมอบงานย่อย (Tasks & Deliverables Management)](#uc-03-จัดการและส่งมอบงานย่อย-tasks--deliverables-management)
4. [UC-04: เสนอและแลกเปลี่ยนแนวคิดคอนเทนต์ (Ideas & Brainstorming)](#uc-04-เสนอและแลกเปลี่ยนแนวคิดคอนเทนต์-ideas--brainstorming)
5. [UC-05: ติดตามความคืบหน้าและกิจกรรมทีมแบบเรียลไทม์ (Track Progress & Real-time Activities)](#uc-05-ติดตามความคืบหน้าและกิจกรรมทีมแบบเรียลไทม์-track-progress--real-time-activities)
6. [UC-06: บริหารจัดการทีมและกำหนดตำแหน่งงาน (Team & Positions Management)](#uc-06-บริหารจัดการทีมและกำหนดตำแหน่งงาน-team--positions-management)
7. [UC-07: สร้างชิ้นงานและมอบหมายงานผลิต (Content Creation & Task Assignment)](#uc-07-สร้างชิ้นงานและมอบหมายงานผลิต-content-creation--task-assignment)
8. [UC-08: ตรวจรับ สั่งแก้ไข และอนุมัติชิ้นงาน (Review, Revision & Approval)](#uc-08-ตรวจรับ-สั่งแก้ไข-และอนุมัติชิ้นงาน-review-revision--approval)
9. [UC-09: เผยแพร่ผลงานสู่สาธารณะ (Publish Content)](#uc-09-เผยแพร่ผลงานสู่สาธารณะ-publish-content)
10. [UC-10: บริหารจัดการผู้ใช้งาน ทีมงาน และสิทธิ์ระบบ (RBAC & User Administration)](#uc-10-บริหารจัดการผู้ใช้งาน-ทีมงาน-และสิทธิ์ระบบ-rbac--user-administration)
11. [UC-11: กำกับดูแลชิ้นงานและภารกิจทั้งหมดในระบบ (Global CMS Supervision)](#uc-11-กำกับดูแลชิ้นงานและภารกิจทั้งหมดในระบบ-global-cms-supervision)
12. [UC-12: ตรวจสอบสถานะระบบและประวัติการดำเนินงาน (System Status & Audit Logs)](#uc-12-ตรวจสอบสถานะระบบและประวัติการดำเนินงาน-system-status--audit-logs)

---

### UC-01: เข้าสู่ระบบและจัดการบัญชีผู้ใช้ (Authentication & Profile Management)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-01** |
| **Use Case Name** | Authentication & Profile Management (การเข้าสู่ระบบและจัดการบัญชีผู้ใช้) |
| **Primary Actor** | Member, Manager (สืบทอดจาก Member), Admin |
| **Preconditions** | ผู้ใช้มีบัญชีที่ลงทะเบียนไว้ในฐานข้อมูล และมีสถานะ Active |
| **Postconditions** | ผู้ใช้ได้รับ JWT Access Token เพื่อยืนยันตัวตน และสามารถดู/อัปเดตข้อมูลโปรไฟล์ส่วนตัวได้ |
| **Trigger** | ผู้ใช้เปิดแอปพลิเคชันหรือเว็บเบราว์เซอร์ และระบุข้อมูลเพื่อเข้าสู่ระบบ |

#### Main Success Scenario:
1. ผู้ใช้เปิดระบบ (Mobile App สำหรับ Member/Manager หรือ Web Portal สำหรับ Admin)
2. ผู้ใช้กรอกอีเมล (Email) และรหัสผ่าน (Password)
3. ระบบตรวจสอบความถูกต้องของข้อมูล (Bcrypt Hash Comparison)
4. ระบบสร้าง JWT Bearer Token ที่บรรจุ `userId`, `role`, และ `teamId`
5. ระบบส่งคืน Token และข้อมูลผู้ใช้ พร้อมเปลี่ยนเส้นทางไปยังหน้า Dashboard ตามบทบาท
6. ผู้ใช้สามารถเรียกดูหรืออัปเดตข้อมูลส่วนตัว (ชื่อ, รูปโปรไฟล์) ผ่านหน้าการตั้งค่าบัญชี

---

### UC-02: เข้าร่วมทีมด้วยรหัสทีม (Join Team by Code)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-02** |
| **Use Case Name** | Join Team by Code (การเข้าร่วมทีมด้วยรหัสทีม) |
| **Primary Actor** | Member, Manager (สืบทอดจาก Member) |
| **Preconditions** | ผู้ใช้ผ่านการยืนยันตัวตนแล้ว และยังไม่มีสังกัดทีม หรือต้องการย้ายเข้าสังกัดทีมใหม่ |
| **Postconditions** | บัญชีผู้ใช้ถูกผูกเข้ากับ `teamId` ของทีมเป้าหมาย และได้รับสิทธิ์เข้าถึงพื้นที่ทำงานของทีม |
| **Trigger** | สมาชิกทีมได้รับรหัสทีม (Team Code เช่น `TEAM-A`) จากหัวหน้าทีม |

#### Main Success Scenario:
1. **Member** เปิดแอปพลิเคชันมือถือ เลือกเมนู "เข้าร่วมทีม"
2. **Member** กรอกรหัสทีม 6-8 ตัวอักษร (เช่น `TEAM-A`)
3. ระบบส่งคำขอ `POST /api/teams/join` ไปยัง Backend
4. ระบบตรวจสอบความถูกต้องของรหัสทีมในฐานข้อมูล:
   - ตรวจสอบว่ามีทีมอยู่จริงและสถานะทีมเป็น `ACTIVE`
5. ระบบอัปเดตฟิลด์ `teamId` ของผู้ใช้ และเพิ่มผู้ใช้เข้าสู่รายการสมาชิกทีม
6. ระบบสร้างบันทึกกิจกรรมต้อนรับสมาชิกใหม่ลงใน Team Activity Feed
7. ระบบรีเฟรชหน้าจอไปยัง Team Workspace ของทีมที่เข้าร่วมสำเร็จ

---

### UC-03: จัดการและส่งมอบงานย่อย (Tasks & Deliverables Management)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-03** |
| **Use Case Name** | Tasks & Deliverables Management (การจัดการและส่งมอบงานย่อย) |
| **Primary Actor** | Member, Manager (สืบทอดจาก Member) |
| **Preconditions** | มี Task ย่อยในสถานะ `TODO`, `IN_PROGRESS` หรือ `REVISION` ที่มอบหมายให้แก่ตน |
| **Postconditions** | Task เปลี่ยนสถานะเป็น `REVIEW` พร้อมบันทึกหลักฐานลิงก์ส่งงาน และแจ้งเตือนไปยัง Manager |
| **Trigger** | สมาชิกทีมเริ่มทำงาน อัปเดตความคืบหน้า หรือผลิตงานเสร็จสิ้นพร้อมส่งตรวจ |

#### Main Success Scenario:
1. **Member** เปิดแอปพลิเคชันมือถือในแท็บ "My Tasks"
2. ระบบแสดงรายการงานที่ตนเองได้รับมอบหมาย พร้อมระบุชิ้นงานแม่ กำหนดส่ง และสถานะ
3. เมื่อเริ่มลงมือทำงาน **Member** กดเปลี่ยนสถานะเป็น "กำลังดำเนินการ (In Progress)"
4. เมื่อผลิตงานเสร็จสิ้น สมาชิกแนบลิงก์ส่งมอบผลงาน (Submission URL เช่น Google Drive, Frame.io หรือ YouTube Unlisted Link)
5. หากเป็นงานที่ถูกสั่งแก้ไข (สถานะ `REVISION`) สมาชิกสามารถกรอกข้อความตอบกลับ (Reply Notes) ชี้แจงสิ่งที่ได้ปรับปรุง
6. **Member** กดปุ่ม "🚀 ส่งตรวจงาน (Submit for Review)"
7. ระบบตรวจสอบรูปแบบ URL (Valid URI Scheme) และอัปเดต Task เป็นสถานะ `REVIEW` พร้อมบันทึก `submittedAt`
8. ระบบส่งการแจ้งเตือนไปยัง Manager และอัปเดตสถานะของ Content หลักเข้าสู่คิวรอตรวจ

---

### UC-04: เสนอและแลกเปลี่ยนแนวคิดคอนเทนต์ (Ideas & Brainstorming)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-04** |
| **Use Case Name** | Ideas & Brainstorming (การเสนอและแลกเปลี่ยนแนวคิดคอนเทนต์) |
| **Primary Actor** | Member, Manager (สืบทอดจาก Member) |
| **Preconditions** | สมาชิกสังกัดอยู่ในทีมและมีสิทธิ์เข้าถึง Idea Board |
| **Postconditions** | ไอเดียถูกบันทึกในฐานข้อมูล และเปิดให้สมาชิกในทีมร่วมแสดงความคิดเห็นและโหวต |
| **Trigger** | สมาชิกในทีมเกิดความคิดสร้างสรรค์ใหม่สำหรับหัวข้อคอนเทนต์ |

#### Main Success Scenario:
1. **Member** หรือ **Manager** เลือกแท็บ "Idea Board" และกดปุ่ม "+ เสนอไอเดียใหม่"
2. ผู้ใช้กรอกข้อมูล: หัวข้อไอเดีย (Title), คำอธิบาย (Description), แพลตฟอร์มเป้าหมาย และหมวดหมู่
3. ผู้ใช้กดยืนยันการส่งไอเดีย
4. ระบบตรวจสอบความถูกต้องของข้อมูล และบันทึกลงฐานข้อมูลสถานะ `DRAFT`
5. สมาชิกในทีมสามารถเปิดดูไอเดีย กด Like/Vote และเขียนคอมเมนต์แลกเปลี่ยนความคิดเห็น
6. **Manager** สามารถพิจารณาเปลี่ยนสถานะไอเดียเป็น `APPROVED` เพื่อเตรียมนำไปเปิดสายการผลิตจริง

---

### UC-05: ติดตามความคืบหน้าและกิจกรรมทีมแบบเรียลไทม์ (Track Progress & Real-time Activities)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-05** |
| **Use Case Name** | Track Progress & Real-time Activities (การติดตามความคืบหน้าและกิจกรรมทีมแบบเรียลไทม์) |
| **Primary Actor** | Member, Manager (สืบทอดจาก Member) |
| **Preconditions** | ผู้ใช้เข้าใช้งานในหน้าจอ Team Workspace ของทีมตนเอง |
| **Postconditions** | ผู้ใช้มองเห็น KPI ภาพรวมของทีม แถบความคืบหน้าเปอร์เซ็นต์รวม และฟีดกิจกรรมล่าสุดสดจากฐานข้อมูล |
| **Trigger** | ผู้ใช้กดเข้าสู่แท็บ "ทีมของฉัน" หรือดึงเพื่อรีเฟรช (Pull-to-Refresh) |

#### Main Success Scenario:
1. ผู้ใช้เลือกแท็บ "ทีมของฉัน (My Team)" บน Mobile App
2. Mobile App ส่งคำขอ `GET /api/teams/:teamId/dashboard` และ `GET /api/teams/:teamId/activity`
3. Backend ตรวจสอบ Team Authorization Guard เพื่อยืนยันว่าผู้ใช้สังกัดทีมนั้นจริง
4. ระบบประมวลผลและส่งคืนข้อมูล:
   - KPI สรุปสถานะงาน (งานทั้งหมด, กำลังผลิต, รอตรวจ, เสร็จสมบูรณ์)
   - แถบ Team Overall Progress % ที่คำนวณจากค่างานย่อยทั้งหมด
   - รายชื่อเพื่อนร่วมทีมและสถานะความพร้อม
   - ฟีดกิจกรรมความเคลื่อนไหวล่าสุด (Chronological Activity Feed) เช่น การส่งงาน, การสั่งแก้, การอนุมัติ
5. ผู้ใช้รับทราบสถานะของทีมและร่วมมือกันได้อย่างราบรื่น

---

### UC-06: บริหารจัดการทีมและกำหนดตำแหน่งงาน (Team & Positions Management)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-06** |
| **Use Case Name** | Team & Positions Management (การบริหารจัดการทีมและกำหนดตำแหน่งงาน) |
| **Primary Actor** | Manager |
| **Preconditions** | Manager เข้าสู่ระบบและมีสิทธิ์เป็นหัวหน้าทีม |
| **Postconditions** | โครงสร้างทีม ข้อมูลสมาชิก และตำแหน่งงาน (Position) ถูกบันทึกและปรับปรุงในระบบ |
| **Trigger** | หัวหน้าทีมต้องการจัดโครงสร้างทีม รับสมาชิกใหม่ หรือมอบหมายตำแหน่งงาน |

#### Main Success Scenario:
1. **Manager** เข้าสู่เมนูจัดการทีมบน Mobile App
2. **Manager** ดูรายการสมาชิกในทีม และเลือกระบุตำแหน่งงานเฉพาะทาง (เช่น Video Editor, Scriptwriter, Graphic Designer)
3. ระบบบันทึกการกำหนดตำแหน่งงานลงในระเบียนสมาชิก
4. **Manager** สามารถสร้างรหัสทีมใหม่ หรืออัปเดตรายละเอียดของสตูดิโอทีม
5. ระบบบันทึกการเปลี่ยนแปลงและอัปเดตสิทธิ์การมองเห็นในทีม

---

### UC-07: สร้างชิ้นงานและมอบหมายงานผลิต (Content Creation & Task Assignment)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-07** |
| **Use Case Name** | Content Creation & Task Assignment (การสร้างชิ้นงานและมอบหมายงานผลิต) |
| **Primary Actor** | Manager |
| **Preconditions** | Manager ต้องการเปิดโปรเจกต์คอนเทนต์ใหม่ (จากไอเดียที่อนุมัติหรือสร้างใหม่) |
| **Postconditions** | ชิ้นงาน Content ถูกสร้างในสถานะ `PLANNING` และมี Task ย่อยถูกผูกเข้ากับสมาชิกในทีม |
| **Trigger** | หัวหน้าทีมเริ่มวางแผนตารางการผลิตสื่อประจำสัปดาห์/เดือน |

#### Main Success Scenario:
1. **Manager** กดปุ่ม "+ สร้าง Content ใหม่"
2. **Manager** ระบุชื่อชิ้นงาน, แพลตฟอร์มเป้าหมาย (YouTube, TikTok), กำหนดส่ง (Deadline), และผู้รับผิดชอบหลัก
3. **Manager** แตกงานย่อย (Sub-tasks) พร้อมกำหนดสมาชิกผู้รับผิดชอบ:
   - ตัวอย่าง: "เขียนบท" มอบหมายให้ Member A
   - ตัวอย่าง: "ตัดต่อวิดีโอ" มอบหมายให้ Member B
4. **Manager** กดยืนยันการสร้างชิ้นงาน
5. ระบบสร้างระเบียน Content (`status = PLANNING`) และสร้าง Tasks ย่อย (`status = TODO`)
6. ระบบปรับสถานะ Content เป็น `PRODUCTION` อัตโนมัติเมื่อเริ่มมีการดำเนินงาน
7. ระบบส่งการแจ้งเตือนไปยังสมาชิกแต่ละคนที่ได้รับมอบหมาย

---

### UC-08: ตรวจรับ สั่งแก้ไข และอนุมัติชิ้นงาน (Review, Revision & Approval)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-08** |
| **Use Case Name** | Review, Revision & Approval (การตรวจรับ สั่งแก้ไข และอนุมัติชิ้นงาน) |
| **Primary Actor** | Manager |
| **Preconditions** | ชิ้นงานหรือภารกิจย่อยอยู่ในสถานะ `REVIEW` พร้อมแนบหลักฐานส่งงาน |
| **Postconditions** | Content/Task เปลี่ยนสถานะเป็น `APPROVED` (หากตรวจผ่าน) หรือ `REVISION` (หากสั่งแก้ไข) |
| **Trigger** | สมาชิกส่งมอบงานเสร็จสิ้นและชิ้นงานเข้าสู่คิวรอตรวจของ Manager |

#### Main Success Scenario (กรณีสั่งแก้ไข - Revision):
1. **Manager** เปิดคิวงานรอตรวจ (Review Queue) และตรวจสอบผลงานจาก Submission URL
2. หากพบจุดบกพร่อง **Manager** กดปุ่ม "🔄 ส่งกลับแก้ไข (Request Revision)"
3. ระบบแสดง Modal ให้ระบุข้อความคำแนะนำในการแก้ไข (Revision Notes)
4. **Manager** พิมพ์รายละเอียดจุดที่ต้องปรับปรุงและกดยืนยัน
5. ระบบเปลี่ยนสถานะ Content เป็น `REVISION` และปรับ Task ที่เกี่ยวข้องกลับเป็น `IN_PROGRESS`
6. ระบบบันทึกประวัติลงใน `reviewHistory` และแจ้งเตือนไปยังสมาชิกผู้รับผิดชอบ

#### Alternative Path (กรณีอนุมัติทันที - Direct 1-Tap Approval):
1. หากผลงานสมบูรณ์ถูกต้องตามมาตรฐาน **Manager** กดปุ่ม "อนุมัติชิ้นงาน (Approve Content)"
2. ระบบส่ง `POST /api/contents/:id/review` พร้อมระบุ `decision: 'APPROVED'`
3. ระบบเปลี่ยนสถานะ Content เป็น `APPROVED` และปรับ Tasks ย่อยที่เกี่ยวข้องเป็น `DONE` (100%)
4. ระบบบันทึกลงใน Team Activity Feed และปลดล็อกชิ้นงานสู่ขั้นตอนการเผยแพร่

---

### UC-09: เผยแพร่ผลงานสู่สาธารณะ (Publish Content)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-09** |
| **Use Case Name** | Publish Content (การเผยแพร่ผลงานสู่สาธารณะ) |
| **Primary Actor** | Manager |
| **Preconditions** | ชิ้นงาน Content อยู่ในสถานะ `APPROVED` |
| **Postconditions** | Content เปลี่ยนสถานะเป็น `PUBLISHED` และระบบบันทึกเวลาเผยแพร่จริง |
| **Trigger** | ถึงกำหนดการเผยแพร่หรือผู้จัดการต้องการเผยแพร่ผลงานทันที |

#### Main Success Scenario:
1. **Manager** เลือกชิ้นงานที่ผ่านการอนุมัติแล้ว (`APPROVED`)
2. **Manager** ระบุลิงก์ผลงานจริงที่เผยแพร่บนแพลตฟอร์ม (Public URL เช่น YouTube Video Link)
3. **Manager** กดปุ่ม "เผยแพร่ผลงาน (Publish Now)"
4. ระบบอัปเดตสถานะ Content เป็น `PUBLISHED` พร้อมบันทึก `publishedAt = NOW()`
5. ระบบบันทึกความสำเร็จลงใน Team Activity Feed เพื่อแสดงในสถิติผลงานเสร็จสมบูรณ์ของทีม

---

### UC-10: บริหารจัดการผู้ใช้งาน ทีมงาน และสิทธิ์ระบบ (RBAC & User Administration)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-10** |
| **Use Case Name** | RBAC & User Administration (การบริหารจัดการผู้ใช้งาน ทีมงาน และสิทธิ์ระบบ) |
| **Primary Actor** | Admin |
| **Preconditions** | Admin เข้าสู่ระบบผ่าน Admin Web Portal |
| **Postconditions** | บัญชีผู้ใช้ สิทธิ์ และโครงสร้างทีมในระบบถูกปรับปรุงในฐานข้อมูล |
| **Trigger** | มีพนักงานเข้าใหม่ ลาออก หรือต้องปรับโครงสร้างสิทธิ์ขององค์กร |

#### Main Success Scenario:
1. **Admin** เปิดหน้า "User & Team Management" บน Admin Web Portal
2. **Admin** ค้นหา เรียกดู หรือแก้ไขข้อมูลผู้ใช้งาน
3. **Admin** กำหนดบทบาทสิทธิ์ (Role: `admin`, `manager`, `member`) หรือระงับการใช้งานบัญชี
4. **Admin** ตรวจสอบและจัดการโครงสร้างทีมทั้งหมดในระบบ
5. ระบบบันทึกการเปลี่ยนแปลงลงในฐานข้อมูล MongoDB

---

### UC-11: กำกับดูแลชิ้นงานและภารกิจทั้งหมดในระบบ (Global CMS Supervision)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-11** |
| **Use Case Name** | Global CMS Supervision (การกำกับดูแลชิ้นงานและภารกิจทั้งหมดในระบบ) |
| **Primary Actor** | Admin |
| **Preconditions** | Admin เข้าสู่ระบบผ่าน Admin Web Portal |
| **Postconditions** | Admin มองเห็นภาพรวมของคอนเทนต์และสถานะการผลิตข้ามทีมทั้งหมดในระบบ |
| **Trigger** | ผู้บริหารหรือผู้ดูแลระบบต้องการติดตามความคืบหน้าภาพรวมของสตูดิโอ |

#### Main Success Scenario:
1. **Admin** เปิดหน้า "Content Management" บน Web Portal
2. ระบบแสดงรายการคอนเทนต์ทั้งหมดจากทุกทีม พร้อมตัวกรองตามทีม แพลตฟอร์ม และสถานะ
3. **Admin** สามารถตรวจสอบความคืบหน้า รายละเอียดของงานผลิต และประวัติการทำงานได้
4. ในกรณีจำเป็น **Admin** มีสิทธิ์จัดการหรือลบเนื้อหาที่ไม่เหมาะสมตามระเบียบองค์กร

---

### UC-12: ตรวจสอบสถานะระบบและประวัติการดำเนินงาน (System Status & Audit Logs)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-12** |
| **Use Case Name** | System Status & Audit Logs (การตรวจสอบสถานะระบบและประวัติการดำเนินงาน) |
| **Primary Actor** | Admin |
| **Preconditions** | Admin เข้าสู่ระบบผ่าน Admin Web Portal |
| **Postconditions** | ข้อมูลบันทึกความปลอดภัยและประวัติการทำธุรกรรมในระบบถูกแสดงผลอย่างละเอียด |
| **Trigger** | Admin ต้องการตรวจสอบความปลอดภัย ตรวจหาสาเหตุของปัญหา หรือตรวจสอบสุขภาพระบบ |

#### Main Success Scenario:
1. **Admin** เปิดหน้า "Audit Logs & System Health" บน Web Portal
2. ระบบแสดงบันทึกเหตุการณ์ความปลอดภัย (เช่น การ Login ผิดพลาด, การเปลี่ยนสิทธิ์, การลบข้อมูลสำคัญ)
3. ระบบแสดงสถานะการเชื่อมต่อฐานข้อมูล MongoDB และประสิทธิภาพการทำงานของ Express Backend
4. **Admin** กรองประวัติตามช่วงเวลา ผู้กระทำ หรือระดับความสำคัญ (Severity) เพื่อรายงานผู้บริหาร
