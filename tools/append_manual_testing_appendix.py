import os
import shutil
import docx
from docx.shared import Inches, Pt, Twips
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

DESKTOP_DOCX = r"C:\Users\itzmo\Desktop\ผลิตสื่อ.docx"
FALLBACK_DOCX = r"C:\Users\itzmo\Desktop\ผลิตสื่อ_อัปเดตภาคผนวก.docx"
REPO_DOCX = r"d:\VsCode\Project\Content-Management-System\docs\academic\SRS-ผลิตสื่อ-สมบูรณ์.docx"


def set_thai_font(run, size_pt=16, bold=False):
    run.font.name = "TH Sarabun New"
    run.font.size = Pt(size_pt)
    run.bold = bold
    rPr = run._r.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.insert(0, rFonts)
    rFonts.set(qn("w:ascii"), "TH Sarabun New")
    rFonts.set(qn("w:hAnsi"), "TH Sarabun New")
    rFonts.set(qn("w:cs"), "TH Sarabun New")

    sz_val = str(int(size_pt * 2))
    sz = rPr.find(qn("w:sz"))
    if sz is None:
        sz = OxmlElement("w:sz")
        rPr.append(sz)
    sz.set(qn("w:val"), sz_val)

    szCs = rPr.find(qn("w:szCs"))
    if szCs is None:
        szCs = OxmlElement("w:szCs")
        rPr.append(szCs)
    szCs.set(qn("w:val"), sz_val)

    if bold:
        bCs = rPr.find(qn("w:bCs"))
        if bCs is None:
            bCs = OxmlElement("w:bCs")
            rPr.append(bCs)


def set_cell_shading(cell, fill_hex="D9D9D9"):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = tcPr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tcPr.append(shd)
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), fill_hex)


def set_table_borders(table):
    tblPr = table._tbl.tblPr
    tblStyle = tblPr.find(qn("w:tblStyle"))
    if tblStyle is None:
        tblStyle = OxmlElement("w:tblStyle")
        tblPr.insert(0, tblStyle)
    tblStyle.set(qn("w:val"), "TableGrid")

    borders = tblPr.find(qn("w:tblBorders"))
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tblPr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        edge_el = borders.find(qn(f"w:{edge}"))
        if edge_el is None:
            edge_el = OxmlElement(f"w:{edge}")
            borders.append(edge_el)
        edge_el.set(qn("w:val"), "single")
        edge_el.set(qn("w:sz"), "4")
        edge_el.set(qn("w:space"), "0")
        edge_el.set(qn("w:color"), "000000")


def add_table_seq_caption(doc, table_no, title_text):
    p = doc.add_paragraph(style="Caption")
    p.paragraph_format.keep_with_next = True
    r1 = p.add_run("ตารางที่ ")
    set_thai_font(r1, 16, bold=True)

    r_begin = p.add_run()
    fldChar1 = OxmlElement("w:fldChar")
    fldChar1.set(qn("w:fldCharType"), "begin")
    r_begin._r.append(fldChar1)

    r_instr = p.add_run()
    instrText = OxmlElement("w:instrText")
    instrText.set(qn("xml:space"), "preserve")
    instrText.text = " SEQ ตารางที่ \\* ARABIC "
    r_instr._r.append(instrText)

    r_sep = p.add_run()
    fldChar2 = OxmlElement("w:fldChar")
    fldChar2.set(qn("w:fldCharType"), "separate")
    r_sep._r.append(fldChar2)

    r_val = p.add_run(str(table_no))
    set_thai_font(r_val, 16, bold=True)

    r_end = p.add_run()
    fldChar3 = OxmlElement("w:fldChar")
    fldChar3.set(qn("w:fldCharType"), "end")
    r_end._r.append(fldChar3)

    r_colon = p.add_run(" : ")
    set_thai_font(r_colon, 16, bold=True)

    r_title = p.add_run(title_text)
    set_thai_font(r_title, 16, bold=True)
    return p


def create_styled_table(doc, headers, rows_data, col_widths_inches=None, font_size_pt=14, center_cols=None):
    if center_cols is None:
        center_cols = set()
    table = doc.add_table(rows=1 + len(rows_data), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table)

    # Repeat header row across pages
    trPr = table.rows[0]._tr.get_or_add_trPr()
    tblHeader = OxmlElement("w:tblHeader")
    trPr.append(tblHeader)

    for c_idx, h_text in enumerate(headers):
        cell = table.cell(0, c_idx)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        set_cell_shading(cell, "D9D9D9")
        if col_widths_inches and c_idx < len(col_widths_inches):
            cell.width = Inches(col_widths_inches[c_idx])
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h_text)
        set_thai_font(r, font_size_pt, bold=True)

    for r_idx, row_vals in enumerate(rows_data, start=1):
        row = table.rows[r_idx]
        for c_idx, val in enumerate(row_vals):
            cell = row.cells[c_idx]
            cell.vertical_alignment = WD_ALIGN_VERTICAL.TOP
            if col_widths_inches and c_idx < len(col_widths_inches):
                cell.width = Inches(col_widths_inches[c_idx])
            p = cell.paragraphs[0]
            if c_idx in center_cols:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(str(val))
            is_bold = c_idx == 0 or str(val) in ("Pass", "100%", "รวมทั้งหมด (Total)")
            set_thai_font(r, font_size_pt, bold=is_bold)

    doc.add_paragraph("")
    return table


# --- DATA DEFINITIONS ---

SCHEDULE_ROWS = [
    ["1", "ศึกษาความต้องการระบบ (SRS) และวิเคราะห์ Use Case ทั้ง 14 รายการ", "1 ก.ค. – 15 ก.ค. 2569", "QA Manager, System Analyst", "รายการขอบเขตฟังก์ชันที่จะทดสอบ"],
    ["2", "วางแผนการทดสอบ (Test Plan) และกำหนด Test Scenario (TS_001 – TS_014)", "16 ก.ค. – 31 ก.ค. 2569", "QA Manager", "เอกสาร Test Plan & Scenario"],
    ["3", "ออกแบบกรณีทดสอบ (Test Case Design) ทั้งกรณี Valid และ Invalid", "1 ส.ค. – 20 ส.ค. 2569", "QA Engineer / Tester", "เอกสาร Test Case (28 กรณีทดสอบ)"],
    ["4", "จัดเตรียมสภาพแวดล้อมและข้อมูลจำลองในฐานข้อมูล MongoDB", "21 ส.ค. – 25 ส.ค. 2569", "Backend / Mobile Developer", "เซิร์ฟเวอร์ทดสอบและบัญชีผู้ใช้ 3 บทบาท"],
    ["5", "ดำเนินการทดสอบระบบรอบที่ 1 (Test Execution - Cycle 1)", "26 ส.ค. – 10 ก.ย. 2569", "QA Tester", "บันทึกผลการทดสอบรอบที่ 1 และรายการแก้ไข"],
    ["6", "แก้ไขข้อบกพร่องและทดสอบซ้ำ (Defect Fixing & Regression Testing)", "11 ก.ย. – 22 ก.ย. 2569", "Developer, QA Tester", "ผลทดสอบซ้ำผ่านครบทุกฟังก์ชัน"],
    ["7", "สรุปผลการทดสอบและจัดทำรายงาน (Test Report & Sign-off)", "23 ก.ย. – 30 ก.ย. 2569", "QA Manager", "รายงานสรุปผลการทดสอบระบบ (Test Report)"],
]

ROLES_ROWS = [
    ["QA Manager (หัวหน้าทีมทดสอบ)", "กำหนดแผนการทดสอบ ควบคุมตารางเวลา ตรวจสอบความครอบคลุมของ Test Scenario/Test Case และอนุมัติรายงานผลการทดสอบ (Test Report)"],
    ["QA Tester (ผู้ดำเนินการทดสอบ)", "เขียนรายละเอียด Test Case (Valid/Invalid) เตรียมข้อมูลทดสอบ รันการทดสอบจริงบน Mobile App และ Admin Web พร้อมบันทึกผลลัพธ์"],
    ["System Analyst (นักวิเคราะห์ระบบ)", "ทบทวนความสอดคล้องของกรณีทดสอบกับความต้องการระบบ (SRS) และ Use Case Description ทั้ง 14 รายการ"],
    ["Developer (ทีมพัฒนาระบบ)", "จัดเตรียมสภาพแวดล้อม (Backend, MongoDB, Mobile App, Admin Web) และแก้ไขข้อบกพร่องที่พบจากการทดสอบ"],
]

ENV_ROWS = [
    ["Backend & Database", "Node.js + Express.js (Port 5000), WebSocket (ws), ฐานข้อมูล MongoDB (content_management)"],
    ["Mobile Application", "React Native (Android Emulator / อุปกรณ์สมาร์ตโฟนระบบ Android) สำหรับบทบาท Member และ Manager"],
    ["Web Application", "Next.js 14 Admin Web Portal (Port 3000) บนเบราว์เซอร์ Google Chrome สำหรับบทบาท Admin"],
    ["บัญชีผู้ใช้สำหรับทดสอบ", "Admin: admin@studio.com | Manager: manager@studio.com (TEAM-A) | Member: member@studio.com (TEAM-A) (รหัสผ่าน: 123456)"],
]

SCENARIO_ROWS = [
    ["TS_001", "UC-01 ลงทะเบียน (Register)", "Mobile App", "Member (ผู้ใช้ใหม่)", "ตรวจสอบการสมัครสมาชิกใหม่ การเลือกตำแหน่งงาน และการดักจับกรณีกรอกข้อมูลไม่ครบหรืออีเมลซ้ำ", "2"],
    ["TS_002", "UC-02 เข้าสู่ระบบ (Login)", "Mobile / Web", "Member, Manager, Admin", "ตรวจสอบการยืนยันตัวตนเข้าสู่ระบบตามสิทธิ์ และการปฏิเสธเมื่อรหัสผ่านหรือสิทธิ์ไม่ถูกต้อง", "2"],
    ["TS_003", "UC-03 จัดการบัญชีส่วนตัว", "Mobile App", "Member, Manager", "ตรวจสอบการแก้ไขชื่อโปรไฟล์ การสลับโหมดมืด/สว่าง และการป้องกันการบันทึกชื่อว่าง", "2"],
    ["TS_004", "UC-04 เข้าร่วมทีมด้วยรหัสทีม", "Mobile App", "Member", "ตรวจสอบการเข้าร่วมทีมด้วยรหัสทีม (Invite Code) ที่ถูกต้อง และการแจ้งเตือนเมื่อรหัสทีมผิด", "2"],
    ["TS_005", "UC-05 จัดการและส่งมอบงานย่อย", "Mobile App", "Member", "ตรวจสอบการรับงาน เปลี่ยนสถานะ แนบลิงก์ส่งมอบงาน และการดักจับเมื่อไม่ระบุลิงก์ผลงาน", "2"],
    ["TS_006", "UC-06 เสนอและแลกเปลี่ยนแนวคิดคอนเทนต์", "Mobile App", "Member, Manager", "ตรวจสอบการเพิ่มไอเดียใหม่ การกดโหวต/อนุมัติไอเดีย และการป้องกันการส่งหัวข้อว่าง", "2"],
    ["TS_007", "UC-07 ติดตามความคืบหน้าและกิจกรรมทีม", "Mobile App", "Member, Manager", "ตรวจสอบการแสดงความคืบหน้าทีม ฟีดกิจกรรมแบบเรียลไทม์ และการกั้นสิทธิ์ข้อมูลข้ามทีม", "2"],
    ["TS_008", "UC-08 บริหารจัดการทีมและกำหนดตำแหน่ง", "Mobile App", "Manager", "ตรวจสอบการดูรายชื่อลูกทีม กำหนดตำแหน่งงาน และการป้องกันสมาชิกทั่วไปแก้ไขสิทธิ์", "2"],
    ["TS_009", "UC-09 สร้างชิ้นงานและมอบหมายงานผลิต", "Mobile App", "Manager", "ตรวจสอบการสร้าง Content ใหม่ การแจกจ่าย Task ให้ลูกทีม และการดักจับข้อมูลไม่ครบ", "2"],
    ["TS_010", "UC-10 ตรวจรับ สั่งแก้ไข และอนุมัติชิ้นงาน", "Mobile App", "Manager", "ตรวจสอบการอนุมัติงาน (Approve) การส่งกลับแก้ไข (Revision) และการบังคับระบุเหตุผลสั่งแก้", "2"],
    ["TS_011", "UC-11 เผยแพร่ผลงานสู่สาธารณะ", "Mobile App", "Manager", "ตรวจสอบการเปลี่ยนสถานะชิ้นงานที่อนุมัติแล้วเป็นเผยแพร่ และการบล็อกชิ้นงานที่ยังไม่ผ่านตรวจ", "2"],
    ["TS_012", "UC-12 บริหารจัดการผู้ใช้ ทีม และสิทธิ์ระบบ", "Admin Web", "Admin", "ตรวจสอบการเพิ่ม/แก้ไขผู้ใช้ การสร้างทีมใหม่ และการป้องกันการสร้างรหัสทีมหรืออีเมลซ้ำ", "2"],
    ["TS_013", "UC-13 กำกับดูแลชิ้นงานและภารกิจทั้งหมด", "Admin Web", "Admin", "ตรวจสอบการค้นหา กรอง แก้ไข/ลบชิ้นงานและงานย่อยจากส่วนกลาง และการป้องกันสร้างข้อมูลว่าง", "2"],
    ["TS_014", "UC-14 ตรวจสอบสถานะระบบและประวัติทำงาน", "Admin Web", "Admin", "ตรวจสอบหน้าแดชบอร์ด Audit Logs สถานะเซิร์ฟเวอร์ และการบล็อกผู้ใช้ที่ไม่ได้ล็อกอินแอดมิน", "2"],
]

TEST_CASE_ROWS = [
    ["TC_001", "TS_001", "ลงทะเบียนสำเร็จ (Valid)", "ผู้ใช้ยังไม่เป็นสมาชิก เปิดหน้าลงทะเบียนบนแอป", "1. กรอกชื่อ-นามสกุล ตำแหน่ง รหัสทีม อีเมล รหัสผ่าน\n2. กดปุ่มลงทะเบียน", "ชื่อ: สมชาย\nตำแหน่ง: Editor\nทีม: TEAM-A\nอีเมล: new@studio.com\nรหัสผ่าน: 123456", "สร้างบัญชีสำเร็จ เข้าสู่ทีม TEAM-A และนำเข้าสู่หน้าหลัก", "สร้างบัญชีและเข้าทีมสำเร็จตามกำหนด", "Pass"],
    ["TC_002", "TS_001", "ลงทะเบียนข้อมูลไม่ครบ/อีเมลซ้ำ (Invalid)", "เปิดหน้าลงทะเบียนบนแอป", "1. เว้นว่างอีเมลหรือกรอกรหัสผ่านสั้นกว่า 6 ตัว\n2. กดปุ่มลงทะเบียน", "ชื่อ: สมชาย\nอีเมล: (เว้นว่าง)\nรหัสผ่าน: 123", "ระบบไม่อนุญาตให้สมัครและแสดงข้อความแจ้งเตือนข้อมูลไม่ครบถ้วน", "แสดงข้อความแจ้งเตือนถูกต้อง", "Pass"],
    ["TC_003", "TS_002", "เข้าสู่ระบบสำเร็จตามสิทธิ์ (Valid)", "มีบัญชีผู้ใช้ในระบบ เปิดหน้าเข้าสู่ระบบ", "1. กรอกอีเมลและรหัสผ่านที่ถูกต้อง\n2. กดปุ่มเข้าสู่ระบบ", "อีเมล: manager@studio.com\nรหัสผ่าน: 123456", "เข้าสู่ระบบสำเร็จ แสดงหน้าจอตามบทบาทของผู้ใช้ (Manager)", "เข้าสู่ระบบและแสดงหน้าจอตรงตามสิทธิ์", "Pass"],
    ["TC_004", "TS_002", "เข้าสู่ระบบด้วยรหัสผ่านผิด (Invalid)", "เปิดหน้าเข้าสู่ระบบ", "1. กรอกอีเมลถูกต้อง แต่กรอกรหัสผ่านผิด\n2. กดปุ่มเข้าสู่ระบบ", "อีเมล: manager@studio.com\nรหัสผ่าน: 000000", "ระบบปฏิเสธการเข้าใช้งานและแจ้งเตือนอีเมลหรือรหัสผ่านไม่ถูกต้อง", "แจ้งเตือนรหัสผ่านไม่ถูกต้อง", "Pass"],
    ["TC_005", "TS_003", "แก้ไขโปรไฟล์และสลับโหมดสีสำเร็จ (Valid)", "เข้าสู่ระบบแล้ว เปิดหน้าโปรไฟล์", "1. กดแก้ไขชื่อโปรไฟล์และกดบันทึก\n2. กดสวิตช์สลับโหมดมืด/สว่าง", "ชื่อใหม่: สมศรี (หัวหน้าทีม)\nโหมด: Dark Mode", "อัปเดตชื่อในระบบทันที และหน้าจอเปลี่ยนโทนสีตามโหมดที่เลือก", "อัปเดตชื่อและเปลี่ยนธีมสำเร็จ", "Pass"],
    ["TC_006", "TS_003", "แก้ไขโปรไฟล์โดยลบชื่อเป็นค่าว่าง (Invalid)", "เปิดหน้าแก้ไขโปรไฟล์", "1. ลบข้อความในช่องชื่อจนว่างเปล่า\n2. กดปุ่มบันทึก", "ชื่อใหม่: (ค่าว่าง)", "ระบบไม่อนุญาตให้บันทึกค่าว่างและแจ้งเตือนให้ระบุชื่อ", "ป้องกันการบันทึกชื่อว่างสำเร็จ", "Pass"],
    ["TC_007", "TS_004", "เข้าร่วมทีมด้วยรหัสทีมถูกต้อง (Valid)", "เข้าสู่ระบบด้วยบัญชีที่ยังไม่มีทีม", "1. กรอกรหัสเข้าร่วมทีมในช่อง Invite Code\n2. กดปุ่มเข้าร่วมทีม", "รหัสทีม: TEAM-A", "ผูกบัญชีเข้ากับ Content Team A และแสดงข้อมูลของทีมทันที", "เข้าร่วมทีม TEAM-A สำเร็จ", "Pass"],
    ["TC_008", "TS_004", "เข้าร่วมทีมด้วยรหัสทีมที่ไม่มีในระบบ (Invalid)", "เข้าสู่ระบบด้วยบัญชีที่ยังไม่มีทีม", "1. กรอกรหัสทีมที่ไม่มีอยู่จริง\n2. กดปุ่มเข้าร่วมทีม", "รหัสทีม: WRONG-999", "ระบบปฏิเสธและแจ้งเตือนไม่พบรหัสทีมดังกล่าวในระบบ", "แจ้งเตือนไม่พบรหัสทีมถูกต้อง", "Pass"],
    ["TC_009", "TS_005", "ส่งมอบงานย่อยพร้อมลิงก์ผลงาน (Valid)", "มีงานย่อยที่ได้รับมอบหมายในหน้างานของฉัน", "1. กดเริ่มทำงาน\n2. วางลิงก์ผลงานในช่องส่งงาน\n3. กดปุ่มส่งมอบงาน", "URL: https://drive.google.com/file/d/clip01", "สถานะงานเปลี่ยนเป็น REVIEW (รอตรวจ) และส่งแจ้งเตือนไปยัง Manager", "เปลี่ยนสถานะเป็นรอตรวจสำเร็จ", "Pass"],
    ["TC_010", "TS_005", "กดส่งมอบงานโดยไม่ระบุลิงก์ผลงาน (Invalid)", "มีงานย่อยสถานะกำลังทำในหน้างานของฉัน", "1. เว้นว่างช่องลิงก์ส่งงาน\n2. กดปุ่มส่งมอบงาน", "URL: (เว้นว่าง)", "ระบบแจ้งเตือนให้ระบุลิงก์ไฟล์ผลงานหรือข้อความตอบกลับก่อนส่ง", "แจ้งเตือนให้กรอกลิงก์ก่อนส่ง", "Pass"],
    ["TC_011", "TS_006", "เสนอแนวคิดคอนเทนต์และกดโหวตสำเร็จ (Valid)", "เปิดหน้าบอร์ดระดมไอเดียในแอป", "1. กดปุ่มเสนอไอเดียใหม่\n2. กรอกหัวข้อและรายละเอียดแล้วกดบันทึก", "หัวข้อ: รีวิวอุปกรณ์จัดไฟสตูดิโอ\nหมวดหมู่: วิดีโอสั้น", "ไอเดียใหม่แสดงบนบอร์ดของทีมทันที สมาชิกกดโหวตได้", "แสดงไอเดียใหม่บนบอร์ดสำเร็จ", "Pass"],
    ["TC_012", "TS_006", "เสนอแนวคิดคอนเทนต์โดยไม่กรอกหัวข้อ (Invalid)", "เปิดหน้าต่างสร้างไอเดียใหม่", "1. เว้นว่างช่องหัวข้อไอเดีย\n2. กดปุ่มบันทึก", "หัวข้อ: (เว้นว่าง)", "ระบบไม่อนุญาตให้สร้างไอเดียและแจ้งเตือนให้ระบุหัวข้อ", "แจ้งเตือนให้กรอกหัวข้อไอเดีย", "Pass"],
    ["TC_013", "TS_007", "ดูความคืบหน้าและฟีดกิจกรรมทีมเรียลไทม์ (Valid)", "สมาชิกอยู่ในทีม TEAM-A เปิดแท็บภาพรวมทีม", "1. เปิดหน้าภาพรวมทีม\n2. ตรวจสอบเปอร์เซ็นต์งานและฟีดกิจกรรมล่าสุด", "ทีม: Content Team A (TEAM-A)", "แสดงแถบความคืบหน้า รายชื่อสมาชิก สถานะออนไลน์ และฟีดกิจกรรมถูกต้อง", "แสดงข้อมูลทีมแบบเรียลไทม์ถูกต้อง", "Pass"],
    ["TC_014", "TS_007", "ป้องกันการเรียกดูข้อมูลข้ามทีม (Invalid)", "ผู้ใช้สังกัด TEAM-B", "1. พยายามเรียกดูข้อมูลแดชบอร์ดของ TEAM-A", "ผู้เรียก: สมาชิก TEAM-B\nเป้าหมาย: TEAM-A", "ระบบกั้นสิทธิ์การเข้าถึง (403 Forbidden) ไม่แสดงข้อมูลของทีมอื่น", "กั้นสิทธิ์ข้อมูลข้ามทีมสำเร็จ", "Pass"],
    ["TC_015", "TS_008", "ผู้จัดการตรวจสอบสมาชิกและกำหนดตำแหน่ง (Valid)", "เข้าสู่ระบบด้วยบัญชี Manager", "1. เปิดหน้าภาพรวมทีม\n2. ตรวจสอบรายชื่อสมาชิกและอัปเดตตำแหน่งงาน", "สมาชิก: John\nตำแหน่ง: Video Editor", "ระบบบันทึกและแสดงตำแหน่งงานของสมาชิกในทีมอย่างถูกต้อง", "อัปเดตและแสดงตำแหน่งงานถูกต้อง", "Pass"],
    ["TC_016", "TS_008", "สมาชิกทั่วไปพยายามแก้ไขโครงสร้างทีม (Invalid)", "เข้าสู่ระบบด้วยบัญชี Member", "1. เปิดหน้าภาพรวมทีมหรือเรียก API แก้ไขทีม", "ผู้เรียก: member@studio.com", "ไม่แสดงปุ่มจัดการทีมสำหรับสมาชิก และปฏิเสธคำขอระดับ API", "ป้องกันสมาชิกแก้ไขทีมสำเร็จ", "Pass"],
    ["TC_017", "TS_009", "สร้างชิ้นงานใหม่และมอบหมายงานย่อยสำเร็จ (Valid)", "เข้าสู่ระบบด้วยบัญชี Manager", "1. กดสร้างชิ้นงานใหม่และกรอกข้อมูลครบ\n2. เลือกผู้รับผิดชอบและกดบันทึก", "ชื่อชิ้นงาน: คลิปแนะนำสินค้าใหม่\nผู้รับผิดชอบ: John\nกำหนดส่ง: 30 ก.ย.", "สร้างชิ้นงานและงานย่อยสำเร็จ งานแสดงในหน้างานของสมาชิกทันที", "สร้างและกระจายงานให้ลูกทีมสำเร็จ", "Pass"],
    ["TC_018", "TS_009", "สร้างชิ้นงานโดยไม่ระบุชื่องาน (Invalid)", "เปิดหน้าสร้างชิ้นงานใหม่ (Manager)", "1. เว้นว่างช่องชื่อชิ้นงาน\n2. กดปุ่มยืนยันสร้างงาน", "ชื่อชิ้นงาน: (เว้นว่าง)", "ระบบแจ้งเตือนให้กรอกชื่อชิ้นงานและไม่อนุญาตให้บันทึก", "แจ้งเตือนเมื่อไม่กรอกชื่องาน", "Pass"],
    ["TC_019", "TS_010", "ผู้จัดการตรวจรับและกดอนุมัติงาน (Valid)", "มีชิ้นงานในสถานะ REVIEW (รอตรวจ)", "1. ตรวจสอบลิงก์ผลงานที่สมาชิกส่งมา\n2. กดปุ่มอนุมัติชิ้นงาน (Approve)", "ชิ้นงาน: รีวิวแกดเจ็ตไอที\nการกระทำ: กดอนุมัติ", "สถานะชิ้นงานเปลี่ยนเป็น APPROVED (อนุมัติแล้ว) ความคืบหน้า 100%", "เปลี่ยนสถานะเป็น APPROVED สำเร็จ", "Pass"],
    ["TC_020", "TS_010", "ผู้จัดการส่งกลับแก้ไขโดยไม่ระบุเหตุผล (Invalid)", "มีชิ้นงานในสถานะ REVIEW เปิดหน้าต่างส่งกลับแก้ไข", "1. กดปุ่มส่งกลับแก้ไข (Revision)\n2. เว้นว่างช่องหมายเหตุแล้วกดยืนยัน", "หมายเหตุการแก้ไข: (เว้นว่าง)", "ระบบแจ้งเตือนให้ระบุรายละเอียดสิ่งที่ต้องแก้ไขก่อนส่งกลับ", "บังคับกรอกเหตุผลก่อนสั่งแก้สำเร็จ", "Pass"],
    ["TC_021", "TS_011", "เผยแพร่ชิ้นงานที่ผ่านการอนุมัติแล้ว (Valid)", "มีชิ้นงานสถานะ APPROVED", "1. เลือกชิ้นงานที่อนุมัติแล้ว\n2. อัปเดตสถานะเป็นเผยแพร่ผลงาน", "ชิ้นงานสถานะ: APPROVED", "ระบบบันทึกสถานะการเผยแพร่และบันทึกลงประวัติกิจกรรมทีม", "อัปเดตสถานะเผยแพร่สำเร็จ", "Pass"],
    ["TC_022", "TS_011", "พยายามเผยแพร่ชิ้นงานที่ยังไม่ผ่านการอนุมัติ (Invalid)", "มีชิ้นงานสถานะ PLANNING หรือ REVISION", "1. เลือกชิ้นงานที่ยังทำไม่เสร็จหรือรอแก้\n2. พยายามกดเผยแพร่ข้ามขั้นตอน", "ชิ้นงานสถานะ: REVISION", "ระบบไม่อนุญาตให้เผยแพร่งานที่ยังไม่ผ่านการตรวจอนุมัติ", "บล็อกการเผยแพร่ข้ามขั้นตอนสำเร็จ", "Pass"],
    ["TC_023", "TS_012", "แอดมินเพิ่มผู้ใช้และสร้างทีมใหม่สำเร็จ (Valid)", "เข้าสู่ระบบ Admin Web", "1. เปิดหน้าผู้ใช้งาน กดเพิ่มผู้ใช้ใหม่\n2. เปิดหน้าจัดการทีม กดสร้างทีมใหม่", "อีเมล: editor2@studio.com\nทีมใหม่: Studio C (TEAM-C)", "สร้างบัญชีผู้ใช้และทีมใหม่ลงฐานข้อมูล แสดงในตารางทันที", "เพิ่มผู้ใช้และสร้างทีมใหม่สำเร็จ", "Pass"],
    ["TC_024", "TS_012", "แอดมินสร้างทีมโดยใช้รหัสทีมซ้ำกับที่มีอยู่ (Invalid)", "เปิดหน้าสร้างทีมใหม่บน Admin Web", "1. กรอกชื่อทีมและรหัสทีมซ้ำกับ TEAM-A\n2. กดปุ่มสร้างทีม", "รหัสทีม: TEAM-A (ซ้ำ)", "ระบบปฏิเสธการสร้างและแจ้งเตือนว่ารหัสทีมนี้ถูกใช้งานแล้ว", "ป้องกันรหัสทีมซ้ำสำเร็จ", "Pass"],
    ["TC_025", "TS_013", "แอดมินค้นหา กรอง และจัดการชิ้นงาน/งานย่อย (Valid)", "เข้าสู่ระบบ Admin Web เปิดหน้าชิ้นงานและงานย่อย", "1. พิมพ์ค้นหาและกรองตามสถานะ\n2. ทดสอบสร้างชิ้นงานและปรับสถานะ", "คำค้นหา: รีวิว\nตัวกรอง: REVIEW", "ตารางกรองข้อมูลถูกต้อง และอัปเดตสถานะชิ้นงาน/งานย่อยแบบเรียลไทม์", "ค้นหา กรอง และอัปเดตข้อมูลสำเร็จ", "Pass"],
    ["TC_026", "TS_013", "แอดมินสร้างชิ้นงานหรือประเภทงานโดยเว้นชื่อว่าง (Invalid)", "เปิดหน้าสร้างชิ้นงานหรือประเภทงานบน Admin Web", "1. เว้นว่างช่องชื่อรายการ\n2. กดปุ่มบันทึก", "ชื่อรายการ: (เว้นว่าง)", "ฟอร์มแจ้งเตือนบังคับกรอกข้อมูล (Required) ไม่ส่งข้อมูลว่างเข้าฐานข้อมูล", "ป้องกันการส่งฟอร์มว่างสำเร็จ", "Pass"],
    ["TC_027", "TS_014", "แอดมินตรวจสอบ Audit Logs และสถานะระบบ (Valid)", "เข้าสู่ระบบ Admin Web", "1. เปิดหน้าประวัติการดำเนินงาน (Audit Logs)\n2. เปิดหน้าตั้งค่าและสถานะระบบ", "ตัวกรอง Log: TASK_SUBMITTED", "แสดงรายการประวัติการทำงานถูกต้อง และแสดงสถานะ MongoDB Connected", "แสดง Audit Logs และสถานะระบบถูกต้อง", "Pass"],
    ["TC_028", "TS_014", "เข้าหน้าจัดการแอดมินโดยไม่ได้เข้าสู่ระบบ (Invalid)", "ยังไม่เข้าสู่ระบบ Admin Web", "1. พิมพ์ URL เข้าหน้า /users หรือ /logs โดยตรงบนเบราว์เซอร์", "URL: http://localhost:3000/users (ไม่มีเซสชัน)", "ระบบ Middleware บล็อกการเข้าถึงและดีดกลับไปหน้า /login ทันที (HTTP 307)", "ดีดกลับหน้า /login อัตโนมัติสำเร็จ", "Pass"],
]

REPORT_ROWS = [
    ["1", "ระบบสมาชิกและการยืนยันตัวตน (Authentication & Profile)", "TS_001 – TS_003", "6", "6", "0", "100%"],
    ["2", "ระบบจัดการทีมและการทำงานร่วมกัน (Team Workspace & Ideas)", "TS_004, TS_006 – TS_008", "8", "8", "0", "100%"],
    ["3", "ระบบกระบวนการผลิตสื่อและตรวจรับงาน (Content & Task Workflow)", "TS_005, TS_009 – TS_011", "8", "8", "0", "100%"],
    ["4", "ระบบบริหารจัดการและกำกับดูแลสำหรับแอดมิน (Admin Web Portal)", "TS_012 – TS_014", "6", "6", "0", "100%"],
    ["รวมทั้งหมด (Total)", "ครอบคลุมครบทั้ง 14 Use Cases (TS_001 – TS_014)", "14 Scenarios", "28", "28", "0", "100%"],
]


def add_heading_paragraph(doc, text, style_name="Heading 1", size_pt=16):
    p = doc.add_paragraph(style=style_name)
    r = p.add_run(text)
    set_thai_font(r, size_pt, bold=True)
    return p


def add_body_paragraph(doc, text, indent_first_line=True):
    p = doc.add_paragraph(style="Normal")
    if indent_first_line:
        p.paragraph_format.first_line_indent = Twips(990)
    r = p.add_run(text)
    set_thai_font(r, 16, bold=False)
    return p


def main():
    doc = docx.Document(DESKTOP_DOCX)

    # Clean up any trailing blank paragraphs and placeholder 'ภาคผนวก' after ภาคผนวก A caption (ภาพที่ 59)
    idx_fig59 = None
    idx_app_b = None
    for i, p in enumerate(doc.paragraphs):
        if p.style.name.lower().startswith("toc"):
            continue
        if "แผนภาพกระบวนการทางธุรกิจในการบริหารจัดการผลิตสื่อ (BPMN Diagram)" in p.text and p.style.name == "Caption":
            idx_fig59 = i
        if "ภาคผนวก B" in p.text:
            idx_app_b = i
            break

    # If ภาคผนวก B was previously added, remove paragraphs and tables after idx_fig59
    if idx_fig59 is not None:
        for i in range(len(doc.paragraphs) - 1, idx_fig59, -1):
            p_del = doc.paragraphs[i]
            p_del._element.getparent().remove(p_del._element)

    # Add a single spacer paragraph after ภาคผนวก A
    doc.add_paragraph("")

    # --- ภาคผนวก B Heading ---
    add_heading_paragraph(doc, "ภาคผนวก B – เอกสารการทดสอบระบบ (Manual System Testing)", "Heading 1", 16)
    add_body_paragraph(
        doc,
        "เอกสารการทดสอบระบบแบบแมนนวล (Manual System Testing) จัดทำขึ้นเพื่อทวนสอบและยืนยันความถูกต้องของฟังก์ชันการทำงานทั้งหมดในระบบบริหารกระบวนการผลิตสื่อ (Content Production Management System) ทั้งบนโมบายแอปพลิเคชันและเว็บแอปพลิเคชันสำหรับผู้ดูแลระบบ โดยแบ่งออกเป็น 4 ส่วนหลัก ได้แก่ การวางแผนการทดสอบ (Test Plan), สรุปภาพรวมสถานการณ์การทดสอบ (Test Scenario Summary), รายละเอียดกรณีทดสอบ (Test Case) และรายงานสรุปผลการทดสอบ (Test Report) ดังรายละเอียดต่อไปนี้",
    )

    # --- B.1 Test Plan ---
    add_heading_paragraph(doc, "B.1 การวางแผนการทดสอบระบบ (Test Plan)", "Heading 2", 16)
    add_body_paragraph(
        doc,
        "การวางแผนการทดสอบระบบมุ่งเน้นการตรวจสอบความถูกต้องของการทำงานตามขอบเขตความต้องการของระบบ (SRS) และแผนภาพยูสเคส (Use Case Diagram) ทั้ง 14 ยูสเคส โดยกำหนดตารางระยะเวลาการดำเนินงาน หน้าที่ความรับผิดชอบของทีมทดสอบ และสภาพแวดล้อมที่ใช้ในการทดสอบ ดังแสดงในตารางที่ 20 ถึงตารางที่ 22",
    )

    add_table_seq_caption(doc, 20, "แผนการดำเนินงานและช่วงเวลาการทดสอบระบบ (Test Schedule)")
    create_styled_table(
        doc,
        headers=["ลำดับ", "กิจกรรมในการทดสอบ (Testing Activities)", "ช่วงเวลาดำเนินงาน", "ผู้รับผิดชอบ", "ผลลัพธ์ที่ได้ (Deliverables)"],
        rows_data=SCHEDULE_ROWS,
        col_widths_inches=[0.5, 2.3, 1.3, 1.2, 1.4],
        font_size_pt=14,
        center_cols={0, 2},
    )

    add_table_seq_caption(doc, 21, "บทบาทและหน้าที่ความรับผิดชอบของทีมทดสอบ (Roles & Responsibilities)")
    create_styled_table(
        doc,
        headers=["บทบาทหน้าที่ (Role)", "ขอบเขตความรับผิดชอบ (Responsibilities)"],
        rows_data=ROLES_ROWS,
        col_widths_inches=[2.0, 4.7],
        font_size_pt=14,
        center_cols=set(),
    )

    add_table_seq_caption(doc, 22, "สภาพแวดล้อมและทรัพยากรที่ใช้ในการทดสอบ (Test Environment)")
    create_styled_table(
        doc,
        headers=["องค์ประกอบ (Component)", "รายละเอียดสภาพแวดล้อมและข้อมูลที่ใช้ทดสอบ (Specification)"],
        rows_data=ENV_ROWS,
        col_widths_inches=[2.0, 4.7],
        font_size_pt=14,
        center_cols=set(),
    )

    # --- B.2 Test Scenario / Summary ---
    add_heading_paragraph(doc, "B.2 สรุปภาพรวมสถานการณ์การทดสอบ (Test Scenario Summary)", "Heading 2", 16)
    add_body_paragraph(
        doc,
        "การสรุปภาพรวมสถานการณ์การทดสอบเป็นการนำฟังก์ชันหลักจาก Use Case ทั้ง 14 รายการ มาจำแนกออกเป็นรหัสสถานการณ์การทดสอบ (Test Scenario: TS_001 ถึง TS_014) โดยในแต่ละสถานการณ์ประกอบด้วยกรณีทดสอบแบบข้อมูลถูกต้อง (Valid Case) และกรณีข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน (Invalid Case) รวมทั้งสิ้น 28 กรณีทดสอบ ดังแสดงในตารางที่ 23",
    )

    add_table_seq_caption(doc, 23, "สรุปภาพรวมสถานการณ์การทดสอบ (Test Scenario Summary)")
    create_styled_table(
        doc,
        headers=["รหัส Scenario", "ชื่อฟีเจอร์ / Use Case", "แพลตฟอร์ม", "ผู้ใช้งาน", "วัตถุประสงค์ของการทดสอบ", "จำนวน TC"],
        rows_data=SCENARIO_ROWS,
        col_widths_inches=[0.8, 1.5, 0.8, 0.9, 2.1, 0.6],
        font_size_pt=14,
        center_cols={0, 2, 3, 5},
    )

    # --- B.3 Test Case Specification ---
    add_heading_paragraph(doc, "B.3 รายละเอียดกรณีทดสอบระบบ (Test Case Specification)", "Heading 2", 16)
    add_body_paragraph(
        doc,
        "รายละเอียดกรณีทดสอบระบบแบบแมนนวล (Manual Test Cases) ทั้ง 28 กรณีทดสอบ (TC_001 ถึง TC_028) ระบุเงื่อนไขก่อนการทดสอบ ขั้นตอนการทดสอบ ข้อมูลที่ใช้ทดสอบ ผลลัพธ์ที่คาดหวัง ผลลัพธ์ที่เกิดขึ้นจริง และสถานะผลการทดสอบ ดังแสดงในตารางที่ 24",
    )

    add_table_seq_caption(doc, 24, "รายละเอียดกรณีทดสอบระบบ (Manual Test Cases: TC_001 – TC_028)")
    create_styled_table(
        doc,
        headers=["รหัส TC", "Scenario", "ชื่อกรณีทดสอบ", "เงื่อนไขก่อนหน้า", "ขั้นตอนการทดสอบ", "ข้อมูลที่ใช้ทดสอบ", "ผลลัพธ์ที่คาดหวัง", "ผลลัพธ์จริง", "สถานะ"],
        rows_data=TEST_CASE_ROWS,
        col_widths_inches=[0.55, 0.55, 0.85, 0.75, 1.05, 0.85, 0.95, 0.70, 0.45],
        font_size_pt=12,
        center_cols={0, 1, 8},
    )

    # --- B.4 Test Report ---
    add_heading_paragraph(doc, "B.4 รายงานสรุปผลการทดสอบระบบ (Test Report)", "Heading 2", 16)
    add_body_paragraph(
        doc,
        "จากการดำเนินการทดสอบระบบบริหารกระบวนการผลิตสื่อตามกรณีทดสอบทั้ง 28 รายการ ครอบคลุมทั้ง 4 โมดูลหลักและ 14 สถานการณ์การทดสอบ พบว่าระบบสามารถทำงานได้ถูกต้องตามความต้องการของระบบทั้งหมด คิดเป็นอัตราการผ่านการทดสอบร้อยละ 100 โดยไม่พบข้อบกพร่องคงค้าง (0 Defects) ดังสรุปในตารางที่ 25",
    )

    add_table_seq_caption(doc, 25, "รายงานสรุปผลการทดสอบระบบแยกตามโมดูลการทำงาน (Test Execution Summary Report)")
    create_styled_table(
        doc,
        headers=["ลำดับ", "โมดูลการทำงาน (System Module)", "รหัส Scenario", "จำนวน TC ทั้งหมด", "ผ่าน (Pass)", "ไม่ผ่าน (Fail)", "อัตราผ่าน (%)"],
        rows_data=REPORT_ROWS,
        col_widths_inches=[0.6, 2.5, 1.2, 0.7, 0.6, 0.6, 0.6],
        font_size_pt=14,
        center_cols={0, 2, 3, 4, 5, 6},
    )

    add_body_paragraph(
        doc,
        "สรุปผลการประเมินความพร้อมของระบบ: ระบบบริหารกระบวนการผลิตสื่อทั้งในส่วนของโมบายแอปพลิเคชันสำหรับหัวหน้าทีมและสมาชิกฝ่ายผลิต และเว็บแอปพลิเคชันสำหรับผู้ดูแลระบบ ผ่านเกณฑ์การทดสอบความถูกต้องของฟังก์ชันการทำงาน (Functional Requirement) การตรวจสอบความถูกต้องของข้อมูลนำเข้า (Validation) และการควบคุมสิทธิ์การเข้าถึงข้อมูลระดับทีม (Role & Team Isolation Security) ครบถ้วนสมบูรณ์ร้อยละ 100 มีความพร้อมสำหรับการนำไปใช้งานจริง",
    )

    # Save to repo academic directory
    os.makedirs(os.path.dirname(REPO_DOCX), exist_ok=True)
    doc.save(REPO_DOCX)
    print(f"Saved updated document to {REPO_DOCX}")

    # Save to Desktop (or fallback if open in Word)
    try:
        doc.save(DESKTOP_DOCX)
        print(f"Saved updated document directly to {DESKTOP_DOCX}")
    except PermissionError:
        doc.save(FALLBACK_DOCX)
        print(f"Desktop file is open in Word; saved to {FALLBACK_DOCX}")


if __name__ == "__main__":
    main()
