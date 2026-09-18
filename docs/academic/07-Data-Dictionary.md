# 7. Data Dictionary (พจนานุกรมข้อมูล) — Content Production Management System

เอกสารนี้ระบุรายละเอียดพจนานุกรมข้อมูล (Data Dictionary) ครบถ้วนทุกตารางและฟิลด์ สำหรับอ้างอิงในการพัฒนาฐานข้อมูล, การสร้าง Prisma Schema, และการทำเอกสารรายงานโครงงานปริญญานิพนธ์

---

### 1. ตาราง: `roles` (บทบาทและสิทธิ์ผู้ใช้)
| ชื่อฟิลด์ | ชนิดข้อมูล | ความยาว | ข้อจำกัด (Constraints) | Nullable | ค่าเริ่มต้น | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | INT / SERIAL | - | PK, Auto Increment | NO | - | รหัสบทบาทหลัก |
| `name` | VARCHAR | 50 | UNIQUE | NO | - | ชื่อบทบาท (`ADMIN`, `MANAGER`, `MEMBER`) |
| `description`| VARCHAR | 255 | - | YES | NULL | รายละเอียดสิทธิ์หน้าที่ |
| `created_at` | TIMESTAMP | - | - | NO | CURRENT_TIMESTAMP | วันเวลาที่สร้างระเบียน |

---

### 2. ตาราง: `users` (ข้อมูลผู้ใช้งานและบุคลากร)
| ชื่อฟิลด์ | ชนิดข้อมูล | ความยาว | ข้อจำกัด (Constraints) | Nullable | ค่าเริ่มต้น | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID / VARCHAR | 36 | PK | NO | gen_random_uuid() | รหัสประจำตัวผู้ใช้สากล |
| `role_id` | INT | - | FK (`roles.id`) | NO | - | อ้างอิงบทบาทหน้าที่ |
| `username` | VARCHAR | 50 | UNIQUE | NO | - | ชื่อสำหรับเข้าสู่ระบบ |
| `email` | VARCHAR | 100 | UNIQUE | NO | - | อีเมลสำหรับติดต่อและแจ้งเตือน |
| `password_hash`| VARCHAR | 255 | - | NO | - | รหัสผ่านที่เข้ารหัสด้วย bcrypt (Salt 10) |
| `first_name` | VARCHAR | 100 | - | YES | NULL | ชื่อจริง |
| `last_name` | VARCHAR | 100 | - | YES | NULL | นามสกุล |
| `is_active` | BOOLEAN | - | - | NO | TRUE | สถานะเปิด/ปิดการใช้งานบัญชี |
| `created_at` | TIMESTAMP | - | - | NO | CURRENT_TIMESTAMP | วันเวลาที่ลงทะเบียน |
| `updated_at` | TIMESTAMP | - | - | NO | CURRENT_TIMESTAMP | วันเวลาที่แก้ไขล่าสุด |

---

### 3. ตาราง: `teams` (กลุ่มและแผนกงานผลิต)
| ชื่อฟิลด์ | ชนิดข้อมูล | ความยาว | ข้อจำกัด (Constraints) | Nullable | ค่าเริ่มต้น | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID / VARCHAR | 36 | PK | NO | gen_random_uuid() | รหัสประจำตัวทีม |
| `name` | VARCHAR | 100 | - | NO | - | ชื่อทีม (เช่น Production Team A) |
| `description`| TEXT | - | - | YES | NULL | รายละเอียดความเชี่ยวชาญของทีม |
| `created_at` | TIMESTAMP | - | - | NO | CURRENT_TIMESTAMP | วันเวลาที่สร้างทีม |

---

### 4. ตาราง: `team_members` (ความสัมพันธ์สมาชิกในทีม)
| ชื่อฟิลด์ | ชนิดข้อมูล | ความยาว | ข้อจำกัด (Constraints) | Nullable | ค่าเริ่มต้น | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `team_id` | UUID / VARCHAR | 36 | PK, FK (`teams.id` ON DELETE CASCADE) | NO | - | รหัสทีม |
| `user_id` | UUID / VARCHAR | 36 | PK, FK (`users.id` ON DELETE CASCADE) | NO | - | รหัสผู้ใช้งาน |
| `role_in_team`| VARCHAR | 50 | - | YES | 'MEMBER' | ตำแหน่งในทีม (เช่น Lead, Editor, Sound) |
| `joined_at` | TIMESTAMP | - | - | NO | CURRENT_TIMESTAMP | วันเวลาที่เข้าร่วมทีม |

---

### 5. ตาราง: `ideas` (คลังข้อเสนอไอเดียคอนเทนต์)
| ชื่อฟิลด์ | ชนิดข้อมูล | ความยาว | ข้อจำกัด (Constraints) | Nullable | ค่าเริ่มต้น | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID / VARCHAR | 36 | PK | NO | gen_random_uuid() | รหัสไอเดีย |
| `title` | VARCHAR | 255 | - | NO | - | หัวข้อไอเดีย |
| `description`| TEXT | - | - | YES | NULL | คำอธิบายโครงเรื่องและกลุ่มเป้าหมาย |
| `platform` | VARCHAR | 50 | CHECK in ('YouTube','TikTok','Instagram') | NO | 'TikTok' | แพลตฟอร์มที่วางแผนลง |
| `category` | VARCHAR | 50 | - | YES | 'General' | หมวดหมู่คอนเทนต์ |
| `status` | VARCHAR | 30 | CHECK in ('DRAFT','APPROVED','REJECTED') | NO | 'DRAFT' | สถานะการพิจารณาไอเดีย |
| `votes_count` | INT | - | - | NO | 0 | จำนวนคะแนนโหวตสนับสนุนจากเพื่อนร่วมทีม |
| `proposed_by`| UUID / VARCHAR | 36 | FK (`users.id`) | NO | - | ผู้เสนอไอเดีย |
| `created_at` | TIMESTAMP | - | - | NO | CURRENT_TIMESTAMP | วันเวลาที่เสนอ |

---

### 6. ตาราง: `contents` (ชิ้นงานคอนเทนต์หลักใน Pipeline)
| ชื่อฟิลด์ | ชนิดข้อมูล | ความยาว | ข้อจำกัด (Constraints) | Nullable | ค่าเริ่มต้น | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID / VARCHAR | 36 | PK | NO | gen_random_uuid() | รหัสชิ้นงานคอนเทนต์ |
| `idea_id` | UUID / VARCHAR | 36 | FK (`ideas.id`) | YES | NULL | ไอเดียต้นฉบับ (หากแปลงมาจาก Idea) |
| `title` | VARCHAR | 255 | - | NO | - | ชื่อชิ้นงานคอนเทนต์ |
| `description`| TEXT | - | - | YES | NULL | รายละเอียดและบรีฟงาน |
| `platform` | VARCHAR | 50 | CHECK in ('YouTube','TikTok','Instagram','Other') | NO | 'TikTok' | แพลตฟอร์มหลัก |
| `category` | VARCHAR | 50 | - | YES | 'General' | หมวดหมู่ |
| `status` | VARCHAR | 30 | CHECK in ('PLANNING','PRODUCTION','REVIEW','REVISION','APPROVED','SCHEDULED','PUBLISHED') | NO | 'PLANNING' | สถานะของวงจรการผลิต (State Machine) |
| `created_by` | UUID / VARCHAR | 36 | FK (`users.id`) | NO | - | ผู้เปิดโปรเจกต์งาน |
| `due_date` | TIMESTAMP | - | - | YES | NULL | วันที่และเวลากำหนดส่งงานขั้นสุดท้าย |
| `published_at`| TIMESTAMP | - | - | YES | NULL | วันและเวลาที่กดเผยแพร่สู่สาธารณะ |
| `created_at` | TIMESTAMP | - | - | NO | CURRENT_TIMESTAMP | วันเวลาที่สร้าง |
| `updated_at` | TIMESTAMP | - | - | NO | CURRENT_TIMESTAMP | วันเวลาที่อัปเดตสถานะล่าสุด |

---

### 7. ตาราง: `tasks` (งานย่อยตามสายการผลิต)
| ชื่อฟิลด์ | ชนิดข้อมูล | ความยาว | ข้อจำกัด (Constraints) | Nullable | ค่าเริ่มต้น | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID / VARCHAR | 36 | PK | NO | gen_random_uuid() | รหัสงานย่อย |
| `content_id` | UUID / VARCHAR | 36 | FK (`contents.id` ON DELETE CASCADE) | NO | - | เชื่อมโยงกับ Content หลัก |
| `title` | VARCHAR | 200 | - | NO | - | ชื่องานย่อย (เช่น ตัดต่อคลิป, อัดเสียง) |
| `task_type` | VARCHAR | 50 | - | NO | 'Editing' | ประเภทงาน (Scripting, Filming, Editing) |
| `assigned_to`| UUID / VARCHAR | 36 | FK (`users.id`) | YES | NULL | สมาชิกที่ได้รับมอบหมาย |
| `status` | VARCHAR | 30 | CHECK in ('TODO','IN_PROGRESS','REVIEW','DONE') | NO | 'TODO' | สถานะการทำงาน |
| `due_date` | TIMESTAMP | - | - | YES | NULL | กำหนดส่งงานย่อย |
| `submission_url`| TEXT | - | - | YES | NULL | ลิงก์ส่งมอบผลงาน (Google Drive / Frame.io) |
| `notes` | TEXT | - | - | YES | NULL | บันทึกเพิ่มเติม |
| `created_at` | TIMESTAMP | - | - | NO | CURRENT_TIMESTAMP | วันเวลาที่สร้าง |
| `updated_at` | TIMESTAMP | - | - | NO | CURRENT_TIMESTAMP | วันเวลาที่อัปเดต |

---

### 8. ตาราง: `content_versions` (ประวัติเวอร์ชันไฟล์งานผลิต)
| ชื่อฟิลด์ | ชนิดข้อมูล | ความยาว | ข้อจำกัด (Constraints) | Nullable | ค่าเริ่มต้น | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID / VARCHAR | 36 | PK | NO | gen_random_uuid() | รหัสเวอร์ชัน |
| `content_id` | UUID / VARCHAR | 36 | FK (`contents.id` ON DELETE CASCADE) | NO | - | ชิ้นงานคอนเทนต์หลัก |
| `version_number`| INT | - | - | NO | 1 | ลำดับเวอร์ชัน (1, 2, 3...) |
| `file_url` | TEXT | - | - | NO | - | ลิงก์ที่อยู่ไฟล์งานในเวอร์ชันนี้ |
| `changelog` | TEXT | - | - | YES | NULL | คำอธิบายจุดที่มีการปรับปรุงแก้ไข |
| `submitted_by`| UUID / VARCHAR | 36 | FK (`users.id`) | NO | - | ผู้ส่งไฟล์งาน |
| `submitted_at`| TIMESTAMP | - | - | NO | CURRENT_TIMESTAMP | วันเวลาที่ส่งงาน |

---

### 9. ตาราง: `reviews` (ประวัติการตรวจงานและฟีดแบ็ก)
| ชื่อฟิลด์ | ชนิดข้อมูล | ความยาว | ข้อจำกัด (Constraints) | Nullable | ค่าเริ่มต้น | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID / VARCHAR | 36 | PK | NO | gen_random_uuid() | รหัสการตรวจงาน |
| `content_id` | UUID / VARCHAR | 36 | FK (`contents.id` ON DELETE CASCADE) | NO | - | ชิ้นงานที่ถูกตรวจ |
| `reviewer_id` | UUID / VARCHAR | 36 | FK (`users.id`) | NO | - | ผู้ตรวจงาน (Manager) |
| `decision` | VARCHAR | 30 | CHECK in ('APPROVED','REVISION') | NO | - | ผลการพิจารณา |
| `revision_notes`| TEXT | - | - | YES | NULL | ข้อความสั่งแก้ไข ระบุจุดที่ต้องปรับปรุง |
| `reviewed_at` | TIMESTAMP | - | - | NO | CURRENT_TIMESTAMP | วันเวลาที่บันทึกผลตรวจ |

---

### 10. ตาราง: `legal_checks` (การตรวจสอบข้อกำหนดกฎหมาย 5 เสาหลัก)
| ชื่อฟิลด์ | ชนิดข้อมูล | ความยาว | ข้อจำกัด (Constraints) | Nullable | ค่าเริ่มต้น | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID / VARCHAR | 36 | PK | NO | gen_random_uuid() | รหัสการตรวจสอบ |
| `content_id` | UUID / VARCHAR | 36 | FK (`contents.id` ON DELETE CASCADE) | NO | - | ชิ้นงานที่ทำการตรวจสอบ |
| `rule_title` | VARCHAR | 255 | - | NO | - | ชื่อกฎหมายที่ตรวจ |
| `rule_category`| VARCHAR | 50 | - | NO | - | หมวดหมู่ (Audio, Footage, PDPA, Trademark, Rules) |
| `passed` | BOOLEAN | - | - | NO | FALSE | ผลการตรวจ (TRUE = ผ่าน, FALSE = ยังไม่ผ่าน) |
| `note` | TEXT | - | - | YES | NULL | บันทึกหลักฐานใบอนุญาต |
| `checked_by` | UUID / VARCHAR | 36 | FK (`users.id`) | YES | NULL | ผู้ตรวจสอบความถูกต้อง |
| `checked_at` | TIMESTAMP | - | - | YES | NULL | วันเวลาที่ตรวจผ่าน |

---

### 11. ตาราง: `content_metrics` (สถิติผลตอบรับรายชิ้นงาน)
| ชื่อฟิลด์ | ชนิดข้อมูล | ความยาว | ข้อจำกัด (Constraints) | Nullable | ค่าเริ่มต้น | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID / VARCHAR | 36 | PK | NO | gen_random_uuid() | รหัสสถิติ |
| `content_id` | UUID / VARCHAR | 36 | FK (`contents.id` ON DELETE CASCADE) | NO | - | ชิ้นงานที่วัดผล |
| `platform` | VARCHAR | 50 | - | NO | 'TikTok' | แพลตฟอร์มที่ดึงข้อมูล |
| `views` | INT | - | - | NO | 0 | ยอดวิวรวม |
| `likes` | INT | - | - | NO | 0 | ยอดกดถูกใจ |
| `comments` | INT | - | - | NO | 0 | จำนวนความคิดเห็น |
| `shares` | INT | - | - | NO | 0 | จำนวนการแชร์ |
| `watch_time_seconds`| INT | - | - | NO | 0 | เวลารับชมรวม (วินาที) |
| `average_view_duration`| DECIMAL | 10, 2 | - | NO | 0.00 | ค่าเฉลี่ยเวลารับชมต่อคน |
| `engagement_rate`| DECIMAL | 5, 2 | - | NO | 0.00 | อัตราการมีส่วนร่วม (%) |
| `followers_gained`| INT | - | - | NO | 0 | ผู้ติดตามที่เพิ่มขึ้นจากคลิปนี้ |
| `collected_at` | TIMESTAMP | - | - | NO | CURRENT_TIMESTAMP | วันเวลาที่ Snapshot ข้อมูล |

---

### 12. ตาราง: `activity_logs` (บันทึกประวัติการกระทำของระบบ - Audit Trail)
| ชื่อฟิลด์ | ชนิดข้อมูล | ความยาว | ข้อจำกัด (Constraints) | Nullable | ค่าเริ่มต้น | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID / VARCHAR | 36 | PK | NO | gen_random_uuid() | รหัสบันทึก Log |
| `entity_name`| VARCHAR | 50 | - | NO | - | ชื่อ Entity ที่เกิดเหตุ (Content, Task, User) |
| `entity_id` | VARCHAR | 50 | - | NO | - | รหัสอ้างอิงของ Entity |
| `action` | VARCHAR | 100 | - | NO | - | การกระทำ เช่น `STATUS_CHANGED`, `APPROVED` |
| `performed_by`| UUID / VARCHAR | 36 | FK (`users.id`) | YES | NULL | ผู้กระทำ (System หรือ User ID) |
| `details` | JSON / JSONB | - | - | YES | NULL | ข้อมูลก่อน/หลังการเปลี่ยนแปลง (Diff Payload) |
| `ip_address` | VARCHAR | 45 | - | YES | NULL | หมายเลข IP ผู้เรียกคำสั่ง |
| `created_at` | TIMESTAMP | - | - | NO | CURRENT_TIMESTAMP | วันเวลาที่เกิดเหตุการณ์ |

