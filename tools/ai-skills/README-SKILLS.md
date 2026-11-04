# Draftly — AI Skills & Rules Portable Package (README-SKILLS.md)

ชุดแพ็กเกจทักษะ (Skills) และกฎ (Rules) แบบพกพาสำหรับนำไปติดตั้งและใช้งานร่วมกับ AI Coding Assistant บนเครื่องอื่นหรือโปรเจกต์อื่น

---

## 1. ทักษะที่บรรจุอยู่ในแพ็กเกจ (Included Skills)

| ทักษะ / กฎ | ที่อยู่ไฟล์ | หน้าที่และพฤติกรรม |
| :--- | :--- | :--- |
| **`ponytail`** | `skills/ponytail/SKILL.md` | ควบคุม AI ให้เขียนโค้ดสั้น กระชับ ยึดหลัก YAGNI นำโค้ดเดิมมาใช้ซ้ำ ใช้คำสั่งมาตรฐาน ไม่ลง Library ฟุ่มเฟือย |
| **`diagram-design`** | `skills/diagram-design/SKILL.md` | ออกแบบและสร้างแผนภาพสถาปัตยกรรม/โฟลว์ระบบ 45 รูปแบบในรูปแบบ HTML + Inline SVG ระดับ Editorial |
| **`draftly-portable`** | `skills/draftly-portable/SKILL.md` | ทักษะสำหรับย้ายเครื่องและตั้งค่าระบบ Draftly (`com.draftly`), ตรวจสอบฐานข้อมูล `content_management`, ผูกพอร์ต ADB และรันชุดทดสอบอัตโนมัติ |
| **`ponytail.md` (Rule)** | `rules/ponytail.md` | กฎระเบียบข้อบังคับระดับ Workspace สำหรับการพัฒนาโค้ดแบบ Minimalist Engineering |

---

## 2. วิธีติดตั้งบนเครื่องใหม่แบบอัตโนมัติ (1-Click Install)

เมื่อย้ายโปรเจกต์ไปยังเครื่องใหม่ สามารถดับเบิลคลิกสคริปต์เพื่อติดตั้งทักษะเข้าสู่ระบบ AI ของเครื่องนั้นได้ทันที:

### ตัวเลือกที่ 1: ผ่านไฟล์ Batch (.bat)
1. เปิดโฟลเดอร์ `tools/ai-skills/`
2. ดับเบิลคลิกไฟล์ `install-skills-to-machine.bat`
3. สคริปต์จะคัดลอกทักษะทั้ง 3 รายการ (`ponytail`, `diagram-design`, `draftly-portable`) เข้าสู่:
   - `%USERPROFILE%\.gemini\config\skills\` (สำหรับ Antigravity / Gemini)
   - `%USERPROFILE%\.agents\` (สำหรับ Agentic Tools ทั่วไป)

### ตัวเลือกที่ 2: ผ่าน PowerShell (.ps1)
เปิด PowerShell ในโฟลเดอร์นี้แล้วรัน:
```powershell
.\install-skills-to-machine.ps1
```

---

## 3. วิธีนำไปใช้กับ AI อื่นๆ บนเครื่องใหม่ (Cross-AI Usage)

### 3.1 Google Antigravity
ทักษะจะถูกเรียกใช้โดยอัตโนมัติเมื่ออยู่ในโฟลเดอร์ `.agents/skills/` ของโปรเจกต์ หรือสามารถสั่งงานผ่าน Slash Command:
```text
/ponytail
/diagram-design
/draftly-portable
```

### 3.2 Claude Code / Codex CLI
คัดลอกโฟลเดอร์ `skills/ponytail`, `skills/diagram-design` และ `skills/draftly-portable` ไปไว้ที่:
```text
~/.claude/skills/
หรือ
~/.codex/skills/
```

### 3.3 Cursor / Windsurf
คัดลอกเนื้อหาจาก `rules/ponytail.md` ไปวางไว้ที่:
```text
.cursor/rules/ponytail.mdc
หรือ
.cursorrules
```

### 3.4 ChatGPT / Claude Web / GitHub Copilot Chat
คัดลอกเนื้อหาจากไฟล์ [AI-PORTABLE-PROMPT.md](../../AI-PORTABLE-PROMPT.md) ไปวางที่ช่อง Custom Instructions หรือส่งเป็นข้อความแรกของการเริ่มสนทนา
