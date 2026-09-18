# How It Works: Admin Users Page (หน้าตารางผู้ใช้)

เอกสารนี้อธิบายการทำงานของไฟล์ `admin-web/src/app/users/page.tsx` ที่เราเพิ่งสร้างขึ้น

## 1. `"use client"` คืออะไร?
บรรทัดแรกสุดของโค้ดคือ `"use client";` นี่คือข้อกำหนดใหม่ของ Next.js (App Router)
- **ค่าเริ่มต้น (Default)**: Next.js จะมองทุกหน้าเป็น Server Component (รันบนเซิร์ฟเวอร์เท่านั้น) ซึ่งทำให้เว็บโหลดเร็วมาก
- **ข้อจำกัด**: Server Component ไม่สามารถใช้คำสั่งที่ตอบโต้กับผู้ใช้บนเบราว์เซอร์ได้ (เช่น `onClick`, `useState`, `useEffect`)
- **การแก้ไข**: เมื่อเราต้องการทำหน้าเว็บที่มีปุ่มกด หรือมีการเก็บ State ของตาราง (เช่น การพิมพ์ค้นหา) เราจึงต้องใส่คำว่า `"use client"` ไว้บนสุด เพื่อบอกว่าหน้านี้เป็น "Client Component"

## 2. การสร้าง Mock Data ชั่วคราวด้วย `useState`
```tsx
const [users] = useState([
  { id: 1, name: 'Somchai Admin', email: 'somchai@cms.com', role: 'ADMIN' },
  // ...
]);
```
ในโค้ดปัจจุบัน เราใช้ข้อมูลจำลอง (Mock Data) มาแสดงในตารางก่อน เพื่อให้เห็นหน้าตาของ UI ว่าสมบูรณ์หรือไม่ โดยยังไม่ต้องพึ่งพาเซิร์ฟเวอร์ Backend
**การต่อ API ของจริง (ในอนาคต)**:
เมื่อเราต้องการดึงข้อมูลของจริงจาก Backend (ที่เราทำไว้ใน Phase 1) เราจะเปลี่ยนโค้ดเป็น:
```tsx
import { useEffect, useState } from 'react';

// ตอนโหลดหน้าเว็บ ให้ใช้ fetch ไปเรียก API
useEffect(() => {
  fetch('http://localhost:5000/api/users', {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => setUsers(data)); // เอาข้อมูลที่ได้มายัดใส่ State
}, []);
```

## 3. โครงสร้างตาราง (Data Table) ด้วย TailwindCSS
เราใช้ Tag พื้นฐานของ HTML ในการทำตาราง (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>`) และตกแต่งด้วย Tailwind
- `w-full text-left border-collapse`: ทำให้ตารางกว้างเต็มหน้าจอ ตัวหนังสือชิดซ้าย
- `border-b border-slate-100 hover:bg-slate-50`: สร้างเส้นแบ่งแต่ละแถว และทำให้มีสีเทาอ่อนๆ (Hover) เวลานำเมาส์ไปชี้ที่แถวนั้น

## 4. การแสดงสีของ Role แบบมีเงื่อนไข (Conditional Styling)
เราสามารถเขียน JavaScript แทรกใน HTML เพื่อเปลี่ยนสีตาม Role ของผู้ใช้ได้:
```tsx
className={`px-3 py-1 rounded-full text-xs font-medium 
  ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
    user.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' : 
    'bg-slate-100 text-slate-700'}
`}
```
**แปลความหมาย**: 
- ถ้าเป็น `ADMIN` ให้ป้ายกำกับเป็น สีม่วง
- ถ้าเป็น `MANAGER` ให้ป้ายกำกับเป็น สีฟ้า
- ถ้าเป็นตำแหน่งอื่น (`MEMBER`) ให้เป็น สีเทา

