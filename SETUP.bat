@echo off
setlocal enabledelayedexpansion
title Hermes AI Trading OS - Setup

:: Re-run as Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

set TARGET=C:\Users\Sugam_office\Desktop\trading learning portal
set ZIP_URL=https://github.com/sugam1812/trading-learning-portal-/archive/refs/heads/claude/trading-learning-platform-iXj0b.zip
set ZIPFILE=%TEMP%\hermes-trading.zip
set EXTRACT=%TEMP%\hermes-extract

color 0A
echo.
echo  ================================================
echo    HERMES AI TRADING OS  --  File Setup
echo  ================================================
echo.
echo  Downloading all project files to:
echo  %TARGET%
echo.

:: ── Download zip from GitHub ──────────────────────────────
echo  [1/4] Downloading project files from GitHub...
echo        (This takes 1-2 minutes depending on internet speed)
echo.

powershell -Command ^
    "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; " ^
    "Write-Host '  Connecting to GitHub...'; " ^
    "Invoke-WebRequest -Uri '%ZIP_URL%' -OutFile '%ZIPFILE%' -UseBasicParsing; " ^
    "Write-Host '  Download complete.'"

if not exist "%ZIPFILE%" (
    echo.
    echo  [ERROR] Download failed. Check your internet connection.
    pause & exit /b 1
)
echo  [OK] Downloaded.

:: ── Extract zip ───────────────────────────────────────────
echo.
echo  [2/4] Extracting files...

if exist "%EXTRACT%" rd /s /q "%EXTRACT%"

powershell -Command ^
    "Expand-Archive -Path '%ZIPFILE%' -DestinationPath '%EXTRACT%' -Force; " ^
    "Write-Host '  Extraction complete.'"

:: ── Copy extracted contents to target folder ──────────────
echo.
echo  [3/4] Copying files to your folder...

:: The zip extracts to a subfolder like "trading-learning-portal--claude-..."
:: We need to copy the CONTENTS of that subfolder into TARGET

powershell -Command ^
    "$src = (Get-ChildItem '%EXTRACT%' -Directory | Select-Object -First 1).FullName; " ^
    "Write-Host ('  Source: ' + $src); " ^
    "Copy-Item -Path (Join-Path $src '*') -Destination '%TARGET%' -Recurse -Force; " ^
    "Write-Host '  Copy complete.'"

:: Cleanup temp files
del /q "%ZIPFILE%" >nul 2>&1
rd /s /q "%EXTRACT%" >nul 2>&1

echo  [OK] All files copied to your folder.

:: ── Verify copy ───────────────────────────────────────────
if not exist "%TARGET%\ai_engine\main.py" (
    echo.
    echo  [ERROR] Files did not copy correctly.
    echo  Check that this folder exists: %TARGET%
    pause & exit /b 1
)
if not exist "%TARGET%\client\package.json" (
    echo  [ERROR] Client files missing.
    pause & exit /b 1
)

echo.
echo  [4/4] Verifying files...
echo  [OK] ai_engine\  - AI Trading Engine
echo  [OK] client\     - React Frontend
echo  [OK] server\     - Express Server
echo  [OK] start.bat   - Startup Script

:: ── Create .env file ──────────────────────────────────────
if not exist "%TARGET%\ai_engine\.env" (
    (
        echo DATABASE_URL=postgresql://traderos:traderos_pass@localhost:5432/traderos_ai
        echo GEMINI_API_KEY=
        echo GROQ_API_KEY=
        echo NVIDIA_API_KEY=
    ) > "%TARGET%\ai_engine\.env"
)

:: ── Done ──────────────────────────────────────────────────
echo.
echo  ================================================
echo    ALL FILES COPIED SUCCESSFULLY
echo  ================================================
echo.
echo  Your folder now has everything:
echo  %TARGET%
echo.
echo  NEXT STEP:
echo  Double-click  start.bat  in that folder
echo  to install software and launch the trading system.
echo.
echo  ================================================
echo.

set /p GO="  Open the folder now? (Y/N): "
if /i "%GO%"=="Y" (
    explorer "%TARGET%"
)

pause
