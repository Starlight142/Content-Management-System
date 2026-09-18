# 🚀 Year 4 Extensions — Content Production Management System

> **วัตถุประสงค์ของโฟลเดอร์นี้:**  
> โฟลเดอร์ `year4-extensions` ถูกแยกออกมาเป็นพิเศษเพื่อรองรับการพัฒนาใน **โครงงานปริญญานิพนธ์ปี 4 (Senior Project)** โดยแยกขาดออกจากโมดูลหลักของ Phase 1 (Core System) อย่างชัดเจน เพื่อป้องกันผลข้างเคียง (Side Effects) และรักษาความเสถียรของระบบสำหรับการประเมินผลในเทอมปัจจุบัน

---

## 📁 โครงสร้างโมดูลส่วนขยายสำหรับปี 4

```text
master/backend/src/year4-extensions/
├── analytics/                  <-- โมดูลวิเคราะห์ Performance และยอดวิวเชิงลึก
│   ├── analytics.controller.js
│   └── analytics.routes.js
│
├── recommendations/            <-- โมดูล AI / Rule-based แนะนำหัวข้อและเวลาโพสต์
│   ├── recommendations.controller.js
│   └── recommendations.routes.js
│
└── trends/                     <-- โมดูลติดตามกระแสและคีย์เวิร์ดยอดนิยม
    ├── trends.controller.js
    └── trends.routes.js
```

---

## 🔌 การเปิดใช้งานในอนาคต (When entering Year 4)
เมื่อขึ้นปี 4 และพร้อมเชื่อมต่อระบบภายนอก สามารถนำ Routes เหล่านี้ไปเสียบเข้ากับ `src/app.js`:

```javascript
// ใน src/app.js (เมื่อพร้อมเริ่มทำโปรเจกต์ปี 4)
const analyticsRoutes = require('./year4-extensions/analytics/analytics.routes');
const recommendationsRoutes = require('./year4-extensions/recommendations/recommendations.routes');
const trendsRoutes = require('./year4-extensions/trends/trends.routes');

app.use('/api/analytics', analyticsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/trends', trendsRoutes);
```

