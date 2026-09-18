# 8. Figma Design Tokens & UI Architecture Guide

เอกสารนี้ระบุ **Design Tokens (ชุดตัวแปรงานดีไซน์)**, **Hierarchy ของ Component**, และ **Wireframe Specifications** สำหรับใช้เป็นพิมพ์เขียวในการสร้าง Mockup และ Interactive Prototype บน Figma 1:1 ให้ตรงกับโค้ดจริงใน React Native และ Next.js

---

## 🎨 1. Color Palette Tokens (รหัสสีมาตรฐานระบบ)

### Primary Brand (Slate & Indigo Studio Tone)
- **Primary 900**: `#0F172A` (Text Headings, Dark Nav Bar)
- **Primary 700**: `#334155` (Secondary Headings, Card Borders)
- **Primary 600 (Accent)**: `#4F46E5` / `#2563EB` (Primary CTA Buttons, Active Tabs)
- **Primary 50**: `#F8FAFC` (App Background, Light Fill)

### Status & State Semantic Colors
- **PLANNING (Slate)**: Background `#F1F5F9`, Text `#475569`, Border `#CBD5E1`
- **PRODUCTION (Amber)**: Background `#FEF3C7`, Text `#B45309`, Border `#FDE68A`
- **REVIEW (Blue)**: Background `#EFF6FF`, Text `#1D4ED8`, Border `#BFDBFE`
- **REVISION (Rose / Orange)**: Background `#FFF1F2`, Text `#E11D48`, Border `#FECDD3`
- **APPROVED / PUBLISHED (Emerald)**: Background `#ECFDF5`, Text `#047857`, Border `#A7F3D0`

### Platform Identity Colors
- **YouTube**: `#DC2626` (Red), Light BG `#FEE2E2`
- **TikTok**: `#000000` (Dark Charcoal), Light BG `#F1F5F9`
- **Instagram**: `#C026D3` (Fuchsia / Gradient), Light BG `#FDF4FF`

---

## 🔤 2. Typography Scale (ขนาดและน้ำหนักตัวอักษร)

ระบบใช้ฟอนต์ **Inter / SF Pro Display / Sukhumvit Set** สำหรับ Mobile & Web:

| Token Name | Font Size | Line Height | Weight | การนำไปใช้ใน Figma |
| :--- | :--- | :--- | :--- | :--- |
| `Heading-XL` | 24px | 32px | Bold (700) | ชื่อหน้าจอหลัก (Screen Title, Screen Headers) |
| `Heading-LG` | 18px | 24px | SemiBold (600) | ชื่อชิ้นงาน (Content Title, Card Headers) |
| `Heading-MD` | 15px | 20px | SemiBold (600) | หัวข้อย่อยในการ์ด, Section Label |
| `Body-Regular`| 13px | 18px | Regular (400) | คำอธิบายงาน (Task Description, Brief) |
| `Body-Small` | 11px | 16px | Medium (500) | วันที่ (Due Date), ผู้รับผิดชอบ (Assignee) |
| `Badge-Text` | 10px | 14px | Bold (700) | แท็กสถานะ (Status Pill), แท็กแพลตฟอร์ม |

---

## 📏 3. Spacing & Radius Tokens (ระยะขอบและความโค้งมน)

- **Grid Base**: 8-point Grid System (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`)
- **Card Padding**: `16px` ด้านใน, `12px` ระยะห่างระหว่างการ์ด (Gap)
- **Border Radius**:
  - `Radius-SM`: `6px` (Status Badges, Small Tag Buttons)
  - `Radius-MD`: `10px` (Input Fields, Primary Buttons)
  - `Radius-LG`: `14px` (Task Cards, Content Cards, Modals)
  - `Radius-Full`: `999px` (Pills, Avatar Circles)
- **Elevation / Shadow**:
  - `Card Shadow`: `Y: 2px`, `Blur: 6px`, `Color: rgba(15, 23, 42, 0.06)`

---

## 📱 4. Mobile App Screen Architecture (ผังหน้าจอสำหรับขึ้น Figma)

### 👑 Flow ผู้จัดการ (Manager Flow - 4 Main Screens)
1. **Screen M1: Pipeline Dashboard (`/manager/dashboard`)**
   - **Header**: Avatar + Studio Name + Badge แจ้งสถานะเชื่อมต่อ MongoDB
   - **Metrics Strip**: การ์ดสรุปยอด 4 ช่อง (All, Reviewing, Revisions, Published)
   - **Lifecycle Stepper**: ตัวบอกเฟส 5 ขั้นตอน (Planning $\rightarrow$ Production $\rightarrow$ Review $\rightarrow$ Approved $\rightarrow$ Published)
   - **Segmented Filter Bar**: แท็บฟิลเตอร์สถานะ (ทั้งหมด, รอตรวจ, สั่งแก้, อนุมัติ)
   - **Content Card Stack**:
     - Platform Tag (YouTube / TikTok)
     - Content Title & Brief
     - Assignee & Due Date
     - Quick Action Buttons: `[⚖️ Audit Legal]` `[Approve]` `[Revision]`
2. **Screen M2: Legal & PDPA Audit Screen (`/manager/legal-audit`)**
   - **Header**: Back Button + Title "Legal Compliance Audit"
   - **Audit Target Banner**: ชื่อคลิปที่กำลังตรวจ พร้อม Platform Badge
   - **Interactive Checklist (5 Cards)**:
     1. Music Licensing (Commercial / Platform Audio Library)
     2. Stock Footage & Imagery (Commercial Rights)
     3. PDPA & Privacy Consent (Face blur / Talent release)
     4. Trademark & Sponsor Disclosure (#PaidPartnership)
     5. Platform Community Guidelines (Safe content)
   - **Gatekeeper Progress Bar**: แสดงเปอร์เซ็นต์ (เช่น 80% / 100%)
   - **Gatekeeper Button**: `[🚀 อนุมัติและพร้อมเผยแพร่]` (Disabled หาก < 5/5 ข้อ)
3. **Screen M3: Idea Pitching Backlog (`/manager/ideas`)**
   - ตารางโหวตไอเดีย, กรองแพลตฟอร์ม, ปุ่ม Approve เพื่อ Convert เป็น Content ในสายการผลิต
4. **Screen M4: Profile & Switch Role (`/profile`)**
   - ข้อมูลผู้ใช้, สถิติงานในสตูดิโอ, ปุ่ม Fast Switch ไปบทบาท Member สำหรับทดสอบ

---

### 🎨 Flow สมาชิกฝ่ายสร้างสรรค์ (Member Flow - 3 Main Screens)
1. **Screen C1: My Tasks Workbench (`/member/tasks`)**
   - **Header**: Greetings "สวัสดีคุณ..." + จำนวนงานที่ค้างส่ง
   - **Task Priority List**:
     - การ์ดงานย่อย (Scripting / Filming / Editing)
     - ระบุ Content แม่ที่สังกัด
     - สถานะงาน (`TODO` / `IN_PROGRESS` / `REVIEW`)
     - กล่องกรอกลิงก์ผลงาน: Input Box วางลิงก์ Google Drive / Frame.io
     - ปุ่ม Action: `[เริ่มทำภารกิจ]` $\rightarrow$ `[🚀 ส่งตรวจงาน]`
2. **Screen C2: Propose Idea Modal / Tab (`/member/propose-idea`)**
   - ฟอร์มเสนอความคิดสร้างสรรค์: ชื่อเรื่อง, แพลตฟอร์ม, รายละเอียด, ปุ่มส่งไอเดีย
3. **Screen C3: Member Profile & Revision Notice (`/member/profile`)**
   - ประวัติงานที่ส่งมอบผ่าน และข้อความติชมจาก Manager ที่สั่งแก้

