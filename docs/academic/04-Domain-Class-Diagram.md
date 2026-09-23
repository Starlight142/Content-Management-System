# 4. Domain Class Diagram — Content Production Management System

เอกสารนี้ระบุแผนภาพคลาสเชิงโดเมน (Domain Class Diagram) ในมาตรฐาน UML 2.5 ครอบคลุม **11 โดเมนเอนทิตี (Domain Entities)** ที่สะท้อนการทำงานของระบบจัดการการผลิตสื่อขนาดใหญ่ พร้อมระบุสมาชิก (Attributes), ระดับการเข้าถึง (Visibility: `+` Public, `-` Private, `#` Protected), ชนิดข้อมูล (Data Types), ความสัมพันธ์ (Multiplicity), และฟังก์ชันการทำงาน (Methods/Operations)

---

## 🏛️ Domain Class Diagram (Mermaid UML)

```mermaid
classDiagram
    direction TB

    %% 1. User & Access Control
    class Role {
        <<Entity>>
        -id: String / Integer
        -name: String
        -description: String
        -permissions: List~String~
        +getPermissions(): List~String~
    }

    class User {
        <<Entity>>
        -id: String
        -username: String
        -email: String
        -passwordHash: String
        -firstName: String
        -lastName: String
        -roleId: String
        -teamId: String
        -workingStatus: WorkingStatusEnum
        -isOnline: Boolean
        -lastActiveAt: DateTime
        -isActive: Boolean
        -createdAt: DateTime
        -updatedAt: DateTime
        +verifyPassword(plainText: String): Boolean
        +hasPermission(permission: String): Boolean
        +getFullName(): String
    }

    class Team {
        <<Entity>>
        -id: String
        -name: String
        -description: String
        -createdAt: DateTime
        +addMember(user: User, roleInTeam: String): Void
        +removeMember(userId: String): Void
        +calculateTeamProgress(): Integer
    }

    class TeamMember {
        <<Association>>
        -teamId: String
        -userId: String
        -roleInTeam: String
        -joinedAt: DateTime
    }

    %% 2. Ideation & Content Core
    class Idea {
        <<Entity>>
        -id: String
        -title: String
        -description: String
        -platform: PlatformEnum
        -category: String
        -proposedById: String
        -status: IdeaStatusEnum
        -votesCount: Integer
        -createdAt: DateTime
        +approve(managerId: String): Void
        +reject(managerId: String, reason: String): Void
        +upvote(userId: String): Void
    }

    class Content {
        <<Entity>>
        -id: String
        -teamId: String
        -title: String
        -description: String
        -category: String
        -platform: PlatformEnum
        -status: ContentStatusEnum
        -progress: Integer
        -createdById: String
        -ideaId: String
        -dueDate: DateTime
        -publishedAt: DateTime
        -createdAt: DateTime
        -updatedAt: DateTime
        +transitionTo(nextStatus: ContentStatusEnum): Boolean
        +addVersion(fileUrl: String, notes: String): ContentVersion
        +submitReview(reviewerId: String, decision: String, notes: String): Review
    }

    class ContentVersion {
        <<Entity>>
        -id: String
        -contentId: String
        -versionNumber: Integer
        -fileUrl: String
        -changelog: String
        -submittedById: String
        -submittedAt: DateTime
        +getFileDetails(): String
    }

    class ContentFile {
        <<Entity>>
        -id: String
        -contentId: String
        -fileUrl: String
        -fileType: FileTypeEnum
        -fileSizeBytes: Integer
        -uploadedById: String
        -uploadedAt: DateTime
    }

    %% 3. Task Management
    class Task {
        <<Entity>>
        -id: String
        -teamId: String
        -contentId: String
        -title: String
        -taskType: TaskTypeEnum
        -assignedToId: String
        -status: TaskStatusEnum
        -progress: Integer
        -dueDate: DateTime
        -submissionUrl: String
        -notes: String
        -revisionNotes: String
        -replyNotes: String
        -createdAt: DateTime
        -updatedAt: DateTime
        +startTask(): Void
        +submitDeliverable(url: String, progress: Integer, replyNotes: String): Void
        +approveTask(): Void
    }

    %% 4. Quality & Review
    class Review {
        <<Entity>>
        -id: String
        -contentId: String
        -reviewerId: String
        -decision: ReviewDecisionEnum
        -revisionNotes: String
        -reviewedAt: DateTime
        +isApproved(): Boolean
    }

    %% 5. Audit & Governance
    class ActivityLog {
        <<Entity>>
        -id: String
        -entityName: String
        -entityId: String
        -action: String
        -performedById: String
        -details: Map~String, Any~
        -ipAddress: String
        -createdAt: DateTime
        +formatLog(): String
    }

    class TeamActivity {
        <<Entity>>
        -id: String
        -teamId: String
        -actorId: String
        -actionType: String
        -title: String
        -details: String
        -entityId: String
        -entityModel: String
        -createdAt: DateTime
        +logEvent(): Void
    }

    %% Enums
    class ContentStatusEnum {
        <<Enumeration>>
        PLANNING
        PRODUCTION
        REVIEW
        REVISION
        APPROVED
        SCHEDULED
        PUBLISHED
    }

    class TaskStatusEnum {
        <<Enumeration>>
        TODO
        IN_PROGRESS
        REVIEW
        REVISION
        DONE
    }

    class PlatformEnum {
        <<Enumeration>>
        YouTube
        TikTok
        Instagram
        Facebook
    }

    %% Relationships and Multiplicities
    Role "1" -- "0..*" User : defines access of >
    User "1" -- "0..*" TeamMember : participates as >
    Team "1" -- "0..*" TeamMember : consists of >
    Team "1" -- "0..*" Content : owns pipeline >
    Team "1" -- "0..*" Task : groups execution >
    Team "1" -- "0..*" TeamActivity : records live events >
    
    User "1" -- "0..*" Idea : proposes >
    Idea "0..1" -- "0..1" Content : converted into >
    User "1" -- "0..*" Content : creates >
    
    Content "1" *-- "0..*" ContentVersion : maintains history >
    Content "1" *-- "0..*" ContentFile : contains assets >
    Content "1" *-- "1..*" Task : divided into >
    
    User "1" -- "0..*" Task : assigned to <
    
    Content "1" *-- "0..*" Review : receives feedback >
    User "1" -- "0..*" Review : reviews <
    
    User "1" -- "0..*" ActivityLog : triggers >
    User "1" -- "0..*" TeamActivity : initiates >
```

---

## 🔍 คำอธิบายความสัมพันธ์เชิงสถาปัตยกรรม (Architecture Associations)

1. **`Content` *-- `ContentVersion` (Composition 1 to 0..\*)**:
   - ความสัมพันธ์แบบ Composition หมายความว่าประวัติ Version ของ Content จะผูกพันกับตัว Content หาก Content ถูกลบ ประวัติเวอร์ชันจะสิ้นสภาพไปด้วย
   - ใช้สำหรับเก็บประวัติไฟล์งานแต่ละรอบที่ส่งตรวจ (เช่น v1, v2 หลังสั่งแก้)

2. **`Task` Revision & Reply Flow (Tracking Invariant)**:
   - แต่ละ Task รองรับวงจรส่งกลับแก้ไขผ่านฟิลด์ `revisionNotes` (คำแนะนำจาก Manager) และ `replyNotes` (ข้อความตอบกลับชี้แจงการแก้ไขจาก Member)

3. **`Content` *-- `1..* Task` (Composition 1 to 1..\*)**:
   - Content ชิ้นหนึ่งต้องมีงานย่อยอย่างน้อย 1 งาน (เช่น การตัดต่อ Editing) จึงจะสามารถขยับสถานะจาก `PLANNING` ไปสู่ `PRODUCTION` ได้

