@echo off
title 3D Magic Gallery - Dev Server

echo ==============================================
echo        3D Magic Gallery - Quick Start
echo ==============================================
echo.
echo Starting development server...
echo Browser will open automatically
echo.
echo Press Ctrl+C to stop server
echo ==============================================
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo [INFO] node_modules not found, installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
    echo.
)

echo [INFO] Starting Next.js dev server...
echo [INFO] Server: http://localhost:3000
echo.

start "" http://localhost:3000

npx next dev

echo.
echo ==============================================
echo           Server stopped
echo ==============================================
pause
