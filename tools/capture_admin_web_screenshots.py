#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
capture_admin_web_screenshots.py
Captures high-resolution screenshots of all Admin Web Portal screens and modals
for Section 3.2 of the SRS Document (หน้าจอเว็บแอปพลิเคชัน).
Outputs to: docs/screenshots/admin-web/
"""

import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

OUTPUT_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "docs", "screenshots", "admin-web")
)
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE_URL = "http://localhost:3000"


def capture_all():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1440,900")
    opts.add_argument("--force-device-scale-factor=2")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--hide-scrollbars")

    driver = webdriver.Chrome(options=opts)
    wait = WebDriverWait(driver, 15)

    try:
        # 1. Login Page (3.2.1 หน้าเข้าสู่ระบบ)
        print("[1/12] Capturing Login Page...")
        driver.get(f"{BASE_URL}/login")
        wait.until(EC.presence_of_element_located((By.XPATH, "//button[@type='submit']")))
        time.sleep(1.2)
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "01_admin_login.png"))

        # Perform Login
        submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_btn.click()
        wait.until(EC.url_to_be(f"{BASE_URL}/"))
        time.sleep(2.0)

        # 2. Dashboard Overview (3.2.2 หน้าแดชบอร์ดภาพรวมระบบ)
        print("[2/12] Capturing Dashboard Overview...")
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "02_admin_dashboard.png"))

        # 3. Users Management - Users Tab (3.2.3 หน้าจัดการข้อมูลผู้ใช้งานและสิทธิ์ระบบ)
        print("[3/12] Capturing Users List...")
        driver.get(f"{BASE_URL}/users")
        wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(),'Users & Teams')]")))
        time.sleep(1.8)
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "03_admin_users_list.png"))

        # 4. Add User Modal (3.2.4 หน้าเพิ่มผู้ใช้งานใหม่)
        print("[4/12] Capturing Add User Modal...")
        add_user_btn = driver.find_element(By.XPATH, "//button[.//span[contains(text(),'เพิ่มพนักงานใหม่')]]")
        add_user_btn.click()
        time.sleep(0.8)
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "04_admin_add_user_modal.png"))

        # Close Add User Modal
        cancel_btn = driver.find_element(By.XPATH, "//button[contains(text(),'ยกเลิก')]")
        cancel_btn.click()
        time.sleep(0.5)

        # 5. Teams Structure Tab (3.2.5 หน้าจัดการโครงสร้างทีม)
        print("[5/12] Capturing Teams Structure Tab...")
        teams_tab_btn = driver.find_element(By.XPATH, "//button[.//span[contains(text(),'โครงสร้างทีม')]]")
        teams_tab_btn.click()
        time.sleep(1.0)
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "05_admin_teams_list.png"))

        # 6. Create Team Modal (3.2.6 หน้าสร้างโครงสร้างทีมใหม่)
        print("[6/12] Capturing Create Team Modal...")
        create_team_btn = driver.find_element(By.XPATH, "//button[.//span[contains(text(),'สร้างทีมใหม่')]]")
        create_team_btn.click()
        time.sleep(0.8)
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "06_admin_create_team_modal.png"))

        # 7. Contents Management (3.2.7 หน้ากำกับดูแลชิ้นงานทั้งหมด)
        print("[7/12] Capturing Contents Management...")
        driver.get(f"{BASE_URL}/contents")
        wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(),'Contents Management')]")))
        time.sleep(1.8)
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "07_admin_contents_list.png"))

        # 8. Create / View Content Modal (3.2.8 หน้าสร้างและจัดการชิ้นงาน)
        print("[8/12] Capturing Create Content Modal...")
        create_content_btn = driver.find_element(By.XPATH, "//button[.//span[contains(text(),'สร้าง Content ใหม่')]]")
        create_content_btn.click()
        time.sleep(0.8)
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "08_admin_create_content_modal.png"))

        # 9. Tasks & Workflow Management - All Tasks Tab (3.2.9 หน้าจัดการภารกิจและงานย่อยทั้งหมด)
        print("[9/12] Capturing Tasks Pipeline List...")
        driver.get(f"{BASE_URL}/tasks")
        wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(),'Tasks & Workflow')]")))
        time.sleep(1.8)
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "09_admin_tasks_list.png"))

        # 10. Task Types Master Tab (3.2.10 หน้าจัดการข้อมูลประเภทงานย่อย)
        print("[10/12] Capturing Task Types Master Tab...")
        types_tab_btn = driver.find_element(By.XPATH, "//button[.//span[contains(text(),'ประเภทงานมาตรฐาน')]]")
        types_tab_btn.click()
        time.sleep(1.0)
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "10_admin_task_types.png"))

        # 11. System Audit Logs (3.2.11 หน้าตรวจสอบประวัติการดำเนินงานของผู้ใช้งาน)
        print("[11/12] Capturing System Audit Logs...")
        driver.get(f"{BASE_URL}/logs")
        wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(),'System Audit Logs')]")))
        time.sleep(1.8)
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "11_admin_audit_logs.png"))

        # 12. System Settings & Health Monitor (3.2.12 หน้าตรวจสอบสถานะระบบและตั้งค่า)
        print("[12/12] Capturing System Settings & Health Monitor...")
        driver.get(f"{BASE_URL}/settings")
        wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(),'System Settings')]")))
        time.sleep(1.8)
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "12_admin_settings_health.png"))

        print("Successfully captured all 12 Admin Web screenshots to:", OUTPUT_DIR)

    finally:
        driver.quit()


if __name__ == "__main__":
    capture_all()

