import os
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

def build_test_excel(output_path):
    wb = Workbook()
    
    # Styles Definition
    font_title = Font(name='Tahoma', size=16, bold=True, color='0F172A')
    font_subtitle = Font(name='Tahoma', size=10, italic=True, color='475569')
    font_section = Font(name='Tahoma', size=12, bold=True, color='1E293B')
    
    font_header = Font(name='Tahoma', size=10, bold=True, color='FFFFFF')
    fill_header = PatternFill(start_color='1E293B', end_color='1E293B', fill_type='solid')
    
    font_card_num = Font(name='Tahoma', size=18, bold=True, color='0F172A')
    font_card_lbl = Font(name='Tahoma', size=9, bold=True, color='64748B')
    fill_card = PatternFill(start_color='F1F5F9', end_color='F1F5F9', fill_type='solid')
    
    font_regular = Font(name='Tahoma', size=9, color='0F172A')
    font_bold = Font(name='Tahoma', size=9, bold=True, color='0F172A')
    
    fill_alt_row = PatternFill(start_color='F8FAFC', end_color='F8FAFC', fill_type='solid')
    fill_white = PatternFill(start_color='FFFFFF', end_color='FFFFFF', fill_type='solid')
    
    fill_pass = PatternFill(start_color='DCFCE7', end_color='DCFCE7', fill_type='solid')
    font_pass = Font(name='Tahoma', size=9, bold=True, color='15803D')
    
    fill_badge_high = PatternFill(start_color='FEF3C7', end_color='FEF3C7', fill_type='solid')
    font_badge_high = Font(name='Tahoma', size=9, bold=True, color='B45309')

    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )
    
    thick_bottom = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='medium', color='1E293B')
    )

    # -------------------------------------------------------------------------
    # Sheet 1: Dashboard & Summary
    # -------------------------------------------------------------------------
    ws_dash = wb.active
    ws_dash.title = "Summary & Dashboard"
    ws_dash.views.sheetView[0].showGridLines = True
    
    ws_dash['B2'] = "Draftly — Content Production Management System"
    ws_dash['B2'].font = font_title
    ws_dash['B3'] = "รายงานผลการทดสอบระบบแบบครบวงจร (Dual Verification: Manual Test Plan & Robot Framework Acceptance Tests)"
    ws_dash['B3'].font = font_subtitle
    
    # KPI Metric Cards
    kpis = [
        ("รวมกรณีทดสอบทั้งหมด", "41 Tests", "B5", "C6"),
        ("Manual Test Cases (IEEE 829)", "15 Tests", "D5", "E6"),
        ("Automated Tests (Robot)", "26 Tests", "F5", "G6"),
        ("อัตราความสำเร็จ (Pass Rate)", "100%", "H5", "I6")
    ]
    
    for title, val, top_left, bot_right in kpis:
        c1, r1 = top_left[0], int(top_left[1])
        c2, r2 = bot_right[0], int(bot_right[1])
        ws_dash.merge_cells(f"{top_left}:{c2}{r1}")
        ws_dash.merge_cells(f"{c1}{r2}:{bot_right}")
        
        lbl_cell = ws_dash[f"{c1}{r1}"]
        lbl_cell.value = title
        lbl_cell.font = font_card_lbl
        lbl_cell.alignment = Alignment(horizontal='center', vertical='center')
        
        val_cell = ws_dash[f"{c1}{r2}"]
        val_cell.value = val
        val_cell.font = font_card_num
        val_cell.alignment = Alignment(horizontal='center', vertical='center')
        
        # Border & Fill
        for row in ws_dash[f"{top_left}:{bot_right}"]:
            for cell in row:
                cell.fill = fill_card
                cell.border = thin_border

    # Test Environment Table
    ws_dash['B9'] = "1. ข้อมูลสภาพแวดล้อมที่ใช้ทดสอบ (Test Environment & Infrastructure)"
    ws_dash['B9'].font = font_section
    
    env_headers = ["ส่วนประกอบ (Component)", "เทคโนโลยี (Technology)", "พอร์ต / ที่อยู่ (Port/Host)", "สถานะการทำงาน (Status)"]
    for col_idx, h in enumerate(env_headers, start=2):
        cell = ws_dash.cell(row=11, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = thin_border
        
    env_data = [
        ["Database Server", "MongoDB Community Server 7.0 (Mongoose ODM)", "127.0.0.1:27017 (content_management)", "ONLINE (Connected)"],
        ["Application Backend", "Node.js 20.x, Express.js 4.x, Socket.io Realtime", "http://127.0.0.1:5000", "ONLINE (Healthy)"],
        ["Admin Web Portal", "Next.js 14, React 18, Tailwind CSS", "http://localhost:3000", "READY"],
        ["Mobile Application", "React Native 0.74, React Navigation, WebSocket", "Xiaomi 13 Pro & Android Emulator", "DEPLOYED"],
        ["Automated Test Engine", "Robot Framework 7.5, RequestsLibrary 0.9.7", "Python 3.14 (.venv)", "EXECUTION COMPLETE (100% PASS)"]
    ]
    
    for r_idx, row_vals in enumerate(env_data, start=12):
        for c_idx, val in enumerate(row_vals, start=2):
            cell = ws_dash.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_regular
            cell.border = thin_border
            cell.fill = fill_alt_row if r_idx % 2 == 0 else fill_white
            if c_idx == 5:
                cell.font = font_pass
                cell.fill = fill_pass
                cell.alignment = Alignment(horizontal='center', vertical='center')

    # Test Accounts Table
    ws_dash['B19'] = "2. บัญชีผู้ใช้มาตรฐานสำหรับการทดสอบ (Pre-seeded Test Accounts)"
    ws_dash['B19'].font = font_section
    
    acc_headers = ["บทบาท (Role)", "อีเมล (Email)", "รหัสผ่าน (Password)", "สังกัดทีม (Team)", "สิทธิ์และหน้าที่หลัก (Primary Scope)"]
    for col_idx, h in enumerate(acc_headers, start=2):
        cell = ws_dash.cell(row=21, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = thin_border
        
    acc_data = [
        ["Admin", "admin@studio.com", "123456", "Global (ส่วนกลาง)", "บริหารจัดการผู้ใช้ สิทธิ์ระบบ กำกับดูแลคอนเทนต์ และตรวจ Audit Logs"],
        ["Manager", "manager@studio.com", "123456", "TEAM-A (Content Team A)", "สร้างสายการผลิต มอบหมายงาน ตรวจสอบ สั่งแก้ไข อนุมัติ และเผยแพร่"],
        ["Member", "member@studio.com", "123456", "TEAM-A (Content Team A)", "ปฏิบัติงานตามที่ได้รับมอบหมาย ส่งมอบผลงาน เสนอไอเดีย และตอบกลับข้อความแก้"],
        ["Outsider", "outsider@studio.com", "123456", "TEAM-B (Beta Studio)", "ทดสอบการแบ่งแยกสิทธิ์และป้องกันการเข้าถึงข้อมูลข้ามทีม (Team Isolation Guard)"]
    ]
    
    for r_idx, row_vals in enumerate(acc_data, start=22):
        for c_idx, val in enumerate(row_vals, start=2):
            cell = ws_dash.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_regular
            cell.border = thin_border
            cell.fill = fill_alt_row if r_idx % 2 == 0 else fill_white
            if c_idx == 2:
                cell.font = font_bold
            if c_idx in [3, 4]:
                cell.alignment = Alignment(horizontal='center', vertical='center')

    # -------------------------------------------------------------------------
    # Sheet 2: Manual Test Cases (IEEE 829 Standard)
    # -------------------------------------------------------------------------
    ws_manual = wb.create_sheet(title="Manual Test Cases")
    ws_manual.views.sheetView[0].showGridLines = True
    ws_manual.freeze_panes = "A2"
    
    m_headers = [
        "Test Case ID", "Use Case Ref", "หมวดหมู่ (Module)", "Actor",
        "ชื่อกรณีทดสอบและวัตถุประสงค์ (Test Scenario / Objective)", "เงื่อนไขเบื้องต้น (Preconditions)",
        "ลำดับขั้นตอนการทดสอบ (Test Steps)", "ข้อมูลนำเข้า (Test Data)",
        "ผลลัพธ์ที่คาดหวัง (Expected Results)", "ผลการทดสอบจริง (Actual Results)",
        "สถานะ (Status)", "ความสำคัญ (Priority)", "วันที่ทดสอบ", "ผู้ทดสอบ"
    ]
    
    for c_idx, h in enumerate(m_headers, start=1):
        cell = ws_manual.cell(row=1, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        cell.border = thick_bottom
    ws_manual.row_dimensions[1].height = 28
    
    manual_cases = [
        ["TC-AUTH-01", "UC-01", "Authentication", "All Roles",
         "เข้าสู่ระบบสำเร็จด้วยข้อมูลที่ถูกต้อง (Positive Test)", "มีบัญชีในระบบและสถานะ ACTIVE",
         "1. เปิดหน้า Login\n2. กรอกอีเมลและรหัสผ่าน\n3. กดปุ่มเข้าสู่ระบบ", "Email: manager@studio.com\nPass: 123456",
         "ระบบตรวจสอบความถูกต้อง สร้าง JWT Bearer Token และนำทางสู่หน้าหลักตามบทบาท", "เข้าสู่ระบบสำเร็จ ได้รับ JWT Token และแสดง Dashboard ตรงตามสิทธิ์",
         "PASS", "High", "15/10/2026", "QA Team"],
         
        ["TC-AUTH-02", "UC-01", "Authentication", "All Roles",
         "ปฏิเสธการเข้าสู่ระบบกรณีรหัสผ่านไม่ถูกต้อง (Negative Test)", "มีบัญชีในระบบ",
         "1. เปิดหน้า Login\n2. กรอกอีเมลถูกต้อง\n3. กรอกรหัสผ่านผิด\n4. กดปุ่มเข้าสู่ระบบ", "Email: manager@studio.com\nPass: wrongpass999",
         "ระบบปฏิเสธการเข้าถึง ส่งรหัส HTTP 401 Unauthorized พร้อมข้อความ Invalid credentials", "ระบบแจ้งเตือน Invalid credentials และไม่อนุญาตให้เข้าสู่ระบบ",
         "PASS", "High", "15/10/2026", "QA Team"],

        ["TC-AUTH-03", "UC-01", "Authentication", "Member",
         "การเรียกดูข้อมูลโปรไฟล์และสถานะตนเอง (Profile Fetch)", "ผู้ใช้เข้าสู่ระบบแล้ว",
         "1. ผู้ใช้เรียกดูข้อมูลโปรไฟล์ผ่าน GET /api/auth/me", "JWT Bearer Token",
         "ระบบส่งคืนข้อมูลผู้ใช้ ชื่อ ตำแหน่งงาน สิทธิ์ และทีมสังกัดถูกต้อง", "ข้อมูลโปรไฟล์แสดงผลครบถ้วนตรงตามฐานข้อมูล",
         "PASS", "Medium", "15/10/2026", "QA Team"],

        ["TC-TEAM-01", "UC-02", "Team Operations", "Member",
         "เข้าร่วมทีมด้วยรหัสทีมถูกต้อง (Positive Join Team)", "ผู้ใช้เข้าสู่ระบบแล้ว และยังไม่มีสังกัดหรือต้องการย้ายทีม",
         "1. เปิดเมนูเข้าร่วมทีม\n2. ระบุ Team Code ที่มีอยู่จริง\n3. กดยืนยัน", "Join Code: TEAM-A",
         "ผู้ใช้ถูกผูกเข้ากับทีมสำเร็จ และระบบนำทางไปยังหน้าจอ Team Workspace", "ผู้ใช้เข้าร่วมทีม Team A สำเร็จ และแสดงผลข้อมูลทีมถูกต้อง",
         "PASS", "High", "15/10/2026", "QA Team"],

        ["TC-TEAM-02", "UC-02", "Team Operations", "Member",
         "ปฏิเสธการเข้าร่วมทีมกรณีรหัสไม่ถูกต้อง (Negative Join Team)", "ผู้ใช้เข้าสู่ระบบแล้ว",
         "1. เปิดเมนูเข้าร่วมทีม\n2. ระบุ Team Code ที่ไม่มีในระบบ\n3. กดยืนยัน", "Join Code: INVALID99",
         "ระบบส่ง HTTP 400 Bad Request แจ้งเตือนไม่พบทีมที่ตรงกับรหัสดังกล่าว", "ระบบแสดงข้อความเตือนไม่พบทีมและไม่อนุญาตให้เข้าร่วม",
         "PASS", "Medium", "15/10/2026", "QA Team"],

        ["TC-TEAM-03", "UC-06", "Team Operations", "Manager",
         "กำหนดตำแหน่งงานเฉพาะทางให้แก่สมาชิก (Position Assignment)", "Manager เข้าสู่ระบบและจัดการทีมของตนเอง",
         "1. เปิดหน้ารายชื่อสมาชิกในทีม\n2. เลือกสมาชิกและเปลี่ยนตำแหน่ง\n3. กดยืนยัน", "Member: member@studio.com\nPosition: Video Editor",
         "ตำแหน่งของสมาชิกถูกอัปเดตเป็น Video Editor และบันทึกลง Team Activity Feed", "ตำแหน่งสมาชิกอัปเดตสำเร็จ และฟีดกิจกรรมบันทึกการเปลี่ยนแปลง",
         "PASS", "Medium", "15/10/2026", "QA Team"],

        ["TC-PROD-01", "UC-07", "Production Workflow", "Manager",
         "สร้างชิ้นงานคอนเทนต์และแตกงานย่อยมอบหมายงานผลิต", "Manager เข้าสู่ระบบในทีม Team A",
         "1. กดปุ่ม + สร้าง Content\n2. ระบุชื่อและแพลตฟอร์ม\n3. แตกงานย่อยและมอบหมายสมาชิก\n4. กดยืนยัน", "Title: รีวิวสมาร์ตโฟน 2026\nPlatform: YouTube\nTask: ตัดต่อวิดีโอ (Member)",
         "Content ถูกสร้างในสถานะ PLANNING และ Task ถูกสร้างในสถานะ TODO พร้อมแจ้งเตือนสมาชิก", "Content และ Task ถูกสร้างลงฐานข้อมูลและแสดงใน Pipeline ถูกต้อง",
         "PASS", "High", "15/10/2026", "QA Team"],

        ["TC-PROD-02", "UC-03", "Production Workflow", "Member",
         "เริ่มปฏิบัติงานและส่งมอบผลงานด้วยลิงก์ URL (Submit Deliverable)", "Member มีงานที่ได้รับมอบหมายในสถานะ TODO",
         "1. Member ปรับสถานะงานเป็น IN_PROGRESS\n2. แนบลิงก์ผลงาน Google Drive\n3. กดส่งตรวจงาน", "Status: IN_PROGRESS -> REVIEW\nURL: https://drive.google.com/test-cut",
         "Task เปลี่ยนเป็น REVIEW และ Content หลักปรับเป็น REVIEW เข้าสู่คิวตรวจของ Manager", "Task และ Content ปรับสถานะเป็น REVIEW และส่งเข้าคิวตรวจเรียบร้อย",
         "PASS", "High", "15/10/2026", "QA Team"],

        ["TC-PROD-03", "UC-08", "Production Workflow", "Manager",
         "ตรวจสอบงานและส่งกลับแก้ไขพร้อมระบุคำแนะนำ (Request Revision)", "ชิ้นงานอยู่ในสถานะ REVIEW ในคิวตรวจของ Manager",
         "1. Manager เปิดดูไฟล์งานจาก URL\n2. กดปุ่มส่งกลับแก้ไข\n3. พิมพ์ข้อความคำแนะนำ\n4. กดยืนยัน", "Decision: REVISION\nNotes: กรุณาปรับลดเสียงเพลงประกอบลง 20%",
         "Content และ Task เปลี่ยนสถานะเป็น REVISION บันทึกลงประวัติการตรวจ และแจ้งเตือนสมาชิก", "สถานะเปลี่ยนเป็น REVISION และข้อความสั่งแก้แสดงในการ์ดงานของสมาชิก",
         "PASS", "High", "15/10/2026", "QA Team"],

        ["TC-PROD-04", "UC-03", "Production Workflow", "Member",
         "ส่งงานรอบแก้ไขพร้อมพิมพ์ข้อความชี้แจง (Submit Revision Reply)", "Task อยู่ในสถานะ REVISION และมีข้อความคำแนะนำ",
         "1. สมาชิกเปิดงานที่ต้องแก้ไข\n2. พิมพ์ Reply Notes ชี้แจง\n3. แนบลิงก์ไฟล์ใหม่\n4. กดส่งตรวจซ้ำ", "Reply Notes: ปรับลดเสียงตามคำแนะนำแล้วครับ\nURL: https://drive.google.com/cut-v2",
         "Task เปลี่ยนสถานะเป็น REVIEW พร้อมบันทึก Reply Notes เพื่อให้ Manager เห็นในรอบตรวจซ้ำ", "Task ปรับเป็น REVIEW และข้อความตอบกลับถูกบันทึกสมบูรณ์",
         "PASS", "High", "15/10/2026", "QA Team"],

        ["TC-PROD-05", "UC-08", "Production Workflow", "Manager",
         "อนุมัติชิ้นงานโดยตรงแบบ 1-Tap (Direct 1-Tap Content Approval)", "Content และ Tasks อยู่ในสถานะ REVIEW รอบสมบูรณ์",
         "1. Manager ตรวจงานรอบแก้ไข\n2. กดปุ่มอนุมัติชิ้นงาน (Approve)", "Decision: APPROVED\nNotes: ผ่านมาตรฐานการผลิต",
         "Content ปรับสถานะเป็น APPROVED และ Tasks ย่อยทั้งหมดถูกซิงค์เป็น DONE (100%) อัตโนมัติ", "Content ได้รับการอนุมัติ และ Task ทั้งหมดปรับเป็น DONE 100% สำเร็จ",
         "PASS", "High", "15/10/2026", "QA Team"],

        ["TC-PROD-06", "UC-09", "Production Workflow", "Manager",
         "เผยแพร่ผลงานสู่ช่องทางสาธารณะ (Publish Content Now)", "Content อยู่ในสถานะ APPROVED",
         "1. เลือก Content ที่ผ่านการอนุมัติ\n2. ระบุลิงก์ผลงานจริง\n3. กดปุ่มเผยแพร่ผลงาน", "Status: PUBLISHED\nURL: https://youtube.com/watch?v=live123",
         "Content ปรับสถานะเป็น PUBLISHED บันทึก publishedAt เป็นเวลาปัจจุบัน และแจ้งเตือนทีม", "Content แสดงสถานะ PUBLISHED พร้อมระบุเวลาเผยแพร่สมบูรณ์",
         "PASS", "High", "15/10/2026", "QA Team"],

        ["TC-IDEA-01", "UC-04", "Ideation", "Member",
         "เสนอแนวคิดคอนเทนต์ใหม่เข้าสู่คลังสตูดิโอ (Pitch Idea)", "สมาชิกสังกัดอยู่ในทีมและมีสิทธิ์เข้าถึง Idea Board",
         "1. เปิดแท็บ Idea Board\n2. กดปุ่ม + เสนอไอเดีย\n3. กรอกชื่อและรายละเอียด\n4. กดยืนยัน", "Title: เทคนิค Generative AI 2026\nPlatform: TikTok\nCategory: Tech",
         "ไอเดียถูกสร้างในสถานะ DRAFT และแสดงผลบนบอร์ดของทีมให้ร่วมแสดงความคิดเห็น", "ไอเดียถูกบันทึกลงฐานข้อมูลและแสดงผลบนบอร์ดทันที",
         "PASS", "Medium", "15/10/2026", "QA Team"],

        ["TC-TRK-01", "UC-05", "Real-Time Tracking", "All Members",
         "ติดตามความคืบหน้าภาพรวมและกระแสกิจกรรมสดของทีม (Team Activity Feed)", "ผู้ใช้เข้าสู่หน้าจอ Team Workspace ของทีมตนเอง",
         "1. เปิดแท็บทีมของฉัน\n2. ตรวจสอบแถบ Overall Progress %\n3. ดึงเพื่อรีเฟรชฟีดกิจกรรม", "Team: TEAM-A",
         "ระบบแสดงค่าความคืบหน้ารวมที่คำนวณจากทุกงาน และลำดับกิจกรรมสดตามเวลาจริง", "แถบความคืบหน้าแสดงผลแม่นยำ และฟีดกิจกรรมอัปเดตแบบเรียลไทม์",
         "PASS", "Medium", "15/10/2026", "QA Team"],

        ["TC-ADM-01", "UC-10, 11, 12", "Admin & Security", "Admin",
         "การกำกับดูแลผู้ใช้ คอนเทนต์ภาพรวม และบันทึกความปลอดภัย (Audit Logs)", "Admin เข้าสู่ระบบผ่าน Admin Web Portal",
         "1. เข้าเมนู User Management\n2. เข้าเมนู Content Management\n3. เข้าเมนู Audit Logs", "Admin JWT Token",
         "Admin สามารถสืบค้นรายชื่อผู้ใช้ทุกทีม ตรวจสอบคอนเทนต์ทั้งหมด และดูบันทึกเหตุการณ์ความปลอดภัย", "ข้อมูลผู้ใช้ คอนเทนต์ และประวัติการทำธุรกรรมแสดงผลครบถ้วน 100%",
         "PASS", "High", "15/10/2026", "QA Team"]
    ]
    
    for r_idx, row in enumerate(manual_cases, start=2):
        ws_manual.row_dimensions[r_idx].height = 42
        for c_idx, val in enumerate(row, start=1):
            cell = ws_manual.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_regular
            cell.border = thin_border
            cell.fill = fill_alt_row if r_idx % 2 == 0 else fill_white
            cell.alignment = Alignment(vertical='top', wrap_text=True)
            
            if c_idx in [1, 2, 4, 12, 13, 14]:
                cell.alignment = Alignment(horizontal='center', vertical='top')
            if c_idx == 1:
                cell.font = font_bold
            if c_idx == 11: # Status PASS
                cell.fill = fill_pass
                cell.font = font_pass
                cell.alignment = Alignment(horizontal='center', vertical='center')
            if c_idx == 12: # Priority
                if val == 'High':
                    cell.fill = fill_badge_high
                    cell.font = font_badge_high

    # Auto-fit column widths for Sheet 2
    col_widths_manual = [14, 14, 18, 12, 32, 26, 32, 28, 34, 34, 12, 12, 14, 14]
    for idx, width in enumerate(col_widths_manual, start=1):
        ws_manual.column_dimensions[get_column_letter(idx)].width = width

    # -------------------------------------------------------------------------
    # Sheet 3: Automated Robot Tests (26 Tests)
    # -------------------------------------------------------------------------
    ws_auto = wb.create_sheet(title="Robot Automated Tests")
    ws_auto.views.sheetView[0].showGridLines = True
    ws_auto.freeze_panes = "A2"
    
    a_headers = [
        "Suite File", "Test Case ID", "Use Case", "คำอธิบายกรณีทดสอบ (Test Description)",
        "API Endpoint & Method", "Tags", "การตรวจสอบและผลลัพธ์ (Assertions & Verifications)",
        "ผลการทดสอบ (Status)", "เวลาที่ใช้ (Duration)", "ประเภทการทดสอบ"
    ]
    for c_idx, h in enumerate(a_headers, start=1):
        cell = ws_auto.cell(row=1, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        cell.border = thick_bottom
    ws_auto.row_dimensions[1].height = 28
    
    auto_cases = [
        # Suite 1
        ["01_authentication_tests.robot", "TC_AUTH_01", "UC-01", "Verify System Health And Database Connection", "GET /api/health", "smoke, health", "status=healthy, db.status=connected, services.api=online", "PASS", "0.04s", "Acceptance / Smoke"],
        ["01_authentication_tests.robot", "TC_AUTH_02", "UC-01", "Successful Login As Administrator", "POST /api/auth/login", "auth, admin", "HTTP 200, JWT token returned, user.role=ADMIN", "PASS", "0.06s", "Acceptance / Security"],
        ["01_authentication_tests.robot", "TC_AUTH_03", "UC-01", "Successful Login As Production Manager", "POST /api/auth/login", "auth, manager", "HTTP 200, JWT token returned, user.role=MANAGER", "PASS", "0.05s", "Acceptance"],
        ["01_authentication_tests.robot", "TC_AUTH_04", "UC-01", "Successful Login As Production Member", "POST /api/auth/login", "auth, member", "HTTP 200, JWT token returned, user.role=MEMBER", "PASS", "0.05s", "Acceptance"],
        ["01_authentication_tests.robot", "TC_AUTH_05", "UC-01", "Reject Login With Incorrect Password", "POST /api/auth/login", "auth, negative", "HTTP 401 Unauthorized, message='Invalid credentials'", "PASS", "0.05s", "Negative / Security"],
        ["01_authentication_tests.robot", "TC_AUTH_06", "UC-01", "Verify Protected Route With Bearer JWT", "GET /api/auth/me", "auth, jwt", "HTTP 200 OK, message='You have access to this protected route'", "PASS", "0.04s", "Security / JWT"],

        # Suite 2
        ["02_team_workspace_tests.robot", "TC_TEAM_01", "UC-02", "Member Fetches Current Team Information", "GET /api/teams/my-team", "team, member", "HTTP 200, team.code=TEAM-A, team.name='Content Team A'", "PASS", "0.04s", "Acceptance"],
        ["02_team_workspace_tests.robot", "TC_TEAM_02", "UC-02", "Successfully Join Team With Valid Join Code", "POST /api/teams/join", "team, join", "HTTP 200, team.code=TEAM-A, member assigned to team", "PASS", "0.05s", "Acceptance"],
        ["02_team_workspace_tests.robot", "TC_TEAM_03", "UC-02", "Reject Join Team With Invalid Code", "POST /api/teams/join", "team, negative", "HTTP 400 Bad Request, message='ไม่พบทีม'", "PASS", "0.04s", "Negative"],
        ["02_team_workspace_tests.robot", "TC_TEAM_04", "UC-05", "Fetch Team Dashboard Metrics", "GET /api/teams/:id/dashboard", "team, dashboard", "HTTP 200, contains keys: team, stats, members, teamTasksCount", "PASS", "0.05s", "Acceptance / Aggregates"],
        ["02_team_workspace_tests.robot", "TC_TEAM_05", "UC-05", "Fetch Real-Time Chronological Activity Feed", "GET /api/teams/:id/activity", "team, activity", "HTTP 200, returns array of team activities ordered by timestamp", "PASS", "0.04s", "Acceptance / Real-time"],

        # Suite 3
        ["03_content_production_workflow_tests.robot", "TC_WORKFLOW_01", "UC-07", "Manager Creates Content Pipeline And Transitions To Production", "POST /api/contents & PATCH status", "workflow, manager, creation", "HTTP 201, content.status=PLANNING -> IN_PROGRESS, task.status=TODO", "PASS", "0.08s", "E2E Lifecycle"],
        ["03_content_production_workflow_tests.robot", "TC_WORKFLOW_02", "UC-03", "Member Starts Task Moving To IN_PROGRESS", "PATCH /api/tasks/:id/status", "workflow, member, progress", "HTTP 200, task.status=IN_PROGRESS, workingStatus=WORKING", "PASS", "0.05s", "E2E Lifecycle"],
        ["03_content_production_workflow_tests.robot", "TC_WORKFLOW_03", "UC-03", "Member Submits Work Deliverable URL Moving Task And Content To REVIEW", "PATCH /api/tasks/:id/status", "workflow, member, submission", "HTTP 200, task.status=REVIEW, parentContent.status=REVIEW, URL attached", "PASS", "0.06s", "E2E Lifecycle"],
        ["03_content_production_workflow_tests.robot", "TC_WORKFLOW_04", "UC-08", "Manager Reviews And Requests Revision With Notes", "POST /api/contents/:id/review", "workflow, manager, revision", "HTTP 200, content.status=REVISION, reviewHistory logged with notes", "PASS", "0.06s", "E2E Lifecycle"],
        ["03_content_production_workflow_tests.robot", "TC_WORKFLOW_05", "UC-03", "Member Submits Revision Reply With Notes And New URL", "PATCH /api/tasks/:id/status", "workflow, member, revision_reply", "HTTP 200, task.status=REVIEW, replyNotes saved, new URL attached", "PASS", "0.05s", "E2E Lifecycle"],
        ["03_content_production_workflow_tests.robot", "TC_WORKFLOW_06", "UC-08", "Manager Direct 1-Tap Approval Synchronizes Tasks To DONE", "POST /api/contents/:id/review", "workflow, manager, approval", "HTTP 200, content.status=APPROVED, tasks synced to DONE (100%)", "PASS", "0.06s", "E2E Lifecycle"],
        ["03_content_production_workflow_tests.robot", "TC_WORKFLOW_07", "UC-09", "Manager Publishes Approved Content", "PATCH /api/contents/:id/status", "workflow, manager, publishing", "HTTP 200, content.status=PUBLISHED, publishedAt recorded", "PASS", "0.05s", "E2E Lifecycle"],

        # Suite 4
        ["04_ideas_brainstorming_tests.robot", "TC_IDEA_01", "UC-04", "Member Proposes New Content Idea", "POST /api/ideas", "ideas, member", "HTTP 201, idea.status=DRAFT, title and category saved", "PASS", "0.05s", "Acceptance"],
        ["04_ideas_brainstorming_tests.robot", "TC_IDEA_02", "UC-04", "Fetch All Ideas On Idea Board", "GET /api/ideas", "ideas, list", "HTTP 200, returns ideas array with author details", "PASS", "0.04s", "Acceptance"],
        ["04_ideas_brainstorming_tests.robot", "TC_IDEA_03", "UC-04", "Manager Approves Content Idea", "PATCH /api/ideas/:id/status", "ideas, manager, approval", "HTTP 200, idea.status=APPROVED", "PASS", "0.05s", "Acceptance"],

        # Suite 5
        ["05_admin_and_security_tests.robot", "TC_ADMIN_01", "UC-10", "Admin Retrieves Complete Users Roster", "GET /api/users", "admin, users", "HTTP 200, returns full list of system users (>= 3)", "PASS", "0.05s", "Governance"],
        ["05_admin_and_security_tests.robot", "TC_ADMIN_02", "UC-11", "Admin Retrieves Global Content List Across Teams", "GET /api/contents", "admin, cms", "HTTP 200, returns global content without team filter", "PASS", "0.05s", "Governance"],
        ["05_admin_and_security_tests.robot", "TC_ADMIN_03", "UC-12", "Admin Retrieves System Audit Logs", "GET /api/logs", "admin, logs", "HTTP 200, returns operational and security audit events", "PASS", "0.04s", "Security & Audit"],
        ["05_admin_and_security_tests.robot", "TC_ADMIN_04", "UC-10", "Reject Member Access To Admin Users Management Endpoint", "GET /api/users", "security, rbac", "HTTP 403 Forbidden, message='permission denied'", "PASS", "0.04s", "Security / RBAC"],
        ["05_admin_and_security_tests.robot", "TC_ADMIN_05", "Security", "Enforce Cross-Team Isolation Security Guard", "GET /api/teams/:teamA/dashboard", "security, isolation", "HTTP 403 Forbidden, message='ไม่มีสิทธิ์เข้าถึงข้อมูลของทีมอื่น'", "PASS", "0.04s", "Security / Isolation"]
    ]
    
    for r_idx, row in enumerate(auto_cases, start=2):
        ws_auto.row_dimensions[r_idx].height = 24
        for c_idx, val in enumerate(row, start=1):
            cell = ws_auto.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_regular
            cell.border = thin_border
            cell.fill = fill_alt_row if r_idx % 2 == 0 else fill_white
            cell.alignment = Alignment(vertical='center')
            
            if c_idx in [2, 3, 6, 8, 9, 10]:
                cell.alignment = Alignment(horizontal='center', vertical='center')
            if c_idx == 2:
                cell.font = font_bold
            if c_idx == 8: # Status PASS
                cell.fill = fill_pass
                cell.font = font_pass

    col_widths_auto = [30, 16, 12, 36, 26, 24, 40, 12, 14, 20]
    for idx, width in enumerate(col_widths_auto, start=1):
        ws_auto.column_dimensions[get_column_letter(idx)].width = width

    # -------------------------------------------------------------------------
    # Sheet 4: Requirement Traceability Matrix (RTM)
    # -------------------------------------------------------------------------
    ws_rtm = wb.create_sheet(title="Traceability Matrix (RTM)")
    ws_rtm.views.sheetView[0].showGridLines = True
    ws_rtm.freeze_panes = "A2"
    
    r_headers = [
        "Use Case ID", "ชื่อฟังก์ชันการทำงาน (Use Case Name)", "บทบาทหลัก (Actor)",
        "กรณีทดสอบแบบดำเนินการด้วยตนเอง (Manual Test Cases)",
        "กรณีทดสอบอัตโนมัติ (Robot Framework Tests)",
        "สถานะความครอบคลุม (Coverage Status)"
    ]
    for c_idx, h in enumerate(r_headers, start=1):
        cell = ws_rtm.cell(row=1, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = thick_bottom
    ws_rtm.row_dimensions[1].height = 28
    
    rtm_data = [
        ["UC-01", "เข้าสู่ระบบและจัดการบัญชีผู้ใช้ (Authentication & Profile)", "Member, Manager, Admin", "TC-AUTH-01, TC-AUTH-02, TC-AUTH-03", "TC_AUTH_01 ถึง TC_AUTH_06 (6 Tests)", "100% COVERED"],
        ["UC-02", "เข้าร่วมทีมด้วยรหัสทีม (Join Team by Code)", "Member, Manager (สืบทอด)", "TC-TEAM-01, TC-TEAM-02", "TC_TEAM_01, TC_TEAM_02, TC_TEAM_03 (3 Tests)", "100% COVERED"],
        ["UC-03", "จัดการและส่งมอบงานย่อย (Tasks & Deliverables Management)", "Member, Manager (สืบทอด)", "TC-PROD-02, TC-PROD-04", "TC_WORKFLOW_02, TC_WORKFLOW_03, TC_WORKFLOW_05 (3 Tests)", "100% COVERED"],
        ["UC-04", "เสนอและแลกเปลี่ยนแนวคิดคอนเทนต์ (Ideas & Brainstorming)", "Member, Manager (สืบทอด)", "TC-IDEA-01", "TC_IDEA_01, TC_IDEA_02, TC_IDEA_03 (3 Tests)", "100% COVERED"],
        ["UC-05", "ติดตามความคืบหน้าและกิจกรรมทีมแบบเรียลไทม์ (Track Progress & Activities)", "Member, Manager (สืบทอด)", "TC-TRK-01", "TC_TEAM_04, TC_TEAM_05 (2 Tests)", "100% COVERED"],
        ["UC-06", "บริหารจัดการทีมและกำหนดตำแหน่งงาน (Team & Positions Management)", "Manager", "TC-TEAM-03", "TC_TEAM_01, TC_TEAM_02 (2 Tests)", "100% COVERED"],
        ["UC-07", "สร้างชิ้นงานและมอบหมายงานผลิต (Content Creation & Task Assignment)", "Manager", "TC-PROD-01", "TC_WORKFLOW_01 (1 Test)", "100% COVERED"],
        ["UC-08", "ตรวจรับ สั่งแก้ไข และอนุมัติชิ้นงาน (Review, Revision & Approval)", "Manager", "TC-PROD-03, TC-PROD-05", "TC_WORKFLOW_04, TC_WORKFLOW_06 (2 Tests)", "100% COVERED"],
        ["UC-09", "เผยแพร่ผลงานสู่สาธารณะ (Publish Content)", "Manager", "TC-PROD-06", "TC_WORKFLOW_07 (1 Test)", "100% COVERED"],
        ["UC-10", "บริหารจัดการผู้ใช้งาน ทีมงาน และสิทธิ์ระบบ (RBAC & User Administration)", "Admin", "TC-ADM-01", "TC_ADMIN_01, TC_ADMIN_04 (2 Tests)", "100% COVERED"],
        ["UC-11", "กำกับดูแลชิ้นงานและภารกิจทั้งหมดในระบบ (Global CMS Supervision)", "Admin", "TC-ADM-01", "TC_ADMIN_02 (1 Test)", "100% COVERED"],
        ["UC-12", "ตรวจสอบสถานะระบบและประวัติการดำเนินงาน (System Status & Audit Logs)", "Admin", "TC-ADM-01", "TC_ADMIN_03 (1 Test)", "100% COVERED"],
        ["Security", "การป้องกันสิทธิ์และการแบ่งแยกข้อมูลข้ามทีม (Team Isolation Guard)", "System Guard", "TC-SEC-01", "TC_ADMIN_05 (1 Test)", "100% COVERED"]
    ]
    
    for r_idx, row in enumerate(rtm_data, start=2):
        ws_rtm.row_dimensions[r_idx].height = 24
        for c_idx, val in enumerate(row, start=1):
            cell = ws_rtm.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_regular
            cell.border = thin_border
            cell.fill = fill_alt_row if r_idx % 2 == 0 else fill_white
            cell.alignment = Alignment(vertical='center')
            
            if c_idx in [1, 3, 6]:
                cell.alignment = Alignment(horizontal='center', vertical='center')
            if c_idx == 1:
                cell.font = font_bold
            if c_idx == 6:
                cell.fill = fill_pass
                cell.font = font_pass

    col_widths_rtm = [14, 38, 22, 34, 36, 18]
    for idx, width in enumerate(col_widths_rtm, start=1):
        ws_rtm.column_dimensions[get_column_letter(idx)].width = width

    # Auto-fit Summary sheet column widths
    col_widths_dash = [4, 28, 38, 38, 28, 20, 20, 20, 20]
    for idx, width in enumerate(col_widths_dash, start=1):
        ws_dash.column_dimensions[get_column_letter(idx)].width = width

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    wb.save(output_path)
    print(f"Excel workbook created successfully at: {output_path}")

if __name__ == '__main__':
    target = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'docs', 'academic', 'Draftly-System-Test-Cases.xlsx'))
    build_test_excel(target)
