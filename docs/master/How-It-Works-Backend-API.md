# How It Works: Backend API (การทำงานของฝั่ง API)

เอกสารนี้อธิบายการไหลของข้อมูล (Data Flow) เมื่อมีผู้ใช้ยิง Request เข้ามาที่ Backend

## 1. Feature-based Architecture (โครงสร้างโฟลเดอร์)
เราแยกโค้ดเป็นโฟลเดอร์ตาม "ฟีเจอร์" เช่น `auth`, `users`, `contents` โดยแต่ละฟีเจอร์จะมี 2 ไฟล์หลัก:
- **`xxx.routes.js`**: ทำหน้าที่รับ Request URL และตรวจสอบสิทธิ์
- **`xxx.controller.js`**: ทำหน้าที่ประมวลผล (Business Logic) คุยกับ Database และส่ง Response กลับไป

## 2. การไหลของข้อมูล (Request Lifecycle)
สมมติว่ามีการยิง API: `POST /api/contents` เพื่อสร้างคอนเทนต์ใหม่ ข้อมูลจะวิ่งตามเส้นทางนี้:

### Step 1: `app.js` (จุดเริ่มต้น)
เมื่อ Request เข้ามาที่ Port 5000 `app.js` จะเป็นด่านแรกที่รับข้อมูล และส่งต่อ Request ไปยัง Router ที่กำหนดไว้
```javascript
app.use('/api/contents', contentsRoutes);
```

### Step 2: `contents.routes.js` (การตรวจสอบ)
Router จะรับช่วงต่อ และเช็คว่าต้องทำอะไรบ้าง
```javascript
router.use(verifyToken); // 1. ตรวจสอบว่า Login หรือยัง (มี Token ไหม)
router.post('/', contentsController.createContent); // 2. ถ้าผ่าน ให้เรียกใช้งาน Controller
```

### Step 3: `auth.js` (Middleware ตรวจสอบสิทธิ์)
ก่อนที่จะไปถึง Controller ระบบจะแวะมาที่ `verifyToken` ก่อน เพื่อถอดรหัส JWT
- หากถอดรหัสผ่าน จะเอาข้อมูล User ไปแปะไว้ใน `req.user`
- หากไม่ผ่าน จะถูกเตะออกทันที (Response `401 Unauthorized`)

### Step 4: `contents.controller.js` (ประมวลผล)
เมื่อผ่านการตรวจสอบมาได้ โค้ดใน Controller จะเริ่มทำงาน
- ดึงข้อมูลชื่อคอนเทนต์จาก `req.body.title`
- ดึงข้อมูลคนสร้างจาก `req.user.userId` (ที่ Middleware แปะไว้ให้)
- สั่ง `db.query(...)` เพื่อบันทึกลง Database
- ส่งคำตอบ (Response) เป็น JSON กลับไปหาคนเรียก API

