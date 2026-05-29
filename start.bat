@echo off
setlocal enabledelayedexpansion
title Hermes AI Trading OS

:: ============================================================
::  Hermes AI Trading OS — Windows Startup Script
::  Double-click this file to start all 3 services
:: ============================================================
::
::  SETUP REQUIRED (first time only):
::  1. Install Python 3.11+  → https://python.org/downloads
::  2. Install Node.js 18+   → https://nodejs.org
::  3. Install PostgreSQL    → https://postgresql.org/download
::     Create DB: traderos_ai  User: traderos  Pass: traderos_pass
::
::  If project is in a different folder, update PROJECT_DIR below:
:: ============================================================

set PROJECT_DIR=%~dp0
:: Remove trailing backslash
if "%PROJECT_DIR:~-1%"=="\" set PROJECT_DIR=%PROJECT_DIR:~0,-1%

echo.
echo  =======================================================
echo    HERMES AI TRADING OS  --  Starting all services...
echo  =======================================================
echo.
echo  Project folder: %PROJECT_DIR%
echo.

:: ── Check Python ──────────────────────────────────────────
echo  [1/4] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo        ERROR: Python not found.
    echo        Download from: https://python.org/downloads
    echo        Make sure to tick "Add Python to PATH" during install.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('python --version 2^>^&1') do echo        OK: %%v

:: ── Check Node ────────────────────────────────────────────
echo  [2/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo        ERROR: Node.js not found.
    echo        Download from: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version 2^>^&1') do echo        OK: Node %%v

:: ── Install Python packages if needed ─────────────────────
echo  [3/4] Checking Python packages...
python -c "import fastapi" >nul 2>&1
if %errorlevel% neq 0 (
    echo        Installing Python packages (first time, takes 1-2 min)...
    pip install -r "%PROJECT_DIR%\ai_engine\requirements.txt" --quiet
    if %errorlevel% neq 0 (
        echo        ERROR: Failed to install Python packages.
        pause
        exit /b 1
    )
    echo        Packages installed successfully.
) else (
    echo        OK: Packages already installed.
)

:: ── Install Node packages if needed ───────────────────────
echo  [4/4] Checking Node packages...
if not exist "%PROJECT_DIR%\client\node_modules" (
    echo        Installing Node packages (first time, takes 1-2 min)...
    cd /d "%PROJECT_DIR%"
    call npm install --silent
    cd /d "%PROJECT_DIR%\client"
    call npm install --silent
    cd /d "%PROJECT_DIR%"
    echo        Node packages installed.
) else (
    echo        OK: Node packages already installed.
)

echo.
echo  Starting services in separate windows...
echo.

:: ── Window 1: AI Engine (FastAPI) ─────────────────────────
start "🤖 Hermes AI Engine [:8000]" cmd /k ^
    "title Hermes AI Engine [:8000] & echo. & echo  AI ENGINE STARTING on port 8000... & echo. & cd /d "%PROJECT_DIR%\ai_engine" & python -m uvicorn main:app --reload --port 8000 --host 0.0.0.0"

:: Wait 2s then start frontend
timeout /t 2 /nobreak >nul

:: ── Window 2: React Frontend (Vite) ───────────────────────
start "🖥  Hermes Frontend [:5173]" cmd /k ^
    "title Hermes Frontend [:5173] & echo. & echo  REACT FRONTEND STARTING on port 5173... & echo. & cd /d "%PROJECT_DIR%\client" & npm run dev"

:: Wait 2s then start server
timeout /t 2 /nobreak >nul

:: ── Window 3: Express Server ───────────────────────────────
start "⚡ Hermes Express Server [:3001]" cmd /k ^
    "title Hermes Express Server [:3001] & echo. & echo  EXPRESS SERVER STARTING on port 3001... & echo. & cd /d "%PROJECT_DIR%\server" & npm run dev"

:: ── Wait for services to come up ──────────────────────────
echo  Waiting for services to start...
timeout /t 6 /nobreak >nul

:: ── Open browser ──────────────────────────────────────────
echo.
echo  Opening AI Fund dashboard in browser...
start "" "http://localhost:5173/ai-fund"

:: ── Done ──────────────────────────────────────────────────
echo.
echo  =======================================================
echo    ALL SERVICES STARTED
echo  =======================================================
echo.
echo    Frontend   :  http://localhost:5173
echo    AI Engine  :  http://localhost:8000
echo    API Server :  http://localhost:3001
echo.
echo    AI Fund    :  http://localhost:5173/ai-fund
echo.
echo    3 separate windows opened for each service.
echo    Close those windows to stop the services.
echo.
echo  Press any key to close this launcher window...
pause >nul
