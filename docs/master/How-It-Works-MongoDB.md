# How It Works: MongoDB & Mongoose Architecture (การทำงานของระบบด้วย MongoDB)

เอกสารนี้อธิบายการปรับเปลี่ยนฐานข้อมูลของระบบจาก PostgreSQL สู่ **MongoDB (NoSQL)** ควบคู่กับ **Mongoose** ในฝั่ง Node.js Backend

---

## 1. ทำไมถึงเปลี่ยนมาใช้ MongoDB?
1. **เก็บข้อมูลแบบ Document (JSON / BSON)**: 
   ในงานผลิตสื่อ คอนเทนต์แต่ละชิ้นมีความหลากหลายสูง (เช่น ข้อมูลวิดีโอสั้น TikTok กับคลิปยาว YouTube มีสถิติคนละแบบ) MongoDB ยอมให้แต่ละ Document มีฟิลด์ที่ยืดหยุ่นได้
2. **Embedded Documents (การฝังข้อมูลย่อย)**: 
   แทนที่จะต้องสร้างหลายๆ ตารางแล้ว `JOIN` กันแบบ SQL เราสามารถฝังข้อมูลย่อย เช่น ประวัติยอดวิวรายวัน (`metrics`) หรือรายการตรวจเช็คกฎหมาย (`legalChecklist`) ลงในการ์ด Content ได้โดยตรง
3. **ความง่ายในการเขียนโค้ดด้วย Mongoose**:
   คำสั่งสั้น กระชับ และมีฟังก์ชันช่วยตรวจสอบความถูกต้อง (Validation) ในตัว

---

## 2. โครงสร้าง Mongoose Models (`backend/src/database/models/`)

### A. `User.js` (ผู้ใช้งานระบบ)
- `username`, `email` (Unique และตัดช่องว่างอัตโนมัติ)
- `passwordHash` (รหัสผ่านที่ผ่านการ Hash ด้วย bcryptjs)
- `role`: กำหนดสิทธิ์ `['ADMIN', 'MANAGER', 'MEMBER']`
- `status`: `['ACTIVE', 'OFFLINE', 'SUSPENDED']`

### B. `Content.js` (เนื้อหาที่ผลิต)
- `title`, `description`
- `platform`: `['YouTube', 'TikTok', 'Instagram', 'Other']`
- `status`: `['PLANNING', 'PRODUCTION', 'REVIEW', 'REVISION', 'APPROVED', 'PUBLISHED']`
- `createdBy`: อ้างอิง ID ของ `User`
- `metrics`: Array ของสถิติ (views, likes, comments, shares, engagementRate)
- `files`: Array ของไฟล์แนบ (fileUrl, fileType)
- `legalChecklist`: รายการตรวจสิทธิ์กฎหมายที่แนบกับคอนเทนต์นั้นๆ

### C. `Task.js` (งานย่อยในกระบวนการผลิต)
- `title`, `contentId` (อ้างอิง Content)
- `taskType`: `Scripting`, `Filming`, `Editing`, `Graphic Design`, `Legal Check`
- `assignedTo`: อ้างอิง ID ของทีมงานผู้รับผิดชอบ
- `status`: `['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']`
- `submissionUrl`: ลิงก์ผลงานที่ทีมงานแนบส่งตรวจ

### D. `Idea.js` (คลังไอเดีย)
- `title`, `description`, `category`
- `proposedBy`: ใครเป็นคนเสนอ
- `status`: `['DRAFT', 'APPROVED', 'REJECTED']`

### E. `LegalArticle.js` (ฐานข้อมูลกฎหมาย)
- `title`, `category` (Music, PDPA, Advertising, Platform Rules)
- `content`: รายละเอียดแนวปฏิบัติ
- `source`: แหล่งอ้างอิงทางกฎหมาย

---

## 3. เปรียบเทียบคำสั่ง: SQL ดั้งเดิม vs Mongoose

| การทำงาน | คำสั่ง SQL เดิม (PostgreSQL) | คำสั่ง Mongoose ใหม่ (MongoDB) |
| :--- | :--- | :--- |
| **ค้นหาทั้งหมด** | `SELECT * FROM users;` | `await User.find();` |
| **ค้นหาตามเงื่อนไข** | `SELECT * FROM content WHERE status = 'REVIEW';` | `await Content.find({ status: 'REVIEW' });` |
| **ค้นหาตัวเดียว** | `SELECT * FROM users WHERE id = $1;` | `await User.findById(id);` |
| **เพิ่มข้อมูลใหม่** | `INSERT INTO task (...) VALUES (...);` | `await Task.create({ ... });` |
| **อัปเดตข้อมูล** | `UPDATE content SET status = $1 WHERE id = $2;` | `await Content.findByIdAndUpdate(id, { status }, { new: true });` |
| **ลบข้อมูล** | `DELETE FROM legal WHERE id = $1;` | `await LegalArticle.findByIdAndDelete(id);` |
| **ดึงข้อมูลข้ามตาราง (JOIN)** | `SELECT * FROM content c LEFT JOIN users u ON ...` | `await Content.find().populate('createdBy', 'username email');` |

---

## 4. วิธีการเชื่อมต่อฐานข้อมูล (`backend/.env`)

ไฟล์ตั้งค่าอยู่ที่ `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/content_management
JWT_SECRET=supersecretjwtkey_cms2026
```

### กรณีที่ 1: ใช้ MongoDB ในเครื่องคอมพิวเตอร์ของคุณ (Local)
- หากคุณติดตั้ง MongoDB Community Server หรือ MongoDB Compass ไว้แล้ว สามารถใช้ `mongodb://127.0.0.1:27017/content_management` ได้ทันที

### กรณีที่ 2: ใช้ MongoDB Atlas (Cloud ฟรี)
- สมัครบัญชีฟรีที่ [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- สร้าง Free Cluster แล้วคัดลอก Connection String มาใส่ใน `.env` เช่น:
  ```env
  MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/content_management?retryWrites=true&w=majority
  ```

---

## 5. คำสั่งใส่ข้อมูลตัวอย่างเริ่มต้น (Seed Data)
เราได้เตรียมสคริปต์สร้างข้อมูลจำลองแบบครบวงจรไว้ให้เรียบร้อยแล้ว:

1. เปิด Terminal ในโฟลเดอร์ `backend/`:
   ```bash
   cd D:\VsCode\Project\Content-Management-System\backend
   ```
2. พิมพ์คำสั่ง:
   ```bash
   npm run seed
   ```
3. ระบบจะสร้างข้อมูล Users 4 คน, Team 1 ทีม, Ideas 2 รายการ, Contents 2 ชิ้น (พร้อมสถิติ), Tasks 2 งาน และกฎหมาย 4 ข้อให้อัตโนมัติ!

**บัญชีทดสอบที่ถูกสร้างขึ้น (รหัสผ่านคือ `123456` ทั้งหมด):**
- 👑 **Admin**: `admin@studio.com`
- 👔 **Manager**: `manager@studio.com`
- 🎬 **Member**: `member@studio.com`

