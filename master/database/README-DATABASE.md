# ระบบฐานข้อมูลพกพาสำหรับย้ายเครื่อง (Portable Database & Auto-Sync)

โฟลเดอร์ `master/database/` เก็บชุดฐานข้อมูล MongoDB (`content_management`) แบบพกพาสำหรับนำไปรันต่อบนเครื่องอื่นได้ทันที พร้อมระบบตรวจสอบข้อมูลภายในอัตโนมัติ (Deep Internal Data Inspection), Auto-Import และ Real-Time Auto-Export

---

## 1. โครงสร้างไฟล์ภายใน `master/database/`

```text
master/database/
├── mongodb-dump/                           # ไฟล์ข้อมูลหลักสำหรับ Auto-Import / Auto-Export
│   ├── full_database_dump.json             # ไฟล์รวมฐานข้อมูลและข้อมูลภายในทั้งหมดในก้อนเดียว
│   ├── export_summary.json                 # สรุปจำนวนเรคคอร์ด, SHA-256 Hash รายตาราง และเวลาอัปเดตล่าสุด
│   ├── users.json                          # ข้อมูลผู้ใช้และรหัสผ่าน (bcrypt hash)
│   ├── teams.json                          # ข้อมูลทีมและรหัสเข้าร่วมทีม (joinCode)
│   ├── contents.json                       # ข้อมูลชิ้นงานหลัก + versions[] + reviewHistory[]
│   ├── tasks.json                          # ข้อมูลงานย่อย + ความคืบหน้า + โน้ตสั่งแก้
│   ├── ideas.json                          # ข้อมูลกระดานไอเดีย
│   └── teamactivities.json                 # ข้อมูลประวัติกิจกรรมและ Audit Logs
│
├── compass-import/                         # ไฟล์ Extended JSON ($oid, $date) สำหรับนำเข้าผ่านโปรแกรม MongoDB Compass
│   ├── users.compass.json
│   ├── teams.compass.json
│   ├── contents.compass.json
│   ├── tasks.compass.json
│   ├── ideas.compass.json
│   └── teamactivities.compass.json
│
├── backups/                                # โฟลเดอร์สำรองข้อมูลเดิมในเครื่องอัตโนมัติก่อนการซิงค์ทับ
├── import-database.bat                     # ดับเบิลคลิกเพื่อตรวจสอบฐานข้อมูลในเครื่องและนำเข้าข้อมูล
├── export-database.bat                     # ดับเบิลคลิกเพื่อดึงข้อมูลล่าสุดจากเครื่องออกมาเป็นไฟล์พกพาทันที
├── schema.sql                              # โครงสร้างตารางอ้างอิงเชิงความสัมพันธ์
└── README-DATABASE.md                      # คู่มือการใช้งาน
```

---

## 2. การทำงานอัตโนมัติ (Auto-Check, Auto-Import & Auto-Export)

### 2.1 ตอนเปิดรันเซิร์ฟเวอร์ Backend (`npm run dev` หรือ `npm start`)
ทุกครั้งที่รัน Backend ระบบจะตรวจสอบฐานข้อมูล `content_management` และ **ข้อมูลภายในทุก Document / ทุก Field** ของทั้ง 6 ตารางเทียบกับไฟล์ใน `master/database/mongodb-dump/` โดยอัตโนมัติ:
1. **เครื่องใหม่ที่ยังไม่มีฐานข้อมูล (`EMPTY_DB`):**
   - ระบบนำเข้าข้อมูลทั้ง 6 ตาราง แปลง `ObjectId` / `Date` ทุกจุด และสร้าง Index (`syncIndexes()`) ให้พร้อมใช้งานทันทีโดยไม่ต้องรันคำสั่งแยก
2. **มีฐานข้อมูลและข้อมูลภายในตรงกัน 100% (`IDENTICAL`):**
   - ระบบตรวจเช็ค SHA-256 Hash รายตารางแล้วแจ้งว่าข้อมูลตรงกัน 100% ข้ามการนำเข้าซ้ำ และพร้อมใช้งานทันที
3. **มีฐานข้อมูลอยู่แล้วแต่ข้อมูลภายในต่างกัน (`DIFFERENT`):**
   - ระบบเปรียบเทียบเวลาอัปเดตล่าสุดของเรคคอร์ดภายใน (`updatedAt`):
     - หากไฟล์ใน `mongodb-dump/` ใหม่กว่า (เช่น เพิ่งดึงโค้ดมาจากอีกเครื่อง) ระบบจะสำรองข้อมูลเดิมในเครื่องไว้ที่ `master/database/backups/` แล้วนำเข้าข้อมูลชุดใหม่ให้อัตโนมัติ
     - หากข้อมูลในเครื่องใหม่กว่าไฟล์ ระบบจะส่งออกข้อมูลในเครื่องมาอัปเดตไฟล์ใน `mongodb-dump/` และ `compass-import/` ทันที

### 2.2 ระหว่างใช้งานระบบ (Real-Time Auto-Export)
- ทุกครั้งที่มีการเพิ่ม แก้ไข หรือลบข้อมูลผ่าน API (`POST`, `PUT`, `PATCH`, `DELETE`) รวมถึงเมื่อกดปิดเซิร์ฟเวอร์ (`Ctrl+C`) ระบบจะส่งออกข้อมูลล่าสุดลงไฟล์ใน `master/database/mongodb-dump/` และ `master/database/compass-import/` อัตโนมัติทันที

---

## 3. การใช้งานผ่านไฟล์ `.bat` หรือคำสั่ง CLI

### วิธีที่ 1: ดับเบิลคลิกไฟล์ `.bat` (สำหรับ Windows)
- **`import-database.bat`**: ตรวจสอบว่าเครื่องมีฐานข้อมูล `content_management` และข้อมูลภายในตรงกับไฟล์หรือไม่ แสดงตารางเปรียบเทียบรายตาราง และให้เลือกนำเข้าหรือสำรองข้อมูลเดิมก่อนนำเข้า
- **`export-database.bat`**: ดึงข้อมูลล่าสุดจากฐานข้อมูลในเครื่องออกมาบันทึกเป็นไฟล์ใน `mongodb-dump/` และ `compass-import/` ทันที

### วิธีที่ 2: รันผ่านคำสั่ง npm ในโฟลเดอร์ `master/backend`
```bash
# ตรวจสอบและเปรียบเทียบข้อมูลภายในเครื่องกับไฟล์พกพา (ไม่แก้ไขข้อมูล)
npm run db:check

# นำเข้าฐานข้อมูลพร้อมตรวจสอบข้อมูลเดิมในเครื่อง
npm run db:import

# ส่งออกฐานข้อมูลจากเครื่องลงไฟล์พกพา
npm run db:export

# ล้างข้อมูลขยะจากการรันเทสอัตโนมัติ (Robot Test) แล้วส่งออกไฟล์สะอาด
npm run db:clean
```

---

## 4. บัญชีผู้ใช้งานภายในฐานข้อมูล (รหัสผ่านทุกบัญชี: `123456`)

| บทบาท (Role) | อีเมล (Email) | ชื่อผู้ใช้ (Username) | ตำแหน่ง (Position) | ทีม (Team) |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@studio.com` | `somchai_admin` | Other | - |
| **MANAGER** | `manager@studio.com` | `somsri_manager` | Production Manager | Content Team A (`TEAM-A`) |
| **MEMBER** | `member@studio.com` | `john_editor` | Video Editor | Content Team A (`TEAM-A`) |
| **MEMBER** | `jane@studio.com` | `jane_writer` | Script Writer | Content Team A (`TEAM-A`) |
| **MEMBER** | `mike@studio.com` | `mike_designer` | Graphic Designer | Content Team A (`TEAM-A`) |
| **MEMBER** | `uto@cms.com` | `uto` | Content Creator | Content Team A (`TEAM-A`) |
| **MEMBER** | `outsider@studio.com` | `bob_outsider` | Content Creator | Content Team B (`TEAM-B`) |

