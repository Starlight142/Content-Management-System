# 1. Use Case Diagram — Content Production Management System (CMS)

## 📌 บทนำและภาพรวมของระบบ
เอกสารนี้กำหนดขอบเขตของระบบ (System Boundary) และความสัมพันธ์ระหว่างผู้ใช้ (Actors) กับฟังก์ชันการทำงานหลัก (Use Cases) ของระบบ **Content Production Management System** เพื่อใช้สำหรับการวิเคราะห์และออกแบบระบบเชิงวัตถุ (OOAD) ในโครงงานระดับชั้นปีที่ 4 (Senior Capstone Project)

---

## 👥 นิยามผู้ใช้ระบบ (Actor Specifications)

ระบบแบ่งบทบาทผู้ใช้งานออกเป็น 3 บทบาทหลัก (Primary Actors) และ 1 ระบบภายนอก (Secondary/External Actor):

1. **Admin (ผู้ดูแลระบบ)**
   - รับผิดชอบงานด้าน Governance, Security, และ System Configuration
   - จัดการสิทธิ์ผู้ใช้งาน (Users & Roles), จัดสรรโครงสร้างทีม (Teams & Member Assignment)
   - กำหนดประเภทงานผลิต (Task Types) และข้อบังคับทางกฎหมาย (Legal Articles)
   - ตรวจสอบประวัติการใช้งานระบบผ่าน Audit Logs

2. **Manager (หัวหน้าทีมผู้ผลิต / บรรณาธิการ)**
   - ควบคุมกระบวนการผลิตสื่อตั้งแต่ต้นน้ำยันปลายน้ำผ่าน Mobile App
   - พิจารณาและอนุมัติไอเดียคอนเทนต์ (Content Ideas)
   - สร้างชิ้นงานคอนเทนต์ (Content) และมอบหมายงานย่อย (Task Assignment)
   - ตรวจสอบคุณภาพงาน (Content Review) สั่งแก้ไข (Revision) หรืออนุมัติ (Approve)
   - ทำหน้าที่เป็น **Legal Gatekeeper** ตรวจสอบรายการสิทธิ์ตามกฎหมาย (Music License, Stock, PDPA, Trademark, Community Guidelines)
   - กำหนดเวลาและคิวการเผยแพร่ (Scheduling & Publishing)

3. **Member (ทีมงานฝ่ายสร้างสรรค์: Creator, Editor, Graphic, Scriptwriter)**
   - เข้าใช้งานผ่าน Mobile App เพื่อจัดการงานที่ได้รับมอบหมาย
   - เสนอไอเดียคอนเทนต์ใหม่เข้าสู่คลังของสตูดิโอ (Idea Pitching)
   - อัปเดตสถานะงาน (`TODO` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `REVIEW`)
   - แนบหลักฐานส่งมอบผลงาน (File Asset / Google Drive / Frame.io Links)
   - รับข้อเสนอแนะและส่งงานรอบแก้ไข (Revision Delivery)

4. **External Platform APIs (ระบบเชื่อมต่อภายนอก - YouTube / TikTok Data APIs)**
   - Secondary Actor ที่ระบบทำการเชื่อมต่อเพื่อดึงสถิติยอดวิว, ยอดไลก์, คอมเมนต์, การแชร์ (Metrics Ingestion) และส่งข้อมูลตารางเผยแพร่

---

## 📊 Use Case Diagram (UML Notation via Mermaid)

```mermaid
flowchart LR
    %% Definition of Actors
    subgraph Actors["👥 System Actors"]
        Admin(("👤 Admin\n(Web Dashboard)"))
        Manager(("👔 Manager\n(Mobile App)"))
        Member(("🎨 Member / Creator\n(Mobile App)"))
        PlatformAPI(("🌐 YouTube & TikTok\nExternal APIs"))
    end

    %% System Boundary
    subgraph CMS["🏢 Content Production Management System (System Boundary)"]
        %% Ideation Subsystem
        subgraph Sub_Ideation["1. Ideation & Planning"]
            UC_ProposeIdea(["UC-01: Propose Content Idea"])
            UC_VoteIdea(["UC-02: Vote & Comment Idea"])
            UC_ApproveIdea(["UC-03: Approve / Reject Idea"])
        end

        %% Production & Team Workspace Subsystem
        subgraph Sub_Production["2. Production & Team Workspace"]
            UC_CreateContent(["UC-04: Create Content Pipeline"])
            UC_AssignTask(["UC-05: Assign Production Tasks"])
            UC_UpdateTask(["UC-06: Update My Task Status & Progress"])
            UC_SubmitDeliverable(["UC-07: Submit Work Assets/Links"])
            UC_ViewTeamOverview(["UC-19: View Team Workspace & Progress"])
            UC_MonitorTeamActivity(["UC-20: Monitor Team Activity Feed"])
        end

        %% Review & Legal Subsystem
        subgraph Sub_Quality["3. Quality & Legal Compliance"]
            UC_ReviewContent(["UC-08: Review Content Draft"])
            UC_RequestRevision(["UC-09: Request Work Revision"])
            UC_LegalAudit(["UC-10: Audit Legal & PDPA Checklist\n<<Gatekeeper>>"])
            UC_ApproveContent(["UC-11: Approve Final Content"])
        end

        %% Publishing & Analytics Subsystem
        subgraph Sub_Publishing["4. Publishing & Analytics"]
            UC_SchedulePublish(["UC-12: Schedule & Publish Content"])
            UC_SyncMetrics(["UC-13: Ingest Performance Metrics"])
            UC_ViewAnalytics(["UC-14: View Intelligence Dashboard"])
        end

        %% System Admin Subsystem
        subgraph Sub_Admin["5. System Administration"]
            UC_ManageUsers(["UC-15: Manage Users & Teams"])
            UC_ManageLegalRules(["UC-16: Configure Legal Database"])
            UC_ViewLogs(["UC-17: Monitor System Audit Logs"])
            UC_Auth(["UC-18: Authenticate (Login/2FA)"])
        end
    end

    %% Relationships - Member
    Member --> UC_Auth
    Member --> UC_ProposeIdea
    Member --> UC_VoteIdea
    Member --> UC_UpdateTask
    Member --> UC_SubmitDeliverable
    Member --> UC_ViewTeamOverview
    Member --> UC_MonitorTeamActivity

    %% Relationships - Manager
    Manager --> UC_Auth
    Manager --> UC_ApproveIdea
    Manager --> UC_CreateContent
    Manager --> UC_AssignTask
    Manager --> UC_ReviewContent
    Manager --> UC_RequestRevision
    Manager --> UC_LegalAudit
    Manager --> UC_ApproveContent
    Manager --> UC_SchedulePublish
    Manager --> UC_ViewAnalytics
    Manager --> UC_ViewTeamOverview
    Manager --> UC_MonitorTeamActivity

    %% Relationships - Admin
    Admin --> UC_Auth
    Admin --> UC_ManageUsers
    Admin --> UC_ManageLegalRules
    Admin --> UC_ViewLogs
    Admin --> UC_ViewAnalytics

    %% External Connections
    UC_SchedulePublish -.-> PlatformAPI
    PlatformAPI -.-> UC_SyncMetrics
    UC_SyncMetrics -.-> UC_ViewAnalytics

    %% Includes & Extends
    UC_CreateContent -.->|<<includes>>| UC_AssignTask
    UC_ApproveContent -.->|<<includes>>| UC_LegalAudit
    UC_ReviewContent -.->|<<extends>>| UC_RequestRevision
```

---

## 📑 สรุปความสัมพันธ์แบบ Include และ Extend
1. **`<<include>>` UC-11 (Approve Final Content) $\rightarrow$ UC-10 (Audit Legal & PDPA Checklist)**:
   - การอนุมัติ Content ขั้นสุดท้ายต้องผ่านการตรวจสอบ Legal Checklist ครบทั้ง 5 ข้อเสมอ (Mandatory Gatekeeper)
2. **`<<include>>` UC-04 (Create Content Pipeline) $\rightarrow$ UC-05 (Assign Production Tasks)**:
   - การสร้าง Content เพื่อส่งเข้าสู่สายการผลิต จะต้องมีการแตก Task ย่อยและกำหนดผู้รับผิดชอบอย่างน้อย 1 คน
3. **`<<extends>>` UC-08 (Review Content Draft) $\leftarrow$ UC-09 (Request Work Revision)**:
   - เมื่อ Manager ตรวจสอบงานแล้วพบจุดบกพร่อง สามารถขยายกระบวนการเพื่อส่งข้อความสั่งแก้ไขงานพร้อมระบุ Timestamp จุดที่ต้องแก้ได้

