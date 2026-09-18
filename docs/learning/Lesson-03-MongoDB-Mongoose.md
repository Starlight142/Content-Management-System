# 📘 Lesson 03: สถาปัตยกรรมฐานข้อมูล MongoDB & Mongoose Database Layer
> **เป้าหมาย:** ทำความเข้าใจว่าทำไม NoSQL/Document Model จึงเหมาะกับงาน Content Production, กลไกของ Mongoose ODM, การจัดการ Database Connection Lifecycle, และการออกแบบ Schema ตัวแรกของระบบ

---

## 1. เข้าใจสถาปัตยกรรม: ทำไมระบบนี้ถึงเปลี่ยนจาก SQL สู่ NoSQL (MongoDB)?

ในระยะแรก โปรเจกต์นี้เริ่มต้นด้วย PostgreSQL (Relational Database / Table & Row) แต่ในการผลิตสื่อจริง ข้อมูลมีเดียและเมตริกซ์มีลักษณะเฉพาะ:

```
[SQL Approach: ตารางแยกและต้อง JOIN]
contents ───(1:N)───> content_metrics (views, likes, shares จาก TikTok/YouTube)
         ───(1:N)───> legal_checklists (ผลตรวจลิขสิทธิ์ 5 ข้อ)

[MongoDB Approach: Document-Oriented / Embed Subdocument]
{
  "_id": ObjectId("..."),
  "title": "เจาะลึก Node.js Core",
  "platform": "YOUTUBE",
  "metrics": { "views": 15200, "likes": 980 },
  "legalChecklist": [
    { "item": "เพลงปลอดลิขสิทธิ์", "passed": true },
    { "item": "ไม่มีภาพติดเครื่องหมายการค้า", "passed": true }
  ]
}
```

### ข้อดีของ MongoDB สำหรับ Content Management:
1. **Schema Flexibility & Embedding:** เราสามารถฝังข้อมูลสถิติ (Metrics) และรายการตรวจกฎหมาย (Legal Checklist) เข้าไปเป็น Subdocument ในชิ้นงาน Content ได้ทันที โดยไม่ต้อง JOIN ข้ามหลายตาราง ช่วยลด Latency มหาศาล
2. **JSON Native (BSON):** ข้อมูลใน MongoDB จัดเก็บแบบ **BSON (Binary JSON)** ทำให้โครงสร้างข้อมูลฝั่ง Backend (JavaScript Object) และฐานข้อมูลเป็นภาษาเดียวกันโดยสมบูรณ์

---

## 2. Mongoose คืออะไร? (ODM: Object Data Modeling)

หากเราต่อ MongoDB ด้วยไดรเวอร์ดิบ (`mongodb` native driver) ข้อมูลจะไม่มีกฎเกณฑ์ ใครจะยัดฟิลด์อะไรลงไปก็ได้ ซึ่งอันตรายต่อระบบธุรกิจ

**Mongoose** ทำหน้าที่เป็น **"ผู้คุมกฎ (Enforcer)"** ระหว่าง Node.js กับ MongoDB:
1. **Schema Definition:** บังคับ Type ของข้อมูล (เช่น `username` ต้องเป็น `String`, `email` ต้องไม่ซ้ำ)
2. **Validation:** เช็คความถูกต้องก่อนบันทึก เช่น ค่าว่าง (`required: true`), ค่าในชุดที่กำหนด (`enum: ['ADMIN', 'MANAGER', 'MEMBER']`)
3. **Middleware / Hooks:** สั่งทำงานอัตโนมัติก่อนหรือหลังบันทึก (เช่น แฮชรหัสผ่านก่อนบันทึก `pre('save')`)
4. **Model Mapping:** แปลง Schema ให้กลายเป็น JavaScript Class ที่มีฟังก์ชันทรงพลัง เช่น `.find()`, `.create()`, `.findByIdAndUpdate()`

---

## 3. สถาปัตยกรรม Connection Lifecycle (`src/config/db.js`)

การเชื่อมต่อฐานข้อมูลในระบบสากล จะต้อง **แยกไฟล์การตั้งค่า (Configuration Isolation)** ออกมาจาก `server.js` เพื่อความเป็นระเบียบและง่ายต่อการทดสอบ (Testing)

```
[Client Request] ──> [server.js]
                          │
                          ▼ (เรียกใช้เมื่อ Server บูต)
                     [config/db.js] ──> [MongoDB Server (Port 27017)]
```

### โค้ด `src/config/db.js` เจาะลึกทีละบรรทัด:

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 1. ดึง Connection String จาก Environment (.env)
    // หากไม่มี ให้ Fallback ไปที่ Localhost พอร์ตมาตรฐาน 27017
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/content_management';

    // 2. สั่งเชื่อมต่อไปยัง MongoDB (คืนค่ากลับมาเป็น Connection Object)
    const conn = await mongoose.connect(mongoUri);

    console.log(`🍃 Connected to MongoDB successfully: ${conn.connection.host}`);
  } catch (error) {
    // 3. ดักจับข้อผิดพลาดกรณี Database ล่ม หรือต่อไม่ติด
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1); // จบการทำงานของเซิร์ฟเวอร์ทันทีหากต่อ DB ไม่สำเร็จ
  }
};

module.exports = connectDB;
```

### จุดสำคัญระดับ Core Architecture:
- **`async / await`:** การเปิด Socket เชื่อมต่อไปยัง MongoDB ต้องใช้เวลา (I/O Operation) จึงต้องทำงานแบบ Asynchronous
- **`127.0.0.1` vs `localhost`:** ใน Node.js ยุคใหม่ แนะนำให้ระบุ `127.0.0.1` แทน `localhost` เพื่อเลี่ยงปัญหาการ Resolution ของ IPv6 (`::1`) บน Windows ซึ่งอาจทำให้เชื่อมต่อช้าไปหลายวินาที
- **`process.exit(1)`:** ในระบบ Production หากฐานข้อมูลที่เป็นหัวใจหลักเชื่อมต่อไม่ติด เซิร์ฟเวอร์ไม่ควรทำงานต่อ เพราะจะทำให้ทุก Request ล้มเหลว

---

## 4. การออกแบบ Schema ตัวแรก: `User` Model

ผู้ใช้คือศูนย์กลางของระบบ Content Management System เพราะต้องระบุสิทธิ์ว่าใครเป็น Admin, Manager (ตรวจงาน), หรือ Creator/Member (ผลิตงาน)

### แผนผัง Model:
```
User Schema
├── username      (String, required, unique, trim)
├── email         (String, required, unique, lowercase, trim)
├── passwordHash  (String, required)
├── firstName     (String, trim)
├── lastName      (String, trim)
├── role          (String, enum: ['ADMIN', 'MANAGER', 'MEMBER'], default: 'MEMBER')
├── status        (String, enum: ['ACTIVE', 'OFFLINE', 'SUSPENDED'], default: 'ACTIVE')
└── timestamps    (createdAt, updatedAt สร้างอัตโนมัติ)
```

---

## 5. ลำดับขั้นตอนการลงมือปฏิบัติ (Action Checklist)

1. **ติดตั้ง `mongoose` ใน `learning/backend`:**
   ```bash
   npm i mongoose
   ```

2. **เพิ่มตัวแปรใน `learning/backend/.env`:**
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/content_management
   ```

3. **สร้างโฟลเดอร์และไฟล์เชื่อมต่อ:**
   - โฟลเดอร์: `learning/backend/src/config/`
   - ไฟล์: `learning/backend/src/config/db.js`

4. **เรียกใช้งาน `connectDB()` ใน `learning/backend/src/server.js`:**
   ```javascript
   const connectDB = require('./config/db');
   
   // เชื่อมต่อ Database ก่อนเริ่ม Listen
   connectDB();
   ```

5. **สร้างโฟลเดอร์และไฟล์โมเดลตัวแรก:**
   - โฟลเดอร์: `learning/backend/src/database/models/`
   - ไฟล์: `learning/backend/src/database/models/User.js`
