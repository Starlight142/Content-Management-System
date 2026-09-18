# 2. Use Case Descriptions — Formal Specifications

เอกสารนี้ระบุรายละเอียดข้อกำหนดการทำงานของ Use Case สำคัญในรูปแบบ **Fully Dressed Use Case Specification (Cockburn / IEEE Format)** สำหรับการประเมินวิชา Software Engineering และโครงงานปริญญานิพนธ์

---

## 📋 สารบัญ Use Cases
1. [UC-01: เสนอและอนุมัติไอเดียคอนเทนต์ (Propose & Approve Content Idea)](#uc-01-เสนอและอนุมัติไอเดียคอนเทนต์-propose--approve-content-idea)
2. [UC-04: สร้างชิ้นงานคอนเทนต์และแตกงานย่อย (Create Content & Assign Tasks)](#uc-04-สร้างชิ้นงานคอนเทนต์และแตกงานย่อย-create-content--assign-tasks)
3. [UC-07: ปฏิบัติงานและส่งมอบผลงาน (Task Execution & Deliverable Submission)](#uc-07-ปฏิบัติงานและส่งมอบผลงาน-task-execution--deliverable-submission)
4. [UC-08: ตรวจทานงานและสั่งแก้ไข (Review & Revision Loop)](#uc-08-ตรวจทานงานและสั่งแก้ไข-review--revision-loop)
5. [UC-10: ตรวจสอบความสอดคล้องทางกฎหมาย (Audit Legal & PDPA Checklist)](#uc-10-ตรวจสอบความสอดคล้องทางกฎหมาย-audit-legal--pdpa-checklist)
6. [UC-12: เผยแพร่และตั้งเวลาคอนเทนต์ (Schedule & Publish Content)](#uc-12-เผยแพร่และตั้งเวลาคอนเทนต์-schedule--publish-content)

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
- หากผลงานสมบูรณ์แบบ Manager กดปุ่ม "Approve" $\rightarrow$ เข้าสู่ **UC-10 (Audit Legal & PDPA Checklist)** ก่อนจะสามารถอนุมัติได้สำเร็จ

---

### UC-10: ตรวจสอบความสอดคล้องทางกฎหมาย (Audit Legal & PDPA Checklist)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-10** |
| **Use Case Name** | Audit Legal & PDPA Checklist (การตรวจสอบข้อกฎหมายและสิทธิ์) |
| **Primary Actor** | Manager (ทำหน้าที่ Compliance Officer) |
| **Secondary Actor** | Legal Rules Knowledge Base |
| **Preconditions** | Content อยู่ในสถานะ `REVIEW` และผ่านการตรวจคุณภาพด้านเนื้อหาเบื้องต้นแล้ว |
| **Postconditions** | รายการตรวจสอบกฎหมายทั้ง 5 ข้อถูกบันทึกลงฐานข้อมูล หากผ่านครบ 5/5 ข้อ ระบบจะปลดล็อกให้สามารถกด Approve/Publish ได้ |
| **Trigger** | Manager เข้าสู่ขั้นตอนตรวจสอบสิทธิ์ก่อนเผยแพร่สื่อสาธารณะ |

#### รายการตรวจสอบ 5 เสาหลัก (5 Mandatory Compliance Pillars):
1. **Music License**: สิทธิ์เพลงประกอบ (ใบอนุญาตเชิงพาณิชย์ หรือเสียงจาก Platform Library)
2. **Stock Footage**: สิทธิ์ภาพนิ่งและวิดีโอ (Commercial Use License)
3. **PDPA & Privacy**: ความยินยอมของบุคคลภายนอกในคลิป (Consent Form / เบลอหน้า / เบลอป้ายทะเบียน)
4. **Trademark & Branding**: ไม่มีสินค้าหรือโลโก้ละเมิด และติดแท็ก Sponsor ถูกต้องตามกฎหมายคุ้มครองผู้บริโภค
5. **Community Guidelines**: ไม่ขัดต่อนโยบายความปลอดภัย (ไม่มี Hate Speech, การหลอกลวง หรือความรุนแรง)

#### Main Success Scenario:
1. **Manager** กดปุ่ม "⚖️ ตรวจสอบกฎหมาย (Legal Audit)" บนการ์ดชิ้นงาน
2. ระบบเปิดหน้าจอ `LegalChecklistScreen` พร้อมแสดงสถานะ Checklist ล่าสุดจากฐานข้อมูล
3. **Manager** ตรวจสอบหลักฐานและคลิกติ๊กถูกในแต่ละข้อที่ผ่านเกณฑ์
4. ระบบคำนวณเปอร์เซ็นต์ความพร้อม (Compliance Score เช่น 3/5 = 60%, 5/5 = 100%) แบบ Real-time
5. เมื่อครบ 5/5 ข้อ (100%) ปุ่ม "🚀 อนุมัติการเผยแพร่ (Approve & Ready to Publish)" จะเปลี่ยนเป็นสีเขียวและเปิดให้กดได้
6. **Manager** กดยืนยัน
7. ระบบส่ง `PUT /api/contents/:id/legal-check` เพื่อบันทึกผลการตรวจ และเปลี่ยนสถานะ Content เป็น `APPROVED`

#### Exception Flows:
- **Ex 5a: ติ๊กไม่ครบ 5 ข้อแล้วพยายามกดยืนยัน**:
  - ระบบบล็อกคำสั่ง (Legal Gatekeeper) และแสดง Dialog เตือน: *"ไม่สามารถอนุมัติได้ ต้องผ่านเกณฑ์กฎหมายครบทั้ง 5 ข้อเพื่อป้องกันการฟ้องร้องลิขสิทธิ์"*

---

### UC-12: เผยแพร่และตั้งเวลาคอนเทนต์ (Schedule & Publish Content)

| รายการ | รายละเอียด |
| :--- | :--- |
| **Use Case ID** | **UC-12** |
| **Use Case Name** | Schedule & Publish Content (การตั้งเวลาและเผยแพร่คอนเทนต์) |
| **Primary Actor** | Manager |
| **Secondary Actor** | YouTube / TikTok Platform API |
| **Preconditions** | Content อยู่ในสถานะ `APPROVED` และผ่าน Legal Checklist 100% |
| **Postconditions** | Content เปลี่ยนสถานะเป็น `PUBLISHED` และระบบเริ่มสร้างตารางดึงสถิติ (Metrics Collector Job) |
| **Trigger** | ถึงกำหนดวันเวลาเผยแพร่ตามแผนการตลาด |

#### Main Success Scenario:
1. **Manager** เลือก Content ที่ผ่านการอนุมัติ (`APPROVED`)
2. **Manager** กำหนดวันและเวลาเผยแพร่ หรือกด "เผยแพร่ทันที (Publish Now)"
3. ระบบตรวจสอบสถานะล่าสุด ยืนยันว่า `legalChecklist.passedAll === true`
4. ระบบอัปเดตสถานะของ Content เป็น `PUBLISHED` พร้อมบันทึก `publishedAt = NOW()`
5. ระบบทำการเริ่มต้น Cron Job เพื่อดึงสถิติผลตอบรับ (Views, Likes, Comments, Engagement Rate) ทุก 6 ชั่วโมง

