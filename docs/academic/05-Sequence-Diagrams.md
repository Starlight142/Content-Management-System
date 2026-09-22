# 5. Sequence Diagrams — Content Production Management System

เอกสารนี้แสดงแผนภาพลำดับขั้นการทำงาน (Sequence Diagrams) ในมาตรฐาน UML เพื่ออธิบายอันดับของข้อความ (Messages) ที่ส่งผ่านระหว่าง Actor, Mobile App UI, API Controller, Workflow State Validator, และ Database Layer บน 3 กระบวนการทำงานวิกฤต (3 Critical Paths)

---

## 🎯 ไดอะแกรมที่ 1: การสร้าง Content และมอบหมายงาน (Content Creation & Task Assignment)

```mermaid
sequenceDiagram
    autonumber
    actor Mgr as 👔 Manager
    participant App as 📱 Mobile App (ManagerDashboard)
    participant API as 🖥️ ContentController
    participant Guard as 🛡️ StateMachineValidator
    participant DB as 🗄️ Database (Content & Task)

    Mgr->>App: 1. กรอกฟอร์มสร้าง Content + ระบุงานย่อย (Tasks)
    Mgr->>App: 2. กดปุ่ม "ยืนยันสร้างชิ้นงาน"
    App->>API: 3. POST /api/contents (title, platform, tasks[])
    activate API
    API->>Guard: 4. validateNewContent(payload)
    activate Guard
    Note over Guard: ตรวจสอบ: ต้องมี Task อย่างน้อย 1 งาน<br/>และ dueDate ต้องไม่อยู่ในอดีต
    Guard-->>API: 5. Validation Passed (Initial Status: PRODUCTION)
    deactivate Guard
    
    API->>DB: 6. INSERT Content (status: 'PRODUCTION')
    API->>DB: 7. INSERT Tasks[] (status: 'TODO', assignedTo: userId)
    DB-->>API: 8. Return saved records with IDs
    API-->>App: 9. HTTP 201 Created (content data + tasks)
    deactivate API
    App-->>Mgr: 10. แสดง Toast "สร้าง Content และมอบหมายงานสำเร็จ"
```

---

## 🔄 ไดอะแกรมที่ 2: การส่งงาน, ตรวจสอบ และสั่งแก้ไข (Task Submission, Review & Revision Loop)

```mermaid
sequenceDiagram
    autonumber
    actor Mem as 🎨 Member (Editor)
    actor Mgr as 👔 Manager
    participant App as 📱 Mobile App
    participant API as 🖥️ Task & Content API
    participant Guard as 🛡️ StateMachineValidator
    participant DB as 🗄️ Database

    %% Member submits
    rect rgb(240, 249, 255)
    Note over Mem, DB: ส่วนที่ 1: การส่งมอบผลงาน (Deliverable Submission)
    Mem->>App: 1. วาง Submission Link (Drive / Frame.io)
    Mem->>App: 2. กดปุ่ม "🚀 ส่งตรวจงาน (Submit for Review)"
    App->>API: 3. PATCH /api/tasks/:id/submit { submissionUrl }
    API->>Guard: 4. validateUrlFormat(submissionUrl)
    Guard-->>API: 5. Valid URL Scheme
    API->>DB: 6. UPDATE Task SET status='REVIEW', submissionUrl
    API->>DB: 7. UPDATE Content SET status='REVIEW' (ถ้าเป็นงานตัดต่อหลัก)
    DB-->>API: 8. Updated successfully
    API-->>App: 9. HTTP 200 OK
    App-->>Mem: 10. แสดงผล "ส่งงานเข้าสู่คิว Review เรียบร้อย"
    end

    %% Manager reviews & requests revision
    rect rgb(254, 226, 226)
    Note over Mgr, DB: ส่วนที่ 2: ผู้จัดการตรวจงานและสั่งแก้ไข (Revision Loop)
    Mgr->>App: 11. เปิดคิวตรวจงาน (ManagerDashboard)
    Mgr->>App: 12. กดปุ่ม "🔄 ส่งกลับแก้ไข (Request Revision)"
    App-->>Mgr: 13. แสดง Prompt ให้กรอก Revision Notes
    Mgr->>App: 14. พิมพ์ฟีดแบ็ก "แก้สีและลดเสียงดนตรีลง 15%"
    App->>API: 15. POST /api/contents/:id/review { decision: 'REVISION', notes }
    API->>Guard: 16. canTransition(from: 'REVIEW', to: 'REVISION')
    Guard-->>API: 17. Allowed Transition
    API->>DB: 18. APPEND reviewHistory (decision, notes, timestamp)
    API->>DB: 19. UPDATE Content SET status='REVISION'
    API->>DB: 20. UPDATE Task SET status='IN_PROGRESS'
    DB-->>API: 21. Records Updated
    API-->>App: 22. HTTP 200 OK { status: 'REVISION' }
    App-->>Mgr: 23. แสดงผล "แจ้งเตือนส่งกลับแก้ไขแล้ว"
    App-->>Mem: 24. Push Notification แจ้งเตือน Editor ให้แก้ไขงาน
    end
```

---

## ⚖️ ไดอะแกรมที่ 3: การตรวจเช็กกฎหมายและอนุมัติเผยแพร่ (Legal Gatekeeper Audit & Publishing)

```mermaid
sequenceDiagram
    autonumber
    actor Mgr as 👔 Manager
    participant App as 📱 Mobile App (LegalChecklistScreen)
    participant API as 🖥️ ContentController
    participant Guard as 🛡️ LegalGatekeeperEngine
    participant DB as 🗄️ Database

    Mgr->>App: 1. เปิดหน้า Legal & PDPA Audit รายชิ้นงาน
    App->>API: 2. GET /api/contents/:id/legal-check
    API->>DB: 3. SELECT legalChecklist FROM Content WHERE id = :id
    DB-->>API: 4. Return current checklist state
    API-->>App: 5. Display 5 checklist items
    
    loop ตรวจสอบและติ๊กทั้ง 5 ข้อ
        Mgr->>App: 6. ติ๊ก (Music, Stock, PDPA, Trademark, Community)
        App->>App: 7. คำนวณความคืบหน้า (100% Passed)
    end
    
    Mgr->>App: 8. กดปุ่ม "🚀 อนุมัติการเผยแพร่ (Approve & Publish)"
    App->>API: 9. PUT /api/contents/:id/legal-check { items: [...] }
    API->>DB: 10. UPDATE Content SET legalChecklist = :items
    
    App->>API: 11. POST /api/contents/:id/review { decision: 'APPROVED' }
    API->>Guard: 12. verifyLegalGatekeeper(contentId)
    activate Guard
    Guard->>DB: 13. ตรวจสอบว่า passed = true ครบทั้ง 5 ข้อหรือไม่
    DB-->>Guard: 14. All 5 items passed (5/5)
    Guard-->>API: 15. [PASS] ปลดล็อกสิทธิ์การ Approve
    deactivate Guard
    
    API->>DB: 16. UPDATE Content SET status='APPROVED' (หรือ PUBLISHED)
    API->>DB: 17. INSERT ActivityLog (action: 'APPROVED_AND_PUBLISHED')
    DB-->>API: 18. Transaction Committed
    API-->>App: 19. HTTP 200 OK (Content Approved)
    App-->>Mgr: 20. แสดง Alert "อนุมัติและพร้อมเผยแพร่สำเร็จ 100%"
```

---

## 👥 ไดอะแกรมที่ 4: การเข้าถึงพื้นที่ทีมและการบันทึกกิจกรรมส่วนกลาง (Team Workspace Access & Event Dispatching)

```mermaid
sequenceDiagram
    autonumber
    actor Mem as 🎨 Team Member (John)
    participant App as 📱 Mobile App (TeamOverviewScreen)
    participant Auth as 🛡️ Auth & TeamAccessGuard
    participant API as 🖥️ Teams & Tasks Controller
    participant DB as 🗄️ Database (MongoDB)

    %% 1. Loading Team Workspace
    rect rgb(238, 242, 255)
    Note over Mem, DB: ส่วนที่ 1: การโหลดข้อมูลภาพรวมทีมและการตรวจสอบสิทธิ์
    Mem->>App: 1. แตะแท็บ "👥 ทีมของฉัน"
    App->>Auth: 2. GET /api/teams/:teamId/dashboard (Bearer JWT)
    Auth->>Auth: 3. verifyTeamAccess: ตรวจสอบ req.user.teamId == :teamId
    alt ละเมิดสิทธิ์ (ข้ามทีม)
        Auth-->>App: 4a. HTTP 403 Forbidden ("You do not have access to this team")
        App-->>Mem: แสดงข้อความเตือนปฏิเสธการเข้าถึง
    else สิทธิ์ถูกต้อง (สังกัดทีมเดียวกัน)
        Auth->>API: 4b. อนุญาตให้ประมวลผลคำขอ
        API->>DB: 5. Query สรุปสถิติทรงพลัง (KPIs), สมาชิกทีม (workingStatus), และงานทั้งหมด
        DB-->>API: 6. คืนข้อมูล Team, Members, Tasks, Progress
        API-->>App: 7. HTTP 200 OK { team, stats, members, tasks }
        App-->>Mem: 8. เรนเดอร์ Team Progress Bar, สมาชิกที่กำลังทำงาน, และงานของทีม
    end
    end

    %% 2. Member Updates Task & Emits Team Activity
    rect rgb(254, 243, 199)
    Note over Mem, DB: ส่วนที่ 2: สมาชิกอัปเดตงานของตนเอง และกระจายกิจกรรมสู่ทีม
    Mem->>App: 9. ปรับสเกล Progress 70%, เลือกสถานะ REVIEW, กด "อัปเดตงาน"
    App->>Auth: 10. PUT /api/tasks/:taskId/status { status: 'REVIEW', progress: 70 }
    Auth->>API: 11. ตรวจสอบสิทธิ์ผู้รับผิดชอบงาน
    API->>DB: 12. ค้นหา Task ตาม :taskId
    alt สมาชิกพยายามแก้ Task ของคนอื่น
        API-->>App: 13a. HTTP 403 Forbidden ("You can only update your own assigned tasks")
        App-->>Mem: แจ้งเตือนข้อผิดพลาด
    else เป็น Task ของตนเอง
        API->>DB: 13b. UPDATE Task SET status='REVIEW', progress=70
        API->>DB: 14. UPDATE User SET workingStatus='REVIEWING' WHERE id=user.id
        API->>DB: 15. คำนวณความคืบหน้ารวม และ UPDATE Content SET progress=70
        API->>DB: 16. INSERT TeamActivity (activityType: 'TASK_SUBMITTED', title: 'John ส่ง AI Tutorial ให้ Manager ตรวจ')
        DB-->>API: 17. บันทึกข้อมูลสำเร็จ
        API-->>App: 18. HTTP 200 OK { message: "Task updated", task }
        App-->>Mem: 19. แสดง Toast "อัปเดตงานและแจ้งเตือนเข้าสู่ทีมเรียบร้อย"
    end
    end

    %% 3. Team Activity Refresh
    rect rgb(236, 253, 245)
    Note over Mem, DB: ส่วนที่ 3: การอัปเดตไทม์ไลน์กิจกรรมล่าสุด (Team Activity Feed)
    App->>API: 20. GET /api/teams/:teamId/activity
    API->>DB: 21. find({ teamId }).sort({ createdAt: -1 }).limit(20)
    DB-->>API: 22. รายการกิจกรรมล่าสุดของทีม
    API-->>App: 23. HTTP 200 OK [ activities... ]
    App-->>Mem: 24. อัปเดตฟีด "ตอนนี้ทีมกำลังทำอะไรอยู่" ทันทีแบบ Real-time
    end
```


