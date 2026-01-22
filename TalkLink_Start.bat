@echo off
setlocal
title TalkLink Launcher

echo ===================================================
echo   TalkLink - Real-time Translation Chat Platform
echo ===================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js v18+ first.
    pause
    exit /b
)

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    call npm install
)

:: Check if client/node_modules exists
if not exist "client\node_modules\" (
    echo [INFO] Installing client dependencies...
    cd client
    call npm install
    cd ..
)

:: Check if build exists, if not build it
if not exist "client\dist\" (
    echo [INFO] Building frontend...
    cd client
    call npm run build
    cd ..
)

echo.
echo [INFO] Starting TalkLink Server...
echo [INFO] Opening browser in 5 seconds...

:: Start browser in background after 5 seconds
start /b cmd /c "timeout /t 5 >nul && start http://localhost:3000"

:: Start server (this blocks until stopped)
call npm run start:prod

pause
