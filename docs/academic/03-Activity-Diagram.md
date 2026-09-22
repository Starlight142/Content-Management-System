# 3. Activity Diagram (Swimlane Process Flow) — Content Production Management System

เอกสารนี้แสดงแผนภาพกิจกรรม (Activity Diagram) ในรูปแบบ **Swimlane (เลนแบ่งบทบาทหน้าที่)** เพื่ออธิบายการไหลของกระบวนการทำงานตั้งแต่ต้นน้ำ (การคิดไอเดีย) จนถึงปลายน้ำ (การเผยแพร่และเก็บสถิติ) พร้อมระบุ Decision Nodes, Fork/Join, และลูปการวนกลับแก้ไขงาน (Revision Loop) อย่างเป็นทางการ

---

## 🌊 แผนภาพกิจกรรมแบบ Swimlane (Mermaid UML)

```mermaid
sequenceDiagram
    autonumber
    %% Participants mapping Swimlanes
    actor Member as 🎨 Member (Creator/Editor)
    actor Manager as 👔 Manager (Reviewer/Lead)
    participant System as ⚙️ Backend & State Engine
    participant Platform as 🌐 YouTube / TikTok API

    %% Phase 1: Ideation
    rect rgb(240, 249, 255)
    Note over Member, Manager: Phase 1: Ideation & Pitching
    Member->>System: 1. เสนอไอเดียใหม่ (POST /api/ideas)
    System-->>Manager: 2. แจ้งเตือนไอเดียใหม่ (Status: DRAFT)
    Manager->>System: 3. ตรวจสอบและกดอนุมัติไอเดีย (Status: APPROVED)
    end

    %% Phase 2: Planning & Production
    rect rgb(254, 243, 199)
    Note over Manager, Member: Phase 2: Pipeline Creation & Task Assignment
    Manager->>System: 4. สร้าง Content Pipeline & แตก Tasks (POST /api/contents)
    System->>System: 5. อัปเดตสถานะ Content เป็น PRODUCTION
    System-->>Member: 6. มอบหมายงานย่อย (Task Status: TODO)
    Member->>System: 7. รับงานและเปลี่ยนสถานะเป็น IN_PROGRESS
    Member->>Member: 8. ดำเนินการผลิต/ตัดต่อ/ออกแบบชิ้นงาน
    Member->>System: 9. แนบลิงก์ส่งงาน (Submission URL) & สั่งส่งตรวจ
    System->>System: 10. เปลี่ยนสถานะ Task & Content เป็น REVIEW
    end

    %% Phase 3: Review & Revision Loop
    rect rgb(254, 226, 226)
    Note over Manager, Member: Phase 3: Quality Review & Revision Loop
    Manager->>System: 11. เปิดตรวจผลงาน (Review Draft)
    alt งานมีจุดบกพร่อง (Needs Revision)
        Manager->>System: 12a. ระบุ Revision Notes & สั่งส่งกลับแก้ไข
        System->>System: 13a. เปลี่ยนสถานะเป็น REVISION
        System-->>Member: 14a. แจ้งเตือนจุดที่ต้องแก้ไข
        Member->>Member: 15a. แก้ไขงานตามฟีดแบ็ก
        Member->>System: 16a. ส่งลิงก์ผลงานเวอร์ชันใหม่ (Loop กลับไปข้อ 9)
    else งานผ่านเกณฑ์เนื้อหา (Content Passed)
        Manager->>System: 12b. บันทึกผลตรวจเนื้อหาเบื้องต้น
    end
    end

    %% Phase 4: Legal Gatekeeper & Approval
    rect rgb(236, 253, 245)
    Note over Manager, System: Phase 4: Legal & Compliance Gatekeeper (Mandatory 5-Pillar Audit)
    Manager->>System: 17. เปิดหน้า Legal Checklist ตรวจสอบ 5 เสาหลัก
    loop ตรวจสอบกฎหมายทีละข้อ
        Manager->>System: 18. ติ๊กยืนยัน Music, Stock, PDPA, Trademark, Community Rules
    end
    alt ผ่านไม่ครบ 5 ข้อ (< 100%)
        System-->>Manager: 19a. [Gatekeeper Blocked] บล็อกการ Approve / Publish!
    else ผ่านครบทั้ง 5 ข้อ (100% Passed)
        Manager->>System: 19b. ยืนยันอนุมัติชิ้นงาน (POST /api/contents/:id/review -> APPROVED)
        System->>System: 20. เปลี่ยนสถานะเป็น APPROVED ปลดล็อกคิวเผยแพร่
    end
    end

    %% Phase 5: Publishing & Analytics
    rect rgb(243, 232, 255)
    Note over Manager, Platform: Phase 5: Publishing & Performance Analytics
    Manager->>System: 21. กดเผยแพร่หรือตั้งเวลา (POST /api/contents/:id/publish)
    System->>Platform: 22. ยิงคำสั่งอัปโหลดหรือเปิดสถานะ Public
    Platform-->>System: 23. ส่งคืน Video ID & Publishing Timestamp
    System->>System: 24. เปลี่ยนสถานะเป็น PUBLISHED
    loop ทุกๆ 6 ชั่วโมง (Automated Cron Ingestion)
        System->>Platform: 25. เรียกขอข้อมูลสถิติ (GET /videos/analytics)
        Platform-->>System: 26. ส่ง Views, Likes, Comments, Engagement
        System->>System: 27. บันทึก Metric Snapshot ลงฐานข้อมูล
    end
    end
```

---

## 🔄 State Machine Lifecycle Diagram (FSM)

แผนภาพแสดงการเปลี่ยนสถานะของ Entity `Content` ตามกฎ Business Rules ที่เข้มงวด:

```mermaid
stateDiagram-v2
    [*] --> PLANNING : Manager สร้าง Content ใหม่
    
    PLANNING --> PRODUCTION : มอบหมาย Task ย่อยสำเร็จ (มีผู้รับผิดชอบ)
    
    PRODUCTION --> REVIEW : Member ส่งผลงานตัดต่อ (Submission URL)
    
    REVIEW --> REVISION : Manager สั่งแก้ (ระบุ Revision Notes)
    REVISION --> REVIEW : Member ส่งผลงานเวอร์ชันใหม่
    
    REVIEW --> APPROVED : ผ่านเกณฑ์ตรวจ + Legal Checklist ผ่าน 100% (5/5 ข้อ)
    
    APPROVED --> SCHEDULED : กำหนดวันเวลาเผยแพร่ในอนาคต
    SCHEDULED --> PUBLISHED : ถึงกำหนดเวลาเผยแพร่
    APPROVED --> PUBLISHED : สั่งเผยแพร่ทันที (Publish Now)
    
    PUBLISHED --> [*] : เก็บสถิติ Performance Metrics ต่อเนื่อง
```

---

## 🛑 กฎข้อห้ามของ State Machine (System Guard Invariants):
1. **ห้ามข้ามขั้นตอน (No State Skipping)**: 
   - `PLANNING` $\rightarrow$ `APPROVED` ❌ (ผิดกฎ ไม่อนุญาต)
   - `PRODUCTION` $\rightarrow$ `PUBLISHED` ❌ (ผิดกฎ ไม่อนุญาต)
2. **Legal Gatekeeper Invariant**:
   - `REVIEW` $\rightarrow$ `APPROVED` จะสำเร็จได้ก็ต่อเมื่อ `Content.legalChecklist` มีสถานะ `passed = true` ครบทั้ง 5 หัวข้อเท่านั้น
3. **Audit Trail Invariant**:
   - ทุกครั้งที่มีการเปลี่ยนสถานะ ระบบจะต้องสร้างระเบียนใน `ActivityLog` เพื่อระบุว่าใคร (`userId`), ทำอะไร (`action`), เวลาใด (`timestamp`), และสถานะก่อนหน้า/ใหม่ (`previousStatus`, `newStatus`)

---

## 👥 แผนภาพกิจกรรม: การทำงานในพื้นที่ทีม (Team-Based Workspace & Activity Stream Flow)

แผนภาพแสดงกระบวนการทำงานร่วมกันระดับทีม การตรวจสอบสิทธิ์ความเป็นสมาชิก (Team Authorization Guard) และการกระจายข่าวสารความเคลื่อนไหว (Team Activity Stream):

```mermaid
sequenceDiagram
    autonumber
    actor Member as 🎨 Member / Manager
    participant App as 📱 Mobile App (Draftly)
    participant Auth as 🛡️ Team Auth Guard
    participant Backend as ⚙️ Team & Task Service
    participant DB as 🗄️ MongoDB

    %% 1. Accessing Team Workspace
    rect rgb(238, 242, 255)
    Note over Member, DB: Phase A: การเข้าถึงข้อมูลภาพรวมทีม (Team Workspace Access)
    Member->>App: เปิดหน้า "ทีมของฉัน (My Team)"
    App->>Auth: GET /api/teams/:teamId/dashboard (แนบ JWT Token)
    Auth->>DB: ตรวจสอบ user.teamId == teamId หรือ role == ADMIN?
    alt ไม่ได้เป็นสมาชิกในทีม (Unauthorized Cross-Team Access)
        Auth-->>App: 403 Forbidden ("You do not have access to this team")
        App-->>Member: แสดงข้อความแจ้งเตือนปฏิเสธการเข้าถึง
    else เป็นสมาชิกในทีม (Authorized)
        Auth->>Backend: อนุญาตคำขอผ่านไปยัง Service
        Backend->>DB: ดึงข้อมูลสรุปทีม, สมาชิก (พร้อม Working Status), และงานทั้งหมด
        DB-->>Backend: คืนค่าสถิติและข้อมูลจริง
        Backend-->>App: 200 OK (team, members, tasks, progress)
        App-->>Member: แสดง Team Overview, หลอด Progress รวม, และสถานะเพื่อนร่วมทีม
    end
    end

    %% 2. Member Updates Task & Emits Team Activity
    rect rgb(254, 243, 199)
    Note over Member, DB: Phase B: การอัปเดตงานของตนเอง และสร้างบันทึกกิจกรรมทีม (Task Update & Activity Logging)
    Member->>App: ปรับ Progress (เช่น 70%), เปลี่ยนสถานะเป็น REVIEW, แนบลิงก์งาน
    App->>Auth: PUT /api/tasks/:taskId (user_id, status, progress, submission_url)
    Auth->>DB: ตรวจสอบ task.assigned_to == user.id (ห้ามแก้ของคนอื่น!)
    alt พยายามแก้ไขงานของสมาชิกอื่น
        Auth-->>App: 403 Forbidden ("You can only update your own assigned tasks")
        App-->>Member: แจ้งเตือนข้อผิดพลาด
    else เป็นงานที่ได้รับมอบหมายของตนเอง
        Auth->>Backend: บันทึกข้อมูลงานย่อย
        Backend->>DB: อัปเดต Task (status = REVIEW, progress = 70%)
        Backend->>DB: อัปเดต User (workingStatus = 'REVIEWING')
        Backend->>DB: คำนวณ Content Progress เฉลี่ย และอัปเดต Content
        Backend->>DB: บันทึก TeamActivity (type = 'TASK_SUBMITTED', title = 'John ส่ง AI Tutorial ให้ Manager ตรวจ')
        Backend-->>App: 200 OK (Task & Content Updated)
        App-->>Member: แสดงผลความคืบหน้าใหม่สำเร็จ
    end
    end

    %% 3. Team Members See Live Activity Feed
    rect rgb(236, 253, 245)
    Note over Member, DB: Phase C: การดึงฟีดกิจกรรมล่าสุดของทีม (Team Activity Feed Polling / Refresh)
    Member->>App: เลื่อนดูฟีด หรือ Pull-to-Refresh ในแท็บ "ทีมของฉัน"
    App->>Backend: GET /api/teams/:teamId/activity
    Backend->>DB: ดึง TeamActivity 20 รายการล่าสุด (เรียงลำดับ desc ตาม createdAt)
    DB-->>Backend: รายการกิจกรรมล่าสุดพร้อมชื่อผู้กระทำและเวลา
    Backend-->>App: 200 OK (TeamActivity List)
    App-->>Member: แสดง Timeline กิจกรรมล่าสุด ให้ทุกคนในทีมรับรู้สถานะตรงกัน
    end
```


