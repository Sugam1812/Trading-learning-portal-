@echo off
setlocal enabledelayedexpansion
title Hermes AI Trading OS

:: ============================================================
::  Hermes AI Trading OS — START ALL SERVICES
::  Double-click to launch everything
:: ============================================================

:: Auto-detect project folder (works from any location)
set PROJECT_DIR=%~dp0
if "%PROJECT_DIR:~-1%"=="\" set PROJECT_DIR=%PROJECT_DIR:~0,-1%

color 0A
echo.
echo  ====================================================
echo    HERMES AI TRADING OS  --  Starting...
echo  ====================================================
echo.
echo  Folder: %PROJECT_DIR%
echo.

:: ── Quick checks ──────────────────────────────────────────
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Python not found. Run INSTALL.bat first.
    pause & exit /b 1
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js not found. Run INSTALL.bat first.
    pause & exit /b 1
)

if not exist "%PROJECT_DIR%\ai_engine\main.py" (
    echo  [ERROR] Project files not found in: %PROJECT_DIR%
    echo  Run INSTALL.bat to set up the project.
    pause & exit /b 1
)

:: ── Install packages if missing ───────────────────────────
python -c "import fastapi" >nul 2>&1
if %errorlevel% neq 0 (
    echo  Installing Python packages (first time)...
    pip install -r "%PROJECT_DIR%\ai_engine\requirements.txt" -q
)

if not exist "%PROJECT_DIR%\client\node_modules" (
    echo  Installing Node packages (first time)...
    cd /d "%PROJECT_DIR%\client" && call npm install -q
    cd /d "%PROJECT_DIR%"
)

:: ── Load .env if exists ───────────────────────────────────
if exist "%PROJECT_DIR%\ai_engine\.env" (
    for /f "usebackq tokens=1,* delims==" %%a in ("%PROJECT_DIR%\ai_engine\.env") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" set %%a=%%b
    )
)

echo.
echo  Starting 3 services...
echo.

:: ── Window 1: AI Engine ───────────────────────────────────
start "AI Engine :8000" cmd /k "color 0B && title AI Engine [:8000] && echo. && echo  HERMES AI ENGINE — FastAPI on port 8000 && echo  Press Ctrl+C to stop && echo. && cd /d "%PROJECT_DIR%\ai_engine" && python -m uvicorn main:app --reload --port 8000 --host 0.0.0.0"

timeout /t 3 /nobreak >nul

:: ── Window 2: React Frontend ──────────────────────────────
start "Frontend :5173" cmd /k "color 0D && title Frontend [:5173] && echo. && echo  REACT FRONTEND — Vite on port 5173 && echo  Press Ctrl+C to stop && echo. && cd /d "%PROJECT_DIR%\client" && npm run dev"

timeout /t 2 /nobreak >nul

:: ── Window 3: Express Server ──────────────────────────────
start "Express :3001" cmd /k "color 0E && title Express Server [:3001] && echo. && echo  EXPRESS SERVER — Node on port 3001 && echo  Press Ctrl+C to stop && echo. && cd /d "%PROJECT_DIR%\server" && npm run dev"

:: ── Wait then open browser ────────────────────────────────
echo  Waiting for services to start (8 seconds)...
timeout /t 8 /nobreak >nul

echo.
echo  Opening browser...
start "" "http://localhost:5173/ai-fund"

:: ── Summary ───────────────────────────────────────────────
echo.
echo  ====================================================
echo    ALL SERVICES RUNNING
echo  ====================================================
echo.
echo    AI Fund Dashboard  →  http://localhost:5173/ai-fund
echo    Full Portal        →  http://localhost:5173
echo    AI Engine API      →  http://localhost:8000
echo    Express Server     →  http://localhost:3001
echo.
echo    3 service windows are open.
echo    Close them to stop the app.
echo.
echo    To use AI Fund:
echo    1. Browser opens automatically
echo    2. Click "START FUND" button
echo    3. Watch agents trade EUR/USD live
echo.
echo  ====================================================
echo.
pause
