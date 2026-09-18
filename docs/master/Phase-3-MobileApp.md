# Phase 3: Mobile App Development

## เป้าหมาย (Goal)
สร้างแอปพลิเคชันบนมือถือสำหรับ **MANAGER** และ **MEMBER** เพื่อใช้เป็นเครื่องมือหลักในการปฏิบัติงาน ตั้งแต่เริ่มคิดไอเดียไปจนถึงการเผยแพร่คอนเทนต์

## เทคโนโลยีที่ใช้ (Tech Stack)
- **React Native (Expo)**: สำหรับพัฒนาแอปที่สามารถรันได้ทั้ง iOS และ Android
- **React Navigation**: สำหรับจัดการระบบนำทาง (Routing) ในแอป
- **Redux หรือ Zustand**: สำหรับจัดการ State ของแอป (เช่น ข้อมูล User ที่ Login อยู่)

## สิ่งที่พัฒนาในเฟสนี้
1. **Role-Based Navigation**
   - **Manager View**: เห็น Dashboard ทีม, การอนุมัติ (Approve), และดู Analytics/Trends
   - **Member View**: เห็นเฉพาะ Task ที่ได้รับมอบหมาย, แจ้งเตือน, และหน้าอัปเดตงาน

2. **ระบบจัดการ Workflow ของคอนเทนต์ (Manager)**
   - ดู Idea ที่เสนอเข้ามาและกดสร้างเป็น Content
   - สร้าง Task (เช่น ถ่ายวิดีโอ) และมอบหมาย (Assign) ให้ Member
   - รีวิวงาน (Review), ตีกลับให้แก้ไข (Revision), และกดอนุมัติ (Approval)
   - จัดตารางเผยแพร่ (Schedule)

3. **ระบบจัดการงานของตัวเอง (Member)**
   - ดูรายการ Task ของตัวเอง (To-Do List)
   - กดอัปเดตสถานะงาน (In Progress -> Done)
   - ส่งไฟล์งาน / แนบลิงก์งานเพื่อส่งให้ Manager รีวิว

4. **ระบบแจ้งเตือน (Push Notifications)**
   - แจ้งเตือน Member เมื่อมี Task ใหม่เข้ามา
   - แจ้งเตือน Manager เมื่อ Member ส่งงานเรียบร้อยแล้ว

