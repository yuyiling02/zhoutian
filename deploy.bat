@echo off
title 3D Magic Gallery - Build & Deploy

echo ==============================================
echo     3D Magic Gallery - Build & Deploy
echo ==============================================
echo.
echo This script will:
echo   1. Clean old build cache
echo   2. Rebuild project
echo   3. Deploy to GitHub Pages
echo.
echo Access: https://yuyiling02.github.io/
echo ==============================================
echo.

cd /d "%~dp0"

echo [Step 1] Cleaning build cache...
if exist .next (
    rmdir /s /q .next
    echo [OK] Cleaned .next directory
)
if exist out (
    rmdir /s /q out
    echo [OK] Cleaned out directory
)
echo.

echo [Step 2] Building project...
npx next build
if errorlevel 1 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)
echo [OK] Build completed
echo.

echo [Step 3] Deploying to GitHub Pages...
cd out

if not exist .git (
    echo [INFO] Initializing git repo...
    git init
    git remote add origin https://github.com/yuyiling02/yuyiling02.github.io.git
)

git add .
git commit -m "Deploy: Auto build from deploy.bat"
git push -f origin master:main

if errorlevel 1 (
    echo.
    echo [ERROR] Deploy failed! Check network connection
    pause
    exit /b 1
)

echo.
echo ==============================================
echo           Deploy successful!
echo ==============================================
echo.
echo Website: https://yuyiling02.github.io/
echo.
echo Wait for GitHub Pages update (1-5 minutes)...
pause
