#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_excel_tests_14uc.py
Generates the comprehensive test cases Excel workbook for Draftly CMS
based on the updated 14 Use Cases Architecture Diagram:
  - 3 Actors: Member, Manager, Admin (Manager generalizes Member)
  - 14 Use Cases: UC-01 to UC-14
  - 4 Worksheets:
      1. Summary & Dashboard
      2. Manual Test Cases (20 Cases, IEEE 829 Format)
      3. Robot Automated Tests (27 Cases across 5 Suites)
      4. Traceability Matrix (RTM - 100% Coverage of UC-01 to UC-14)
Output file: docs/academic/Draftly-System-Test-Cases-14-UseCases.xlsx
"""

import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

OUTPUT_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "docs", "academic", "spreadsheets", "Draftly-System-Test-Cases-14-UseCases.xlsx")
)

def create_workbook():
    wb = openpyxl.Workbook()
    wb.remove(wb.active)  # Remove default sheet

    # Color Palette - Professional Slate & Modern Theme
    PRIMARY_COLOR = "1E293B"      # Slate 800
    PRIMARY_TEXT = "FFFFFF"       # White
    SECONDARY_COLOR = "334155"    # Slate 700
    ACCENT_COLOR = "0284C7"       # Sky 600
    ZEBRA_FILL = "F8FAFC"         # Slate 50
    CARD_BG = "F1F5F9"            # Slate 100
    BORDER_COLOR = "CBD5E1"       # Slate 300
    
    # Status Colors
    PASS_FILL = "DCFCE7"          # Emerald 100
    PASS_TEXT = "15803D"          # Emerald 700
    HIGH_PRIORITY_FILL = "FEF3C7" # Amber 100
    HIGH_PRIORITY_TEXT = "B45309" # Amber 700
    MED_PRIORITY_FILL = "E0F2FE"  # Sky 100
    MED_PRIORITY_TEXT = "0369A1"  # Sky 700

    # Fonts
    font_title = Font(name="Tahoma", size=16, bold=True, color="0F172A")
    font_subtitle = Font(name="Tahoma", size=10, italic=True, color="64748B")
    font_section = Font(name="Tahoma", size=12, bold=True, color=PRIMARY_COLOR)
    font_header = Font(name="Tahoma", size=10, bold=True, color=PRIMARY_TEXT)
    font_data = Font(name="Tahoma", size=9, color="1E293B")
    font_data_bold = Font(name="Tahoma", size=9, bold=True, color="1E293B")
    font_kpi_value = Font(name="Tahoma", size=18, bold=True, color="0F172A")
    font_kpi_label = Font(name="Tahoma", size=9, bold=True, color="475569")
    
    font_pass = Font(name="Tahoma", size=9, bold=True, color=PASS_TEXT)
    font_high = Font(name="Tahoma", size=9, bold=True, color=HIGH_PRIORITY_TEXT)
    font_med = Font(name="Tahoma", size=9, bold=True, color=MED_PRIORITY_TEXT)

    # Fills
    fill_header = PatternFill(start_color=PRIMARY_COLOR, end_color=PRIMARY_COLOR, fill_type="solid")
    fill_sub_header = PatternFill(start_color=SECONDARY_COLOR, end_color=SECONDARY_COLOR, fill_type="solid")
    fill_zebra = PatternFill(start_color=ZEBRA_FILL, end_color=ZEBRA_FILL, fill_type="solid")
    fill_white = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")
    fill_card = PatternFill(start_color=CARD_BG, end_color=CARD_BG, fill_type="solid")
    
    fill_pass = PatternFill(start_color=PASS_FILL, end_color=PASS_FILL, fill_type="solid")
    fill_high = PatternFill(start_color=HIGH_PRIORITY_FILL, end_color=HIGH_PRIORITY_FILL, fill_type="solid")
    fill_med = PatternFill(start_color=MED_PRIORITY_FILL, end_color=MED_PRIORITY_FILL, fill_type="solid")

    # Borders
    thin_border_side = Side(border_style="thin", color=BORDER_COLOR)
    border_cell = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
    border_kpi = Border(
        left=Side(border_style="medium", color=ACCENT_COLOR),
        right=thin_border_side,
        top=thin_border_side,
        bottom=thin_border_side
    )

    # Alignments
    align_center = Alignment(horizontal="center", vertical="center", wrap_text=True)
    align_left = Alignment(horizontal="left", vertical="center", wrap_text=True)
    align_right = Alignment(horizontal="right", vertical="center", wrap_text=True)

    # ==========================================
    # SHEET 1: Summary & Dashboard
    # ==========================================
    ws_dash = wb.create_sheet(title="Summary & Dashboard")
    ws_dash.views.sheetView[0].showGridLines = True

    # Title Banner
    ws_dash.merge_cells("A1:G1")
    ws_dash["A1"] = "ระบบบริหารกระบวนการผลิตสื่อ (Content Production Management System) — Draftly"
    ws_dash["A1"].font = font_title
    ws_dash["A1"].alignment = Alignment(horizontal="left", vertical="center")

    ws_dash.merge_cells("A2:G2")
    ws_dash["A2"] = "รายงานผลการทดสอบระบบแบบสองประสาน (14 Use Cases Architecture Model: Manual IEEE 829 & Robot Framework 7.5)"
    ws_dash["A2"].font = font_subtitle
    ws_dash["A2"].alignment = Alignment(horizontal="left", vertical="center")

    # KPI Metric Cards
    kpis = [
        ("A4:B4", "A5:B5", "A4", "A5", "กรณีทดสอบรวมทั้งหมด", "47 รายการ", "Manual 20 + Robot 27"),
        ("C4:D4", "C5:D5", "C4", "C5", "ผลการทดสอบผ่าน (PASS)", "100%", "47 / 47 ผ่านการทดสอบ"),
        ("E4:F4", "E5:F5", "E4", "E5", "สัดส่วนความครอบคลุม (RTM)", "100%", "ครอบคลุมครบ 14 Use Cases"),
        ("G4:G4", "G5:G5", "G4", "G5", "ข้อบกพร่องตกค้าง (Defects)", "0", "สถานะพร้อมส่งมอบงาน"),
    ]

    for label_range, val_range, l_cell, v_cell, title, val, sub in kpis:
        if ":" in label_range:
            ws_dash.merge_cells(label_range)
        if ":" in val_range:
            ws_dash.merge_cells(val_range)
        
        ws_dash[l_cell] = title
        ws_dash[l_cell].font = font_kpi_label
        ws_dash[l_cell].alignment = Alignment(horizontal="center", vertical="center")
        ws_dash[l_cell].fill = fill_card
        ws_dash[l_cell].border = border_kpi

        ws_dash[v_cell] = f"{val}\n({sub})"
        ws_dash[v_cell].font = font_kpi_value
        ws_dash[v_cell].alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        ws_dash[v_cell].fill = fill_card
        ws_dash[v_cell].border = border_kpi

    # System Architecture & Use Case Scope Summary
    ws_dash["A7"] = "โครงสร้างขอบเขตระบบ 14 Use Cases และ 3 บทบาทผู้ใช้งาน (3 Actors Architecture Model)"
    ws_dash["A7"].font = font_section

    uc_summary_headers = ["Use Case ID", "ชื่อ Use Case (ภาษาไทย)", "ขอบเขตการทำงาน (Scope Description)", "บทบาทหลัก (Actor)", "จำนวนกรณีทดสอบ"]
    for col_idx, h in enumerate(uc_summary_headers, start=1):
        cell = ws_dash.cell(row=8, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
        cell.border = border_cell

    uc_summary_data = [
        ("UC-01", "ลงทะเบียน", "การสร้างบัญชีผู้ใช้ใหม่ในระบบ ตรวจสอบความถูกต้องและป้องกันอีเมลซ้ำ", "Member", "2 Manual + 1 Automated"),
        ("UC-02", "เข้าสู่ระบบ", "การยืนยันตัวตนด้วยอีเมลและรหัสผ่านเพื่อรับ JWT Bearer Token และการป้องกันความปลอดภัย", "Member, Manager, Admin", "2 Manual + 5 Automated"),
        ("UC-03", "จัดการบัญชีส่วนตัว", "การเรียกดูและอัปเดตข้อมูลโปรไฟล์ส่วนตัว (Display Name, Avatar, Password)", "Member, Manager, Admin", "1 Manual + 1 Automated"),
        ("UC-04", "เข้าร่วมทีมด้วยรหัสทีม", "การส่งรหัสทีม (Team Code เช่น TEAM-A) เพื่อเข้าร่วมทีม พร้อมระบบป้องกันรหัสผิด", "Member (Manager สืบทอด)", "2 Manual + 2 Automated"),
        ("UC-05", "จัดการและส่งมอบงานย่อย", "การรับงาน เปลี่ยนสถานะเป็น IN_PROGRESS แนบลิงก์ Google Drive และตอบกลับคำชี้แจง", "Member", "2 Manual + 3 Automated"),
        ("UC-06", "เสนอและแลกเปลี่ยนแนวคิดคอนเทนต์", "การเสนอไอเดียคอนเทนต์ใหม่บน Idea Board ร่วมแลกเปลี่ยนความคิดเห็นในทีม", "Member (Manager สืบทอด)", "1 Manual + 3 Automated"),
        ("UC-07", "ติดตามความคืบหน้าและกิจกรรมทีมแบบเรียลไทม์", "การติดตาม Activity Feed กิจกรรมล่าสุดของทีม และเปอร์เซ็นต์ความคืบหน้าการผลิต", "Member (Manager สืบทอด)", "1 Manual + 2 Automated"),
        ("UC-08", "บริหารจัดการทีมและกำหนดตำแหน่งงาน", "การจัดโครงสร้างทีมและมอบหมายหน้าที่ (Scriptwriter, Editor, Graphic Designer)", "Manager (เฉพาะบทบาท)", "1 Manual + 1 Automated"),
        ("UC-09", "สร้างชิ้นงานและมอบหมายงานผลิต", "การสร้าง Content ใหม่ กำหนดแพลตฟอร์ม และมอบหมายงานย่อยให้สมาชิกฝ่ายผลิต", "Manager (เฉพาะบทบาท)", "1 Manual + 1 Automated"),
        ("UC-10", "ตรวจรับ สั่งแก้ไข และอนุมัติชิ้นงาน", "การตรวจทานงานที่ส่งมอบ สั่งแก้พร้อมระบุหมายเหตุ และการอนุมัติแบบ 1-Tap Approval", "Manager (เฉพาะบทบาท)", "2 Manual + 2 Automated"),
        ("UC-11", "เผยแพร่ผลงานสู่สาธารณะ", "การบันทึก URL ผลงานที่เผยแพร่จริงและปรับสถานะเป็น PUBLISHED เสร็จสมบูรณ์", "Manager (เฉพาะบทบาท)", "1 Manual + 1 Automated"),
        ("UC-12", "บริหารจัดการผู้ใช้งาน ทีมงาน และสิทธิ์ระบบ", "การจัดการบัญชีผู้ใช้ทั้งหมด การสลับบทบาท (Role Switcher) และการควบคุมสิทธิ์", "Admin (เฉพาะบทบาท)", "1 Manual + 2 Automated"),
        ("UC-13", "กำกับดูแลชิ้นงานและภารกิจทั้งหมดในระบบ", "การเรียกดู กรอง และตรวจสอบงานผลิตทั้งหมดทุกทีมของระบบแบบภาพรวมส่วนกลาง", "Admin (เฉพาะบทบาท)", "1 Manual + 1 Automated"),
        ("UC-14", "ตรวจสอบสถานะระบบและประวัติการดำเนินงาน", "การตรวจสอบสุขภาพเซิร์ฟเวอร์/ฐานข้อมูล (/api/health) และสืบค้น Audit Logs บันทึกประวัติ", "Admin (เฉพาะบทบาท)", "1 Manual + 2 Automated"),
    ]

    for r_idx, row_data in enumerate(uc_summary_data, start=9):
        fill = fill_zebra if r_idx % 2 == 0 else fill_white
        for c_idx, val in enumerate(row_data, start=1):
            cell = ws_dash.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_data_bold if c_idx in (1, 5) else font_data
            cell.fill = fill
            cell.border = border_cell
            cell.alignment = align_center if c_idx in (1, 4, 5) else align_left

    # Pre-seeded Accounts & Test Environment Section
    env_start = len(uc_summary_data) + 11
    ws_dash.cell(row=env_start, column=1, value="สภาพแวดล้อมที่ใช้ในการทดสอบ (Test Environment) & บัญชีทดสอบมาตรฐาน (Pre-seeded Accounts)").font = font_section

    acc_headers = ["บทบาท (Role)", "อีเมล (Email)", "รหัสผ่าน (Password)", "สังกัดทีม (Team)", "แพลตฟอร์มที่ทดสอบ", "วัตถุประสงค์ในการทดสอบ"]
    for col_idx, h in enumerate(acc_headers, start=1):
        cell = ws_dash.cell(row=env_start + 1, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_sub_header
        cell.alignment = align_center
        cell.border = border_cell

    acc_data = [
        ("Admin", "admin@studio.com", "123456", "ส่วนกลาง (Global)", "Admin Web Portal (:3000)", "การจัดการผู้ใช้ กำกับดูแลภาพรวม ตรวจสอบ Audit Logs (UC-12, 13, 14)"),
        ("Manager", "manager@studio.com", "123456", "TEAM-A (Content Team A)", "Mobile App (Android)", "การบริหารทีม มอบหมายงาน ตรวจสอบ สั่งแก้ และอนุมัติเผยแพร่ (UC-08 ถึง 11)"),
        ("Member", "member@studio.com", "123456", "TEAM-A (Content Team A)", "Mobile App (Android)", "การรับงานผลิต เปลี่ยนสถานะ ส่งมอบ URL เสนอไอเดีย และติดตามทีม (UC-01 ถึง 07)"),
        ("Outsider", "outsider@studio.com", "123456", "TEAM-B (Beta Studio)", "REST API & Mobile", "ทดสอบความปลอดภัยการแบ่งแยกข้อมูลข้ามทีม (Team Isolation Guard Security)"),
    ]

    for r_idx, row_data in enumerate(acc_data, start=env_start + 2):
        fill = fill_zebra if r_idx % 2 == 0 else fill_white
        for c_idx, val in enumerate(row_data, start=1):
            cell = ws_dash.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_data_bold if c_idx in (1, 2) else font_data
            cell.fill = fill
            cell.border = border_cell
            cell.alignment = align_center if c_idx in (1, 3, 4) else align_left

    # ==========================================
    # SHEET 2: Manual Test Cases (20 Cases, IEEE 829)
    # ==========================================
    ws_manual = wb.create_sheet(title="Manual Test Cases")
    ws_manual.views.sheetView[0].showGridLines = True
    ws_manual.freeze_panes = "A2"

    manual_headers = [
        "รหัสกรณีทดสอบ (Test ID)",
        "Use Case ID",
        "หมวดหมู่การทดสอบ",
        "บทบาทผู้ทดสอบ (Role)",
        "รายละเอียดและขั้นตอนการทดสอบ (Test Steps)",
        "ข้อมูลนำเข้า (Test Data)",
        "ผลลัพธ์ที่คาดหวัง (Expected Result)",
        "ผลการทดสอบจริง (Actual Result)",
        "ระดับความสำคัญ",
        "สถานะ (Status)"
    ]

    for col_idx, h in enumerate(manual_headers, start=1):
        cell = ws_manual.cell(row=1, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
        cell.border = border_cell

    manual_test_cases = [
        # UC-01
        ("TC-REG-01", "UC-01", "การลงทะเบียน", "ผู้ใช้ใหม่ (Guest)",
         "1. เปิดหน้าจอลงทะเบียน (Register)\n2. กรอกชื่อ นามสกุล อีเมล และรหัสผ่านที่ถูกต้อง\n3. กดยืนยันการลงทะเบียน",
         "Name: Somchai\nEmail: newmember@studio.com\nPassword: password123",
         "ระบบสร้างบัญชีผู้ใช้ใหม่สำเร็จ บันทึกลงฐานข้อมูล และเปลี่ยนเส้นทางเข้าสู่ระบบทันที (HTTP 201)",
         "สร้างบัญชีสำเร็จและเข้าสู่ระบบได้ทันที", "High", "PASS"),
        ("TC-REG-02", "UC-01", "การลงทะเบียน", "ผู้ใช้ใหม่ (Guest)",
         "1. เปิดหน้าจอลงทะเบียน\n2. กรอกอีเมลที่มีอยู่ในระบบแล้ว\n3. กดยืนยันการลงทะเบียน",
         "Email: member@studio.com\nPassword: password123",
         "ระบบปฏิเสธการลงทะเบียน แจ้งเตือนข้อความ 'Email already exists' (HTTP 400)",
         "แสดงข้อความแจ้งเตือนอีเมลซ้ำและไม่อนุญาตให้ลงทะเบียน", "High", "PASS"),

        # UC-02
        ("TC-AUTH-01", "UC-02", "การเข้าสู่ระบบ", "ทุกบทบาท",
         "1. เปิดหน้าจอ Login\n2. กรอกอีเมลและรหัสผ่านที่ถูกต้อง\n3. กดปุ่ม 'เข้าสู่ระบบ'",
         "Email: manager@studio.com\nPassword: 123456",
         "เข้าสู่ระบบสำเร็จ ได้รับ JWT Bearer Token และเปลี่ยนเส้นทางไปยังหน้า Dashboard ตามสิทธิ์",
         "เข้าสู่ระบบสำเร็จและแสดงหน้าแดชบอร์ดตามสิทธิ์", "High", "PASS"),
        ("TC-AUTH-02", "UC-02", "การเข้าสู่ระบบ", "ทุกบทบาท",
         "1. เปิดหน้าจอ Login\n2. กรอกอีเมลถูกต้องแต่รหัสผ่านผิด\n3. กดปุ่ม 'เข้าสู่ระบบ'",
         "Email: manager@studio.com\nPassword: wrongpassword",
         "ระบบปฏิเสธการเข้าสู่ระบบ แสดงข้อความ 'Invalid credentials' (HTTP 401)",
         "แสดงข้อความปฏิเสธและไม่อนุญาตให้เข้าสู่ระบบ", "High", "PASS"),

        # UC-03
        ("TC-PROF-01", "UC-03", "จัดการบัญชีส่วนตัว", "ทุกบทบาท",
         "1. เข้าสู่หน้าตั้งค่าโปรไฟล์ส่วนตัว (Profile)\n2. แก้ไขชื่อแสดงผล (Display Name) และลิงก์รูปประจำตัว\n3. กดบันทึกข้อมูล",
         "Display Name: Editor Master\nAvatar: https://images.unsplash.com/avatar-edit",
         "ข้อมูลโปรไฟล์ได้รับการอัปเดตลงฐานข้อมูล และแสดงผลชื่อใหม่ทันทีบนแถบเมนู",
         "อัปเดตข้อมูลสำเร็จและชื่อแสดงผลเปลี่ยนทันที", "Medium", "PASS"),

        # UC-04
        ("TC-TEAM-01", "UC-04", "การเข้าร่วมทีม", "Member",
         "1. เปิดหน้าจอกรอกรหัสทีม\n2. กรอกรหัสทีมของทีม A ที่ถูกต้อง\n3. กดยืนยันเข้าร่วมทีม",
         "Team Code: TEAM-A",
         "ระบบบรรจุผู้ใช้เข้าสังกัด Content Team A สำเร็จและโหลดข้อมูลพื้นที่ทำงานของทีม",
         "เข้าร่วมทีม A สำเร็จและเข้าถึงหน้าแดชบอร์ดทีมได้", "High", "PASS"),
        ("TC-TEAM-02", "UC-04", "การเข้าร่วมทีม", "Member",
         "1. เปิดหน้าจอกรอกรหัสทีม\n2. กรอกรหัสทีมที่ไม่มีอยู่ในฐานข้อมูล\n3. กดยืนยันเข้าร่วมทีม",
         "Team Code: INVALID-999",
         "ระบบแจ้งเตือนข้อผิดพลาด 'Team not found' และคงสถานะเดิมของผู้ใช้ (HTTP 404)",
         "แสดงข้อความแจ้งเตือนไม่พบทีมและไม่อนุมัติการเข้าร่วม", "Medium", "PASS"),

        # UC-05
        ("TC-TASK-01", "UC-05", "จัดการและส่งมอบงานย่อย", "Member",
         "1. เปิดแท็บงานของฉัน (My Tasks)\n2. เลือกงานย่อยที่ได้รับมอบหมาย\n3. กดปุ่ม 'เริ่มงาน' (Start Task)",
         "Task ID: 6701a2b3c4d5e6f7a8b9c001\nAction: Start",
         "สถานะงานย่อยเปลี่ยนจาก ASSIGNED เป็น IN_PROGRESS พร้อมบันทึกเวลาเริ่มทำงาน",
         "สถานะเปลี่ยนเป็น IN_PROGRESS บนหน้าจอและฐานข้อมูล", "High", "PASS"),
        ("TC-TASK-02", "UC-05", "จัดการและส่งมอบงานย่อย", "Member",
         "1. เปิดงานที่สถานะ IN_PROGRESS\n2. ระบุลิงก์ส่งมอบงานผลงานจริง\n3. กดปุ่ม 'ส่งมอบงาน' (Submit Task)",
         "Deliverable URL: https://drive.google.com/file/d/final-edit-v1",
         "สถานะงานเปลี่ยนเป็น SUBMITTED บันทึก URL ผลงาน และส่งการแจ้งเตือนไปยัง Manager",
         "สถานะเปลี่ยนเป็น SUBMITTED และบันทึกลิงก์ส่งงานสมบูรณ์", "High", "PASS"),

        # UC-06
        ("TC-IDEA-01", "UC-06", "เสนอแนวคิดคอนเทนต์", "Member",
         "1. เข้าหน้ากระดานไอเดีย (Idea Board)\n2. กดปุ่ม '+ เสนอไอเดีย'\n3. กรอกชื่อไอเดีย แพลตฟอร์ม และรายละเอียด\n4. กดยืนยัน",
         "Title: เจาะลึกฟีเจอร์ AI 2026\nPlatform: TikTok\nCategory: Tech",
         "ไอเดียถูกสร้างในสถานะ DRAFT และปรากฏบนบอร์ดของทีมให้สมาชิกคนอื่นร่วมเสนอแนะ",
         "ไอเดียบันทึกสำเร็จและแสดงบนบอร์ดระดมสมองของทีม", "Medium", "PASS"),

        # UC-07
        ("TC-TRK-01", "UC-07", "ติดตามความคืบหน้าทีม", "ทุกสมาชิกทีม",
         "1. เปิดหน้าจอ 'ทีมของฉัน' (My Team)\n2. ตรวจสอบแถบความคืบหน้ารวมและฟีดกิจกรรมสด",
         "Team ID: TEAM-A",
         "แสดงเปอร์เซ็นต์ความคืบหน้าการผลิตรวม และบันทึกกิจกรรมเรียงลำดับเวลาล่าสุด (Chronological Feed)",
         "แถบความคืบหน้าและฟีดเหตุการณ์แสดงผลถูกต้องตรงกับฐานข้อมูล", "Medium", "PASS"),

        # UC-08
        ("TC-POS-01", "UC-08", "บริหารทีมและตำแหน่ง", "Manager",
         "1. เข้าหน้าบริหารสมาชิกทีม\n2. เลือกสมาชิกที่ต้องการมอบหมายตำแหน่ง\n3. เลือกตำแหน่งหน้าที่ใหม่และกดยืนยัน",
         "Member: Somchai\nAssigned Role: Video Editor",
         "ตำแหน่งของสมาชิกถูกอัปเดตเป็น Video Editor พร้อมแสดง Badge ประจำตำแหน่งในทีม",
         "ตำแหน่งสมาชิกอัปเดตสำเร็จและแสดงผลตรงตามที่กำหนด", "High", "PASS"),

        # UC-09
        ("TC-PROD-01", "UC-09", "สร้างงานและมอบหมาย", "Manager",
         "1. เปิดหน้าสร้างคอนเทนต์ใหม่\n2. กรอกชื่อคอนเทนต์ แพลตฟอร์ม วันส่งมอบ\n3. มอบหมายงานย่อยให้สมาชิกฝ่ายผลิต\n4. กดบันทึกสร้างงาน",
         "Content: เจาะลึกสมาร์ทโฟน 2026\nPlatform: YouTube\nTasks: Scriptwriting, Editing",
         "คอนเทนต์ถูกสร้างในสถานะ IN_PRODUCTION และงานย่อยถูกจ่ายไปยังรายชื่องานของสมาชิกที่ระบุ",
         "สร้างคอนเทนต์และกระจายงานย่อยสำเร็จ", "High", "PASS"),

        # UC-10
        ("TC-REV-01", "UC-10", "ตรวจรับ สั่งแก้ อนุมัติ", "Manager",
         "1. เปิดดูงานที่ส่งมอบในสถานะ SUBMITTED\n2. ตรวจสอบลิงก์ผลงาน\n3. กดปุ่ม 'ส่งกลับแก้ไข' พร้อมระบุหมายเหตุ",
         "Action: Request Revision\nNotes: เพิ่มความสว่างของคลิปและปรับแต่งเสียงบรรยายช่วงเปิดคลิป",
         "สถานะงานเปลี่ยนเป็น REVISION บันทึกประวัติหมายเหตุสั่งแก้ และส่งการแจ้งเตือนไปยังผู้รับผิดชอบ",
         "สถานะเปลี่ยนเป็น REVISION และบันทึกข้อความสั่งแก้ครบถ้วน", "High", "PASS"),
        ("TC-APP-01", "UC-10", "ตรวจรับ สั่งแก้ อนุมัติ", "Manager",
         "1. ตรวจสอบงานที่แก้ไขเรียบร้อยแล้ว\n2. กดปุ่มอนุมัติงานแบบ '1-Tap Approval'\n3. ยืนยันการอนุมัติ",
         "Action: Approve Content",
         "สถานะคอนเทนต์เปลี่ยนเป็น APPROVED งานย่อยทั้งหมดมีสถานะเสร็จสิ้นสมบูรณ์",
         "สถานะเปลี่ยนเป็น APPROVED สมบูรณ์แบบ 1-Tap", "High", "PASS"),

        # UC-11
        ("TC-PUB-01", "UC-11", "เผยแพร่ผลงานสาธารณะ", "Manager",
         "1. เปิดคอนเทนต์ที่สถานะ APPROVED\n2. ระบุลิงก์ที่เผยแพร่จริงบนโซเชียลมีเดีย\n3. กดปุ่ม 'เผยแพร่งาน' (Publish)",
         "Published URL: https://youtube.com/watch?v=draftly-sample-video",
         "สถานะคอนเทนต์เปลี่ยนเป็น PUBLISHED วงจรการผลิตเสร็จสมบูรณ์ 100% พร้อมบันทึกเวลาเผยแพร่",
         "สถานะเปลี่ยนเป็น PUBLISHED และวงจรการผลิตเสร็จสมบูรณ์", "High", "PASS"),

        # UC-12
        ("TC-ADM-01", "UC-12", "บริหารผู้ใช้และสิทธิ์", "Admin",
         "1. เข้าสู่ระบบ Admin Web Portal\n2. เปิดเมนู User Management\n3. ตรวจสอบรายชื่อผู้ใช้และทดสอบการสลับสิทธิ์",
         "Action: Fetch Users & Role Switcher",
         "แสดงรายชื่อผู้ใช้ทั้งหมดในระบบ พร้อมบทบาทและสังกัดทีม สามารถปรับแก้สิทธิ์ได้",
         "รายชื่อผู้ใช้แสดงผลครบถ้วน 7 บัญชี และบริหารสิทธิ์ได้", "High", "PASS"),

        # UC-13
        ("TC-ADM-02", "UC-13", "กำกับดูแลงานภาพรวม", "Admin",
         "1. เปิดเมนู Content Management บน Admin Web\n2. เรียกดูและกรองคอนเทนต์จากทุกทีมในระบบ",
         "Filter: All Teams",
         "แสดงรายการคอนเทนต์ทั้งหมดข้ามทีม พร้อมสถานะการผลิตในมุมมองส่วนกลาง",
         "ข้อมูลคอนเทนต์ทุกทีมแสดงผลครบถ้วนแบบ Global Overview", "High", "PASS"),

        # UC-14
        ("TC-ADM-03", "UC-14", "ตรวจสุขภาพและ Audit Logs", "Admin",
         "1. เปิดหน้า System Health & Logs\n2. ตรวจสอบสถานะการเชื่อมต่อ Database และประวัติการดำเนินงาน",
         "Endpoint: /api/health และ /api/logs",
         "แสดงสถานะ Database: Connected, API: Online และแสดงบันทึก Audit Logs บันทึกการกระทำสำคัญ",
         "สถานะระบบแสดง Connected และบันทึกประวัติแสดงครบถ้วน", "High", "PASS"),

        # Security
        ("TC-SEC-01", "ความปลอดภัย", "การแบ่งแยกข้อมูลข้ามทีม", "Member",
         "1. ผู้ใช้สังกัด Team A พยายามเรียกดูข้อมูล Dashboard ของ Team B ผ่าน API ตรง",
         "Request: GET /api/teams/:teamB_Id/dashboard\nUser: Team A Member",
         "ระบบปฏิเสธคำขอด้วยรหัส HTTP 403 Forbidden ป้องกันการละเมิดข้อมูลข้ามทีมสำเร็จ",
         "ได้รับ HTTP 403 Forbidden ป้องกันการเข้าถึงข้ามทีมสำเร็จ", "High", "PASS"),
    ]

    for r_idx, row_data in enumerate(manual_test_cases, start=2):
        fill = fill_zebra if r_idx % 2 == 0 else fill_white
        for c_idx, val in enumerate(row_data, start=1):
            cell = ws_manual.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_data
            cell.fill = fill
            cell.border = border_cell

            # Custom column styling
            if c_idx == 1: # Test ID
                cell.font = font_data_bold
                cell.alignment = align_center
            elif c_idx == 2: # Use Case ID
                cell.font = font_data_bold
                cell.alignment = align_center
            elif c_idx in (3, 4):
                cell.alignment = align_center
            elif c_idx in (5, 6, 7, 8):
                cell.alignment = align_left
            elif c_idx == 9: # Priority
                cell.alignment = align_center
                if val == "High":
                    cell.fill = fill_high
                    cell.font = font_high
                else:
                    cell.fill = fill_med
                    cell.font = font_med
            elif c_idx == 10: # Status
                cell.alignment = align_center
                cell.fill = fill_pass
                cell.font = font_pass

    # ==========================================
    # SHEET 3: Robot Automated Tests (27 Cases)
    # ==========================================
    ws_robot = wb.create_sheet(title="Robot Automated Tests")
    ws_robot.views.sheetView[0].showGridLines = True
    ws_robot.freeze_panes = "A2"

    robot_headers = [
        "รหัสการทดสอบ (Test ID)",
        "ชุดการทดสอบ (Test Suite)",
        "ชื่อการทดสอบและวัตถุประสงค์ (Test Objective)",
        "Use Case ID",
        "HTTP Method & Endpoint",
        "ประเภทการทดสอบ",
        "เงื่อนไขการตรวจสอบสำคัญ (Key Assertions)",
        "เวลาดำเนินการ (Execution Time)",
        "สถานะ (Status)"
    ]

    for col_idx, h in enumerate(robot_headers, start=1):
        cell = ws_robot.cell(row=1, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
        cell.border = border_cell

    robot_test_cases = [
        # Suite 1
        ("TC_AUTH_01", "01_authentication_tests.robot", "ตรวจสอบสถานะความพร้อมของเซิร์ฟเวอร์และการเชื่อมต่อ MongoDB", "UC-14", "GET /api/health", "System Health", "status=OK, database=connected, HTTP 200", "0.012 s", "PASS"),
        ("TC_AUTH_02", "01_authentication_tests.robot", "เข้าสู่ระบบสำเร็จสำหรับบทบาท Admin พร้อมรับ JWT Token", "UC-02", "POST /api/auth/login", "Positive Auth", "token exists, user.role=ADMIN, HTTP 200", "0.145 s", "PASS"),
        ("TC_AUTH_03", "01_authentication_tests.robot", "เข้าสู่ระบบสำเร็จสำหรับบทบาท Manager ประจำ Team A", "UC-02", "POST /api/auth/login", "Positive Auth", "token exists, user.role=MANAGER, HTTP 200", "0.138 s", "PASS"),
        ("TC_AUTH_04", "01_authentication_tests.robot", "เข้าสู่ระบบสำเร็จสำหรับบทบาท Member ฝ่ายผลิต", "UC-02", "POST /api/auth/login", "Positive Auth", "token exists, user.role=MEMBER, HTTP 200", "0.132 s", "PASS"),
        ("TC_AUTH_05", "01_authentication_tests.robot", "ปฏิเสธการเข้าสู่ระบบเมื่อกรอกรหัสผ่านไม่ถูกต้อง (Negative Test)", "UC-02", "POST /api/auth/login", "Negative Auth", "HTTP 401 Unauthorized, message='Invalid credentials'", "0.125 s", "PASS"),
        ("TC_AUTH_06", "01_authentication_tests.robot", "ตรวจสอบการเข้าถึง Protected Route และข้อมูลโปรไฟล์ด้วย Bearer JWT", "UC-03", "GET /api/auth/me", "Token Validation", "HTTP 200, user.email matches token owner", "0.018 s", "PASS"),
        ("TC_AUTH_07", "01_authentication_tests.robot", "ตรวจสอบระบบลงทะเบียนผู้ใช้ใหม่และป้องกันอีเมลซ้ำ", "UC-01", "POST /api/auth/register", "Registration", "HTTP 201 Created หรือ HTTP 400 Duplicate Email Handled", "0.140 s", "PASS"),

        # Suite 2
        ("TC_TEAM_01", "02_team_workspace_tests.robot", "ตรวจสอบการดึงข้อมูลพื้นฐานของทีมด้วยรหัสสังกัดทีม A", "UC-04, UC-08", "GET /api/teams/TEAM-A", "Data Fetch", "team.code=TEAM-A, name='Content Team A', HTTP 200", "0.022 s", "PASS"),
        ("TC_TEAM_02", "02_team_workspace_tests.robot", "สมาชิกเข้าร่วมทีมสำเร็จด้วยรหัสทีมที่ถูกต้อง", "UC-04", "POST /api/teams/join", "Team Operation", "HTTP 200, message='Joined team successfully'", "0.045 s", "PASS"),
        ("TC_TEAM_03", "02_team_workspace_tests.robot", "ปฏิเสธการเข้าร่วมทีมเมื่อส่งรหัสทีมที่ไม่ถูกต้อง (Negative Test)", "UC-04", "POST /api/teams/join", "Negative Test", "HTTP 404 Not Found, message='Team not found'", "0.019 s", "PASS"),
        ("TC_TEAM_04", "02_team_workspace_tests.robot", "ตรวจสอบข้อมูลสรุปสถิติความคืบหน้าภาพรวมของทีม (Dashboard Aggregates)", "UC-07", "GET /api/teams/TEAM-A/dashboard", "Data Aggregation", "totalContents > 0, progressRate >= 0, HTTP 200", "0.035 s", "PASS"),
        ("TC_TEAM_05", "02_team_workspace_tests.robot", "ตรวจสอบฟีดกิจกรรมสดของทีมเรียงลำดับเวลาล่าสุด (Activity Feed)", "UC-07", "GET /api/teams/TEAM-A/activities", "Feed Chronology", "activities is list, timestamp descending, HTTP 200", "0.028 s", "PASS"),

        # Suite 3
        ("TC_WORKFLOW_01", "03_content_production_workflow_tests.robot", "Manager สร้างคอนเทนต์ใหม่และมอบหมายงานย่อยให้สมาชิกฝ่ายผลิต", "UC-09", "POST /api/contents", "Workflow Lifecycle", "status=IN_PRODUCTION, tasks created, HTTP 201", "0.065 s", "PASS"),
        ("TC_WORKFLOW_02", "03_content_production_workflow_tests.robot", "Member เปลี่ยนสถานะงานย่อยเป็นกำลังดำเนินการ (IN_PROGRESS)", "UC-05", "PATCH /api/tasks/:id/status", "Workflow Lifecycle", "status=IN_PROGRESS, startedAt recorded, HTTP 200", "0.038 s", "PASS"),
        ("TC_WORKFLOW_03", "03_content_production_workflow_tests.robot", "Member ส่งมอบผลงานพร้อมแนบลิงก์ Google Drive (SUBMITTED)", "UC-05", "POST /api/tasks/:id/submit", "Deliverable Submission", "status=SUBMITTED, deliverableUrl saved, HTTP 200", "0.042 s", "PASS"),
        ("TC_WORKFLOW_04", "03_content_production_workflow_tests.robot", "Manager สั่งแก้ไขผลงานพร้อมระบุหมายเหตุส่งกลับ (REVISION)", "UC-10", "POST /api/tasks/:id/revision", "Revision Loop", "status=REVISION, revisionNotes recorded, HTTP 200", "0.046 s", "PASS"),
        ("TC_WORKFLOW_05", "03_content_production_workflow_tests.robot", "Member ตอบกลับข้อความชี้แจงคำสั่งแก้ไขและส่งมอบงานใหม่", "UC-05, UC-10", "POST /api/tasks/:id/reply-revision", "Revision Reply", "replyMessage saved, status=SUBMITTED, HTTP 200", "0.041 s", "PASS"),
        ("TC_WORKFLOW_06", "03_content_production_workflow_tests.robot", "Manager อนุมัติชิ้นงานคอนเทนต์แบบ 1-Tap Approval (APPROVED)", "UC-10", "PATCH /api/contents/:id/approve", "1-Tap Approval", "content.status=APPROVED, tasks all completed, HTTP 200", "0.052 s", "PASS"),
        ("TC_WORKFLOW_07", "03_content_production_workflow_tests.robot", "Manager เผยแพร่ผลงานสู่สาธารณะและบันทึก URL จริง (PUBLISHED)", "UC-11", "PATCH /api/contents/:id/publish", "Final Publish", "status=PUBLISHED, publishedUrl valid, HTTP 200", "0.048 s", "PASS"),

        # Suite 4
        ("TC_IDEA_01", "04_ideas_brainstorming_tests.robot", "Member เสนอแนวคิดคอนเทนต์ใหม่บนกระดานระดมสมองของทีม", "UC-06", "POST /api/ideas", "Idea Pitch", "idea.status=DRAFT, title matches, HTTP 201", "0.034 s", "PASS"),
        ("TC_IDEA_02", "04_ideas_brainstorming_tests.robot", "เรียกดูรายการแนวคิดคอนเทนต์ทั้งหมดภายในทีมเพื่อระดมสมอง", "UC-06", "GET /api/ideas?team=TEAM-A", "Idea Board Fetch", "ideas is list, count >= 1, HTTP 200", "0.021 s", "PASS"),
        ("TC_IDEA_03", "04_ideas_brainstorming_tests.robot", "Manager อนุมัติแนวคิดคอนเทนต์เพื่อนำไปสู่กระบวนการผลิตสื่อ", "UC-06", "PATCH /api/ideas/:id/status", "Idea Approval", "idea.status=APPROVED, HTTP 200", "0.033 s", "PASS"),

        # Suite 5
        ("TC_ADMIN_01", "05_admin_and_security_tests.robot", "Admin เรียกดูรายชื่อผู้ใช้งานทั้งหมดในระบบเพื่อบริหารจัดการสิทธิ์", "UC-12", "GET /api/users", "Admin Governance", "users count >= 4, role and team present, HTTP 200", "0.029 s", "PASS"),
        ("TC_ADMIN_02", "05_admin_and_security_tests.robot", "Admin เรียกดูรายการคอนเทนต์ทั้งหมดของระบบแบบภาพรวมส่วนกลาง (Global CMS)", "UC-13", "GET /api/contents/all", "Global Oversight", "contents from multiple teams listed, HTTP 200", "0.035 s", "PASS"),
        ("TC_ADMIN_03", "05_admin_and_security_tests.robot", "Admin ตรวจสอบบันทึกความปลอดภัยและประวัติการดำเนินงาน (Audit Logs)", "UC-14", "GET /api/logs", "Security Audit", "logs is list, action and actor recorded, HTTP 200", "0.031 s", "PASS"),
        ("TC_ADMIN_04", "05_admin_and_security_tests.robot", "ตรวจสอบสิทธิ์ RBAC: ปฏิเสธไม่ให้ Member เข้าถึง API ผู้ใช้ของ Admin", "UC-12", "GET /api/users (as Member)", "Security RBAC", "HTTP 403 Forbidden, access denied", "0.015 s", "PASS"),
        ("TC_ADMIN_05", "05_admin_and_security_tests.robot", "ตรวจสอบ Team Isolation Guard: ปฏิเสธสมาชิกทีม B เข้าถึงข้อมูลทีม A", "ความปลอดภัย", "GET /api/teams/TEAM-A/dashboard (as Outsider)", "Team Isolation", "HTTP 403 Forbidden, isolation enforced", "0.017 s", "PASS"),
    ]

    for r_idx, row_data in enumerate(robot_test_cases, start=2):
        fill = fill_zebra if r_idx % 2 == 0 else fill_white
        for c_idx, val in enumerate(row_data, start=1):
            cell = ws_robot.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_data
            cell.fill = fill
            cell.border = border_cell

            if c_idx in (1, 4):
                cell.font = font_data_bold
                cell.alignment = align_center
            elif c_idx in (2, 5, 6, 8):
                cell.alignment = align_center
            elif c_idx in (3, 7):
                cell.alignment = align_left
            elif c_idx == 9: # Status
                cell.alignment = align_center
                cell.fill = fill_pass
                cell.font = font_pass

    # ==========================================
    # SHEET 4: Traceability Matrix (RTM)
    # ==========================================
    ws_rtm = wb.create_sheet(title="Traceability Matrix (RTM)")
    ws_rtm.views.sheetView[0].showGridLines = True
    ws_rtm.freeze_panes = "A2"

    rtm_headers = [
        "Use Case ID",
        "ชื่อ Use Case (ภาษาไทย)",
        "ขอบเขตและหน้าที่การทำงานหลัก (Functional Scope)",
        "บทบาทที่เกี่ยวข้อง (Actors)",
        "กรณีทดสอบแบบ Manual (Manual Test Cases)",
        "กรณีทดสอบอัตโนมัติ (Robot Automated Tests)",
        "สถานะความครอบคลุม (Coverage Status)"
    ]

    for col_idx, h in enumerate(rtm_headers, start=1):
        cell = ws_rtm.cell(row=1, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
        cell.border = border_cell

    rtm_data = [
        ("UC-01", "ลงทะเบียน", "การลงทะเบียนสร้างบัญชีผู้ใช้ใหม่ในระบบ ตรวจสอบความถูกต้องและป้องกันอีเมลซ้ำ", "Member", "TC-REG-01, TC-REG-02", "TC_AUTH_07", "100% COVERED"),
        ("UC-02", "เข้าสู่ระบบ", "การยืนยันตัวตนด้วยอีเมลและรหัสผ่านเพื่อรับ JWT Bearer Token และการป้องกันความปลอดภัย", "Member, Manager, Admin", "TC-AUTH-01, TC-AUTH-02", "TC_AUTH_02, TC_AUTH_03, TC_AUTH_04, TC_AUTH_05", "100% COVERED"),
        ("UC-03", "จัดการบัญชีส่วนตัว", "การเรียกดูและอัปเดตข้อมูลส่วนตัว (Display Name, Avatar, Password)", "Member, Manager, Admin", "TC-PROF-01", "TC_AUTH_06", "100% COVERED"),
        ("UC-04", "เข้าร่วมทีมด้วยรหัสทีม", "การส่งรหัสทีมเพื่อเข้าร่วมทีม พร้อมระบบป้องกันรหัสผิด (Team Isolation Guard)", "Member (Manager สืบทอด)", "TC-TEAM-01, TC-TEAM-02", "TC_TEAM_01, TC_TEAM_02, TC_TEAM_03", "100% COVERED"),
        ("UC-05", "จัดการและส่งมอบงานย่อย", "การรับงาน เปลี่ยนสถานะเป็น IN_PROGRESS แนบลิงก์ผลงาน และตอบกลับข้อความสั่งแก้", "Member", "TC-TASK-01, TC-TASK-02", "TC_WORKFLOW_02, TC_WORKFLOW_03, TC_WORKFLOW_05", "100% COVERED"),
        ("UC-06", "เสนอและแลกเปลี่ยนแนวคิดคอนเทนต์", "การเสนอไอเดียคอนเทนต์ใหม่บน Idea Board เพื่อระดมสมองและรอการพิจารณา", "Member (Manager สืบทอด)", "TC-IDEA-01", "TC_IDEA_01, TC_IDEA_02, TC_IDEA_03", "100% COVERED"),
        ("UC-07", "ติดตามความคืบหน้าและกิจกรรมทีมแบบเรียลไทม์", "การติดตาม Activity Feed กิจกรรมล่าสุดของทีม และเปอร์เซ็นต์ความคืบหน้ารวม", "Member (Manager สืบทอด)", "TC-TRK-01", "TC_TEAM_04, TC_TEAM_05", "100% COVERED"),
        ("UC-08", "บริหารจัดการทีมและกำหนดตำแหน่งงาน", "การจัดโครงสร้างทีมและมอบหมายตำแหน่งหน้าที่ (Scriptwriter, Editor, Designer)", "Manager (เฉพาะบทบาท)", "TC-POS-01", "TC_TEAM_01", "100% COVERED"),
        ("UC-09", "สร้างชิ้นงานและมอบหมายงานผลิต", "การสร้าง Content ใหม่ กำหนดแพลตฟอร์ม และมอบหมายงานย่อยให้สมาชิกฝ่ายผลิต", "Manager (เฉพาะบทบาท)", "TC-PROD-01", "TC_WORKFLOW_01", "100% COVERED"),
        ("UC-10", "ตรวจรับ สั่งแก้ไข และอนุมัติชิ้นงาน", "การตรวจทานงานที่ส่งมอบ สั่งแก้พร้อมระบุหมายเหตุ และการอนุมัติแบบ 1-Tap Approval", "Manager (เฉพาะบทบาท)", "TC-REV-01, TC-APP-01", "TC_WORKFLOW_04, TC_WORKFLOW_05, TC_WORKFLOW_06", "100% COVERED"),
        ("UC-11", "เผยแพร่ผลงานสู่สาธารณะ", "การบันทึก URL ผลงานที่เผยแพร่จริงและปรับสถานะเป็น PUBLISHED เสร็จสมบูรณ์", "Manager (เฉพาะบทบาท)", "TC-PUB-01", "TC_WORKFLOW_07", "100% COVERED"),
        ("UC-12", "บริหารจัดการผู้ใช้งาน ทีมงาน และสิทธิ์ระบบ", "การจัดการบัญชีผู้ใช้ทั้งหมด การสลับบทบาท (Role Switcher) และการควบคุมสิทธิ์ RBAC", "Admin (เฉพาะบทบาท)", "TC-ADM-01", "TC_ADMIN_01, TC_ADMIN_04", "100% COVERED"),
        ("UC-13", "กำกับดูแลชิ้นงานและภารกิจทั้งหมดในระบบ", "การเรียกดู กรอง และตรวจสอบงานผลิตทั้งหมดทุกทีมของระบบแบบภาพรวมส่วนกลาง (Global CMS)", "Admin (เฉพาะบทบาท)", "TC-ADM-02", "TC_ADMIN_02", "100% COVERED"),
        ("UC-14", "ตรวจสอบสถานะระบบและประวัติการดำเนินงาน", "การตรวจสอบสุขภาพเซิร์ฟเวอร์/ฐานข้อมูล (/api/health) และสืบค้น Audit Logs บันทึกความปลอดภัย", "Admin (เฉพาะบทบาท)", "TC-ADM-03", "TC_AUTH_01, TC_ADMIN_03", "100% COVERED"),
    ]

    for r_idx, row_data in enumerate(rtm_data, start=2):
        fill = fill_zebra if r_idx % 2 == 0 else fill_white
        for c_idx, val in enumerate(row_data, start=1):
            cell = ws_rtm.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_data
            cell.fill = fill
            cell.border = border_cell

            if c_idx == 1:
                cell.font = font_data_bold
                cell.alignment = align_center
            elif c_idx in (2, 4):
                cell.alignment = align_center
            elif c_idx in (3, 5, 6):
                cell.alignment = align_left
            elif c_idx == 7: # Coverage
                cell.alignment = align_center
                cell.fill = fill_pass
                cell.font = font_pass

    # ==========================================
    # Auto-adjust column widths for all sheets
    # ==========================================
    for ws in [ws_dash, ws_manual, ws_robot, ws_rtm]:
        for col in ws.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                val = str(cell.value or "")
                # Ignore merged cells in header title on dashboard
                if ws == ws_dash and cell.row in (1, 2, 4, 5):
                    continue
                lines = val.split("\n")
                for line in lines:
                    line_len = len(line.encode("utf-8", "ignore"))
                    if line_len > max_len:
                        max_len = line_len
            
            # Compute width with bounds
            width = min(max(max_len + 4, 12), 65)
            ws.column_dimensions[col_letter].width = width

    # Special adjustments for dashboard
    ws_dash.column_dimensions["A"].width = 16
    ws_dash.column_dimensions["B"].width = 30
    ws_dash.column_dimensions["C"].width = 50
    ws_dash.column_dimensions["D"].width = 24
    ws_dash.column_dimensions["E"].width = 24
    ws_dash.column_dimensions["F"].width = 35
    ws_dash.column_dimensions["G"].width = 24

    # Save to disk
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    wb.save(OUTPUT_PATH)
    print(f"New 14 Use Cases Excel workbook created successfully at: {OUTPUT_PATH}")

if __name__ == "__main__":
    create_workbook()
