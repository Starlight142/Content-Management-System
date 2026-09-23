# 🎬 Draftly — Content Production Management System (CMS)
> **Draftly: โครงงานระบบบริหารจัดการกระบวนการผลิตสื่อ (Content Production Management System)**  
> พัฒนาขึ้นเพื่อส่งมอบในรายวิชา และออกแบบโครงสร้างทางวิศวกรรมซอฟต์แวร์ให้สามารถต่อยอดได้ในอนาคต

---

## 📌 1. ภาพรวมของระบบ (System Overview)

**Draftly** คือระบบช่วยจัดการกระบวนการผลิตสื่อตั้งแต่ต้นจนจบ เพื่อให้การทำงานในสตูดิโอมีระเบียบและตรวจสอบได้จริง:
- **Idea**: เสนอและคัดกรองไอเดียคอนเทนต์
- **Production & Tasks**: มอบหมายงานย่อยตามหน้าที่ (บท, ถ่ายทำ, ตัดต่อ, เสียง, กราฟิก) และติดตามความคืบหน้าภาพรวมทีม
- **Review & Revision**: ตรวจสอบผลงานที่ส่งมอบ, ส่งกลับแก้ไขพร้อมคำแนะนำ (Revision Notes), และรับข้อความชี้แจงตอบกลับ (Reply Notes)
- **Direct Approval & Publish**: ตรวจรับ อนุมัติชิ้นงานโดยตรง (1-Tap Approval) และกำหนดการเผยแพร่สื่อ

---

## 👥 2. บทบาทผู้ใช้งาน (Roles & Capabilities)

ระบบกำหนดสิทธิ์การใช้งานแบ่งตาม 3 บทบาทหลัก:

| บทบาท | ช่องทางใช้งาน | หน้าที่หลัก |
| :--- | :--- | :--- |
| **👤 Admin (ผู้ดูแลระบบ)** | Admin Web | จัดการผู้ใช้งาน, จัดการทีม, กำหนดประเภทงานผลิต, และตรวจสอบ System Logs |
| **👔 Manager (ผู้จัดการทีม)** | Mobile App | อนุมัติไอเดีย, มอบหมายงาน, ตรวจสอบงาน, สั่งแก้ไข, อนุมัติชิ้นงานโดยตรง, และกำหนดการเผยแพร่ |
| **🎨 Member (ทีมงานสร้างสรรค์)** | Mobile App | เสนอไอเดีย, ดูงานและภาพรวมทีม, อัปเดตสถานะงาน, แนบลิงก์ส่งมอบผลงาน, และส่งข้อความตอบกลับรอบแก้ไข |

---

## 📚 3. เอกสารการวิเคราะห์และออกแบบระบบ (System Design Deliverables)

จัดทำเอกสารและแผนภาพครบถ้วน 7 รายการหลักตามข้อกำหนดของรายวิชา:

| ลำดับ | รายการเอกสารวิชาการ | คำอธิบาย | ลิงก์เอกสาร |
| :---: | :--- | :--- | :---: |
| **2.1** | **Use Case Diagram** | แผนภาพขอบเขตการทำงานของระบบและ 3 บทบาทผู้ใช้ | [📄 ดูเอกสาร](docs/academic/01-Use-Case-Diagram.md) |
| **2.2** | **Use Case Descriptions** | รายละเอียดข้อกำหนดการทำงานตามมาตรฐาน IEEE / Cockburn | [📄 ดูเอกสาร](docs/academic/02-Use-Case-Descriptions.md) |
| **2.3** | **Activity Diagram** | แผนภาพกิจกรรมแบบ Swimlanes แสดง Flow การผลิตและลูปแก้ไขงาน | [📄 ดูเอกสาร](docs/academic/03-Activity-Diagram.md) |
| **2.4** | **Class Diagram** | แผนภาพคลาสความสัมพันธ์เชิงโครงสร้างของระบบ | [📄 ดูเอกสาร](docs/academic/04-Domain-Class-Diagram.md) |
| **2.5** | **Sequence Diagram** | แผนภาพลำดับขั้นตอนการส่งงาน, ตรวจงาน, ลูปแก้ไขงานพร้อม Reply Notes และการอนุมัติ | [📄 ดูเอกสาร](docs/academic/05-Sequence-Diagrams.md) |
| **2.6** | **Entity Relationship Diagram (ERD)** | แผนภาพความสัมพันธ์ของข้อมูลแบบ Relational (Crow's Foot) | [📄 ดูเอกสาร](docs/academic/06-Entity-Relationship-Diagram.md) |
| **2.7** | **Data Dictionary** | พจนานุกรมข้อมูลรายละเอียดทุกตารางและคอลัมน์ | [📄 ดูเอกสาร](docs/academic/07-Data-Dictionary.md) |

*(เอกสารเสริมสำหรับงานออกแบบ: [🎨 Figma Design Tokens & Wireframes Blueprint](docs/academic/08-Figma-Design-Tokens-And-Wireframes.md))*

---

## 💻 4. เทคโนโลยีที่ใช้ในการพัฒนา (Technology Stack)

- **Mobile Application**: React Native (JavaScript)
- **Admin Web**: Next.js / React (JavaScript .jsx)
- **Backend API**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)

---

## ⚡ 5. วิธีการติดตั้งและทดสอบระบบ (Quickstart Guide)

### 5.1 เริ่มต้นรัน Backend API (Port 5000)
```bash
cd master/backend
npm install
npm run seed     # สร้างข้อมูลจำลองเริ่มต้นสำหรับทดสอบ (Users, Teams, Contents, Tasks)
npm run dev      # รันเซิร์ฟเวอร์ (หรือ npm start)
```
> ทดสอบ Health Check ได้ที่: `http://localhost:5000/api/health`

### 5.2 เริ่มต้นรัน Admin Web (Port 3000)
```bash
cd master/admin-web
npm install
npm run dev
```
> เข้าใช้งานได้ที่: `http://localhost:3000`

### 5.3 เริ่มต้นรัน Mobile Application (Android)
```bash
cd master/mobile-app
npm install
npm start        # เริ่มต้น Metro Bundler
npm run android  # รันลงใน Android Emulator
```

---

## 🔐 6. บัญชีสำหรับทดสอบระบบ (Test Accounts)

ข้อมูลบัญชีเริ่มต้นที่ถูกสร้างโดย `npm run seed`:

| บทบาท (Role) | อีเมล (Email) | รหัสผ่าน (Password) | ช่องทางใช้งาน |
| :--- | :--- | :--- | :--- |
| **Manager** | `manager@studio.com` | `123456` | Mobile App |
| **Member** | `member@studio.com` | `123456` | Mobile App |
| **Admin** | `admin@studio.com` | `123456` | Admin Web |

*(บน Mobile App มีปุ่ม **Fast Role Switcher** ในหน้า Login ให้สามารถคลิกเพื่อสลับบทบาททดสอบได้ทันที)*

---

## 📁 7. โครงสร้างโฟลเดอร์โปรเจกต์ (Project Structure)

```text
Content-Management-System/
├── docs/                           <-- เอกสารวิชาการ 7 รายการ และบันทึกประวัติการพัฒนา
│   ├── academic/                   <-- 7 UML & System Diagrams (2.1 - 2.7)
│   ├── year-4-capstone/            <-- พิมพ์เขียวการออกแบบสำหรับต่อยอดในอนาคต
│   └── PROJECT-DEVELOPMENT-LOG.md  <-- บันทึกประวัติการพัฒนา
│
├── master/                         <-- ซอร์สโค้ดระบบหลักที่ใช้งานจริง
│   ├── backend/                    <-- Express.js REST API
│   ├── admin-web/                  <-- Next.js Admin Dashboard
│   └── mobile-app/                 <-- React Native Mobile Application
│
└── learning/                       <-- โฟลเดอร์สำหรับการเรียนรู้และฝึกฝนเขียนโค้ด
```

---
<sub>จัดทำเพื่อการศึกษาและส่งมอบตามข้อกำหนดของรายวิชา • 2026</sub>
