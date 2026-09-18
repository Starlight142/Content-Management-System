# How It Works: Mobile App Architecture (โครงสร้างแอปพลิเคชันมือถือ)

เอกสารนี้อธิบายโครงสร้างและการทำงานของ **Mobile App (React Native + JavaScript)** ใน Phase 3 ตามข้อกำหนดที่คุณระบุไว้

---

## 1. เทคโนโลยีที่ใช้
- **React Native 0.87 (Community CLI)**: ติดตั้งผ่านคำสั่ง `npx @react-native-community/cli init` ตามที่คุณสั่งการ
- **JavaScript XML (`.jsx`) ล้วน 100%**: ใช้ไฟล์นามสกุล `.jsx` สำหรับทุก Component เพื่อให้ตรงกับมาตรฐาน React และง่ายต่อการทำความเข้าใจ
- **Node.js & Express API Integration**: เชื่อมต่อไปยัง Backend พอร์ต `5000` ที่เราสร้างไว้ใน Phase 1

---

## 2. โครงสร้างโฟลเดอร์ (Folder Structure)
เราจัดโครงสร้างตามหัวข้อที่ 13 ในสเปคของคุณอย่างแม่นยำ:

```text
mobile-app/
├── App.jsx                     <-- จุดเริ่มต้นของแอป ตรวจสอบ Role เพื่อเลือก Navigator
├── index.js
├── src/
│   ├── features/              <-- แยกตามฟีเจอร์การทำงาน (.jsx)
│   │   ├── auth/LoginScreen.jsx
│   │   ├── dashboard/ManagerDashboard.jsx
│   │   ├── ideas/IdeaListScreen.jsx
│   │   ├── tasks/MemberTaskList.jsx
│   │   ├── legal/LegalChecklistScreen.jsx
│   │   ├── contents/
│   │   ├── workflow/
│   │   ├── calendar/
│   │   ├── review/
│   │   ├── notifications/
│   │   ├── analytics/
│   │   ├── trends/
│   │   ├── recommendations/
│   │   └── profile/
│   │
│   ├── navigation/            <-- การนำทางตามสิทธิ์ของผู้ใช้งาน (.jsx)
│   │   ├── AuthNavigator.jsx
│   │   ├── ManagerNavigator.jsx
│   │   └── MemberNavigator.jsx
│   │
│   ├── services/
│   │   └── api.js             <-- ตัวเชื่อมต่อ REST API กับ Node.js Backend
│   ├── components/
│   ├── hooks/
│   ├── store/
│   ├── utils/
│   └── assets/
```

---

## 3. สถาปัตยกรรมแบ่งสิทธิ์การใช้งาน (Role-Based Navigation)
ในไฟล์ `mobile-app/App.js` จะตรวจสอบสิทธิ์ของผู้ใช้งานทันทีที่ Login:

```javascript
{!currentUser ? (
  <AuthNavigator onLoginSuccess={handleLoginSuccess} />
) : currentUser.role === 'MANAGER' ? (
  <ManagerNavigator user={currentUser} onLogout={handleLogout} />
) : (
  <MemberNavigator user={currentUser} onLogout={handleLogout} />
)}
```

### A. ฝั่งผู้จัดการ (Manager View):
- **Dashboard**: ดูจำนวนงานที่รอ Review และงานที่อนุมัติแล้ว
- **Review Content**: สามารถกด **"อนุมัติ (Approve)"** หรือกด **"ตีกลับแก้ไข (Revision)"** พร้อมส่งโน้ตกลับไปให้ Member
- **Legal Checklist (`LegalChecklistScreen.js`)**: ตรวจสอบเกณฑ์ 5 ข้อ (ลิขสิทธิ์เพลง, PDPA, Trademark ฯลฯ) หากติ๊กไม่ครบทุกข้อ **ระบบจะบล็อกไม่ให้กด Publish**
- **Idea Brainstorming**: อนุมัติไอเดียเพื่อแปลงเป็น Content ในขั้นตอน Planning

### B. ฝั่งทีมงาน (Member View):
- **รายการ Tasks**: แสดงงานที่ได้รับมอบหมาย เช่น ตัดต่อคลิป, อัดเสียง, ทำภาพปก
- **อัปเดตสถานะ**: กด `Start Task` เพื่อเปลี่ยนเป็น `IN_PROGRESS`
- **ส่งไฟล์งาน**: มีกล่องให้กรอกลิงก์ผลงาน (เช่น Google Drive หรือ Cloud URL) แล้วกดส่งตรวจ ระบบจะเปลี่ยนสถานะเป็น `REVIEW` และส่งไปโผล่ที่หน้าจอของ Manager ทันที

---

## 4. การเชื่อมต่อกับ Backend (`src/services/api.js`)
แอปมือถือถูกตั้งค่าให้เรียก Backend ผ่าน IP ที่ถูกต้องอัตโนมัติ:
- **Android Emulator**: ชี้ไปที่ `http://10.0.2.2:5000/api` (IP พิเศษที่ Emulator ใช้คุยกับเครื่องคอมพิวเตอร์ของคุณ)
- **iOS Simulator / เครื่องจริง**: ชี้ไปที่ `http://localhost:5000/api` หรือ IP วงแลนของคุณ
- รองรับการแนบ `Authorization: Bearer <JWT>` อัตโนมัติเมื่อผู้ใช้ Login ผ่าน

---

## 5. วิธีการทดลองรัน Mobile App บนเครื่องของคุณ
1. เปิด Terminal ในโฟลเดอร์ `mobile-app/`:
   ```bash
   cd D:\VsCode\Project\Content-Management-System\mobile-app
   ```
2. เริ่มต้น Metro Bundler:
   ```bash
   npm start
   ```
3. หากคุณมี Android Studio และเปิด Emulator อยู่แล้ว สามารถรัน:
   ```bash
   npm run android
   ```
