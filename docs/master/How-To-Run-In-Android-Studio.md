# How To Run Mobile App in Android Studio (คู่มือการรันแอปด้วย Android Studio)

เอกสารนี้อธิบายขั้นตอนการเปิดโปรเจกต์ React Native และรันแอปบน **Android Studio** ผ่าน Emulator (เครื่องจำลอง) หรือสมาร์ตโฟนจริง

---

## 1. การเปิดโปรเจกต์ใน Android Studio
> ⚠️ **ข้อสำคัญมาก**: เวลาเปิดโปรเจกต์ใน Android Studio **อย่าเลือกโฟลเดอร์ root รวม** ให้เลือกเฉพาะโฟลเดอร์ `android/` เท่านั้น!

1. เปิดโปรแกรม **Android Studio**
2. คลิก **Open** (หรือไปที่เมนู `File > Open...`)
3. เลือกไปที่โฟลเดอร์:
   ```text
   D:\VsCode\Project\Content-Management-System\mobile-app\android
   ```
4. กด **OK** แล้วรอให้ Android Studio ทำการ **Gradle Sync** และดาวน์โหลด Dependencies ของฝั่ง Android ให้เสร็จสมบูรณ์ (สังเกตแถบดาวน์โหลดมุมขวาล่าง)

---

## 2. การเปิดเครื่องจำลอง (Android Emulator)
1. ใน Android Studio ให้คลิกที่ไอคอน **Device Manager** (แถบขวาบน หรือรูปมือถือข้างๆ ปุ่ม Play)
2. หากมี Device อยู่แล้ว ให้คลิกปุ่ม **Play (สามเหลี่ยมสีเขียว)** เพื่อเปิดเครื่องจำลองขึ้นมา
3. หากยังไม่มีเครื่องจำลอง ให้กด **Create Device** (แนะนำเลือก Pixel 7 หรือ Pixel 8 และเลือก Android 13 หรือ 14) แล้วรอให้เครื่องบูตขึ้นมาจนถึงหน้าจอหลัก

---

## 3. การรันเซิร์ฟเวอร์ JavaScript (Metro Bundler)
ก่อนที่จะกดรันแอปใน Android Studio เครื่องคอมพิวเตอร์จำเป็นต้องเปิดตัวจ่ายโค้ด JavaScript (Metro) เสียก่อน:

1. เปิด Terminal ใน VS Code หรือ Command Prompt
2. เข้าไปที่โฟลเดอร์ `mobile-app`:
   ```bash
   cd D:\VsCode\Project\Content-Management-System\mobile-app
   ```
3. พิมพ์คำสั่งเริ่มเซิร์ฟเวอร์:
   ```bash
   npm start
   ```
   *(หน้าต่างนี้ต้องเปิดค้างไว้ตลอดเวลาที่ทดสอบแอป)*

---

## 4. สั่งรันแอปพลิเคชันขึ้นสู่หน้าจอ
คุณสามารถเลือกทำได้ 2 วิธี:

### วิธีที่ 1: กดปุ่ม Run ใน Android Studio (ง่ายที่สุด)
- ที่แถบด้านบนของ Android Studio ตรวจสอบให้แน่ใจว่า:
  - ช่อง Target เลือกเป็น **`app`**
  - ช่อง Device เลือกเครื่องจำลองที่เปิดอยู่
- คลิกปุ่ม **Run (รูปสามเหลี่ยมสีเขียว ▶)** หรือกดปุ่มลัด `Shift + F10`
- Android Studio จะ Build ไฟล์ `.apk` แล้วติดตั้งลงบนหน้าจอ Emulator ให้อัตโนมัติ!

### วิธีที่ 2: รันผ่านคำสั่ง Terminal
- เปิดอีกหนึ่ง Terminal ในโฟลเดอร์ `mobile-app` แล้วพิมพ์:
  ```bash
  npx react-native run-android
  ```

---

## 5. การเชื่อมต่อกับ Backend (API) บน Android Emulator
- บน Android Emulator หากเราพิมพ์ `localhost:5000` มันจะหมายถึงตัวมือถือเอง ไม่ใช่คอมพิวเตอร์ของคุณ
- **เราได้ตั้งค่าในไฟล์ `src/services/api.js` ไว้ให้เรียบร้อยแล้ว**: 
  - ระบบจะชี้ไปที่ **`http://10.0.2.2:5000/api`** โดยอัตโนมัติ ซึ่งเป็น IP พิเศษที่ Android Emulator ใช้ติดต่อกับเครื่องคอมพิวเตอร์ของคุณได้ทันที!
  - อย่าลืมเปิดเซิร์ฟเวอร์ Backend ค้างไว้ด้วยนะครับ (`cd backend && npm run dev`)

---

## 6. การทดสอบในแอปเมื่อเปิดขึ้นมา
1. **ทดสอบ Login**:
   - ลองกดปุ่ม **👔 Manager** แล้วกดเข้าสู่ระบบ -> จะเปิดเข้าสู่หน้า Dashboard ผู้จัดการ มีคิว Review คอนเทนต์
   - ลองกดออกจากระบบ แล้วกดปุ่ม **🎬 Member** -> จะเปิดเข้าสู่หน้า Tasks ของทีมงานผลิต มีปุ่ม Start Task และกล่องแนบลิงก์ผลงาน
2. **ทดสอบ Legal Check**:
   - ในหน้า Manager ลองกดเมนู `Legal Check` เพื่อดู Checklist 5 ข้อและลองติ๊กถูกดู

