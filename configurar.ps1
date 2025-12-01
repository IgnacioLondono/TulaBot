# Script de Configuración para TulaBot
# Este script te ayudará a configurar el archivo .env

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuración de TulaBot" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si existe el archivo .env
if (Test-Path .env) {
    Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Archivo .env no encontrado" -ForegroundColor Red
    Write-Host "💡 Creando archivo .env desde plantilla..." -ForegroundColor Yellow
    
    # Crear archivo .env básico
    @"
# ============================================
# TulaBot - Configuración Completa
# ============================================

# DISCORD BOT - Configuración Principal (OBLIGATORIO)
DISCORD_TOKEN=
CLIENT_ID=
CLIENT_SECRET=
DEFAULT_PREFIX=!

# GOOGLE GEMINI AI - Configuración de IA (OPCIONAL)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash

# TENOR API - Para GIFs (OPCIONAL)
TENOR_API_KEY=

# MYSQL - Configuración de Base de Datos
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=tulabot
MYSQL_USER=tulabot
MYSQL_PASSWORD=
MYSQL_PORT=3306

# BASE DE DATOS - Configuración para el Bot
DB_HOST=localhost
DB_PORT=3306
DB_USER=tulabot
DB_PASSWORD=
DB_NAME=tulabot

# PANEL WEB - Configuración del Panel Web
REDIRECT_URI=http://localhost:3000/callback
WEB_PORT=3000
SESSION_SECRET=

# CONFIGURACIÓN AVANZADA
NODE_ENV=development
WEB_ENABLED=true
BOT_API_PORT=3001
BOT_API_HOST=0.0.0.0
BOT_URL=http://bot:3001
"@ | Out-File -FilePath .env -Encoding UTF8
    
    Write-Host "✅ Archivo .env creado" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Generador de Contraseñas Seguras" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Función para generar contraseña segura
function Generate-SecurePassword {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

Write-Host "¿Quieres generar contraseñas seguras? (S/N)" -ForegroundColor Yellow
$generate = Read-Host

if ($generate -eq "S" -or $generate -eq "s" -or $generate -eq "Y" -or $generate -eq "y") {
    Write-Host ""
    Write-Host "Contraseñas generadas:" -ForegroundColor Green
    Write-Host ""
    
    $mysqlRoot = Generate-SecurePassword
    $mysqlUser = Generate-SecurePassword
    $sessionSecret = Generate-SecurePassword
    
    Write-Host "MYSQL_ROOT_PASSWORD:" -ForegroundColor Cyan
    Write-Host $mysqlRoot -ForegroundColor White
    Write-Host ""
    
    Write-Host "MYSQL_PASSWORD / DB_PASSWORD:" -ForegroundColor Cyan
    Write-Host $mysqlUser -ForegroundColor White
    Write-Host ""
    
    Write-Host "SESSION_SECRET:" -ForegroundColor Cyan
    Write-Host $sessionSecret -ForegroundColor White
    Write-Host ""
    
    Write-Host "⚠️ IMPORTANTE: Copia estas contraseñas y pégalas en tu archivo .env" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verificación de Configuración" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Leer archivo .env
$envContent = Get-Content .env -ErrorAction SilentlyContinue

if ($envContent) {
    $requiredVars = @(
        "DISCORD_TOKEN",
        "CLIENT_ID",
        "CLIENT_SECRET",
        "MYSQL_ROOT_PASSWORD",
        "MYSQL_PASSWORD",
        "DB_PASSWORD",
        "SESSION_SECRET"
    )
    
    $missing = @()
    $configured = @()
    
    foreach ($var in $requiredVars) {
        $found = $false
        foreach ($line in $envContent) {
            if ($line -match "^$var=") {
                $value = $line -replace "^$var=", ""
                if ($value -and $value.Trim() -ne "") {
                    $found = $true
                    $configured += $var
                    break
                }
            }
        }
        if (-not $found) {
            $missing += $var
        }
    }
    
    Write-Host "Variables configuradas:" -ForegroundColor Green
    foreach ($var in $configured) {
        Write-Host "  ✅ $var" -ForegroundColor Green
    }
    
    if ($missing.Count -gt 0) {
        Write-Host ""
        Write-Host "Variables faltantes:" -ForegroundColor Red
        foreach ($var in $missing) {
            Write-Host "  ❌ $var" -ForegroundColor Red
        }
        Write-Host ""
        Write-Host "💡 Completa estas variables en el archivo .env" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "✅ Todas las variables obligatorias están configuradas" -ForegroundColor Green
    }
} else {
    Write-Host "❌ No se pudo leer el archivo .env" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Próximos Pasos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Completa el archivo .env con tus valores:" -ForegroundColor Yellow
Write-Host "   - DISCORD_TOKEN: Obténlo en Discord Developer Portal > Bot > Token" -ForegroundColor White
Write-Host "   - CLIENT_ID: Obténlo en Discord Developer Portal > General Information" -ForegroundColor White
Write-Host "   - CLIENT_SECRET: Obténlo en Discord Developer Portal > OAuth2" -ForegroundColor White
Write-Host ""
Write-Host "2. Configura OAuth2 Redirect URI en Discord:" -ForegroundColor Yellow
Write-Host "   - Ve a Discord Developer Portal > OAuth2 > Redirects" -ForegroundColor White
Write-Host "   - Agrega: http://localhost:3000/callback" -ForegroundColor White
Write-Host ""
Write-Host "3. Lee la guía completa:" -ForegroundColor Yellow
Write-Host "   - Abre CONFIGURAR_TODO.md para instrucciones detalladas" -ForegroundColor White
Write-Host ""
Write-Host "4. Inicia el bot:" -ForegroundColor Yellow
Write-Host "   npm start" -ForegroundColor White
Write-Host ""

