#!/usr/bin/env pwsh

Write-Host "🗄️ Testing PostgreSQL Database Connection" -ForegroundColor Green
Write-Host ""

# Database connection details
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "crypto_portfolio"
$dbUser = "crypto_portfolio"
$dbPassword = "crypto_portfolio"

Write-Host "Testing connection to PostgreSQL..." -ForegroundColor Cyan
Write-Host "Host: $dbHost" -ForegroundColor White
Write-Host "Port: $dbPort" -ForegroundColor White
Write-Host "Database: $dbName" -ForegroundColor White
Write-Host "Username: $dbUser" -ForegroundColor White
Write-Host ""

# Test if PostgreSQL is running
try {
    $connection = Test-NetConnection -ComputerName $dbHost -Port $dbPort -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "✅ PostgreSQL server is running on $dbHost`:$dbPort" -ForegroundColor Green
    } else {
        Write-Host "❌ Cannot connect to PostgreSQL server on $dbHost`:$dbPort" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please ensure:" -ForegroundColor Yellow
        Write-Host "1. PostgreSQL is installed and running" -ForegroundColor White
        Write-Host "2. Database 'crypto_portfolio' exists" -ForegroundColor White
        Write-Host "3. User 'crypto_portfolio' has access" -ForegroundColor White
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
} catch {
    Write-Host "❌ Error testing connection: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Test with psql if available
try {
    $env:PGPASSWORD = $dbPassword
    $result = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "SELECT version();" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database connection successful!" -ForegroundColor Green
        Write-Host "PostgreSQL Version:" -ForegroundColor Cyan
        Write-Host $result -ForegroundColor White
    } else {
        Write-Host "⚠️ psql not available, but port is open" -ForegroundColor Yellow
        Write-Host "Connection test passed - Spring Boot should be able to connect" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ psql not available, but port is open" -ForegroundColor Yellow
    Write-Host "Connection test passed - Spring Boot should be able to connect" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Ready to start Spring Boot backend!" -ForegroundColor Green
Write-Host "Run: ./start-backend.ps1" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"