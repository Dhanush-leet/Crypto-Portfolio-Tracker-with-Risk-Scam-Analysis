@echo off
echo Starting Crypto Portfolio Tracker Backend...
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    echo.
    echo Please install Java 17 or higher:
    echo - Download from: https://adoptium.net/
    echo - Or use Chocolatey: choco install openjdk17
    echo - Or use Scoop: scoop install openjdk17
    echo.
    pause
    exit /b 1
)

echo Java found! Starting Spring Boot application...
echo.

cd crypto-portfolio-api

REM Try Maven wrapper first
if exist "..\mvnw.cmd" (
    echo Using Maven wrapper...
    ..\mvnw.cmd spring-boot:run
) else (
    REM Fallback to system Maven
    echo Using system Maven...
    mvn spring-boot:run
)

pause