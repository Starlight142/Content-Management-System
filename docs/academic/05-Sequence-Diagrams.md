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

