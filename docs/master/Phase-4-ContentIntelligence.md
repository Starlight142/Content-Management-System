# Phase 4: Content Intelligence & Integrations

## เป้าหมาย (Goal)
ทำให้ระบบมีความอัจฉริยะมากขึ้น โดยไม่ต้องอาศัยคนมานั่งเก็บข้อมูลเอง ระบบจะสามารถดึงยอดวิว วิเคราะห์ความนิยม แนะนำคอนเทนต์ใหม่ และป้องกันความผิดพลาดทางกฎหมายได้

## เทคโนโลยีที่ใช้ (Tech Stack)
- **YouTube Data API v3 & TikTok API**: สำหรับเชื่อมต่อดึงยอดวิว, ไลก์, คอมเมนต์
- **Node-Cron / Agenda**: สำหรับตั้งเวลารันงานเบื้องหลัง (Background Jobs)
- **Rule-based Logic**: สำหรับระบบ Recommendation
- **Cloud Storage (AWS S3 / Google Cloud Storage)**: สำหรับเก็บไฟล์วิดีโอจริง

## สิ่งที่พัฒนาในเฟสนี้
1. **Data Analytics Pipeline (Cron Jobs)**
   - ระบบจะทำงานทุกๆ วัน/ชั่วโมง เพื่อดึงยอดวิว (Views), ไลก์, แชร์ จาก YouTube/TikTok
   - นำข้อมูลมาคำนวณ `Engagement Rate` และ `Average View Duration`
   - นำข้อมูลมาเก็บเป็น Snapshot ทำให้สามารถดูกราฟการเติบโต (Growth Rate) ได้

2. **Trend Detection & Recommendations**
   - นำข้อมูลที่เก็บมาคำนวณ `Trend Score`
   - ตรวจจับว่า Content Category ไหนมีคนดูเยอะที่สุดในช่วงเวลาไหน (Historical Best Time)
   - **Recommendation Engine**: ทำงานด้วย Rule-based เช่น *หากวิดีโอหมวดหมู่ IT มียอดเอนเกจเมนต์สูงบนแพลตฟอร์ม TikTok ระบบจะแนะนำให้ทีมทำคอนเทนต์ประเภทนี้เพิ่ม*

3. **Legal Check & Compliance (ก่อนเผยแพร่)**
   - ก่อนที่ Manager จะกด Publish คอนเทนต์ จะต้องผ่านหน้า **Legal Checklist**
   - เช่น มีการติ๊กยืนยันลิขสิทธิ์เพลง, ยืนยันเรื่อง PDPA หากมีหน้าคนอื่นในคลิป
   - ข้อมูลกฎหมายเหล่านี้จะดึงมาจากที่ Admin ตั้งค่าไว้ใน Phase 2

4. **File Storage Management**
   - พัฒนาตัวอัปโหลดไฟล์วิดีโอหรือรูปภาพ โดยส่งไปเก็บที่ Cloud Storage
   - Database (`content_file` table) จะเก็บเพียงแค่ URL (Link) ของไฟล์เท่านั้น เพื่อไม่ให้ Database ทำงานหนักเกินไป

