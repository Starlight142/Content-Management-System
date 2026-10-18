@echo off
chcp 65001 >nul
title Draftly CMS - Portable Database Inspector & Importer
echo ================================================================================
echo   Draftly Content Production Management System - Database Check ^& Import
echo ================================================================================
echo.

cd /d "%~dp0..\backend"

if not exist "node_modules\" (
    echo [Setup] ไม่พบโฟลเดอร์ node_modules ในเครื่องใหม่ กำลังติดตั้งแพ็กเกจอัตโนมัติ...
    call npm install
    echo.
)

echo [Check] กำลังตรวจสอบฐานข้อมูล content_management และข้อมูลภายในเครื่อง...
echo.
node src/database/import_db.js

echo.
echo ================================================================================
pause

