# How It Works: Database & Connection (การทำงานของฐานข้อมูล)

เอกสารนี้อธิบายการทำงานของฐานข้อมูล PostgreSQL และการเชื่อมต่อในโปรเจกต์นี้

## 1. ไฟล์ `database/schema.sql` (โครงสร้างฐานข้อมูล)
ไฟล์นี้เป็นไฟล์ที่เก็บคำสั่ง Data Definition Language (DDL) สำหรับใช้ "สร้างตาราง" ทั้งหมดในระบบ 
- เราใช้ `SERIAL PRIMARY KEY` เพื่อให้รหัส ID รันอัตโนมัติ (Auto-increment) ทุกครั้งที่มีข้อมูลใหม่
- เราใช้ `REFERENCES table_name(id)` เพื่อทำ Foreign Key เชื่อมความสัมพันธ์ เช่น คอนเทนต์นี้ใครเป็นคนสร้าง (`created_by REFERENCES users(id)`)
- เราใช้ `ON DELETE CASCADE` เพื่อบอกว่า ถ้าข้อมูลหลักถูกลบ ข้อมูลที่อ้างอิงมันอยู่ให้ลบตามไปด้วยเลย (เช่น ลบ Content ออก Task ของ Content นั้นก็จะถูกลบด้วย)

## 2. ไฟล์ `backend/src/config/db.js` (การเชื่อมต่อ)
เราใช้ไลบรารีชื่อ `pg` (node-postgres) เพื่อให้ Node.js คุยกับ PostgreSQL ได้
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  // ...
});
```
- **ทำไมต้องใช้ `Pool`?**: ในระบบที่มีคนใช้งานเยอะๆ การเชื่อมต่อฐานข้อมูลใหม่ทุกครั้งจะช้ามาก (เหมือนการต่อสายโทรศัพท์ใหม่ทุกครั้ง) `Pool` จะทำการสร้างการเชื่อมต่อสำรองเตรียมไว้ (เช่น 10 เส้น) เมื่อมีคนเรียก API ระบบจะหยิบเส้นที่ว่างไปใช้ พอใช้เสร็จก็ส่งคืน `Pool` ทำให้ระบบทำงานได้รวดเร็วมาก

## 3. การใช้งานใน Controller
เมื่อเราต้องการดึงข้อมูล เราจะเรียกใช้ `db.query()` เช่น:
```javascript
const result = await db.query('SELECT * FROM users');
```
ตัวแปล `result.rows` จะเก็บผลลัพธ์เป็น Array ของ Object ให้เรานำไปใช้งานต่อได้ทันที

