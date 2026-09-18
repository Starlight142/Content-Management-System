# 4. Automated Legal & AI Compliance Specification (Year 4 Blueprint)

เอกสารนี้ระบุการต่อยอดระบบ **Legal & Compliance Gatekeeper** จากระบบตรวจสอบด้วยตนเอง (Manual 5-Pillar Checklist ในปัจจุบัน) สู่ระบบ **AI-Assisted Automated Audit** สำหรับโครงงานปี 4

---

## ⚖️ 1. สถาปัตยกรรมระบบตรวจข้อกำหนดกฎหมายอัตโนมัติ (Automated Compliance Architecture)

```mermaid
flowchart TD
    VideoInput["🎬 ไฟล์วิดีโอต้นฉบับ (MP4 / MOV)"]
    
    subgraph Pipeline["🔍 Automated Inspection Pipeline (Python/Node Service)"]
        AudioTrack["แยกแทร็กเสียง (Audio Demux)"]
        Frames["สกัดเฟรมภาพ (Frame Extraction 1 fps)"]
        Transcript["ถอดเสียงเป็นข้อความ (Speech-to-Text via Whisper)"]
        
        AudioTrack --> MusicCheck["🎵 Audio Fingerprinting\n(ตรวจลิขสิทธิ์เพลงกับคลัง Artlist/Epidemic)"]
        Frames --> FaceDetect["👤 Face & License Plate Detection\n(PDPA Consent & Anonymization)"]
        Frames --> LogoDetect["🏷️ Trademark & Brand Logo OCR\n(ตรวจสปอนเซอร์และโลโก้ละเมิด)"]
        Transcript --> ContentSafety["🛡️ NLP Policy Filter\n(ตรวจ Hate Speech & กฎชุมชนแพลตฟอร์ม)"]
    end
    
    subgraph Gatekeeper["⚖️ Compliance Decision Engine"]
        ReportGen["Audit Score Aggregator (0 - 100%)"]
        Verdict{"ผ่านเกณฑ์ความปลอดภัยหรือไม่?"}
    end
    
    VideoInput --> AudioTrack
    VideoInput --> Frames
    VideoInput --> Transcript
    
    MusicCheck --> ReportGen
    FaceDetect --> ReportGen
    LogoDetect --> ReportGen
    ContentSafety --> ReportGen
    
    ReportGen --> Verdict
    Verdict -->|Score >= 95%| Pass["✅ ปลดล็อกสถานะ APPROVED"]
    Verdict -->|Score < 95%| Flag["⚠️ แจ้งเตือน Manager พร้อมแนบ Timestamp จุดเสี่ยง"]
```

---

## 🛠️ 2. เทคโนโลยีที่ใช้ในการตรวจสอบแต่ละเสาหลัก (Tech Stack by Pillar)

### เสาหลักที่ 1: ตรวจจับลิขสิทธิ์เพลง (Music Copyright)
- **เทคโนโลยี**: Audio Fingerprinting (Chromaprint / AcoustID หรือ ACRCloud SDK)
- **การทำงาน**: สกัด Spectral Peak ของเพลงประกอบในคลิป แล้วนำไปเทียบกับฐานข้อมูลเพลงเชิงพาณิชย์ที่สตูดิโอซื้อสิทธิ์ไว้ หากพบเพลงที่มีลิขสิทธิ์และไม่มี License Key จะแจ้งเตือนทันที

### เสาหลักที่ 2: คุ้มครองข้อมูลส่วนบุคคลและใบหน้า (PDPA Compliance)
- **เทคโนโลยี**: Computer Vision (MediaPipe Face Detection / OpenCV)
- **การทำงาน**: สแกนใบหน้าบุคคลในคลิป ตรวจสอบว่ามีใบหน้าที่ไม่อยู่ในฐานข้อมูลทีมงาน (Talent Release Form) หรือไม่ พร้อมระบบ Auto-Blur อัตโนมัติ

### เสาหลักที่ 3: ตรวจสอบเครื่องหมายการค้าและสปอนเซอร์ (Trademark Disclosure)
- **เทคโนโลยี**: Object Detection (YOLOv8) + EasyOCR
- **การทำงาน**: ตรวจหาโลโก้แบรนด์สินค้าที่อาจละเมิดลิขสิทธิ์ และตรวจสอบว่าคลิปที่มีสปอนเซอร์มีการแสดงคำเตือน `#PaidPartnership` หรือ `#โฆษณา` ถูกต้องตามกฎหมาย สคบ. หรือไม่

### เสาหลักที่ 4: ตรวจสอบนโยบายชุมชนและความปลอดภัย (Community Standards)
- **เทคโนโลยี**: OpenAI Whisper (Audio to Text) + RoBERTa Toxic Comment Classifier
- **การทำงาน**: ถอดเสียงพูดในคลิปเป็น Text แล้วตรวจจับคำหยาบคาย, ข้อมูลหลอกลวง (Misinformation), หรือ Hate Speech

