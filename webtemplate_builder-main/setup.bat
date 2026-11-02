@echo off
setlocal enabledelayedexpansion

echo =====================================================================
echo  Website Template Marketplace ^& Builder - Full Project Setup
echo =====================================================================
echo.

REM 1. Check Python installation
echo [1/5] Checking Python installation...
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not found in system PATH.
    echo Please install Python 3.10 or higher and add it to your PATH.
    pause
    exit /b 1
)
python --version

REM 2. Check Node.js and npm installation
echo.
echo [2/5] Checking Node.js and npm...
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not found in system PATH.
    echo Please install Node.js version 18 or higher and add it to your PATH.
    pause
    exit /b 1
)
echo Node version:
node -v
echo npm version:
call npm -v

REM 3. Setup Python Virtual Environment
echo.
echo [3/5] Setting up Python virtual environment...
if not exist "venv" (
    echo Creating virtual environment in .\venv...
    python -m venv venv
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
) else (
    echo Virtual environment already exists.
)

REM Ensure .env exists in backend
if not exist "backend\.env" (
    echo Creating backend\.env from .env.example...
    copy backend\.env.example backend\.env >nul
)

REM Install backend dependencies
echo Installing backend dependencies from backend\requirements.txt...
call .\venv\Scripts\activate.bat
call pip install -r backend\requirements.txt
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install backend dependencies.
    pause
    exit /b 1
)

REM 4. Database Migrations & Initial Data Seeding
echo.
echo [4/5] Running database migrations and seeding demo catalogue...
call python backend\manage.py migrate
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Database migration failed.
    pause
    exit /b 1
)

call python backend\manage.py seed_data
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Seed data command reported an issue, continuing...
)

REM 5. Install Frontend Dependencies
echo.
echo [5/5] Installing frontend dependencies...
if not exist "frontend\node_modules" (
    cd frontend
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install frontend packages.
        cd ..
        pause
        exit /b 1
    )
    cd ..
) else (
    echo Frontend node_modules already installed.
)

echo.
echo =====================================================================
echo  SETUP COMPLETED SUCCESSFULLY!
echo =====================================================================
echo.
echo Pre-seeded Demonstration Accounts:
echo   - Administrator: admin@example.com / AdminPass123^^!
echo   - Customer:      customer@example.com / CustomerPass123^^!
echo.
echo To start both Frontend and Backend concurrently, run:
echo   run.bat
echo =====================================================================
echo.
