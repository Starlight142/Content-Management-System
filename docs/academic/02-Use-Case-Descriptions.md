# 2. Use Case Descriptions — Formal Specifications

เอกสารนี้ระบุรายละเอียดข้อกำหนดการทำงานของ Use Case สำคัญในรูปแบบ **Fully Dressed Use Case Specification (Cockburn / IEEE Format)** สำหรับการประเมินวิชา Software Engineering และโครงงานปริญญานิพนธ์

---

## 📋 สารบัญ Use Cases
1. [UC-01: เสนอและอนุมัติไอเดียคอนเทนต์ (Propose & Approve Content Idea)](#uc-01-เสนอและอนุมัติไอเดียคอนเทนต์-propose--approve-content-idea)
2. [UC-04: สร้างชิ้นงานคอนเทนต์และแตกงานย่อย (Create Content & Assign Tasks)](#uc-04-สร้างชิ้นงานคอนเทนต์และแตกงานย่อย-create-content--assign-tasks)
3. [UC-07: ปฏิบัติงานและส่งมอบผลงาน (Task Execution & Deliverable Submission)](#uc-07-ปฏิบัติงานและส่งมอบผลงาน-task-execution--deliverable-submission)
4. [UC-08: ตรวจทานงานและสั่งแก้ไข (Review & Revision Loop)](#uc-08-ตรวจทานงานและสั่งแก้ไข-review--revision-loop)
5. [UC-10: ส่งงานรอบแก้ไขพร้อมข้อความตอบกลับ (Submit Revision with Reply Notes)](#uc-10-ส่งงานรอบแก้ไขพร้อมข้อความตอบกลับ-submit-revision-with-reply-notes)
6. [UC-11: ตรวจรับและอนุมัติชิ้นงานโดยตรง (Approve Final Content)](#uc-11-ตรวจรับและอนุมัติชิ้นงานโดยตรง-approve-final-content)
7. [UC-12: เผยแพร่และตั้งเวลาคอนเทนต์ (Schedule & Publish Content)](#uc-12-เผยแพร่และตั้งเวลาคอนเทนต์-schedule--publish-content)
8. [UC-19: ดูภาพรวมและความคืบหน้าของทีม (View Team Workspace & Progress)](#uc-19-ดูภาพรวมและความคืบหน้าของทีม-view-team-workspace--progress)

---

### UC-01: เสนอและอนุมัติไอเดียคอนเทนต์ (Propose & Approve Content Idea)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-01** |
| **Use Case Name** | Propose & Approve Content Idea (การเสนอและอนุมัติไอเดีย) |
| **Primary Actor** | Member (ผู้เสนอ), Manager (ผู้อนุมัติ) |
| **Secondary Actor** | - |
| **Preconditions** | ผู้ใช้งานได้เข้าสู่ระบบ (Authenticated) และมีสถานะ Active ในระบบ |
| **Postconditions** | ไอเดียถูกบันทึกในฐานข้อมูล หากได้รับการอนุมัติจะสามารถ Convert เป็น Content Production Pipeline ได้ |
| **Trigger** | สมาชิกทีมมีความคิดสร้างสรรค์ใหม่และต้องการเสนอเข้าสู่คลังสตูดิโอ |

#### Main Success Scenario (Flow of Events):
1. **Member** เปิดแอปพลิเคชันมือถือ เลือกแท็บ "Idea Board" และกดปุ่ม "+ เสนอไอเดียใหม่"
2. ระบบแสดงฟอร์มให้กรอก: หัวข้อไอเดีย (Title), คำอธิบาย (Description), แพลตฟอร์มเป้าหมาย (YouTube, TikTok, Instagram), และหมวดหมู่ (Category)
3. **Member** กรอกข้อมูลครบถ้วนและกดยืนยัน "ส่งไอเดีย"
4. ระบบตรวจสอบความถูกต้องของข้อมูล (Validation) และบันทึกลงฐานข้อมูลในสถานะ `DRAFT`
5. ระบบส่งแจ้งเตือนไปยัง **Manager**
6. **Manager** เปิดดูรายการไอเดียในสถานะ `DRAFT` และอ่านรายละเอียด
7. **Manager** กดปุ่ม "อนุมัติไอเดีย (Approve)"
8. ระบบอัปเดตสถานะของไอเดียเป็น `APPROVED` และแจ้งเตือนให้ Member ทราบ

#### Alternative & Exception Flows:
- **Alt 7a: Manager ไม่อนุมัติไอเดีย (Reject)**:
  - 7a1. Manager กดปุ่ม "ปฏิเสธ (Reject)" พร้อมระบุเหตุผล (Rejection Reason)
  - 7a2. ระบบเปลี่ยนสถานะเป็น `REJECTED` และบันทึกเหตุผล
- **Ex 3a: ข้อมูลไม่ครบถ้วน (Validation Failure)**:
  - 3a1. หากชื่อไอเดียสั้นกว่า 5 ตัวอักษร ระบบปฏิเสธการส่ง และแสดงข้อความแจ้งเตือนสีแดง

---

### UC-04: สร้างชิ้นงานคอนเทนต์และแตกงานย่อย (Create Content & Assign Tasks)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-04** |
| **Use Case Name** | Create Content & Assign Tasks (สร้างคอนเทนต์และมอบหมายงาน) |
| **Primary Actor** | Manager |
| **Secondary Actor** | - |
| **Preconditions** | Manager เข้าสู่ระบบแล้ว และมีไอเดียที่ผ่านการอนุมัติหรือต้องการเปิดโปรเจกต์ใหม่ |
| **Postconditions** | ชิ้นงาน Content ถูกสร้างในสถานะ `PLANNING` และมี Task ย่อยถูกผูกเข้ากับสมาชิกในทีม |
| **Trigger** | ต้องการเริ่มกระบวนการผลิตสื่อจริง |

#### Main Success Scenario:
1. **Manager** เข้าสู่ Dashboard กดปุ่ม "+ สร้าง Content ใหม่" (หรือ Convert จาก Idea ที่อนุมัติแล้ว)
2. ระบบแสดงฟอร์มกำหนดรายละเอียดคอนเทนต์: ชื่อชิ้นงาน, แพลตฟอร์ม, กำหนดส่ง (Due Date), ผู้รับผิดชอบหลัก
3. **Manager** กำหนดงานย่อย (Subtasks):
   - ตัวอย่าง: "เขียนบท (Scripting)" มอบหมายให้ Member A
   - ตัวอย่าง: "ถ่ายทำ (Filming)" มอบหมายให้ Member B
   - ตัวอย่าง: "ตัดต่อ (Editing)" มอบหมายให้ Member C
4. **Manager** กดยืนยันการสร้าง
5. ระบบสร้างระเบียนใน `contents` (`status = PLANNING`) และสร้างระเบียนใน `tasks` (`status = TODO`)
6. ระบบเปลี่ยนสถานะ Content อัตโนมัติเป็น `PRODUCTION` เนื่องจากมี Task ได้รับการมอบหมายแล้ว
7. ระบบส่ง Notification ไปยัง Member แต่ละคนที่ได้รับมอบหมาย

#### Exception Flows:
- **Ex 4a: ไม่มีการระบุงานย่อย**:
  - ระบบจะแจ้งเตือนว่า *"ต้องมีงานย่อยอย่างน้อย 1 งานเพื่อส่งเข้าสู่สายการผลิต"*

---

### UC-07: ปฏิบัติงานและส่งมอบผลงาน (Task Execution & Deliverable Submission)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-07** |
| **Use Case Name** | Task Execution & Deliverable Submission (การทำงานและส่งมอบผลงาน) |
| **Primary Actor** | Member (Creator / Editor) |
| **Secondary Actor** | Google Drive / Frame.io (Cloud Storage Links) |
| **Preconditions** | Member มีงานในสถานะ `TODO` หรือ `IN_PROGRESS` ที่ตนเองได้รับมอบหมาย |
| **Postconditions** | Task เปลี่ยนสถานะเป็น `REVIEW` พร้อมบันทึกหลักฐานลิงก์ส่งงาน และแจ้งเตือนไปยัง Manager |
| **Trigger** | สมาชิกทีมตัดต่อหรือผลิตงานเสร็จสิ้น และต้องการส่งตรวจ |

#### Main Success Scenario:
1. **Member** เปิดแอปพลิเคชันมือถือในแท็บ "My Tasks"
2. ระบบแสดงรายการงานที่ได้รับมอบหมาย โดยกรองเฉพาะงานของตนเอง
3. **Member** เลือกงานที่ต้องการส่ง และกดเปลี่ยนสถานะเป็น "กำลังดำเนินการ (In Progress)"
4. เมื่อผลิตไฟล์งานเสร็จและอัปโหลดขึ้น Cloud Storage เรียบร้อยแล้ว สมาชิกจะวางลิงก์ส่งงาน (Submission URL เช่น Google Drive, Frame.io หรือ YouTube Unlisted Link)
5. **Member** กดปุ่ม "🚀 ส่งตรวจงาน (Submit for Review)"
6. ระบบทำการ Validate รูปแบบ URL ต้องเป็น Valid URI Scheme (`http://` หรือ `https://`)
7. ระบบอัปเดต Task เป็นสถานะ `REVIEW` และบันทึก `submittedAt`
8. หากงานตัดต่อหลักเสร็จสิ้น ระบบจะอัปเดตสถานะของ Content หลักเป็น `REVIEW` โดยอัตโนมัติ เพื่อดึงเข้าสู่คิวการตรวจของ Manager

#### Exception Flows:
- **Ex 6a: ลิงก์ว่างหรือรูปแบบไม่ถูกต้อง**:
  - ระบบแสดง Alert แจ้งว่า *"กรุณาแนบลิงก์ผลงานที่สามารถเข้าถึงได้ก่อนส่งตรวจ"* และไม่อนุญาตให้อัปเดตสถานะ

---

### UC-08: ตรวจทานงานและสั่งแก้ไข (Review & Revision Loop)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-08** |
| **Use Case Name** | Review & Revision Loop (การตรวจงานและส่งกลับแก้ไข) |
| **Primary Actor** | Manager |
| **Secondary Actor** | - |
| **Preconditions** | Content อยู่ในสถานะ `REVIEW` และมีงานย่อยส่งมอบครบถ้วน |
| **Postconditions** | Content เปลี่ยนสถานะเป็น `REVISION` (หากสั่งแก้) พร้อมบันทึกประวัติการสั่งแก้ หรือเปลี่ยนเป็น `APPROVED` (หากตรวจผ่าน) |
| **Trigger** | Manager เปิดคิวงานเพื่อพิจารณาคุณภาพของชิ้นงาน |

#### Main Success Scenario (Revision Requested Path):
1. **Manager** เปิดหน้ารายการงานที่รอตรวจ (`filter = REVIEW`)
2. **Manager** กดดูผลงานจาก Submission URL
3. **Manager** พบจุดที่ต้องปรับปรุง เช่น เสียงดังเกินไป หรือช่วง Hook เปิดคลิปไม่น่าสนใจ
4. **Manager** กดปุ่ม "🔄 ส่งกลับแก้ไข (Request Revision)"
5. ระบบแสดงหน้าต่างข้อความให้ระบุหมายเหตุการแก้ไข (Revision Notes)
6. **Manager** พิมพ์รายละเอียด: *"แก้เสียงดนตรีช่วงนาทีที่ 0:15 ให้เบาลง 20% และตัดช่วงแนะนำตัวให้กระชับขึ้น"* และกดยืนยัน
7. ระบบบันทึกข้อความลงใน `reviewHistory` พร้อมระบุ `decision = REVISION`, `reviewerId`, และ `timestamp`
8. ระบบเปลี่ยนสถานะ Content เป็น `REVISION` และเปลี่ยนสถานะ Task ที่เกี่ยวข้องกลับเป็น `IN_PROGRESS`
9. ระบบส่งแจ้งเตือนกลับไปยัง Editor เพื่อแก้ไขงาน

#### Alternative Path (Approve Path):
- หากผลงานสมบูรณ์แบบ Manager กดปุ่ม "อนุมัติชิ้นงาน" โดยตรง $\rightarrow$ เข้าสู่ **UC-11 (Approve Final Content)** เพื่ออนุมัติและปรับสถานะเป็น `APPROVED` ทันที

---

### UC-10: ส่งงานรอบแก้ไขพร้อมข้อความตอบกลับ (Submit Revision with Reply Notes)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-10** |
| **Use Case Name** | Submit Revision with Reply Notes (การส่งงานรอบแก้ไขพร้อมคำชี้แจง) |
| **Primary Actor** | Member (Creator / Editor / Graphic) |
| **Secondary Actor** | - |
| **Preconditions** | Task อยู่ในสถานะ `REVISION` โดย Manager ได้ระบุคำแนะนำ (Revision Notes) ไว้ |
| **Postconditions** | Task เปลี่ยนสถานะเป็น `REVIEW` พร้อมบันทึก `replyNotes` และลิงก์เวอร์ชันใหม่ (ถ้ามี) สู่ระบบ |
| **Trigger** | สมาชิกปรับปรุงแก้ไขงานตามคำสั่งของ Manager เสร็จสิ้น |

#### Main Success Scenario:
1. **Member** เปิดแอปพลิเคชันมือถือในหน้า "งานของฉัน (Member Tasks Workbench)"
2. ในหมวดบนสุด **"งานที่ต้องดำเนินการ (Action Required)"** ระบบแสดงการ์ดงานสถานะ `REVISION` พร้อมกล่องฟีดแบ็กคำแนะนำจาก Manager
3. **Member** พิมพ์รายละเอียดสิ่งที่ได้ปรับปรุงลงในช่อง **"ข้อความตอบกลับสำหรับการแก้ไขงาน (Reply Notes)"** เช่น *"ปรับลดเสียงเพลงประกอบลง 20% และแก้สีตามที่แนะนำแล้วครับ"*
4. **Member** วางลิงก์ไฟล์งานใหม่ในช่อง "แนบลิงก์ไฟล์ผลงานใหม่ (ถ้ามี)"
5. **Member** กดปุ่ม **"ส่งงานที่แก้ไขแล้ว"**
6. ระบบตรวจสอบว่ามีข้อความตอบกลับหรือลิงก์ผลงานอย่างใดอย่างหนึ่ง (หรือทั้งสองอย่าง)
7. ระบบส่ง `PATCH /api/tasks/:id/submit` พร้อมแนบ `replyNotes`, `submissionUrl`, และ `progress`
8. ระบบอัปเดตสถานะ Task เป็น `REVIEW` และบันทึกลงใน Team Activity Feed เพื่อให้ Manager ตรวจสอบซ้ำ

#### Exception Flows:
- **Ex 10a: ไม่ได้กรอกข้อความตอบกลับและไม่มีลิงก์**:
  - ระบบแสดง Alert แจ้งเตือนว่า *"กรุณาระบุข้อความตอบกลับหรือแนบลิงก์ไฟล์งานก่อนส่ง"*

---

### UC-11: ตรวจรับและอนุมัติชิ้นงานโดยตรง (Approve Final Content)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-11** |
| **Use Case Name** | Approve Final Content (การตรวจรับและอนุมัติชิ้นงานโดยตรง) |
| **Primary Actor** | Manager |
| **Secondary Actor** | - |
| **Preconditions** | Content อยู่ในสถานะ `REVIEW` และงานย่อยทั้งหมดเสร็จสมบูรณ์ |
| **Postconditions** | Content เปลี่ยนสถานะเป็น `APPROVED` งานย่อยเปลี่ยนเป็น `DONE` (100%) และปลดล็อกคิวการเผยแพร่ |
| **Trigger** | Manager ตรวจสอบคุณภาพงานรอบสุดท้ายและเห็นว่าพร้อมเผยแพร่ |

#### Main Success Scenario:
1. **Manager** เปิดหน้า "งานผลิต (Manager Pipeline Dashboard)"
2. ในส่วน **"คิวที่ต้องตรวจสอบ (Pending Review)"** Manager เลือกดูชิ้นงานสถานะ `REVIEW`
3. **Manager** ตรวจสอบไฟล์งานและข้อความตอบกลับของสมาชิก
4. **Manager** กดปุ่ม **"อนุมัติชิ้นงาน (Approve Content)"**
5. ระบบแสดงข้อความยืนยันการอนุมัติ
6. ระบบส่งคำขอ `POST /api/contents/:id/review` พร้อมส่ง `decision: 'APPROVED'`
7. ระบบอัปเดตสถานะ Content เป็น `APPROVED` และซิงค์สถานะ Task ที่เกี่ยวข้องทั้งหมดเป็น `DONE` (ความคืบหน้า 100%)
8. ระบบบันทึกประวัติการอนุมัติและสร้างรายการใน Team Activity Feed พร้อมแจ้งเตือนสมาชิกในทีม

---

### UC-12: เผยแพร่และตั้งเวลาคอนเทนต์ (Schedule & Publish Content)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-12** |
| **Use Case Name** | Schedule & Publish Content (การตั้งเวลาและเผยแพร่คอนเทนต์) |
| **Primary Actor** | Manager |
| **Secondary Actor** | YouTube / TikTok Platform API |
| **Preconditions** | Content อยู่ในสถานะ `APPROVED` |
| **Postconditions** | Content เปลี่ยนสถานะเป็น `PUBLISHED` และระบบเริ่มสร้างตารางดึงสถิติ (Metrics Collector Job) |
| **Trigger** | ถึงกำหนดวันเวลาเผยแพร่ตามแผนการตลาด |

#### Main Success Scenario:
1. **Manager** เลือก Content ที่ผ่านการอนุมัติ (`APPROVED`)
2. **Manager** กำหนดวันและเวลาเผยแพร่ หรือกด "เผยแพร่ทันที (Publish Now)"
3. ระบบตรวจสอบสถานะล่าสุด ยืนยันว่า Content อยู่ในสถานะ `APPROVED`
4. ระบบอัปเดตสถานะของ Content เป็น `PUBLISHED` พร้อมบันทึก `publishedAt = NOW()`
5. ระบบทำการเริ่มต้น Cron Job เพื่อดึงสถิติผลตอบรับ (Views, Likes, Comments, Engagement Rate) ทุก 6 ชั่วโมง

---

### UC-19: ดูภาพรวมและความคืบหน้าของทีม (View Team Workspace & Progress)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-19** |
| **Use Case Name** | View Team Workspace & Progress (การดูภาพรวมงานและความคืบหน้าของทีม) |
| **Primary Actor** | Member, Manager |
| **Preconditions** | ผู้ใช้ผ่านการยืนยันตัวตน (Authenticated) และสังกัดอยู่ในทีมอย่างน้อย 1 ทีม |
| **Postconditions** | ผู้ใช้มองเห็นรายชื่องานทั้งหมดของทีม, สถานะ, เปอร์เซ็นต์ความคืบหน้า และสถานะของเพื่อนร่วมทีม |
| **Trigger** | ผู้ใช้กดเข้าสู่แท็บ "ทีมของฉัน" หรือ "ภาพรวมทีม" บน Mobile App |

#### Main Success Scenario:
1. ผู้ใช้กดเลือกแท็บ **"ทีมของฉัน (My Team)"**
2. Mobile App ส่งคำขอ `GET /api/teams/my-team` และ `GET /api/teams/:teamId/dashboard` พร้อมแนบ JWT Bearer Token
3. Backend ดำเนินการ **Team-Level Authorization Guard**:
   - ตรวจสอบว่าผู้ใช้สังกัดอยู่ในทีมที่ร้องขอจริง (หรือมีสิทธิ์ Admin)
   - หากสังกัดจริง อนุญาตให้ดึงข้อมูล Dashboard Aggregate
4. ระบบส่งคืนข้อมูล:
   - สรุปตัวเลข KPI: งานของฉัน vs งานของทีม, งานกำลังผลิต, รอตรวจ, และเสร็จสมบูรณ์
   - แถบ Progress รวมของทีม (Team Overall Progress % คำนวณจากค่างานย่อยทั้งหมด)
   - รายชื่อสมาชิกในทีมและสถานะการทำงานสด (กำลังทำงาน, รอตรวจงาน, พร้อมรับงาน)
   - ตารางงานทั้งหมดของทีม พร้อมระบุชิ้นงานแม่, ชื่องานย่อย, ผู้รับผิดชอบ, สถานะ, Progress %, และ Deadline
5. Mobile App แสดงผลข้อมูลสด 100% จากฐานข้อมูล MongoDB

#### Exception Flows:
- **Ex 3a: ผู้ใช้พยายามเข้าถึงข้อมูลของทีมที่ตนไม่ได้สังกัด (Cross-team Violation)**:
  - Backend ตรวจพบว่า `user.teamId !== teamId` และปฏิเสธคำขอด้วยรหัส `403 Forbidden`
  - Mobile App แสดงข้อความแจ้งเตือน: *"ไม่สามารถเข้าถึงได้: คุณไม่มีสิทธิ์ดูข้อมูลของทีมนี้"*

---

### UC-20: ตรวจสอบบันทึกกิจกรรมสดของทีม (Monitor Team Activity Feed)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-20** |
| **Use Case Name** | Monitor Team Activity Feed (การติดตามกระแสกิจกรรมสดของทีม) |
| **Primary Actor** | Member, Manager |
| **Preconditions** | ผู้ใช้เข้าใช้งานในหน้าจอ Team Workspace ของทีมตนเอง |
| **Postconditions** | ผู้ใช้มองเห็นลำดับเหตุการณ์ล่าสุดของทีมแบบเรียลไทม์ |
| **Trigger** | หน้าจอ Team Overview โหลดข้อมูล หรือผู้ใช้กด Pull-to-Refresh |

#### Main Success Scenario:
1. ระบบดึงข้อมูลกิจกรรมจาก `GET /api/teams/:teamId/activity` (ตาราง `team_activities`)
2. ระบบจัดเรียงลำดับกิจกรรมตามเวลาล่าสุด (Chronological Order) เช่น:
   - *"John ส่ง AI Tutorial ให้ Manager ตรวจ"* (เวลา 14:30 น.)
   - *"Jane อัปโหลด Script v2"* (เวลา 14:10 น.)
   - *"Manager มอบหมาย Thumbnail ให้ Mike"* (เวลา 13:45 น.)
   - *"Mike เปลี่ยน Task เป็น IN_PROGRESS"* (เวลา 13:20 น.)
3. สมาชิกในทีมรับรู้สถานะการขับเคลื่อนงาน ทำให้ทีมทำงานประสานกันได้โดยไม่ต้องคอยสอบถามรายบุคคล
