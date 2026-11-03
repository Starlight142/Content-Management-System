@echo off
setlocal EnableDelayedExpansion
title Draftly - AI Skills Installer for New Machine

echo ========================================================
echo   Draftly AI Skills Portable Installer
echo   Skills: Ponytail + Diagram Design + Rules
echo ========================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "GLOBAL_GEMINI_DIR=%USERPROFILE%\.gemini\config"
set "GLOBAL_AGENTS_DIR=%USERPROFILE%\.agents"

echo [1/3] Installing skills into Global Antigravity / Gemini configuration...
if not exist "%GLOBAL_GEMINI_DIR%\skills\ponytail" mkdir "%GLOBAL_GEMINI_DIR%\skills\ponytail"
if not exist "%GLOBAL_GEMINI_DIR%\skills\diagram-design" mkdir "%GLOBAL_GEMINI_DIR%\skills\diagram-design"

copy /Y "%SCRIPT_DIR%skills\ponytail\SKILL.md" "%GLOBAL_GEMINI_DIR%\skills\ponytail\SKILL.md" >nul
copy /Y "%SCRIPT_DIR%skills\diagram-design\SKILL.md" "%GLOBAL_GEMINI_DIR%\skills\diagram-design\SKILL.md" >nul
echo       Installed to: %GLOBAL_GEMINI_DIR%\skills\

echo.
echo [2/3] Installing skills into Global .agents directory...
if not exist "%GLOBAL_AGENTS_DIR%\skills\ponytail" mkdir "%GLOBAL_AGENTS_DIR%\skills\ponytail"
if not exist "%GLOBAL_AGENTS_DIR%\skills\diagram-design" mkdir "%GLOBAL_AGENTS_DIR%\skills\diagram-design"
if not exist "%GLOBAL_AGENTS_DIR%\rules" mkdir "%GLOBAL_AGENTS_DIR%\rules"

copy /Y "%SCRIPT_DIR%skills\ponytail\SKILL.md" "%GLOBAL_AGENTS_DIR%\skills\ponytail\SKILL.md" >nul
copy /Y "%SCRIPT_DIR%skills\diagram-design\SKILL.md" "%GLOBAL_AGENTS_DIR%\skills\diagram-design\SKILL.md" >nul
copy /Y "%SCRIPT_DIR%rules\ponytail.md" "%GLOBAL_AGENTS_DIR%\rules\ponytail.md" >nul
echo       Installed to: %GLOBAL_AGENTS_DIR%\

echo.
echo [3/3] Checking project-level .agents directory...
if exist "%SCRIPT_DIR%..\..\.agents" (
    echo       Project .agents directory already verified.
) else (
    echo       Creating project-level .agents fallback...
    if not exist "%SCRIPT_DIR%..\..\.agents\skills\ponytail" mkdir "%SCRIPT_DIR%..\..\.agents\skills\ponytail"
    if not exist "%SCRIPT_DIR%..\..\.agents\skills\diagram-design" mkdir "%SCRIPT_DIR%..\..\.agents\skills\diagram-design"
    if not exist "%SCRIPT_DIR%..\..\.agents\rules" mkdir "%SCRIPT_DIR%..\..\.agents\rules"
    copy /Y "%SCRIPT_DIR%skills\ponytail\SKILL.md" "%SCRIPT_DIR%..\..\.agents\skills\ponytail\SKILL.md" >nul
    copy /Y "%SCRIPT_DIR%skills\diagram-design\SKILL.md" "%SCRIPT_DIR%..\..\.agents\skills\diagram-design\SKILL.md" >nul
    copy /Y "%SCRIPT_DIR%rules\ponytail.md" "%SCRIPT_DIR%..\..\.agents\rules\ponytail.md" >nul
)

echo.
echo ========================================================
echo   Installation Successful!
echo   Skills installed:
echo     - ponytail (Minimalist Senior Developer Coding)
echo     - diagram-design (Editorial Architecture Diagrams)
echo ========================================================
echo.
pause
