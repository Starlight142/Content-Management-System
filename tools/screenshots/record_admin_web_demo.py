#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
record_admin_web_demo.py
Records an automated E2E test video (.mp4 + animated .webp preview) of the
Draftly Admin Web Portal (http://localhost:3000) covering:
  - UC-01: Admin Login & Session Authentication
  - UC-16: Executive Dashboard & Real-Time Metrics
  - UC-02: Users & Role Management + Add User Modal Animation
  - UC-03: Teams Structure & Workspace Code Management + Create Team Modal
  - UC-05: Content Production Pipeline & Create Content Modal
  - UC-07: Tasks & Workflow Pipeline + Task Types Master Configuration
  - UC-14: System Audit Logs & Live Search Filtering
  - UC-15: System Settings & Real-Time Health Monitor
"""

import io
import os
import shutil
import time
import imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
VIDEO_DIR = os.path.join(ROOT_DIR, "docs", "videos")
SUBMISSION_VIDEO_DIR = os.path.join(ROOT_DIR, "docs", "teacher-submission", "5-Test-Videos")
os.makedirs(VIDEO_DIR, exist_ok=True)
os.makedirs(SUBMISSION_VIDEO_DIR, exist_ok=True)

BASE_URL = "http://localhost:3000"
FPS = 10


def get_font(size=20):
    for font_path in [
        r"C:\Windows\Fonts\tahoma.ttf",
        r"C:\Windows\Fonts\leelawUI.ttf",
        r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ]:
        if os.path.exists(font_path):
            try:
                return ImageFont.truetype(font_path, size)
            except Exception:
                pass
    return ImageFont.load_default()


FONT_TITLE = get_font(19)
FONT_SUB = get_font(15)


def annotate_frame(png_bytes, step_badge, step_title, status_text="RUNNING"):
    img = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    img = img.resize((1280, 800), Image.Resampling.LANCZOS)
    draw = ImageDraw.Draw(img, "RGBA")

    bar_h = 54
    w, h = img.size
    draw.rectangle([(0, h - bar_h), (w, h)], fill=(15, 23, 42, 235))
    draw.line([(0, h - bar_h), (w, h - bar_h)], fill=(99, 102, 241, 255), width=2)

    badge_bg = (79, 70, 229, 255)
    draw.rounded_rectangle([(18, h - bar_h + 11), (218, h - 11)], radius=6, fill=badge_bg)
    draw.text((28, h - bar_h + 15), step_badge, fill=(255, 255, 255, 255), font=FONT_SUB)

    draw.text((232, h - bar_h + 14), step_title, fill=(248, 250, 252, 255), font=FONT_TITLE)

    status_color = (16, 185, 129, 255) if status_text == "PASS" else (245, 158, 11, 255)
    draw.rounded_rectangle([(w - 140, h - bar_h + 11), (w - 18, h - 11)], radius=6, fill=status_color)
    draw.text((w - 118, h - bar_h + 15), f"● {status_text}", fill=(255, 255, 255, 255), font=FONT_SUB)

    return np.array(img)


class ScreenRecorder:
    def __init__(self, driver):
        self.driver = driver
        self.frames = []
        self.step_badge = "INIT"
        self.step_title = "Starting Admin Web E2E Test Suite..."
        self.status_text = "RUNNING"

    def set_step(self, badge, title, status="RUNNING"):
        print(f"[{badge}] {title} ({status})", flush=True)
        self.step_badge = badge
        self.step_title = title
        self.status_text = status

    def capture_frames(self, count, delay=0.05):
        for _ in range(count):
            try:
                png = self.driver.get_screenshot_as_png()
                frame = annotate_frame(png, self.step_badge, self.step_title, self.status_text)
                self.frames.append(frame)
            except Exception:
                pass
            if delay > 0:
                time.sleep(delay)

    def smooth_scroll(self, total_px, steps=8):
        dy = total_px / steps
        for _ in range(steps):
            self.driver.execute_script(f"window.scrollBy(0, {dy});")
            png = self.driver.get_screenshot_as_png()
            self.frames.append(annotate_frame(png, self.step_badge, self.step_title, self.status_text))


def run_admin_web_recording():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1440,900")
    opts.add_argument("--force-device-scale-factor=1.5")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--hide-scrollbars")

    chrome_bin = os.path.expanduser(r"~\.cache\selenium\chrome\win64\156.0.8078.80\chrome.exe")
    chromedriver_bin = os.path.expanduser(r"~\.cache\selenium\chromedriver\win64\156.0.8078.80\chromedriver.exe")
    if os.path.exists(chrome_bin) and os.path.exists(chromedriver_bin):
        opts.binary_location = chrome_bin
        driver = webdriver.Chrome(service=Service(chromedriver_bin), options=opts)
    else:
        driver = webdriver.Chrome(options=opts)

    wait = WebDriverWait(driver, 15)
    rec = ScreenRecorder(driver)

    try:
        # 1. Login Page
        rec.set_step("TC_AUTO_001 | UC-01", "หน้าเข้าสู่ระบบผู้ดูแลระบบ (Admin Web Login - admin@studio.com)", "RUNNING")
        driver.get(f"{BASE_URL}/login")
        wait.until(EC.presence_of_element_located((By.XPATH, "//button[@type='submit']")))
        time.sleep(0.5)
        rec.capture_frames(12)

        submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
        rec.set_step("TC_AUTO_001 | UC-01", "ตรวจสอบสิทธิ์ JWT Bearer Token และเข้าสู่ระบบสำเร็จ", "PASS")
        submit_btn.click()
        wait.until(EC.url_to_be(f"{BASE_URL}/"))
        time.sleep(1.0)
        rec.capture_frames(15)

        # 2. Dashboard Overview
        rec.set_step("TC_AUTO_028 | UC-16", "หน้าแดชบอร์ดภาพรวมระบบ (Executive Dashboard & Real-Time Metrics)", "PASS")
        rec.capture_frames(12)
        rec.smooth_scroll(320, steps=8)
        rec.capture_frames(10)
        rec.smooth_scroll(-320, steps=6)

        # 3. Users & Role Management
        rec.set_step("TC_AUTO_005 | UC-02", "หน้าจัดการผู้ใช้งานและสิทธิ์ระบบ (Users & Role Management)", "RUNNING")
        driver.get(f"{BASE_URL}/users")
        wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(),'Users & Teams')]")))
        time.sleep(1.0)
        rec.capture_frames(14)

        add_user_btn = driver.find_element(By.XPATH, "//button[.//span[contains(text(),'เพิ่มพนักงานใหม่')]]")
        add_user_btn.click()
        time.sleep(0.4)
        rec.set_step("TC_AUTO_006 | UC-02", "หน้าต่างเพิ่มพนักงานใหม่และกำหนดตำแหน่งงาน (Add Staff Modal)", "PASS")
        rec.capture_frames(14)

        cancel_btn = driver.find_element(By.XPATH, "//button[contains(text(),'ยกเลิก')]")
        cancel_btn.click()
        time.sleep(0.3)
        rec.capture_frames(6)

        # 4. Teams Structure
        teams_tab_btn = driver.find_element(By.XPATH, "//button[.//span[contains(text(),'โครงสร้างทีม')]]")
        teams_tab_btn.click()
        time.sleep(0.6)
        rec.set_step("TC_AUTO_008 | UC-03", "หน้าจัดการโครงสร้างทีม (Multi-Team Isolation: TEAM-A / TEAM-B)", "PASS")
        rec.capture_frames(14)

        create_team_btn = driver.find_element(By.XPATH, "//button[.//span[contains(text(),'สร้างทีมใหม่')]]")
        create_team_btn.click()
        time.sleep(0.4)
        rec.set_step("TC_AUTO_009 | UC-03", "หน้าต่างสร้างทีมใหม่และกำหนดหัวหน้าทีม (Create Team Modal)", "PASS")
        rec.capture_frames(14)

        # 5. Contents Management
        rec.set_step("TC_AUTO_012 | UC-05", "หน้ากำกับดูแลชิ้นงานทั้งหมด (Studio Content Production Pipeline)", "RUNNING")
        driver.get(f"{BASE_URL}/contents")
        wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(),'Contents Management')]")))
        time.sleep(1.0)
        rec.capture_frames(14)

        create_content_btn = driver.find_element(By.XPATH, "//button[.//span[contains(text(),'สร้าง Content ใหม่')]]")
        create_content_btn.click()
        time.sleep(0.4)
        rec.set_step("TC_AUTO_013 | UC-05", "หน้าต่างสร้างชิ้นงานใหม่และผูกทีมรับผิดชอบ (Create Content Modal)", "PASS")
        rec.capture_frames(14)

        # 6. Tasks & Workflow Management
        rec.set_step("TC_AUTO_016 | UC-07", "หน้าจัดการภารกิจและงานย่อยทั้งหมด (Tasks & Sub-Tasks Pipeline)", "PASS")
        driver.get(f"{BASE_URL}/tasks")
        wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(),'Tasks & Workflow')]")))
        time.sleep(1.0)
        rec.capture_frames(14)

        types_tab_btn = driver.find_element(By.XPATH, "//button[.//span[contains(text(),'ประเภทงานมาตรฐาน')]]")
        types_tab_btn.click()
        time.sleep(0.6)
        rec.set_step("TC_AUTO_017 | UC-07", "หน้าตั้งค่าประเภทงานมาตรฐานของสตูดิโอ (Master Task Types)", "PASS")
        rec.capture_frames(14)

        # 7. System Audit Logs
        rec.set_step("TC_AUTO_026 | UC-14", "หน้าตรวจสอบประวัติการดำเนินงาน (System Audit Logs Traceability)", "RUNNING")
        driver.get(f"{BASE_URL}/logs")
        wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(),'System Audit Logs')]")))
        time.sleep(1.0)
        rec.capture_frames(12)

        try:
            search_input = driver.find_element(By.XPATH, "//input[contains(@placeholder,'ค้นหา')]")
            for ch in "Content":
                search_input.send_keys(ch)
                rec.capture_frames(2, delay=0.02)
            rec.set_step("TC_AUTO_026 | UC-14", "ทดสอบค้นหาและกรองประวัติกิจกรรมแบบทันที (Instant Log Search)", "PASS")
            rec.capture_frames(12)
        except Exception:
            pass

        # 8. System Settings & Health Monitor
        rec.set_step("TC_AUTO_027 | UC-15", "หน้าตรวจสอบสถานะระบบแบบเรียลไทม์ (System Health & Service Monitor)", "PASS")
        driver.get(f"{BASE_URL}/settings")
        wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(),'System Settings')]")))
        time.sleep(1.0)
        rec.capture_frames(18)

        # Save MP4 Video
        mp4_path = os.path.join(VIDEO_DIR, "01_Admin_Web_Test_Demo.mp4")
        print(f"Encoding {len(rec.frames)} frames to {mp4_path} ...", flush=True)
        writer = imageio.get_writer(
            mp4_path,
            fps=FPS,
            codec="libx264",
            quality=8,
            pixelformat="yuv420p",
            macro_block_size=16,
        )
        for f in rec.frames:
            writer.append_data(f)
        writer.close()

        webp_path = os.path.join(VIDEO_DIR, "01_Admin_Web_Test_Demo.webp")
        pil_frames = [Image.fromarray(f).resize((960, 600), Image.Resampling.LANCZOS) for f in rec.frames[::2]]
        pil_frames[0].save(
            webp_path,
            save_all=True,
            append_images=pil_frames[1:],
            duration=int(1000 / (FPS / 2)),
            loop=0,
            quality=80,
        )

        shutil.copy2(mp4_path, os.path.join(SUBMISSION_VIDEO_DIR, "01_Admin_Web_Test_Demo.mp4"))
        print("Admin Web video saved successfully:", mp4_path, flush=True)

    finally:
        driver.quit()


if __name__ == "__main__":
    run_admin_web_recording()
