# 8. Figma Design Tokens & UI Architecture Guide

เอกสารนี้ระบุ **Design Tokens (ชุดตัวแปรงานดีไซน์)**, **Hierarchy ของ Component**, และ **Wireframe Specifications** สำหรับใช้เป็นพิมพ์เขียวในการสร้าง Mockup และ Interactive Prototype บน Figma 1:1 ให้สอดคล้องกับแนวคิด **"Modern + Simple + Professional"** และตรงกับโค้ดจริงใน React Native และ Next.js

---

## 1. Color Palette Tokens (รหัสสีมาตรฐานระบบ)

แนวทางการใช้สีหลัก: **Blue / Navy / White / Gray** เรียบง่าย สะอาดตา และเน้นสีสถานะเฉพาะจุดที่เป็น Badge / Pill / Indicator Dot โดยไม่ระบายสีทั้งการ์ดเพื่อคงความสบายตา

### Primary Brand & Neutral System
- **Primary Accent (`#2563EB`)**: น้ำเงิน ใช้กับปุ่มหลัก (CTA), Active Navigation Tabs, สัญลักษณ์สำคัญ
- **Primary Dark / Navy (`#0F172A`)**: ตัวอักษรหลัก (Headings), หัวข้อการ์ด, บัญชีผู้ใช้งาน
- **Background (`#F8FAFC`)**: สีพื้นหลังของแอปพลิเคชัน (Light Canvas)
- **Surface / Card (`#FFFFFF`)**: พื้นหลังการ์ดงาน, Container, Popover, Modals
- **Secondary Text (`#64748B`)**: ตัวอักษรคำอธิบายย่อย, วันที่, ตำแหน่งงาน
- **Muted Text (`#94A3B8`)**: ข้อความ Placeholder, ตัวบ่งชี้รอง
- **Border (`#E2E8F0`)**: เส้นแบ่งส่วน และขอบการ์ดงาน

### 6-State Semantic Status Tokens (Badge / Pill / Indicator)
| สถานะงาน | Background Token | Text / Icon Token | Border Token | การนำไปใช้ |
| :--- | :--- | :--- | :--- | :--- |
| **IN_PROGRESS** (กำลังดำเนินการ) | `#EFF6FF` | `#2563EB` | `#BFDBFE` | งานที่กำลังผลิต, ตัดต่อ, บันทึกเทป |
| **REVIEW / PENDING** (รอตรวจทาน) | `#FEF9C3` | `#CA8A04` | `#FDE047` | งานที่ส่งตรวจ รอ Manager อนุมัติ |
| **REVISION** (ส่งกลับแก้ไข) | `#FFEDD5` | `#EA580C` | `#FDBA74` | งานที่มี Feedback ให้แก้ไข (ต้องเด่น) |
| **APPROVED / PUBLISHED** (อนุมัติแล้ว) | `#DCFCE7` | `#16A34A` | `#86EFAC` | งานที่ผ่านการตรวจ และพร้อมเผยแพร่ |
| **OVERDUE / URGENT** (เร่งด่วน/เกินกำหนด) | `#FEE2E2` | `#DC2626` | `#FCA5A5` | ใกล้ครบกำหนด หรือส่งงานช้ากว่ากำหนด |
| **NOT_STARTED / TODO** (รอดำเนินการ) | `#F1F5F9` | `#64748B` | `#CBD5E1` | งานที่ยังไม่ได้เริ่มทำ หรือรอรับงาน |

### Platform Identity Tokens
- **YouTube**: `#DC2626` (Red), Light Fill `#FEE2E2`
- **TikTok**: `#000000` (Charcoal), Light Fill `#F1F5F9`
- **Instagram**: `#C026D3` (Fuchsia), Light Fill `#FDF4FF`

---

## 2. Visual Hierarchy & Highlight System

หลักการจัดลำดับสายตา: **"อะไรที่ผู้ใช้ต้องจัดการก่อน ต้องเด่นที่สุด"**

```
Priority 1: [URGENT / REVISION] -> Highlight เด่นชัดด้านบนสุด (Action Required Section)
Priority 2: [REVIEW / IN_PROGRESS] -> คิวตรวจงาน และความคืบหน้าของงานปัจจุบัน
Priority 3: [TEAM PROGRESS & PIPELINE] -> ภาพรวมของทีม สมาชิก และกิจกรรมทั่วไป
```

1. **Section "งานที่ต้องดำเนินการ (Action Required)"**:
   - อยู่ด้านบนสุดเสมอ
   - รวมงาน `REVISION` (มีกล่อง Manager Feedback ชัดเจน) และงานเร่งด่วน/เกินกำหนด
2. **Section "งานทั้งหมดที่ได้รับมอบหมาย / รายการผลิตทั้งหมด"**:
   - เรียงลำดับงานตาม Priority และวันครบกำหนด
3. **Clean Presentation**:
   - ไม่ใช้อีโมจิที่ไม่จำเป็นในหัวข้อหรือปุ่ม
   - ใช้ Pill Badge และ Indicator Dot เล็กๆ แทนการถมสีการ์ดทั้งใบ
   - Touch Target มาตรฐานขั้นต่ำ `44px` พร้อม `borderRadius: 10px`

---

## 3. Typography Scale (ขนาดและน้ำหนักตัวอักษร)

ระบบใช้แบบอักษร **Inter / SF Pro Display / Sukhumvit Set**:

| Token Name | Font Size | Line Height | Weight | การนำไปใช้ใน Figma |
| :--- | :--- | :--- | :--- | :--- |
| `Heading-XL` | 24px | 32px | Bold (700) | ชื่อหน้าจอหลัก (Screen Titles, App Brand) |
| `Heading-LG` | 18px | 24px | Bold (700) | ชื่อทีม, หัวข้อ Dashboard |
| `Heading-MD` | 15px | 20px | SemiBold (600) | ชื่อชิ้นงานคอนเทนต์, หัวข้อ Section |
| `Body-Regular`| 13px | 18px | Regular (400) | คำอธิบายงาน (Task Description, Brief) |
| `Body-Small` | 11px | 16px | Medium (500) | วันครบกำหนด (Due Date), ผู้รับผิดชอบ (Assignee) |
| `Badge-Text` | 11px | 14px | SemiBold (600) | ข้อความในแท็กสถานะ (Status Pill), แท็กสมาชิก |

---

## 4. Spacing & Radius Tokens

- **Grid Base**: 8-point Grid System (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`)
- **Card Padding**: `16px` ด้านใน, `12px` ระยะห่างระหว่างการ์ด
- **Border Radius**:
  - `Radius-SM`: `6px` (Status Badges, Pill Tags)
  - `Radius-MD`: `10px` (Input Fields, Primary Buttons, Action Items)
  - `Radius-LG`: `14px` (Task Cards, Metric Cards, Modals)
  - `Radius-Full`: `999px` (Avatars, Circular Buttons)
- **Minimum Touch Target**: ความสูงขั้นต่ำ `44px` สำหรับปุ่มกดหลักตาม Apple HIG & Material Design

---

## 5. Mobile App Screen Architecture

### 👑 Flow ผู้จัดการ (Manager Flow - 5 Tabs / Screens)
1. **Screen M1: Pipeline Dashboard (`/manager/dashboard`)**
   - **Action Required Queue**: คิวงานที่รอตรวจสอบ (`REVIEW`) และงานที่สั่งแก้ไข (`REVISION`)
   - **Metrics Strip**: สรุปยอด 5 สถิติ (ทั้งหมด, รอดำเนินการ, กำลังผลิต, รอตรวจ, อนุมัติ)
   - **Full Pipeline Stack**: การ์ดงานผลิตทั้งหมด พร้อมปุ่ม `[ตรวจชิ้นงาน]`, `[ส่งกลับแก้ไข]`, `[อนุมัติ]`
2. **Screen M2: Team Overview (`/manager/team`)**
   - **Header & Metric**: ชื่อทีม, จำนวนสมาชิก, แถบความคืบหน้าทีมภาพรวม (`#2563EB`)
   - **Real-Time Members List**: แสดงรายชื่อสมาชิก สถานะการทำงาน (`กำลังทำงาน`, `รอตรวจงาน`, `พร้อมรับงาน`) ด้วย Indicator Dot
   - **Team Tasks Pipeline**: งานทั้งหมดของทีม และผู้รับผิดชอบแต่ละคน
   - **Team Activity Feed**: ประวัติและกิจกรรมล่าสุดของทีม
3. **Screen M3: Legal Compliance & Quality Audit (`/manager/legal-audit`)**
   - การตรวจเช็ก 3 มิติ: ลิขสิทธิ์เสียง, ฟุตเทจภาพ, ข้อกำหนดเนื้อหา
   - กล่องข้อคิดเห็นและคำแนะนำเจาะจง
   - ปุ่ม `[ส่งกลับแก้ไขพร้อมคอมเมนต์]` และ `[อนุมัติชิ้นงาน (Approve)]`
4. **Screen M4: Idea Brainstorming (`/manager/ideas`)**
   - กระดานเสนอไอเดีย, ระบบนับคะแนนโหวต (Upvotes), ปุ่มเสนอไอเดียใหม่
5. **Screen M5: Profile & Settings (`/profile`)**
   - ข้อมูลบัญชี, สวิตช์โหมดมืด (Dark Mode), ปุ่มออกจากระบบ

---

### 🎨 Flow สมาชิกฝ่ายสร้างสรรค์ (Member Flow - 4 Tabs / Screens)
1. **Screen C1: Team Overview (`/member/team`)**
   - สมาชิกสามารถเห็นภาพรวมทีม งานของเพื่อนร่วมทีม สถานะงาน และกิจกรรมล่าสุด
   - สมาชิกอ่านได้อย่างเดียว (Read-only) ไม่สามารถแก้ไขงานของผู้อื่นได้
2. **Screen C2: Member Tasks Workbench (`/member/tasks`)**
   - **Section 1 (Action Required)**: งานที่ต้องแก้ไข (`REVISION`) พร้อมกล่องคำแนะนำจาก Manager เด่นชัด และงานที่ใกล้ครบกำหนด
   - **Section 2 (งานทั้งหมดที่ได้รับมอบหมาย)**: งานของตนเองทั้งหมด
   - ฟิลด์ส่งงาน: แนบ URL ไฟล์งาน (Google Drive / Frame.io) และปุ่ม `[ส่งตรวจงาน]`
3. **Screen C3: Idea Brainstorming (`/member/ideas`)**
   - เสนอไอเดียคอนเทนต์ใหม่เข้าสู่คลัง และร่วมโหวตสนับสนุนไอเดียของทีม
4. **Screen C4: Member Profile (`/member/profile`)**
   - ข้อมูลส่วนตัว สังกัดทีม และการตั้งค่าธีม
