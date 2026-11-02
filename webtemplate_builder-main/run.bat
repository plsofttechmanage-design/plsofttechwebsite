@echo off
setlocal

echo =====================================================================
echo  Starting Website Template Marketplace ^& Builder
echo =====================================================================
echo.

:: Verify environment readiness
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] Python virtual environment not found!
    echo Please run setup.bat first to configure your environment.
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo [ERROR] Frontend dependencies not found!
    echo Please run setup.bat first to install npm packages.
    pause
    exit /b 1
)

echo [1/2] Launching Django Backend Server (http://127.0.0.1:8000)...
start "Marketplace Backend API [Django :8000]" cmd /k "title Backend API (Django :8000) && call .\venv\Scripts\activate.bat && python backend\manage.py runserver 8000"

echo [2/2] Launching React Vite Frontend (http://localhost:5173)...
start "Marketplace Frontend UI [React :5173]" cmd /k "title Frontend UI (React Vite :5173) && cd frontend && npm run dev"

echo.
echo Both servers have been launched in dedicated terminal windows!
echo Opening browser to http://localhost:5173 in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo =====================================================================
echo  SYSTEM RUNNING CONCURRENTLY!
echo =====================================================================
echo  Frontend Application: http://localhost:5173/
echo  Backend REST API:     http://127.0.0.1:8000/
echo  Interactive Swagger:  http://127.0.0.1:8000/api/docs/
echo  Django Staff Admin:   http://127.0.0.1:8000/django-admin/
echo.
echo  Demo Credentials:
echo   - Admin:    admin@example.com / AdminPass123!
echo   - Customer: customer@example.com / CustomerPass123!
echo.
echo  Note: To stop the servers, close the respective terminal windows.
echo =====================================================================

