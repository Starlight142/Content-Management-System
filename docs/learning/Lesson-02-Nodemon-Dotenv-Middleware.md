# 📘 Lesson 02: สถาปัตยกรรม Nodemon, Environment (.env) และ Middleware
> **เป้าหมาย:** ทำความเข้าใจว่า Process Watcher ทำงานอย่างไร, ทำไมระบบความปลอดภัยต้องใช้ `.env`, และ Middleware สำคัญอย่างไรในระดับ Core Architecture

---

## 1. Nodemon ทำงานอย่างไรเบื้องหลัง? (Process Supervision)
เมื่อเราสั่ง `node server.js` ตัว Node.js จะโหลดไฟล์ทั้งหมดขึ้นสู่ Memory (RAM) และรันอยู่แบบนั้น เมื่อคุณแก้ไฟล์ใน VS Code โค้ดใน RAM ไม่ได้เปลี่ยนตาม

### สิ่งที่ `nodemon` ทำ:
1. ใช้ฟังก์ชันตรวจสอบไฟล์ของระบบปฏิบัติการ (File System Watcher: `fs.watch`)
2. เมื่อมีการกด **Save (Ctrl + S)** ตัว `nodemon` จะตรวจพบการเปลี่ยนแปลงของเวลาบันทึกไฟล์ (Timestamp)
3. ส่งสัญญาณ `SIGUSR2` เพื่อฆ่า Process ของเซิร์ฟเวอร์เดิม และสตาร์ตคำสั่ง `node` ขึ้นมาใหม่อัตโนมัติในเสี้ยววินาที

---

## 2. Environment Variables (.env) คืออะไร และทำไมต้องใช้?

ในหลักการพัฒนาซอฟต์แวร์ระดับโลก (**The Twelve-Factor App**) มีกฎเหล็กข้อหนึ่งว่า:
> *"ห้ามฮาร์ดโค้ดค่าการตั้งค่า รหัสผ่าน หรือพอร์ต ลงในโค้ดดิบเด็ดขาด (Strict separation of config from code)"*

### ปัญหาของการฮาร์ดโค้ด:
- ถ้าคุณเขียน `const PORT = 5000;` หรือใส่รหัสฐานข้อมูลลงในโค้ด แล้ววันหนึ่งคุณนำโค้ดขึ้น GitHub รหัสผ่านของคุณจะรั่วไหลทันที
- เวลาขึ้นเซิร์ฟเวอร์จริง (Production) พอร์ตอาจไม่ใช่ 5000 (อาจเป็น 80 หรือ 443) คุณต้องมาคอยแก้โค้ดทุกครั้ง

### การแก้ปัญหาด้วย `.env`:
1. ไฟล์ `.env` จะถูกเพิ่มลงใน `.gitignore` เพื่อ **ไม่ให้อัปโหลดขึ้น Cloud**
2. ไลบรารี `dotenv` จะทำหน้าที่อ่านข้อความในไฟล์ `.env` แล้วนำไปฝากไว้ในตัวแปรส่วนกลางของระบบที่ชื่อ **`process.env`** ของ Node.js
3. โค้ดของเราจะเรียกใช้ผ่าน `process.env.PORT` ซึ่งปลอดภัย 100%

---

## 3. เจาะลึก Middleware: หัวใจสำคัญที่สุดของ Express.js

**Middleware คืออะไร?**
ให้จินตนาการว่า เซิร์ฟเวอร์คือ **"ตึกสำนักงาน"** และ Request จาก Client คือ **"พัสดุที่ส่งเข้ามา"**:

$$\text{Client Request} \longrightarrow \boxed{\text{Middleware 1}} \longrightarrow \boxed{\text{Middleware 2}} \longrightarrow \boxed{\text{Route Handler}} \longrightarrow \text{Response}$$

Middleware คือ **"ด่านตรวจคัดกรอง"** ที่ทำงานอยู่ตรงกลางระหว่างที่ Request เข้ามา ก่อนที่จะส่งต่อให้ Route ปลายทางประมวลผล

### ทำไมต้องใส่ `app.use(express.json());`?
เวลา Client ยิงคำขอ `POST` ส่งข้อมูล JSON มา ข้อมูลไม่ได้มาเป็น Object สำเร็จรูป แต่จะวิ่งมาทางสายเน็ตเวิร์กเป็น **กระแสข้อมูลไบต์ดิบ (Stream of Raw Bytes / Buffers)**:
```text
47 65 74 20 2f 20 48 54 54 50 2f 31 2e 31 ... (Raw Bytes)
```
* หากไม่มี Middleware เซิร์ฟเวอร์จะไม่รู้ว่าก้อนข้อมูลนี้คืออะไร และ `req.body` จะกลายเป็น `undefined`
* **`express.json()`** จะทำหน้าที่รวบรวมก้อนไบต์ดิบทั้งหมด แล้วสั่ง `JSON.parse()` แปลงเป็น **JavaScript Object** ที่สวยงามให้เราหยิบใช้ผ่าน `req.body` ได้ทันที!

---

## 4. โครงสร้างโค้ดแบบเจาะลึก (Step-by-Step Code Structure)

```javascript
require('dotenv').config(); // โหลดไฟล์ .env เข้าสู่กระบวนการของ Node.js
const express = require('express');
const app = express();

// ด่านตรวจที่ 1: แปลง Body ที่เป็น JSON ให้กลายเป็น Object
app.use(express.json());

// ด่านตรวจที่ 2: Route GET หน้าแรก
app.get('/', (req, res) => {
  res.send('Hello, Content Production Management System has been started successfully!');
});

// ด่านตรวจที่ 3: Route POST สำหรับรับข้อมูล
app.post('/api/test', (req, res) => {
  // req.body จะมีค่าได้ เพราะผ่านด่านตรวจ express.json() ด้านบนมาแล้ว
  const clientData = req.body; 

  // ส่งผลลัพธ์ตอบกลับเป็น JSON พร้อม HTTP Status 200 (Default)
  res.json({
    status: 'success',
    message: 'เซิร์ฟเวอร์ได้รับข้อมูลของคุณเรียบร้อยแล้ว!',
    dataReceived: clientData
  });
});

// อ่านค่าพอร์ตจาก Environment หากไม่มีให้ Fallback ไปที่ 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 เซิร์ฟเวอร์กำลังทำงานที่พอร์ต http://localhost:${PORT}`);
});
```

---

## 5. ทำไมต้องใช้ `npm i -D nodemon`? (Dependencies vs DevDependencies)

ในโลกการพัฒนาซอฟต์แวร์ Node.js แพ็กเกจถูกแบ่งออกเป็น 2 ประเภทหลักใน `package.json`:

1. **`dependencies`** (เช่น `express`, `mongoose`, `dotenv`):
   - โค้ดที่แอปพลิเคชันต้องใช้ทำงานจริงทั้งบนเครื่องเราและบน **Production Server**
   - หากขาดแพ็กเกจเหล่านี้ ระบบจะรันไม่ขึ้น (Crash)

2. **`devDependencies`** (เช่น `nodemon`, `eslint`, `jest`):
   - เครื่องมือที่ช่วยอำนวยความสะดวกให้ **นักพัฒนา (Developer)** ในช่วงกำลังเขียนโค้ดเท่านั้น
   - ธง `-D` (หรือ `--save-dev`) บอก npm ว่าเครื่องมือนี้ไม่ต้องแถมไปตอน Deploy ขึ้น Server จริง ช่วยให้ระบบโหลดเร็ว ประหยัดพื้นที่ และปลอดภัยยิ่งขึ้น

---

## 6. ลำดับขั้นตอนการลงมือปฏิบัติ (Action Checklist)

1. **ติดตั้งเครื่องมือใน `learning/backend`:**
   ```bash
   npm i -D nodemon
   npm i dotenv
   ```
2. **สร้างไฟล์ `.env` ที่โฟลเดอร์รากของ `learning/backend`:**
   ```env
   PORT=5000
   ```
3. **ปรับแต่ง `package.json` ให้ชี้ไปที่ `src/server.js`:**
   ```json
   "scripts": {
     "start": "node src/server.js",
     "dev": "nodemon src/server.js"
   }
   ```
4. **แก้ไข `src/server.js`** ตามตัวอย่างในหัวข้อที่ 4
5. **รันเซิร์ฟเวอร์ด้วยคำสั่ง:**
   ```bash
   npm run dev
   ```

