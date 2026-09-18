# 📘 Lesson 01: พื้นฐานการทำงานของ Node.js และ Express Server
> **เป้าหมาย:** เข้าใจว่าทำไม Node.js ถึงรันเซิร์ฟเวอร์ได้, เครื่องมือ Express ทำงานอย่างไร, และคำสั่งแต่ละบรรทัดทำหน้าที่อะไรในระดับลึก

---

## 1. เข้าใจสถาปัตยกรรม: คอมพิวเตอร์กลายเป็น Server ได้อย่างไร?
ก่อนที่จะเขียนโค้ด เราต้องเข้าใจว่า **"Server"** คืออะไรในเชิงฮาร์ดแวร์และเน็ตเวิร์ก:

1. **Client (ฝั่งคนเรียกใช้งาน):** เช่น Browser (Chrome), มือถือ (Mobile App) ส่งคำขอที่เรียกว่า **HTTP Request** ไปยัง IP Address และ Port ที่ระบุ
2. **Port (ประตูรับข้อมูล):** คอมพิวเตอร์ 1 เครื่องมีประตูสื่อสาร (Port) ได้ถึง 65,535 พอร์ต พอร์ต 80/443 มักใช้กับเว็บทั่วไป ส่วน **พอร์ต 5000** นิยมใช้เป็นประตูด้านหลังสำหรับทดสอบพัฒนา (Development API)
3. **Node.js Runtime:** เป็นเครื่องยนต์ (JavaScript V8 Engine) ที่นำภาษา JavaScript จากเดิมที่รันได้แค่บน Browser ออกมาสั่งงานฮาร์ดแวร์ของระบบปฏิบัติการ (Windows/Linux) ได้โดยตรง เช่น การเปิด Port เพื่อดักฟังข้อมูลที่วิ่งเข้ามา

---

## 2. เจาะลึกโค้ด `server.js` ทีละบรรทัด (Line-by-Line Breakdown)

```javascript
const express = require('express');
const app = express();
```

### 🔍 บรรทัดที่ 1: `const express = require('express');`
* **`require(...)`**: เป็นฟังก์ชันของระบบ CommonJS ใน Node.js ทำหน้าที่เดินไปหาโฟลเดอร์ `node_modules/express` เพื่อโหลดไลบรารีเข้ามา
* **`const express`**: ตัวแปรคงที่ (Constant) ที่เก็บ "ฟังก์ชันแม่แบบ (Factory Function)" ของไลบรารี Express เอาไว้

### 🔍 บรรทัดที่ 2: `const app = express();`
* เป็นการเรียกฟังก์ชันแม่แบบ เพื่อสร้าง **"อินสแตนซ์ของแอปพลิเคชัน (Express Application Instance)"**
* ตัวแปร `app` ตัวนี้จะกลายเป็น **ศูนย์บัญชาการหลัก** ของเซิร์ฟเวอร์ ที่มีเมธอดต่างๆ เช่น `.get()`, `.post()`, `.use()`, `.listen()` ให้เราเรียกใช้งาน

---

```javascript
app.get('/', (req, res) => {
  res.send('Hello, Content Production Management System has been started successfully!');
});
```

### 🔍 บรรทัดที่ 4-6: การสร้าง Route (Routing)
* **`app.get(...)`**: บอกว่าเซิร์ฟเวอร์จะรับคำขอที่เป็น HTTP Method **`GET`** (การขออ่านข้อมูล)
* **`'/'` (Path/Endpoint):** คือเส้นทางหน้าแรกสุด (Root URL) เช่น `http://localhost:5000/`
* **`(req, res) => { ... }` (Route Handler Callback):**
  * **`req` (Request Object):** บรรจุข้อมูลทั้งหมดที่ Client ส่งมา เช่น IP Address, Headers, URL Parameters
  * **`res` (Response Object):** เครื่องมือที่ใช้ส่งคำตอบกลับไปหา Client
  * **`res.send(...)`**: คำสั่งที่แปลงข้อความแล้วส่งกลับไปหาเบราว์เซอร์ พร้อมแนบ HTTP Status Code `200 OK` ให้อัตโนมัติ

---

```javascript
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
```

### 🔍 บรรทัดที่ 8-11: การเปิดพอร์ต (Event Loop & Listening)
* **`app.listen(PORT, callback)`**: สั่งให้ระบบปฏิบัติการ Windows จองพอร์ต 5000 ไว้ และเริ่มวนลูปดักฟัง (Event Loop) รอการเชื่อมต่อจากเน็ตเวิร์ก
* ฟังก์ชัน Callback ด้านในจะทำงานทันทีที่พอร์ตถูกเปิดสำเร็จ เพื่อแสดงข้อความยืนยันใน Terminal

