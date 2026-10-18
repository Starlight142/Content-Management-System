@echo off
chcp 65001 >nul
title Draftly CMS - Portable Database Exporter
echo ================================================================================
echo   Draftly Content Production Management System - Database Export
echo ================================================================================
echo.

cd /d "%~dp0..\backend"

if not exist "node_modules\" (
    echo [Setup] ไม่พบโฟลเดอร์ node_modules กำลังติดตั้งแพ็กเกจอัตโนมัติ...
    call npm install
    echo.
)

echo [Export] กำลังดึงข้อมูลล่าสุดจากฐานข้อมูล content_management ออกมาเป็นไฟล์พกพา...
echo.
node src/database/export_db.js

echo.
echo ================================================================================
pause
