@echo off
setlocal enabledelayedexpansion
title Hermes AI Trading OS — Installer

:: ============================================================
::  HERMES AI TRADING OS — ONE-CLICK INSTALLER
::  Creates "Trading Learning Portal" folder on your Desktop
::  and downloads + sets up everything automatically.
:: ============================================================

set DESKTOP=%USERPROFILE%\Desktop
set INSTALL_DIR=%DESKTOP%\Trading Learning Portal
set REPO_URL=https://github.com/sugam1812/trading-learning-portal-
set BRANCH=claude/trading-learning-platform-iXj0b

color 0A
echo.
echo  ====================================================
echo    HERMES AI TRADING OS  --  INSTALLER
echo  ====================================================
echo.
echo  This will install the project to:
echo  %INSTALL_DIR%
echo.
echo  Press any key to start, or close this window to cancel.
pause >nul

echo.
echo  ── STEP 1: Checking requirements ──────────────────
echo.

:: Check Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Git is not installed.
    echo.
    echo  Please install Git first:
    echo  https://git-scm.com/download/win
    echo.
    echo  After installing Git, run this file again.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('git --version') do echo  [OK] %%v

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Python is not installed.
    echo.
    echo  Please install Python 3.11+ from:
    echo  https://www.python.org/downloads/
    echo  IMPORTANT: Tick "Add Python to PATH" during install.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('python --version 2^>^&1') do echo  [OK] %%v

:: Check Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js is not installed.
    echo.
    echo  Please install Node.js LTS from:
    echo  https://nodejs.org
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo  [OK] Node.js %%v

echo.
echo  All requirements met!
echo.

:: ── STEP 2: Create Desktop folder ─────────────────────────
echo  ── STEP 2: Creating project folder ────────────────
echo.

if exist "%INSTALL_DIR%" (
    echo  Folder already exists: %INSTALL_DIR%
    echo  Updating existing installation...
    echo.
    cd /d "%INSTALL_DIR%"
    git pull origin %BRANCH% 2>&1
    goto :deps
)

echo  Creating: %INSTALL_DIR%
mkdir "%INSTALL_DIR%"

:: ── STEP 3: Clone the project ─────────────────────────────
echo.
echo  ── STEP 3: Downloading project from GitHub ─────────
echo.
echo  Cloning branch: %BRANCH%
echo  This may take 1-2 minutes...
echo.

git clone --branch %BRANCH% %REPO_URL% "%INSTALL_DIR%"

if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Failed to download project from GitHub.
    echo  Check your internet connection and try again.
    echo.
    rmdir /s /q "%INSTALL_DIR%" 2>nul
    pause
    exit /b 1
)

echo.
echo  [OK] Project downloaded successfully!

:deps
:: ── STEP 4: Install Python packages ───────────────────────
echo.
echo  ── STEP 4: Installing Python packages ──────────────
echo.
echo  (This takes 1-2 minutes on first run)
echo.

pip install -r "%INSTALL_DIR%\ai_engine\requirements.txt"

if %errorlevel% neq 0 (
    echo  [WARNING] Some Python packages failed to install.
    echo  The app may still work. Continuing...
)
echo.
echo  [OK] Python packages installed.

:: ── STEP 5: Install Node packages ─────────────────────────
echo.
echo  ── STEP 5: Installing Node.js packages ─────────────
echo.
echo  (This takes 1-2 minutes on first run)
echo.

cd /d "%INSTALL_DIR%"
call npm install

cd /d "%INSTALL_DIR%\client"
call npm install

cd /d "%INSTALL_DIR%\server"
call npm install 2>nul

echo.
echo  [OK] Node packages installed.

:: ── STEP 6: Create .env file ──────────────────────────────
echo.
echo  ── STEP 6: Creating environment file ───────────────
echo.

if not exist "%INSTALL_DIR%\ai_engine\.env" (
    (
        echo # Hermes AI Trading OS — Environment Variables
        echo # Add your FREE API keys below for smarter AI reasoning
        echo # The system works fully WITHOUT these keys too
        echo.
        echo # Google Gemini Flash (free) → https://aistudio.google.com/apikey
        echo GEMINI_API_KEY=
        echo.
        echo # Groq (free) → https://console.groq.com
        echo GROQ_API_KEY=
        echo.
        echo # NVIDIA NIM (free) → https://build.nvidia.com
        echo NVIDIA_API_KEY=
        echo.
        echo # PostgreSQL connection
        echo DATABASE_URL=postgresql://traderos:traderos_pass@localhost:5432/traderos_ai
    ) > "%INSTALL_DIR%\ai_engine\.env"
    echo  [OK] Created ai_engine\.env (edit to add optional API keys)
) else (
    echo  [OK] .env file already exists.
)

:: ── STEP 7: Create Desktop shortcut ───────────────────────
echo.
echo  ── STEP 7: Creating Desktop shortcut ───────────────
echo.

set SHORTCUT=%DESKTOP%\Start Hermes Trading OS.lnk
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT%'); $s.TargetPath = '%INSTALL_DIR%\start.bat'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.IconLocation = 'cmd.exe,0'; $s.Description = 'Start Hermes AI Trading OS'; $s.Save()" 2>nul

if exist "%SHORTCUT%" (
    echo  [OK] Shortcut created on Desktop: "Start Hermes Trading OS"
) else (
    echo  [OK] Use start.bat directly from the folder.
)

:: ── DONE ──────────────────────────────────────────────────
echo.
echo  ====================================================
echo    INSTALLATION COMPLETE!
echo  ====================================================
echo.
echo  Project installed to:
echo  %INSTALL_DIR%
echo.
echo  ── HOW TO START ────────────────────────────────────
echo.
echo  Option 1: Double-click "Start Hermes Trading OS"
echo            shortcut on your Desktop
echo.
echo  Option 2: Open the folder and double-click start.bat
echo            %INSTALL_DIR%\start.bat
echo.
echo  ── POSTGRESQL SETUP (if not done yet) ─────────────
echo.
echo  Open pgAdmin or SQL Shell and run:
echo.
echo    CREATE USER traderos WITH PASSWORD 'traderos_pass';
echo    CREATE DATABASE traderos_ai OWNER traderos;
echo    GRANT ALL PRIVILEGES ON DATABASE traderos_ai TO traderos;
echo.
echo  ── FREE API KEYS (optional) ────────────────────────
echo.
echo  Edit: %INSTALL_DIR%\ai_engine\.env
echo  Add Gemini key: https://aistudio.google.com/apikey
echo.
echo  ====================================================
echo.

set /p LAUNCH="  Launch the app now? (Y/N): "
if /i "%LAUNCH%"=="Y" (
    cd /d "%INSTALL_DIR%"
    start "" "%INSTALL_DIR%\start.bat"
)

echo.
pause
