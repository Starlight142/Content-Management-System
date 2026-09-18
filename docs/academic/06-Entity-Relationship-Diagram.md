# 6. Entity-Relationship Diagram (ERD) — Relational & Document Data Models

เอกสารนี้ระบุแผนภาพความสัมพันธ์ของข้อมูล (Entity-Relationship Diagram - ERD) ในมาตรฐาน **Crow's Foot Notation** สำหรับสถาปัตยกรรม Relational Database (PostgreSQL / MySQL พร้อม Prisma ORM) ควบคู่กับคู่มือการแปลงสู่ Document Model (MongoDB Mongoose) เพื่อตอบคำถามคณะกรรมการสอบปริญญานิพนธ์ได้อย่างสมบูรณ์

---

## 📐 Relational ER Diagram (Crow's Foot Notation via Mermaid)

```mermaid
erDiagram
    ROLES ||--o{ USERS : "assigned to"
    USERS ||--o{ TEAM_MEMBERS : "belongs to"
    TEAMS ||--o{ TEAM_MEMBERS : "has members"
    
    USERS ||--o{ IDEAS : "proposes"
    IDEAS |o--o| CONTENTS : "originates"
    USERS ||--o{ CONTENTS : "creates"
    
    CONTENTS ||--o{ CONTENT_VERSIONS : "tracks"
    USERS ||--o{ CONTENT_VERSIONS : "submits"
    
    CONTENTS ||--o{ CONTENT_FILES : "contains"
    USERS ||--o{ CONTENT_FILES : "uploads"
    
    CONTENTS ||--|{ TASKS : "divided into"
    USERS ||--o{ TASKS : "assigned to"
    
    CONTENTS ||--o{ REVIEWS : "evaluated in"
    USERS ||--o{ REVIEWS : "reviews"
    
    CONTENTS ||--|{ LEGAL_CHECKS : "audited by"
    USERS ||--o{ LEGAL_CHECKS : "verifies"
    
    CONTENTS ||--o{ CONTENT_METRICS : "measures"
    
    USERS ||--o{ ACTIVITY_LOGS : "performs"

    ROLES {
        int id PK
        string name UK
        string description
        datetime created_at
    }

    USERS {
        uuid id PK
        int role_id FK
        string username UK
        string email UK
        string password_hash
        string first_name
        string last_name
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    TEAMS {
        uuid id PK
        string name
        string description
        datetime created_at
    }

    TEAM_MEMBERS {
        uuid team_id PK,FK
        uuid user_id PK,FK
        string role_in_team
        datetime joined_at
    }

    IDEAS {
        uuid id PK
        string title
        text description
        string platform
        string category
        string status
        int votes_count
        uuid proposed_by FK
        datetime created_at
    }

    CONTENTS {
        uuid id PK
        uuid idea_id FK
        string title
        text description
        string platform
        string category
        string status
        uuid created_by FK
        datetime due_date
        datetime published_at
        datetime created_at
        datetime updated_at
    }

    CONTENT_VERSIONS {
        uuid id PK
        uuid content_id FK
        int version_number
        text file_url
        text changelog
        uuid submitted_by FK
        datetime submitted_at
    }

    CONTENT_FILES {
        uuid id PK
        uuid content_id FK
        text file_url
        string file_type
        int file_size_bytes
        uuid uploaded_by FK
        datetime uploaded_at
    }

    TASKS {
        uuid id PK
        uuid content_id FK
        string title
        string task_type
        uuid assigned_to FK
        string status
        datetime due_date
        text submission_url
        text notes
        datetime created_at
        datetime updated_at
    }

    REVIEWS {
        uuid id PK
        uuid content_id FK
        uuid reviewer_id FK
        string decision
        text revision_notes
        datetime reviewed_at
    }

    LEGAL_CHECKS {
        uuid id PK
        uuid content_id FK
        string rule_title
        string rule_category
        boolean passed
        text note
        uuid checked_by FK
        datetime checked_at
    }

    CONTENT_METRICS {
        uuid id PK
        uuid content_id FK
        string platform
        int views
        int likes
        int comments
        int shares
        int watch_time_seconds
        decimal average_view_duration
        decimal engagement_rate
        int followers_gained
        datetime collected_at
    }

    ACTIVITY_LOGS {
        uuid id PK
        string entity_name
        uuid entity_id
        string action
        uuid performed_by FK
        jsonb details
        string ip_address
        datetime created_at
    }
```

---

## 💡 แนวทางการตอบอาจารย์: ทำไมระบบจึงเหมาะกับสถาปัตยกรรม Hybrid (SQL + NoSQL)?

หากคณะกรรมการสอบถามว่า:
> *"ทำไมระบบจึงมีทั้งโมเดล Relational (SQL) และ Document (MongoDB)? เหตุใดจึงไม่เลือกแบบใดแบบหนึ่งไปเลย?"*

**คำตอบเชิงวิศวกรรมระดับเกียรตินิยม:**
1. **Core Workflow เป็น Relational Transactions (เหมาะกับ PostgreSQL / MySQL + Prisma)**:
   - ผู้ใช้, สิทธิ์ (RBAC), โครงสร้างทีม, และสถานะการส่งมอบงาน มีความสัมพันธ์แบบ Referential Integrity สูงมาก
   - ตัวอย่าง: หาก User ลาออกจากทีม Task ที่ค้างอยู่ต้องไม่เกิด Dangling Pointer, หรือการเปลี่ยนสถานะจาก Review ไป Approval ต้องเป็น ACID Transaction
2. **Metrics & Media Payloads เป็น Document / Time-Series (เหมาะกับ MongoDB)**:
   - สถิติจาก YouTube Data API v3 และ TikTok API มีโครงสร้าง JSON แบบกึ่งมีโครงสร้าง (Semi-structured) และมีการ Snap ข้อมูลเข้ามาทุกๆ 6 ชั่วโมง
   - การเก็บ `metrics` แบบ Embedded Subdocuments ใน NoSQL ช่วยให้ดึงข้อมูลกราฟแนวโน้ม (Time-series trends) ได้รวดเร็วโดยไม่ต้อง Join ตารางนับล้านแถว
3. **Legal Checklist Compliance**:
   - การเก็บ Checklist 5 ข้อแบบ Embedded Array ใน MongoDB ช่วยให้การตรวจสอบ Gatekeeper ทำได้เร็วแบบ $O(1)$ ในการโหลด Content Object เพียงครั้งเดียว

