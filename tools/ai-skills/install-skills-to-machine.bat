@echo off
setlocal EnableDelayedExpansion
title Draftly - AI Skills Installer for New Machine

echo ========================================================
echo   Draftly AI Skills Portable Installer
echo   Skills: ponytail + diagram-design + draftly-portable
echo ========================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "GLOBAL_GEMINI_DIR=%USERPROFILE%\.gemini\config"
set "GLOBAL_AGENTS_DIR=%USERPROFILE%\.agents"

echo [1/3] Installing skills into Global Antigravity / Gemini configuration...
for %%S in (ponytail diagram-design draftly-portable) do (
    if not exist "%GLOBAL_GEMINI_DIR%\skills\%%S" mkdir "%GLOBAL_GEMINI_DIR%\skills\%%S"
    copy /Y "%SCRIPT_DIR%skills\%%S\SKILL.md" "%GLOBAL_GEMINI_DIR%\skills\%%S\SKILL.md" >nul
)
echo       Installed to: %GLOBAL_GEMINI_DIR%\skills\

echo.
echo [2/3] Installing skills into Global .agents directory...
for %%S in (ponytail diagram-design draftly-portable) do (
    if not exist "%GLOBAL_AGENTS_DIR%\skills\%%S" mkdir "%GLOBAL_AGENTS_DIR%\skills\%%S"
    copy /Y "%SCRIPT_DIR%skills\%%S\SKILL.md" "%GLOBAL_AGENTS_DIR%\skills\%%S\SKILL.md" >nul
)
if not exist "%GLOBAL_AGENTS_DIR%\rules" mkdir "%GLOBAL_AGENTS_DIR%\rules"
copy /Y "%SCRIPT_DIR%rules\ponytail.md" "%GLOBAL_AGENTS_DIR%\rules\ponytail.md" >nul
echo       Installed to: %GLOBAL_AGENTS_DIR%\

echo.
echo [3/3] Syncing project-level .agents directory...
for %%S in (ponytail diagram-design draftly-portable) do (
    if not exist "%SCRIPT_DIR%..\..\.agents\skills\%%S" mkdir "%SCRIPT_DIR%..\..\.agents\skills\%%S"
    copy /Y "%SCRIPT_DIR%skills\%%S\SKILL.md" "%SCRIPT_DIR%..\..\.agents\skills\%%S\SKILL.md" >nul
)
if not exist "%SCRIPT_DIR%..\..\.agents\rules" mkdir "%SCRIPT_DIR%..\..\.agents\rules"
copy /Y "%SCRIPT_DIR%rules\ponytail.md" "%SCRIPT_DIR%..\..\.agents\rules\ponytail.md" >nul

echo.
echo ========================================================
echo   Installation Successful!
echo   Skills installed:
echo     - ponytail (Minimalist Senior Developer Coding)
echo     - diagram-design (Editorial Architecture Diagrams)
echo     - draftly-portable (New PC Migration & Bootstrap)
echo ========================================================
echo.
pause
