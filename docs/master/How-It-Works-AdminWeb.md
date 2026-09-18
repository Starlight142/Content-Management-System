# How It Works: Admin Web (การทำงานของ Next.js)

โปรเจกต์นี้เราใช้ **Next.js (App Router)** ซึ่งเป็นเฟรมเวิร์คยอดนิยมของ React สำหรับสร้างเว็บแบบสมัยใหม่

## 1. App Router (`src/app/`)
Next.js เวอร์ชั่นใหม่จะใช้ระบบ **App Router** ซึ่งเป็นการสร้างหน้าเว็บตามโครงสร้างโฟลเดอร์ เช่น:
- สร้างไฟล์ `src/app/page.tsx` = ได้หน้า `http://localhost:3000/`
- สร้างไฟล์ `src/app/users/page.tsx` = ได้หน้า `http://localhost:3000/users`

## 2. โครงสร้าง Layout หลัก (`layout.tsx`)
ในไฟล์ `src/app/layout.tsx` จะเป็นหน้ากากหลัก (Master Layout) ของทั้งเว็บไซต์ 
สิ่งใดก็ตามที่เขียนไว้ในไฟล์นี้ จะ "ปรากฏอยู่ในทุกๆ หน้า" ของเว็บ

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex h-screen">
        <Sidebar /> {/* 👈 เมนูด้านซ้าย จะแสดงทุกหน้า */}
        <div className="flex-1 flex flex-col">
          <Topbar /> {/* 👈 แถบด้านบน จะแสดงทุกหน้า */}
          <main className="p-8">
            {children} {/* 👈 เนื้อหาของหน้าเพจต่างๆ จะมาโผล่ตรงนี้ */}
          </main>
        </div>
      </body>
    </html>
  );
}
```
**`{children}` คืออะไร?**
หากคุณเปิดไปที่หน้า `http://localhost:3000/` ตัวแปร `{children}` จะถูกแทนที่ด้วยโค้ดจากไฟล์ `src/app/page.tsx` 
นี่คือเทคนิคที่ทำให้เราไม่ต้องเขียนโค้ด Sidebar และ Topbar ซ้ำๆ ในทุกๆ หน้า

## 3. TailwindCSS (การแต่งสีและสไตล์)
คุณจะเห็น Class แปลกๆ เช่น `className="flex flex-col bg-slate-900 text-white"` 
นี่คือระบบ TailwindCSS ที่ให้เราพิมพ์คำสั่งตกแต่ง CSS ลงไปใน HTML ได้เลย
- `flex`: จัด Layout แบบ Flexbox
- `bg-slate-900`: พื้นหลังสีเทาเข้ม
- `text-white`: ตัวหนังสือสีขาว
- `p-6`: ย่อมาจาก padding: 1.5rem (การเว้นระยะขอบด้านใน)

## 4. UI Icons (Lucide-React)
เราใช้ไลบรารี `lucide-react` เพื่อให้ได้ไอคอนที่คมชัดและปรับขนาดเปลี่ยนสีได้ง่าย 
เช่น `<Users size={24} className="text-blue-500" />` จะแสดงรูปไอคอนกลุ่มคนสีฟ้าออกมา

