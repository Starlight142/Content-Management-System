# 6. PostgreSQL & Prisma ORM Migration Blueprint (Year 4 Thesis Implementation)

เอกสารนี้จัดเตรียมไฟล์ **Prisma Schema (`schema.prisma`) ฉบับสมบูรณ์ 100%** ที่แมปตรงกับ **ERD และ Data Dictionary** ทั้ง 12 ตาราง สำหรับใช้ยกระดับฐานข้อมูลจาก MongoDB สู่ **PostgreSQL หรือ MySQL** ในโครงงานปริญญานิพนธ์ปี 4 ได้ทันทีโดยไม่ต้องออกแบบใหม่

---

## 📄 `prisma/schema.prisma` (Production-Ready Definition)

```prisma
datasource db {
  provider = "postgresql" // หรือ "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ----------------------------------------------------
// 1. User & Access Control (RBAC)
// ----------------------------------------------------

enum RoleName {
  ADMIN
  MANAGER
  MEMBER
}

model Role {
  id          Int      @id @default(autoincrement())
  name        RoleName @unique
  description String?
  createdAt   DateTime @default(now()) @map("created_at")

  users User[]

  @@map("roles")
}

model User {
  id           String   @id @default(uuid())
  roleId       Int      @map("role_id")
  username     String   @unique @db.VarChar(50)
  email        String   @unique @db.VarChar(100)
  passwordHash String   @map("password_hash") @db.VarChar(255)
  firstName    String?  @map("first_name") @db.VarChar(100)
  lastName     String?  @map("last_name") @db.VarChar(100)
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  role Role @relation(fields: [roleId], references: [id])

  teamMembers     TeamMember[]
  proposedIdeas   Idea[]           @relation("UserIdeas")
  createdContents Content[]        @relation("UserContents")
  assignedTasks   Task[]           @relation("UserTasks")
  submittedVers   ContentVersion[] @relation("UserVersions")
  uploadedFiles   ContentFile[]    @relation("UserFiles")
  reviewsGiven    Review[]         @relation("UserReviews")
  legalChecksDone LegalCheck[]     @relation("UserLegalChecks")
  activityLogs    ActivityLog[]    @relation("UserLogs")

  @@map("users")
}

model Team {
  id          String   @id @default(uuid())
  name        String   @db.VarChar(100)
  description String?  @db.Text
  createdAt   DateTime @default(now()) @map("created_at")

  members TeamMember[]

  @@map("teams")
}

model TeamMember {
  teamId     String   @map("team_id")
  userId     String   @map("user_id")
  roleInTeam String?  @default("MEMBER") @map("role_in_team") @db.VarChar(50)
  joinedAt   DateTime @default(now()) @map("joined_at")

  team Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([teamId, userId])
  @@map("team_members")
}

// ----------------------------------------------------
// 2. Ideation & Content Production
// ----------------------------------------------------

enum IdeaStatus {
  DRAFT
  APPROVED
  REJECTED
}

enum Platform {
  YouTube
  TikTok
  Instagram
  Other
}

enum ContentStatus {
  PLANNING
  PRODUCTION
  REVIEW
  REVISION
  APPROVED
  SCHEDULED
  PUBLISHED
}

model Idea {
  id          String     @id @default(uuid())
  title       String     @db.VarChar(255)
  description String?    @db.Text
  platform    Platform   @default(TikTok)
  category    String?    @default("General") @db.VarChar(50)
  status      IdeaStatus @default(DRAFT)
  votesCount  Int        @default(0) @map("votes_count")
  proposedBy  String     @map("proposed_by")
  createdAt   DateTime   @default(now()) @map("created_at")

  proposer User      @relation("UserIdeas", fields: [proposedBy], references: [id])
  content  Content?

  @@map("ideas")
}

model Content {
  id          String        @id @default(uuid())
  ideaId      String?       @unique @map("idea_id")
  title       String        @db.VarChar(255)
  description String?       @db.Text
  platform    Platform      @default(TikTok)
  category    String?       @default("General") @db.VarChar(50)
  status      ContentStatus @default(PLANNING)
  createdBy   String        @map("created_by")
  dueDate     DateTime?     @map("due_date")
  publishedAt DateTime?     @map("published_at")
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  idea    Idea? @relation(fields: [ideaId], references: [id])
  creator User  @relation("UserContents", fields: [createdBy], references: [id])

  versions    ContentVersion[]
  files       ContentFile[]
  tasks       Task[]
  reviews     Review[]
  legalChecks LegalCheck[]
  metrics     ContentMetric[]

  @@map("contents")
}

// ----------------------------------------------------
// 3. Task Management & Deliverables
// ----------------------------------------------------

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
}

model Task {
  id            String     @id @default(uuid())
  contentId     String     @map("content_id")
  title         String     @db.VarChar(200)
  taskType      String     @default("Editing") @map("task_type") @db.VarChar(50)
  assignedTo    String?    @map("assigned_to")
  status        TaskStatus @default(TODO)
  dueDate       DateTime?  @map("due_date")
  submissionUrl String?    @map("submission_url") @db.Text
  notes         String?    @db.Text
  createdAt     DateTime   @default(now()) @map("created_at")
  updatedAt     DateTime   @updatedAt @map("updated_at")

  content  Content @relation(fields: [contentId], references: [id], onDelete: Cascade)
  assignee User?   @relation("UserTasks", fields: [assignedTo], references: [id])

  @@map("tasks")
}

model ContentVersion {
  id            String   @id @default(uuid())
  contentId     String   @map("content_id")
  versionNumber Int      @default(1) @map("version_number")
  fileUrl       String   @map("file_url") @db.Text
  changelog     String?  @db.Text
  submittedBy   String   @map("submitted_by")
  submittedAt   DateTime @default(now()) @map("submitted_at")

  content   Content @relation(fields: [contentId], references: [id], onDelete: Cascade)
  submitter User    @relation("UserVersions", fields: [submittedBy], references: [id])

  @@map("content_versions")
}

model ContentFile {
  id            String   @id @default(uuid())
  contentId     String   @map("content_id")
  fileUrl       String   @map("file_url") @db.Text
  fileType      String?  @default("VIDEO") @map("file_type") @db.VarChar(50)
  fileSizeBytes Int?     @map("file_size_bytes")
  uploadedBy    String   @map("uploaded_by")
  uploadedAt    DateTime @default(now()) @map("uploaded_at")

  content  Content @relation(fields: [contentId], references: [id], onDelete: Cascade)
  uploader User    @relation("UserFiles", fields: [uploadedBy], references: [id])

  @@map("content_files")
}

// ----------------------------------------------------
// 4. Quality Review & Legal Compliance
// ----------------------------------------------------

enum ReviewDecision {
  APPROVED
  REVISION
}

model Review {
  id            String         @id @default(uuid())
  contentId     String         @map("content_id")
  reviewerId    String         @map("reviewer_id")
  decision      ReviewDecision
  revisionNotes String?        @map("revision_notes") @db.Text
  reviewedAt    DateTime       @default(now()) @map("reviewed_at")

  content  Content @relation(fields: [contentId], references: [id], onDelete: Cascade)
  reviewer User    @relation("UserReviews", fields: [reviewerId], references: [id])

  @@map("reviews")
}

model LegalCheck {
  id           String    @id @default(uuid())
  contentId    String    @map("content_id")
  ruleTitle    String    @map("rule_title") @db.VarChar(255)
  ruleCategory String    @map("rule_category") @db.VarChar(50)
  passed       Boolean   @default(false)
  note         String?   @db.Text
  checkedBy    String?   @map("checked_by")
  checkedAt    DateTime? @map("checked_at")

  content Content @relation(fields: [contentId], references: [id], onDelete: Cascade)
  auditor User?   @relation("UserLegalChecks", fields: [checkedBy], references: [id])

  @@map("legal_checks")
}

// ----------------------------------------------------
// 5. Analytics & Audit Logging
// ----------------------------------------------------

model ContentMetric {
  id                  String   @id @default(uuid())
  contentId           String   @map("content_id")
  platform            String   @db.VarChar(50)
  views               Int      @default(0)
  likes               Int      @default(0)
  comments            Int      @default(0)
  shares              Int      @default(0)
  watchTimeSeconds    Int      @default(0) @map("watch_time_seconds")
  averageViewDuration Decimal  @default(0.0) @map("average_view_duration") @db.Decimal(10, 2)
  engagementRate      Decimal  @default(0.0) @map("engagement_rate") @db.Decimal(5, 2)
  followersGained     Int      @default(0) @map("followers_gained")
  collectedAt         DateTime @default(now()) @map("collected_at")

  content Content @relation(fields: [contentId], references: [id], onDelete: Cascade)

  @@map("content_metrics")
}

model ActivityLog {
  id          String   @id @default(uuid())
  entityName  String   @map("entity_name") @db.VarChar(50)
  entityId    String   @map("entity_id") @db.VarChar(50)
  action      String   @db.VarChar(100)
  performedBy String?  @map("performed_by")
  details     Json?
  ipAddress   String?  @map("ip_address") @db.VarChar(45)
  createdAt   DateTime @default(now()) @map("created_at")

  user User? @relation("UserLogs", fields: [performedBy], references: [id])

  @@map("activity_logs")
}
```

