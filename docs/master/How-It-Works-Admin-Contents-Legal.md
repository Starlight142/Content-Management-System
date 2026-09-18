# How It Works: Admin Contents & Legal Database (หน้าจัดการเนื้อหาและกฎหมาย)

เอกสารนี้อธิบายแนวคิดการทำงานของไฟล์หน้า `contents/page.tsx` และ `legal/page.tsx`

## 1. การจัดการรูปแบบสีของสถานะ (Dynamic Status Colors)
ในไฟล์หน้า Contents มีการสร้างฟังก์ชัน `getStatusColor` เพื่อเปลี่ยนสีป้าย (Badge) อัตโนมัติ โดยอ้างอิงจากระบบ Workflow ที่เราออกแบบไว้ในสเปค:
```tsx
const getStatusColor = (status) => {
  switch(status) {
    case 'PUBLISHED': return 'bg-green-100 text-green-700'; // เผยแพร่แล้ว = สีเขียว
    case 'REVIEW': return 'bg-orange-100 text-orange-700'; // รอตรวจสอบ = สีส้ม
    case 'PRODUCTION': return 'bg-blue-100 text-blue-700'; // กำลังผลิต = สีน้ำเงิน
    case 'PLANNING': return 'bg-slate-100 text-slate-700'; // วางแผน = สีเทา
  }
};
```
เทคนิคนี้ช่วยให้ผู้ดูแลระบบ (Admin/Manager) มองปราดเดียวก็รู้ทันทีว่างานไหนติดขัดหรือเสร็จสิ้นแล้ว

## 2. โครงสร้างที่นำไปใช้ซ้ำ (Reusable UI Patterns)
หากสังเกตในโค้ด คุณจะพบว่าหน้า `Users`, `Contents`, และ `Legal` จะมีโครงสร้างคล้ายคลึงกันมาก:
1. **Header**: มีชื่อหน้าและปุ่มบวก (Add) มุมขวาบน
2. **Search Bar**: กล่องค้นหาที่มีไอคอนแว่นขยาย (`<Search />`)
3. **Table**: ตารางที่มีส่วนหัว (`<thead>`) เป็นพื้นหลังสีเทา และเนื้อหา (`<tbody>`) ที่จะวนลูปตัวแปร Array ขึ้นมาแสดงผล

**แนวทางในอนาคต**: 
เมื่อโปรเจกต์เติบโตขึ้น เราสามารถดึงชิ้นส่วนเหล่านี้ไปทำเป็น "Component แยกรวมศูนย์" ได้ (ตัวอย่างเช่น สร้างไฟล์ `components/DataTable.tsx`) เพื่อที่ว่าเวลาแก้ไขหน้าตากล่องค้นหาหรือตาราง จะได้แก้แค่ไฟล์เดียว แล้วอัปเดตทั้งโปรเจกต์เลย

## 3. หน้า Legal Database สำคัญอย่างไรกับภาพรวม?
ข้อมูลในตารางหน้าที่เราเพิ่งสร้างขึ้นนี้ (`legal/page.tsx`) เมื่อบันทึกลง Database (ในตาราง `legal_article`) มันจะถูกดึงไปแสดงผลเป็น **Checklist ใน Mobile App** 
ก่อนที่ Manager จะสามารถเปลี่ยน Status คอนเทนต์เป็น `PUBLISHED` ได้ ระบบจะบังคับให้ต้องเช็คถูก (☑) ตามกฎหมายเหล่านี้ให้ครบก่อน เพื่อเป็นหลักฐานว่า "คอนเทนต์นี้ปลอดภัย" (Compliance)

