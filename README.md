# Draftly — Content Production Management System (CMS)
> **Draftly: โครงงานระบบบริหารจัดการกระบวนการผลิตสื่อ (Content Production Management System)**  
> พัฒนาขึ้นเพื่อส่งมอบในรายวิชา และออกแบบโครงสร้างทางวิศวกรรมซอฟต์แวร์ให้สามารถต่อยอดได้ในอนาคต

---

## 1. ภาพรวมของระบบ (System Overview)

**Draftly** คือระบบช่วยจัดการกระบวนการผลิตสื่อตั้งแต่ต้นจนจบ เพื่อให้การทำงานในสตูดิโอมีระเบียบและตรวจสอบได้จริง:
- **Idea**: เสนอและคัดกรองไอเดียคอนเทนต์
- **Production & Tasks**: มอบหมายงานย่อยตามหน้าที่ (บท, ถ่ายทำ, ตัดต่อ, เสียง, กราฟิก) และติดตามความคืบหน้าภาพรวมทีม
- **Review & Revision**: ตรวจสอบผลงานที่ส่งมอบ, ส่งกลับแก้ไขพร้อมคำแนะนำ (Revision Notes), และรับข้อความชี้แจงตอบกลับ (Reply Notes)
- **Direct Approval & Publish**: ตรวจรับ อนุมัติชิ้นงานโดยตรง (1-Tap Approval) และกำหนดการเผยแพร่สื่อ

---

## 2. บทบาทผู้ใช้งาน (Roles & Capabilities)

ระบบกำหนดสิทธิ์การใช้งานแบ่งตาม 3 บทบาทหลัก:

| บทบาท | ช่องทางใช้งาน | หน้าที่หลัก |
| :--- | :--- | :--- |
| **Admin (ผู้ดูแลระบบ)** | Admin Web | จัดการผู้ใช้งาน, จัดการทีม, กำหนดประเภทงานผลิต, และตรวจสอบ System Logs |
| **Manager (ผู้จัดการทีม)** | Mobile App | อนุมัติไอเดีย, มอบหมายงาน, ตรวจสอบงาน, สั่งแก้ไข, อนุมัติชิ้นงานโดยตรง, และกำหนดการเผยแพร่ |
| **Member (ทีมงานสร้างสรรค์)** | Mobile App | เสนอไอเดีย, ดูงานและภาพรวมทีม, อัปเดตสถานะงาน, แนบลิงก์ส่งมอบผลงาน, และส่งข้อความตอบกลับรอบแก้ไข |

---

## 3. เอกสารการวิเคราะห์และออกแบบระบบ (System Design Deliverables)

จัดทำเอกสาร แผนภาพ รายงาน และชุดทดสอบครบถ้วนตามข้อกำหนดของรายวิชา:

| ลำดับ | รายการเอกสารวิชาการ | คำอธิบาย | ลิงก์เอกสาร |
| :---: | :--- | :--- | :---: |
| **01** | **Use Case Diagram** | แผนภาพขอบเขตการทำงานของระบบ (14 Use Cases) และ 3 บทบาทผู้ใช้ | [ดูเอกสาร](docs/academic/01-Use-Case-Diagram.md) |
| **02** | **Use Case Descriptions** | รายละเอียดข้อกำหนดการทำงานตามมาตรฐาน IEEE / Cockburn | [ดูเอกสาร](docs/academic/02-Use-Case-Descriptions.md) |
| **03** | **Activity Diagram** | แผนภาพกิจกรรมแบบ Swimlanes แสดง Flow การผลิตและลูปแก้ไขงาน | [ดูเอกสาร](docs/academic/03-Activity-Diagram.md) |
| **04** | **Class Diagram** | แผนภาพคลาสความสัมพันธ์เชิงโครงสร้างของระบบ | [ดูเอกสาร](docs/academic/04-Domain-Class-Diagram.md) |
| **05** | **Sequence Diagram** | แผนภาพลำดับขั้นตอนการส่งงาน, ตรวจงาน, ลูปแก้ไขงาน และการอนุมัติ | [ดูเอกสาร](docs/academic/05-Sequence-Diagrams.md) |
| **06** | **Entity Relationship Diagram (ERD)** | แผนภาพความสัมพันธ์ของข้อมูลแบบ Relational (Crow's Foot) | [ดูเอกสาร](docs/academic/06-Entity-Relationship-Diagram.md) |
| **07** | **Data Dictionary** | พจนานุกรมข้อมูลรายละเอียดทุกตารางและคอลัมน์ | [ดูเอกสาร](docs/academic/07-Data-Dictionary.md) |
| **08** | **Figma Design Tokens & Wireframes** | โทเค็นสีและโครงสร้างหน้าจอของระบบ | [ดูเอกสาร](docs/academic/08-Figma-Design-Tokens-And-Wireframes.md) |
| **09** | **Deployment Diagram** | แผนภาพสถาปัตยกรรมการติดตั้งระบบแบบ 3-Tier | [ดูเอกสาร](docs/academic/09-Deployment-Diagram.md) |
| **10** | **Workflow Diagram (BPMN)** | แผนภาพกระบวนการทางธุรกิจในการบริหารจัดการผลิตสื่อ | [ดูเอกสาร](docs/academic/10-Workflow-Diagram.md) |
| **11** | **Test Plan & Manual Test Cases** | แผนการทดสอบและตารางกรณีทดสอบแบบ Manual Testing | [ดูเอกสาร](docs/academic/11-Test-Plan-And-Manual-Test-Cases.md) |
| **12** | **Automated Testing (Robot Framework)** | สถาปัตยกรรมและผลการทดสอบอัตโนมัติด้วย Robot Framework | [ดูเอกสาร](docs/academic/12-Automated-Testing-Robot-Framework.md) |

---

## 4. เทคโนโลยีที่ใช้ในการพัฒนา (Technology Stack)

- **Mobile Application**: React Native (JavaScript)
- **Admin Web**: Next.js / React (JavaScript .jsx)
- **Backend API**: Node.js, Express.js, WebSocket (`ws`)
- **Database**: MongoDB (Mongoose)
- **Automated Testing**: Robot Framework + RequestsLibrary

---

## 5. วิธีการติดตั้งและทดสอบระบบ (Quickstart Guide)

### 5.1 เริ่มต้นรัน Backend API (Port 5000)
```bash
cd master/backend
npm install
npm run seed       # สร้างข้อมูลจำลองเริ่มต้น (หรือ npm run db:import เพื่อนำเข้าจาก dump)
npm run dev        # รันเซิร์ฟเวอร์พอร์ต 5000
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
npm start          # เริ่มต้น Metro Bundler
npm run android    # รันลงใน Android Emulator
```

---

## 6. บัญชีสำหรับทดสอบระบบ (Test Accounts)

ข้อมูลบัญชีเริ่มต้นที่ถูกสร้างโดย `npm run seed`:

| บทบาท (Role) | อีเมล (Email) | รหัสผ่าน (Password) | ช่องทางใช้งาน |
| :--- | :--- | :--- | :--- |
| **Manager** | `manager@studio.com` | `123456` | Mobile App |
| **Member** | `member@studio.com` | `123456` | Mobile App |
| **Admin** | `admin@studio.com` | `123456` | Admin Web |

---

## 7. โครงสร้างโฟลเดอร์โปรเจกต์ (Project Structure)

```text
Content-Management-System/
├── docs/                                   # เอกสารวิชาการ รูปภาพ และบันทึกประวัติการพัฒนา
│   ├── academic/                           # เอกสารวิเคราะห์และออกแบบระบบ (01 - 12)
│   │   ├── diagrams/                       # ไฟล์แผนภาพต้นฉบับ (.drawio) และรูปภาพ (.png)
│   │   ├── reports/                        # เอกสารรายงานโครงงานฉบับสมบูรณ์ (.docx)
│   │   └── spreadsheets/                   # ตารางกรณีทดสอบและฐานข้อมูล (.xlsx)
│   ├── learning/                           # บทเรียนโครงสร้างโค้ด Backend (Lesson 01 - 03)
│   ├── master/                             # คู่มือสถาปัตยกรรมและการทำงานของระบบภายใน
│   ├── screenshots/                        # ภาพหน้าจอการใช้งานจริง
│   │   ├── admin-web/                      # ภาพหน้าจอ Admin Web (12 หน้าจอ)
│   │   └── mobile/                         # ภาพหน้าจอ Mobile Application (17 หน้าจอ)
│   ├── year-4-capstone/                    # พิมพ์เขียวการออกแบบสำหรับต่อยอดในอนาคต
│   ├── PROJECT-DEVELOPMENT-LOG.md          # บันทึกประวัติการพัฒนาระบบ (Markdown)
│   └── PROJECT-DEVELOPMENT-LOG.html        # บันทึกประวัติการพัฒนาระบบ (Interactive Web)
│
├── master/                                 # ซอร์สโค้ดระบบหลักที่ใช้งานจริง
│   ├── backend/                            # Express.js REST API, WebSocket & MongoDB Dump
│   ├── admin-web/                          # Next.js 14 Admin Web Portal
│   ├── mobile-app/                         # React Native Mobile Application
│   └── database/                           # โครงสร้างอ้างอิงฐานข้อมูล (schema.sql)
│
├── tests/                                  # ชุดการทดสอบระบบอัตโนมัติ
│   └── robot/                              # Robot Framework Test Suites & Keywords
│       ├── resources/                      # Reusable Keywords & Variables
│       └── testcases/                      # 5 ชุดการทดสอบอัตโนมัติ (01 - 05)
│
└── tools/                                  # สคริปต์และเครื่องมือช่วยงานอัตโนมัติ
    ├── excel/                              # สคริปต์สร้างตารางกรณีทดสอบและส่งออกฐานข้อมูลเป็น Excel
    ├── screenshots/                        # สคริปต์แคปหน้าจอ Admin Web อัตโนมัติ (Selenium)
    ├── tunnel/                             # สคริปต์และไบนารี Cloudflare Tunnel
    └── word/                               # สคริปต์อัปเดตเอกสาร Word รายงานโครงงานอัตโนมัติ
```

---
<sub>จัดทำเพื่อการศึกษาและส่งมอบตามข้อกำหนดของรายวิชา • 2026</sub>

