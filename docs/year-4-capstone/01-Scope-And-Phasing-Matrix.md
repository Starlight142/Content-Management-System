# 1. Project Scoping & Phasing Matrix (การแบ่งขอบเขตงานปัจจุบัน vs โปรเจกต์ปี 4)

## 📌 บทนำและหลักการแบ่ง Scope (The Engineering Rationale)
การทำโปรเจกต์ขนาดใหญ่ส่งอาจารย์ในระดับมหาวิทยาลัยและต่อยอดสู่ **ปริญญานิพนธ์ระดับปี 4 (Senior Capstone Project)** ต้องมีการวางขอบเขตการทำงาน (Scoping & Phasing) ที่เป็นไปได้จริง (Feasible) และไม่พยายามทำทุกอย่างพร้อมกันจนระบบเละ

> [!IMPORTANT]
> **กฎเหล็กของ Senior Software Engineer**:
> *"Core Workflow ต้องเสถียรและทำงานได้จริง 100% ก่อนที่จะเริ่มทำระบบอัจฉริยะ (Intelligence / AI / External APIs)"*  
> หากสายการผลิตพื้นฐาน (Task $\rightarrow$ Review $\rightarrow$ Approval) ยังมีบั๊ก แล้วรีบไปต่อ API ภายนอกหรือทำ Machine Learning คณะกรรมการจะมองว่าระบบไม่มีรากฐานและสอบตกทันที

---

## 📊 ตารางเปรียบเทียบขอบเขตงาน (Current Semester vs Year 4 Capstone)

| โดเมนการทำงาน | 🎯 Scope ส่งอาจารย์ปัจจุบัน (Phase 1: Core System) | 🚀 Scope ต่อขยายปี 4 (Phase 2 & 3: Intelligence & Advanced) |
| :--- | :--- | :--- |
| **1. Authentication & RBAC** | • Login, JWT Token, Password Hash (bcrypt)<br>• RBAC 3 ระดับ: `ADMIN`, `MANAGER`, `MEMBER`<br>• ห้าม User เลือกระดับสิทธิ์เอง | • OAuth 2.0 (Google, TikTok Login)<br>• Two-Factor Authentication (2FA via SMS/TOTP)<br>• Team Invitation System ผ่าน Email Token |
| **2. Content & Workflow** | • วงจรการผลิต: `PLANNING` $\rightarrow$ `PRODUCTION` $\rightarrow$ `REVIEW` $\leftrightarrows$ `REVISION` $\rightarrow$ `APPROVED` $\rightarrow$ `PUBLISHED`<br>• Finite State Machine Guard ป้องกันการข้ามขั้นตอน<br>• จัดเก็บ Metadata ในฐานข้อมูล | • Automated Content Scheduling (Cron Queue / BullMQ)<br>• Multi-Platform Auto Publishing ผ่าน Webhooks<br>• Custom Workflow Builder (ปรับ State ได้ตามขนาดสตูดิโอ) |
| **3. File & Deliverables** | • จัดเก็บ Submission Link (Google Drive / Frame.io / YouTube Unlisted)<br>• Versioning ประวัติไฟล์งานส่งตรวจ (v1, v2, v3...)<br>• บันทึก Changelog การแก้ไขงาน | • Cloud Object Storage Integration (AWS S3 / Google Cloud Storage)<br>• Presigned URL สำหรับ Direct Upload ผ่าน Mobile App<br>• Video Transcoding & Automated Thumbnail Generation |
| **4. Quality & Compliance** | • 5-Pillar Legal Checklist (เพลง, สต็อก, PDPA, เครื่องหมายการค้า, นโยบายชุมชน)<br>• **Legal Gatekeeper**: บล็อกไม่ให้ Approve/Publish หากไม่ผ่าน 5/5 ข้อ | • AI-Assisted Audio Fingerprinting ตรวจจับลิขสิทธิ์เพลง<br>• Computer Vision Face Blur ตรวจสอบบุคคลภายนอก (PDPA)<br>• OCR Trademark Detection สแกนโลโก้แบรนด์ในภาพ |
| **5. Analytics & Intelligence** | • แบบจำลองข้อมูลสถิติ (Mock/Seed Metric Snapshots: Views, Likes, Comments, Engagement Rate) | • **YouTube Data API v3** เชื่อมต่อ OAuth และ Ingest สถิติจริง<br>• **TikTok Display API** เชื่อมต่อดึงสถิติจริง<br>• Audience Demographics & Retention Graph |
| **6. Recommendation Engine** | • แสดงสถิติเบื้องต้น และตารางแนะนำหัวข้อแบบ Static/Rule-based | • Machine Learning Topic & Keyword Recommendation<br>• Optimal Posting Time Engine (วิเคราะห์เวลาที่ผู้ติดตามตอบรับสูงสุด)<br>• Trend Prediction Model (คำนวณ Trend Growth Score) |
| **7. Database Architecture** | • NoSQL (MongoDB Mongoose) สำหรับ Prototype ที่ยืดหยุ่นสูง<br>• Crow's Foot Relational ERD & Data Dictionary ครบถ้วน | • Migration สู่ Relational Database เต็มรูปแบบ (PostgreSQL + Prisma ORM)<br>• Time-Series Partitioning สำหรับตารางสถิติ Metric |
| **8. Testing & QA** | • Manual Workflow Verification บน Mobile & Web<br>• Positive / Negative State Machine Tests | • Automated Unit Tests & Integration Tests (Jest, Supertest)<br>• End-to-End Testing (Playwright / Detox) |

---

## 🛑 สิ่งที่ไม่ควรทำในเทอมปัจจุบัน (Current Semester Anti-Patterns)
1. **อย่าเพิ่งเขียนโค้ดต่อ API YouTube/TikTok จริง**: เพราะต้องใช้ OAuth App Verification, Client Secret, Quota Limit และ Token Refresh ที่ซับซ้อน จะทำให้เสียเวลาหลักของ Core System
2. **อย่าเพิ่งทำ Machine Learning ในเทอมนี้**: ระบบแนะนำคอนเทนต์ในช่วงแรกให้ใช้ **Rule-based Heuristics** (เช่น คัดเลือกจากหัวข้อที่ Engagement Rate สูงสุดใน 30 วันที่ผ่านมา) ก็เพียงพอสำหรับการสาธิต
3. **อย่าเพิ่งทำ Direct Video File Upload เข้าเซิร์ฟเวอร์ Express ตรงๆ**: การอัปโหลดไฟล์วิดีโอ 4K/1080p ขนาดหลายร้อย MB เข้า Node.js Server จะทำให้ Memory รั่วและเซิร์ฟเวอร์ล่ม ให้ใช้ระบบแนบ Submission Link (Drive/Cloud) ใน Phase 1 ไปก่อน

