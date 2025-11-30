# 🔧 Solución: Puerto 3000 en Uso

## Problema
El error `EADDRINUSE: address already in use :::3000` significa que el puerto 3000 ya está siendo usado por otro proceso.

## Soluciones

### Opción 1: Detener el proceso que usa el puerto (Recomendado)

**En PowerShell:**
```powershell
# Detener el proceso (reemplaza 30968 con el PID que aparezca)
taskkill /PID 30968 /F
```

**O encontrar y detener todos los procesos Node.js:**
```powershell
# Ver todos los procesos Node.js
Get-Process node

# Detener todos los procesos Node.js (¡CUIDADO! Esto detendrá TODOS)
Stop-Process -Name node -Force
```

### Opción 2: Cambiar el puerto del panel web

1. Edita tu archivo `.env` y cambia:
```env
WEB_PORT=3001
```

2. Actualiza el Redirect URI en Discord Developer Portal:
   - Ve a OAuth2 > General
   - Cambia el redirect a: `http://localhost:3001/callback`

3. Reinicia el bot

### Opción 3: Deshabilitar el panel web temporalmente

Si no necesitas el panel web ahora:

1. Edita tu archivo `.env`:
```env
WEB_ENABLED=false
```

2. Reinicia el bot

## Verificar qué está usando el puerto

```powershell
netstat -ano | findstr :3000
```

Esto mostrará el PID del proceso. Luego puedes ver qué es:
```powershell
tasklist /FI "PID eq [PID_AQUI]"
```

## Prevención

El código ahora maneja este error mejor y el bot no se detendrá si el puerto está ocupado. Simplemente mostrará un mensaje de advertencia y continuará funcionando.






