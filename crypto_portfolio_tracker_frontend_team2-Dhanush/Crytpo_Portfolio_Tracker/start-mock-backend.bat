@echo off
echo Starting Mock Backend for Crypto Portfolio Tracker...
echo.

cd mock-backend

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found! Installing dependencies...
npm install

echo.
echo Starting mock backend server...
npm start

pause