@echo off
setlocal enabledelayedexpansion
title Hermes AI Trading OS

:: ================================================================
::  HERMES AI TRADING OS — FULL AUTO START
::  Double-click this file. Everything installs and starts.
::  Works even on a fresh Windows PC with nothing installed.
:: ================================================================

:: ── Re-launch as Administrator if not already ──────────────────
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting administrator rights...
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

:: ── Variables ──────────────────────────────────────────────────
set DESKTOP=%USERPROFILE%\Desktop
set PROJECT_DIR=%DESKTOP%\Trading Learning Portal
set REPO_URL=https://github.com/sugam1812/trading-learning-portal-
set BRANCH=claude/trading-learning-platform-iXj0b
set DB_NAME=traderos_ai
set DB_USER=traderos
set DB_PASS=traderos_pass
set PG_SUPERPASS=postgres

:: If running from inside the project folder already, use that
if exist "%~dp0ai_engine\main.py" (
    set PROJECT_DIR=%~dp0
    if "!PROJECT_DIR:~-1!"=="\" set PROJECT_DIR=!PROJECT_DIR:~0,-1!
)

color 0A
echo.
echo  ================================================================
echo    HERMES AI TRADING OS  --  Full Auto Setup ^& Start
echo  ================================================================
echo.
echo  Project will be at: %PROJECT_DIR%
echo.

:: ================================================================
::  PHASE 1 — INSTALL PREREQUISITES
:: ================================================================
echo  [PHASE 1/5] Checking and installing prerequisites...
echo.

:: ── Check winget ──────────────────────────────────────────────
winget --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!] winget not found. Installing App Installer...
    powershell -Command "Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe" >nul 2>&1
)

:: ── Git ───────────────────────────────────────────────────────
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [..] Installing Git...
    winget install --id Git.Git -e --silent --accept-package-agreements --accept-source-agreements
    call :refreshpath
    git --version >nul 2>&1
    if !errorlevel! neq 0 (
        echo  [X] Git install failed. Downloading manually...
        powershell -Command "Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.47.0.windows.1/Git-2.47.0-64-bit.exe' -OutFile '%TEMP%\git-installer.exe'"
        start /wait "" "%TEMP%\git-installer.exe" /VERYSILENT /NORESTART /NOCANCEL /SP-
        call :refreshpath
    )
    echo  [OK] Git installed.
) else (
    for /f "tokens=*" %%v in ('git --version') do echo  [OK] %%v already installed
)

:: ── Python ────────────────────────────────────────────────────
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [..] Installing Python 3.11...
    winget install --id Python.Python.3.11 -e --silent --accept-package-agreements --accept-source-agreements
    call :refreshpath
    python --version >nul 2>&1
    if !errorlevel! neq 0 (
        echo  [..] Trying Python via direct download...
        powershell -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe' -OutFile '%TEMP%\python-installer.exe'"
        start /wait "" "%TEMP%\python-installer.exe" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
        call :refreshpath
    )
    echo  [OK] Python installed.
) else (
    for /f "tokens=*" %%v in ('python --version 2^>^&1') do echo  [OK] %%v already installed
)

:: ── Node.js ───────────────────────────────────────────────────
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [..] Installing Node.js LTS...
    winget install --id OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements
    call :refreshpath
    node --version >nul 2>&1
    if !errorlevel! neq 0 (
        echo  [..] Trying Node.js via direct download...
        powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi' -OutFile '%TEMP%\node-installer.msi'"
        start /wait msiexec /i "%TEMP%\node-installer.msi" /quiet /norestart
        call :refreshpath
    )
    echo  [OK] Node.js installed.
) else (
    for /f "tokens=*" %%v in ('node --version') do echo  [OK] Node.js %%v already installed
)

:: ── PostgreSQL ────────────────────────────────────────────────
set PSQL_PATH=
for %%p in (
    "C:\Program Files\PostgreSQL\16\bin"
    "C:\Program Files\PostgreSQL\15\bin"
    "C:\Program Files\PostgreSQL\14\bin"
    "C:\Program Files\PostgreSQL\17\bin"
) do (
    if exist "%%~p\psql.exe" (
        set PSQL_PATH=%%~p
        goto :pg_found
    )
)

echo  [..] Installing PostgreSQL 16...
winget install --id PostgreSQL.PostgreSQL.16 -e --silent --accept-package-agreements --accept-source-agreements --override "/S /PASSWORD=%PG_SUPERPASS%"
call :refreshpath

:: Search again after install
for %%p in (
    "C:\Program Files\PostgreSQL\16\bin"
    "C:\Program Files\PostgreSQL\15\bin"
    "C:\Program Files\PostgreSQL\14\bin"
    "C:\Program Files\PostgreSQL\17\bin"
) do (
    if exist "%%~p\psql.exe" (
        set PSQL_PATH=%%~p
        goto :pg_found
    )
)
echo  [!] PostgreSQL install may need a reboot. Continuing...
goto :pg_done

:pg_found
echo  [OK] PostgreSQL found at: %PSQL_PATH%

:pg_done

:: ================================================================
::  PHASE 2 — DOWNLOAD PROJECT
:: ================================================================
echo.
echo  [PHASE 2/5] Setting up project folder...
echo.

if exist "%PROJECT_DIR%\ai_engine\main.py" (
    echo  [OK] Project already exists. Pulling latest updates...
    cd /d "%PROJECT_DIR%"
    git pull origin %BRANCH% 2>&1 | findstr /v "^$"
) else (
    if not exist "%PROJECT_DIR%" mkdir "%PROJECT_DIR%"
    echo  [..] Downloading project from GitHub...
    echo       (This may take 1-2 minutes)
    git clone --branch %BRANCH% --depth 1 %REPO_URL% "%PROJECT_DIR%"
    if !errorlevel! neq 0 (
        echo.
        echo  [X] Failed to download project.
        echo      Check your internet connection and try again.
        pause
        exit /b 1
    )
    echo  [OK] Project downloaded to: %PROJECT_DIR%
)

:: Create .env if missing
if not exist "%PROJECT_DIR%\ai_engine\.env" (
    (
        echo DATABASE_URL=postgresql://%DB_USER%:%DB_PASS%@localhost:5432/%DB_NAME%
        echo GEMINI_API_KEY=
        echo GROQ_API_KEY=
        echo NVIDIA_API_KEY=
    ) > "%PROJECT_DIR%\ai_engine\.env"
    echo  [OK] Created .env file
)

:: ================================================================
::  PHASE 3 — SETUP DATABASE
:: ================================================================
echo.
echo  [PHASE 3/5] Setting up PostgreSQL database...
echo.

if not defined PSQL_PATH (
    echo  [!] psql not found in PATH. Trying system PATH...
    psql --version >nul 2>&1
    if !errorlevel! equ 0 set PSQL_PATH=.
)

if defined PSQL_PATH (
    :: Start PostgreSQL service
    net start postgresql-x64-16 >nul 2>&1
    net start postgresql-x64-15 >nul 2>&1
    net start postgresql >nul 2>&1

    :: Wait for PG to start
    timeout /t 3 /nobreak >nul

    :: Create user and database
    set PGPASSWORD=%PG_SUPERPASS%

    if "%PSQL_PATH%"=="." (
        set PSQL_EXE=psql
    ) else (
        set PSQL_EXE="%PSQL_PATH%\psql.exe"
    )

    :: Create role (ignore error if exists)
    !PSQL_EXE! -U postgres -c "DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='%DB_USER%') THEN CREATE USER %DB_USER% WITH PASSWORD '%DB_PASS%'; END IF; END $$;" >nul 2>&1

    :: Create database (ignore error if exists)
    !PSQL_EXE! -U postgres -c "SELECT 1 FROM pg_database WHERE datname='%DB_NAME%'" 2>nul | findstr /c:"1 row" >nul
    if !errorlevel! neq 0 (
        !PSQL_EXE! -U postgres -c "CREATE DATABASE %DB_NAME% OWNER %DB_USER%;" >nul 2>&1
    )

    :: Grant privileges
    !PSQL_EXE! -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%;" >nul 2>&1

    :: Test connection
    set PGPASSWORD=%DB_PASS%
    !PSQL_EXE! -U %DB_USER% -d %DB_NAME% -c "SELECT 1;" >nul 2>&1
    if !errorlevel! equ 0 (
        echo  [OK] Database '%DB_NAME%' ready with user '%DB_USER%'
    ) else (
        echo  [!] DB connection test failed - engine will retry on start
    )
    set PGPASSWORD=
) else (
    echo  [!] PostgreSQL not found. AI engine may fail to connect.
    echo      Install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo      Then run this script again.
)

:: ================================================================
::  PHASE 4 — INSTALL PACKAGES
:: ================================================================
echo.
echo  [PHASE 4/5] Installing packages...
echo.

:: Python packages
python -c "import fastapi, asyncpg, uvicorn" >nul 2>&1
if %errorlevel% neq 0 (
    echo  [..] Installing Python packages (1-2 min)...
    pip install -r "%PROJECT_DIR%\ai_engine\requirements.txt" --quiet --disable-pip-version-check
    echo  [OK] Python packages installed.
) else (
    echo  [OK] Python packages already installed.
)

:: Node packages — client
if not exist "%PROJECT_DIR%\client\node_modules\vite" (
    echo  [..] Installing frontend packages (1-2 min)...
    cd /d "%PROJECT_DIR%\client"
    call npm install --silent 2>nul
    echo  [OK] Frontend packages installed.
) else (
    echo  [OK] Frontend packages already installed.
)

:: Node packages — server
if not exist "%PROJECT_DIR%\server\node_modules" (
    echo  [..] Installing server packages...
    cd /d "%PROJECT_DIR%\server"
    call npm install --silent 2>nul
    echo  [OK] Server packages installed.
) else (
    echo  [OK] Server packages already installed.
)

cd /d "%PROJECT_DIR%"

:: ================================================================
::  PHASE 5 — START ALL SERVICES
:: ================================================================
echo.
echo  [PHASE 5/5] Starting all services...
echo.

:: Ensure PostgreSQL is running
if defined PSQL_PATH (
    net start postgresql-x64-16 >nul 2>&1
    net start postgresql-x64-15 >nul 2>&1
)

:: Kill any old instances on these ports
powershell -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
powershell -Command "Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
powershell -Command "Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

timeout /t 1 /nobreak >nul

:: ── AI Engine (FastAPI + Python) ──────────────────────────────
start "AI Engine" cmd /k "color 0B & title [AI ENGINE] port 8000 & echo. & echo  HERMES AI ENGINE running on http://localhost:8000 & echo  Close this window to stop the AI engine. & echo. & cd /d ""%PROJECT_DIR%\ai_engine"" & set PYTHONPATH=%PROJECT_DIR%\ai_engine & python -m uvicorn main:app --reload --port 8000 --host 0.0.0.0"

echo  [..] Starting AI Engine...
timeout /t 4 /nobreak >nul

:: ── React Frontend (Vite) ─────────────────────────────────────
start "Frontend" cmd /k "color 0D & title [FRONTEND] port 5173 & echo. & echo  REACT FRONTEND running on http://localhost:5173 & echo  Close this window to stop the frontend. & echo. & cd /d ""%PROJECT_DIR%\client"" & npm run dev"

echo  [..] Starting React Frontend...
timeout /t 4 /nobreak >nul

:: ── Express Server ────────────────────────────────────────────
start "Express" cmd /k "color 0E & title [EXPRESS] port 3001 & echo. & echo  EXPRESS SERVER running on http://localhost:3001 & echo  Close this window to stop the server. & echo. & cd /d ""%PROJECT_DIR%\server"" & npm run dev"

echo  [..] Starting Express Server...
timeout /t 5 /nobreak >nul

:: ── Health check ──────────────────────────────────────────────
echo.
echo  Checking services...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8000/health' -TimeoutSec 5 -UseBasicParsing; Write-Host '  [OK] AI Engine is live' } catch { Write-Host '  [!] AI Engine still starting...' }"
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 5 -UseBasicParsing; Write-Host '  [OK] Frontend is live' } catch { Write-Host '  [!] Frontend still starting...' }"

:: ── Open browser ──────────────────────────────────────────────
echo.
echo  Opening AI Fund dashboard...
start "" "http://localhost:5173/ai-fund"

:: ── Done ──────────────────────────────────────────────────────
echo.
echo  ================================================================
echo    HERMES AI TRADING OS IS RUNNING
echo  ================================================================
echo.
echo    AI Fund Dashboard  →  http://localhost:5173/ai-fund
echo    Full Learning Portal   →  http://localhost:5173
echo    AI Engine API      →  http://localhost:8000/health
echo.
echo    HOW TO USE:
echo    1. Browser opened automatically to AI Fund page
echo    2. Click the GREEN "START FUND" button
echo    3. Watch 8 AI agents analyze EUR/USD and GBP/USD
echo    4. Agents will open paper trades automatically
echo.
echo    TO STOP: Close the 3 service windows (blue, pink, yellow)
echo    TO RESTART: Double-click start.bat again
echo.
echo    Project folder:
echo    %PROJECT_DIR%
echo  ================================================================
echo.
pause
exit /b

:: ================================================================
::  Helper: Refresh PATH from registry (after installs)
:: ================================================================
:refreshpath
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set SYS_PATH=%%b
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v Path 2^>nul') do set USR_PATH=%%b
set PATH=%SYS_PATH%;%USR_PATH%;C:\Program Files\Git\cmd;C:\Program Files\PostgreSQL\16\bin;C:\Program Files\PostgreSQL\15\bin
exit /b
