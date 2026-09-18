# 5. Cloud Object Storage & Asset Pipeline Specification (Year 4 Blueprint)

เอกสารนี้ระบุการออกแบบสถาปัตยกรรมการจัดเก็บไฟล์มีเดียขนาดใหญ่ (Large Media Assets) เพื่อยกระดับจากการแนบลิงก์ Google Drive สู่การใช้งาน **Cloud Object Storage (AWS S3 / Google Cloud Storage / Cloudflare R2)** พร้อม **Presigned Upload URLs** สำหรับโปรเจกต์ปี 4

---

## ☁️ 1. สถาปัตยกรรม Direct-to-Cloud Upload (ป้องกัน Server ล่ม)

> [!WARNING]
> **ทำไมห้ามอัปโหลดไฟล์วิดีโอผ่าน Express Server ตรงๆ?**  
> ไฟล์วิดีโอ 4K/1080p มีขนาด 200MB - 2GB หากให้ Mobile App ส่งไฟล์ผ่าน Express Server จะทำให้ Node.js Event Loop บล็อกตัว, Memory พุ่งสูง และเซิร์ฟเวอร์จะปฏิเสธคำขออื่นทันที

### ทางออกระดับสากล: Presigned URL Pattern
```mermaid
sequenceDiagram
    autonumber
    actor Creator as 🎨 Member / Creator
    participant App as 📱 Mobile App
    participant API as ⚙️ Backend API
    participant S3 as 🪣 AWS S3 / Cloud Storage
    participant CDN as 🌐 CloudFront CDN

    Creator->>App: 1. เลือกไฟล์วิดีโอ/ภาพที่ตัดต่อเสร็จ
    App->>API: 2. ขอสิทธิ์อัปโหลด (POST /api/files/presigned-url)
    Note over API: ตรวจสอบสิทธิ์ (Auth Check)<br/>และสร้าง Secure Presigned URL (อายุ 15 นาที)
    API-->>App: 3. ส่งคืน Presigned PUT URL + S3 Object Key
    
    App->>S3: 4. อัปโหลดไฟล์ตรงเข้า Bucket (HTTP PUT Streaming)
    S3-->>App: 5. อัปโหลดสำเร็จ (HTTP 200 OK)
    
    App->>API: 6. บันทึก Metadata (POST /api/contents/:id/files { s3Key, fileSizeBytes })
    API->>API: 7. บันทึกลงตาราง content_files & content_versions
    API-->>App: 8. ยืนยันบันทึกผลงานสำเร็จ
    
    %% Manager streaming
    actor Manager as 👔 Manager
    Manager->>App: 9. เปิดดูวิดีโอเพื่อตรวจงาน
    App->>CDN: 10. เล่นวิดีโอผ่าน CDN HLS/MP4 Streaming
```

---

## 🗂️ 2. โครงสร้างการจัดเก็บใน Bucket (S3 Object Hierarchy)

จัดระเบียบตาม Content ID และ Version อย่างเป็นระบบ:
```text
production-media-bucket/
└── contents/
    └── {content_id}/
        ├── raw/                  <-- ฟุตเทจดิบและไฟล์ต้นฉบับ
        │   └── camera_a_take1.mov
        ├── versions/             <-- ไฟล์วิดีโอที่ตัดต่อส่งตรวจแต่ละรอบ
        │   ├── v1_draft.mp4
        │   └── v2_revised.mp4
        ├── thumbnails/           <-- รูปภาพหน้าปก
        │   ├── cover_final.png
        │   └── cover_thumbnail_sm.webp
        └── legal_proofs/         <-- เอกสารใบอนุญาตและ PDPA Consent
            ├── music_license_artlist.pdf
            └── talent_consent_form.pdf
```

