# Phase 2: Admin Web Development

## เป้าหมาย (Goal)
สร้างระบบจัดการหลังบ้าน (Back-office) สำหรับผู้ที่มี Role เป็น **ADMIN** เพื่อใช้ในการบริหารจัดการภาพรวมขององค์กร จัดการผู้ใช้ ข้อมูลกฎหมาย และตรวจสอบสถานะของระบบ 

## เทคโนโลยีที่ใช้ (Tech Stack)
- **React.js & Next.js**: สำหรับสร้าง Web Application ที่รวดเร็วและรองรับ SEO (ถ้าจำเป็น)
- **TailwindCSS / Material UI**: (หรือ UI Framework อื่นๆ) สำหรับความสวยงาม
- **Axios / Fetch**: สำหรับเรียกใช้งาน API จาก Phase 1

## สิ่งที่พัฒนาในเฟสนี้
1. **ระบบบริหารจัดการพื้นฐาน (Master Data Management)**
   - **Manage Users**: เพิ่ม ลด แก้ไข และกำหนด Role ให้กับผู้ใช้
   - **Manage Teams**: สร้างทีมและดึงผู้ใช้เข้าไปอยู่ในทีม
   - **Manage Task Types**: กำหนดประเภทของงาน (เช่น ถ่ายทำ, เขียนบท, กราฟิก)

2. **ระบบฐานข้อมูลกฎหมาย (Legal Information)**
   - เพิ่ม/ลบ/แก้ไข ข้อกำหนดกฎหมาย, ลิขสิทธิ์เพลง, PDPA, และกฎของแพลตฟอร์ม
   - ข้อมูลส่วนนี้จะถูกส่งไปให้ Mobile App ใช้ทำ Checklist ก่อน Publish Content

3. **ระบบตรวจสอบและรายงาน (Monitoring & Reports)**
   - **System Dashboard**: ดูภาพรวมว่ามีผู้ใช้กี่คน คอนเทนต์กำลังผลิตกี่ตัว
   - **Activity Logs**: ตรวจสอบประวัติการใช้งานระบบว่าใครทำอะไร เมื่อไหร่ (Audit Trail)

## ลักษณะการทำงาน (Workflow)
1. Admin เข้าสู่ระบบผ่านหน้า Web Login
2. ระบบจะตรวจสอบ JWT Token และเช็คว่า Role = ADMIN เท่านั้น
3. Admin สามารถเข้าถึง Sidebar เมนูต่างๆ เพื่อตั้งค่าระบบให้พร้อมก่อนที่ Manager และ Member จะเริ่มใช้งานใน Mobile App

