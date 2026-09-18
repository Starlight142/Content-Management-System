# Phase 1: Database & Backend Foundation

## เป้าหมาย (Goal)
สร้างรากฐานของระบบทั้งหมด ได้แก่ ฐานข้อมูล (Database) และตัวจัดการข้อมูล (Backend API) เพื่อให้แอปพลิเคชันฝั่งหน้าบ้าน (Web และ Mobile) สามารถเรียกใช้งานข้อมูลได้อย่างปลอดภัยและมีประสิทธิภาพ

## เทคโนโลยีที่ใช้ (Tech Stack)
- **Node.js & Express.js**: สำหรับสร้าง REST API
- **PostgreSQL**: ฐานข้อมูลหลัก (ผ่านไลบรารี `pg`)
- **JWT & Bcrypt**: สำหรับระบบ Authentication และความปลอดภัย
- **Feature-based Architecture**: โครงสร้างโฟลเดอร์แยกตามโมดูลเพื่อความง่ายในการดูแล

## สิ่งที่พัฒนาในเฟสนี้
1. **ออกแบบและสร้าง Database Schema (`database/schema.sql`)**
   - รองรับระบบผู้ใช้และทีม (`users`, `team`, `user_role`)
   - รองรับกระบวนการทำคอนเทนต์ (`idea`, `content`, `task`, `workflow`)
   - รองรับการเก็บข้อมูลประสิทธิภาพ (`content_metric`, `trend`, `recommendation`)
   - รองรับการตรวจสอบกฎหมาย (`legal_article`, `content_legal_check`)

2. **พัฒนาระบบ Authentication (`/api/auth`)**
   - สร้างระบบสมัครสมาชิก (Register) พร้อมเข้ารหัสรหัสผ่าน (Hash)
   - สร้างระบบเข้าสู่ระบบ (Login) และออก Token (JWT)

3. **พัฒนา Core APIs พื้นฐาน**
   - **Users API**: จัดการข้อมูลผู้ใช้งาน
   - **Teams API**: จัดการทีมและสมาชิกภายในทีม
   - **Ideas API**: จัดการกระบวนการเสนอและรวบรวมไอเดียคอนเทนต์
   - **Contents API**: ตัวหลักของระบบสำหรับสร้างและปรับสถานะ Content
   - **Tasks API**: ระบบมอบหมายงานให้ Member (เช่น สคริปต์, ถ่ายทำ, ตัดต่อ)

## ระบบสิทธิ์การใช้งาน (RBAC)
ใน Backend จะมี Middleware (`verifyRole`) คอยเช็คว่าใครมีสิทธิ์ทำอะไร เช่น:
- สร้างทีมหรือมอบหมายงาน ต้องเป็น **ADMIN** หรือ **MANAGER**
- การอัปเดตงานของตัวเอง **MEMBER** สามารถทำได้

