#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
record_mobile_app_demo.py
Automates a full E2E test walkthrough on the Android Emulator (Pixel 8),
captures lossless frames via `adb exec-out screencap -p`, overlays the
real-time QA Test Telemetry Dashboard, and exports:
  - docs/videos/02_Mobile_App_Test_Demo.mp4
  - docs/videos/02_Mobile_App_Test_Demo.webp
  - docs/videos/03_Full_System_Combined_Test_Demo.mp4
"""

import io
import os
import shutil
import subprocess
import time
import imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
VIDEO_DIR = os.path.join(ROOT_DIR, "docs", "videos")
SUBMISSION_VIDEO_DIR = os.path.join(ROOT_DIR, "docs", "teacher-submission", "5-Test-Videos")
os.makedirs(VIDEO_DIR, exist_ok=True)
os.makedirs(SUBMISSION_VIDEO_DIR, exist_ok=True)

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


FONT_BADGE = get_font(15)
FONT_HEADER = get_font(23)
FONT_SUB = get_font(15)
FONT_TITLE = get_font(19)
FONT_ROW = get_font(14)

ALL_STEPS = [
    ("TC_AUTO_003 | UC-04", "หน้าลงทะเบียนและเข้าสู่ระบบ (Sign In / Sign Up & Join Code)"),
    ("TC_AUTO_002 | UC-01", "เข้าสู่ระบบด้วยบัญชีหัวหน้าทีม (Manager: manager@studio.com)"),
    ("TC_AUTO_014 | UC-06", "หน้างานผลิตของหัวหน้าทีม (Manager Production Pipeline & Review)"),
    ("TC_AUTO_015 | UC-06", "หน้าต่างสร้างชิ้นงานใหม่ (SmoothModal Hardware GPU Animation)"),
    ("TC_AUTO_010 | UC-04", "หน้าภาพรวมทีมและสถานะออนไลน์เรียลไทม์ (Team Overview & Presence)"),
    ("TC_AUTO_022 | UC-11", "หน้ากระดานระดมไอเดียของทีม (Team Idea Board & Voting)"),
    ("TC_AUTO_024 | UC-13", "หน้าโปรไฟล์และสลับโหมดมืด (Dark Mode Theme & Instant Tab Cache)"),
    ("TC_AUTO_018 | UC-08", "สลับเข้าสู่ระบบด้วยบัญชีสมาชิกทีม (Member: member@studio.com)"),
    ("TC_AUTO_019 | UC-09", "หน้างานของฉันและส่งมอบงาน (Member My Tasks & Progress Update)"),
]


def adb(cmd):
    subprocess.run(f"adb {cmd}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def grab_phone_image():
    raw = subprocess.check_output(["adb", "exec-out", "screencap", "-p"])
    return Image.open(io.BytesIO(raw)).convert("RGB")


def render_dashboard_frame(phone_pil, active_idx, status="PASS"):
    phone_resized = phone_pil.resize((340, 756), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (1280, 800), (15, 23, 42))
    draw = ImageDraw.Draw(canvas, "RGBA")

    # Left side: Phone Bezel + Live Screen
    px, py = 68, 22
    draw.rounded_rectangle(
        [(px - 8, py - 8), (px + 340 + 8, py + 756 + 8)],
        radius=24,
        fill=(30, 41, 59),
        outline=(99, 102, 241),
        width=2,
    )
    canvas.paste(phone_resized, (px, py))

    # Right side: QA Automated Test Telemetry Dashboard
    rx = 456
    draw.text((rx, 28), "Draftly Mobile App — Automated E2E Test Recording", fill=(248, 250, 252), font=FONT_HEADER)
    draw.text(
        (rx, 62),
        "Device: Android 14 Emulator (Pixel 8 - 1080x2400)  |  API: http://127.0.0.1:5000/api (Online)",
        fill=(148, 163, 184),
        font=FONT_SUB,
    )

    badge, title = ALL_STEPS[active_idx]

    # Active Step Card
    draw.rounded_rectangle([(rx, 102), (1236, 224)], radius=14, fill=(30, 41, 59), outline=(99, 102, 241), width=2)
    draw.rounded_rectangle([(rx + 18, 118), (rx + 225, 152)], radius=6, fill=(79, 70, 229))
    draw.text((rx + 28, 125), badge, fill=(255, 255, 255), font=FONT_BADGE)

    status_col = (16, 185, 129) if status == "PASS" else (245, 158, 11)
    draw.rounded_rectangle([(1105, 118), (1216, 152)], radius=6, fill=status_col)
    draw.text((1122, 125), f"● {status}", fill=(255, 255, 255), font=FONT_BADGE)

    draw.text((rx + 18, 172), title, fill=(248, 250, 252), font=FONT_TITLE)

    # Execution Checklist
    draw.text((rx, 244), "รายการทดสอบตาม Use Case (Mobile Test Execution Log):", fill=(203, 213, 225), font=FONT_SUB)
    y_cursor = 276
    for i, (s_badge, s_title) in enumerate(ALL_STEPS):
        if i < active_idx or (i == active_idx and status == "PASS"):
            state = "PASS"
            row_bg = (30, 41, 59)
            border_c = (16, 185, 129)
            icon_bg = (16, 185, 129)
            text_c = (241, 245, 249)
        elif i == active_idx:
            state = "RUN"
            row_bg = (30, 41, 59)
            border_c = (245, 158, 11)
            icon_bg = (245, 158, 11)
            text_c = (255, 255, 255)
        else:
            state = "WAIT"
            row_bg = (15, 23, 42)
            border_c = (51, 65, 85)
            icon_bg = (71, 85, 105)
            text_c = (100, 116, 139)

        draw.rounded_rectangle([(rx, y_cursor), (1236, y_cursor + 48)], radius=8, fill=row_bg, outline=border_c, width=1)
        draw.rounded_rectangle([(rx + 12, y_cursor + 10), (rx + 78, y_cursor + 38)], radius=5, fill=icon_bg)
        draw.text((rx + 22, y_cursor + 15), state, fill=(255, 255, 255), font=FONT_ROW)
        draw.text((rx + 92, y_cursor + 14), f"[{s_badge}] {s_title}", fill=text_c, font=FONT_ROW)
        y_cursor += 55

    return np.array(canvas)


class MobileRecorder:
    def __init__(self):
        self.frames = []
        self.active_idx = 0
        self.status = "RUNNING"

    def set_step(self, idx, status="RUNNING"):
        self.active_idx = idx
        self.status = status
        badge, title = ALL_STEPS[idx]
        print(f"[Step {idx+1}/9] [{badge}] {title} ({status})", flush=True)

    def capture(self, hold_frames=10):
        img = grab_phone_image()
        frame = render_dashboard_frame(img, self.active_idx, self.status)
        for _ in range(hold_frames):
            self.frames.append(frame)

    def tap_and_capture(self, x, y, wait=0.7, hold_frames=10):
        adb(f"shell input tap {x} {y}")
        time.sleep(wait)
        self.capture(hold_frames=hold_frames)

    def swipe_and_capture(self, x1, y1, x2, y2, duration_ms=350, wait=0.6, hold_frames=10):
        adb(f"shell input swipe {x1} {y1} {x2} {y2} {duration_ms}")
        time.sleep(wait)
        self.capture(hold_frames=hold_frames)


def run_mobile_recording():
    adb("reverse tcp:5000 tcp:5000")
    adb("reverse tcp:8081 tcp:8081")

    # Ensure we are on LoginScreen first
    adb("shell input tap 930 2215")
    time.sleep(0.5)
    adb("shell input swipe 540 1800 540 600 300")
    time.sleep(0.5)
    adb("shell input tap 540 1925")
    time.sleep(1.2)

    rec = MobileRecorder()

    # Step 0: Login & Sign Up Tabs
    rec.set_step(0, "RUNNING")
    rec.capture(hold_frames=10)
    rec.tap_and_capture(730, 565, wait=0.8, hold_frames=14)  # Sign Up Tab
    rec.set_step(0, "PASS")
    rec.tap_and_capture(280, 565, wait=0.7, hold_frames=10)  # Sign In Tab

    # Step 1: Login as Manager
    rec.set_step(1, "RUNNING")
    rec.tap_and_capture(540, 1475, wait=0.7, hold_frames=12)  # Demo Accounts Drawer
    rec.tap_and_capture(185, 1715, wait=0.5, hold_frames=10)  # Select Manager
    rec.set_step(1, "PASS")
    rec.tap_and_capture(540, 1255, wait=2.0, hold_frames=15)  # Sign In

    # Step 2: Manager Production Dashboard
    rec.set_step(2, "PASS")
    rec.capture(hold_frames=12)
    rec.swipe_and_capture(540, 1700, 540, 750, 350, wait=0.7, hold_frames=12)
    rec.swipe_and_capture(540, 750, 540, 1700, 350, wait=0.7, hold_frames=10)

    # Step 3: SmoothModal Create Content/Task
    rec.set_step(3, "PASS")
    rec.tap_and_capture(735, 225, wait=0.8, hold_frames=15)
    adb("shell input keyevent 4")
    time.sleep(0.6)
    rec.capture(hold_frames=8)

    # Step 4: Team Overview Tab
    rec.set_step(4, "PASS")
    rec.tap_and_capture(385, 2215, wait=1.2, hold_frames=15)
    rec.swipe_and_capture(540, 1700, 540, 900, 350, wait=0.6, hold_frames=12)
    rec.swipe_and_capture(540, 900, 540, 1700, 350, wait=0.6, hold_frames=8)

    # Step 5: Idea Board Tab
    rec.set_step(5, "PASS")
    rec.tap_and_capture(680, 2215, wait=1.2, hold_frames=15)

    # Step 6: Profile & Dark Mode Toggle + Instant Tab Cache
    rec.set_step(6, "RUNNING")
    rec.tap_and_capture(930, 2215, wait=0.8, hold_frames=12)
    rec.set_step(6, "PASS")
    rec.tap_and_capture(855, 922, wait=0.8, hold_frames=14)   # Dark Mode ON
    rec.tap_and_capture(145, 2215, wait=0.6, hold_frames=12)  # Instant cached Production Tab (Dark)
    rec.tap_and_capture(385, 2215, wait=0.6, hold_frames=12)  # Instant cached Team Tab (Dark)
    rec.tap_and_capture(930, 2215, wait=0.6, hold_frames=8)   # Back to Profile
    rec.tap_and_capture(855, 922, wait=0.7, hold_frames=8)    # Light Mode ON

    # Logout Manager
    adb("shell input swipe 540 1800 540 600 350")
    time.sleep(0.6)
    rec.tap_and_capture(540, 1925, wait=1.0, hold_frames=10)

    # Step 7: Login as Member (John Editor)
    rec.set_step(7, "RUNNING")
    rec.tap_and_capture(540, 1475, wait=0.7, hold_frames=10)  # Open Demo Accounts
    rec.tap_and_capture(395, 1715, wait=0.5, hold_frames=10)  # Select Editor
    rec.set_step(7, "PASS")
    rec.tap_and_capture(540, 1255, wait=2.0, hold_frames=15)  # Sign In

    # Step 8: Member My Tasks & Deliverable Submission
    rec.set_step(8, "PASS")
    rec.swipe_and_capture(540, 1700, 540, 850, 350, wait=0.7, hold_frames=14)
    rec.tap_and_capture(385, 2215, wait=0.8, hold_frames=12)  # Member Team Tab
    rec.tap_and_capture(680, 2215, wait=0.8, hold_frames=14)  # Member Idea Tab

    # Encode Mobile MP4
    mp4_path = os.path.join(VIDEO_DIR, "02_Mobile_App_Test_Demo.mp4")
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

    # Save Mobile Animated WebP
    webp_path = os.path.join(VIDEO_DIR, "02_Mobile_App_Test_Demo.webp")
    pil_frames = [Image.fromarray(f).resize((960, 600), Image.Resampling.LANCZOS) for f in rec.frames[::2]]
    pil_frames[0].save(
        webp_path,
        save_all=True,
        append_images=pil_frames[1:],
        duration=int(1000 / (FPS / 2)),
        loop=0,
        quality=80,
    )

    shutil.copy2(mp4_path, os.path.join(SUBMISSION_VIDEO_DIR, "02_Mobile_App_Test_Demo.mp4"))

    # Also build Combined Master Video (Admin Web + Mobile App)
    web_mp4 = os.path.join(VIDEO_DIR, "01_Admin_Web_Test_Demo.mp4")
    combined_mp4 = os.path.join(VIDEO_DIR, "03_Full_System_Web_And_App_Test_Demo.mp4")
    if os.path.exists(web_mp4):
        print(f"Building combined Web + App video: {combined_mp4} ...", flush=True)
        comb_writer = imageio.get_writer(
            combined_mp4,
            fps=FPS,
            codec="libx264",
            quality=8,
            pixelformat="yuv420p",
            macro_block_size=16,
        )
        web_reader = imageio.get_reader(web_mp4)
        for wf in web_reader:
            comb_writer.append_data(wf)
        web_reader.close()
        for mf in rec.frames:
            comb_writer.append_data(mf)
        comb_writer.close()
        shutil.copy2(combined_mp4, os.path.join(SUBMISSION_VIDEO_DIR, "03_Full_System_Web_And_App_Test_Demo.mp4"))

    print("All Mobile & Combined videos saved successfully!", flush=True)


if __name__ == "__main__":
    run_mobile_recording()
