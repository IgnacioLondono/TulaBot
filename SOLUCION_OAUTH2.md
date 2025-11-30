# 🔧 Solución: Error 401 Unauthorized en OAuth2

## Problema
El error `401 Unauthorized on POST /api/v9/oauth2/token` indica que Discord rechazó las credenciales al intentar intercambiar el código por un token.

## Causas Comunes

### 1. CLIENT_SECRET Incorrecto
El `CLIENT_SECRET` en tu archivo `.env` no coincide con el de Discord Developer Portal.

**Solución:**
1. Ve a https://discord.com/developers/applications
2. Selecciona tu aplicación
3. Ve a **OAuth2** > **General**
4. Copia el **Client Secret** (haz clic en "Reset Secret" si es necesario)
5. Actualiza tu archivo `.env`:
```env
CLIENT_SECRET=tu_client_secret_aqui
```

### 2. Redirect URI No Coincide
El Redirect URI en tu `.env` debe coincidir **exactamente** con el configurado en Discord.

**Solución:**
1. En Discord Developer Portal > OAuth2 > General
2. En "Redirects", asegúrate de tener exactamente:
   ```
   http://localhost:3000/callback
   ```
   (Sin barra al final, sin espacios, exactamente como está)

3. En tu `.env`:
```env
REDIRECT_URI=http://localhost:3000/callback
```

### 3. Variables de Entorno No Cargadas
El archivo `.env` no se está leyendo correctamente.

**Solución:**
1. Verifica que el archivo `.env` esté en la raíz del proyecto (mismo nivel que `package.json`)
2. Reinicia el bot después de cambiar `.env`
3. Verifica que no haya espacios alrededor del `=`:
   ```env
   # ✅ Correcto
   CLIENT_SECRET=abc123
   
   # ❌ Incorrecto
   CLIENT_SECRET = abc123
   ```

## Verificación Rápida

Ejecuta esto para verificar tu configuración:
```bash
# Verificar que las variables estén cargadas
node -e "require('dotenv').config(); console.log('CLIENT_ID:', process.env.CLIENT_ID ? '✅' : '❌'); console.log('CLIENT_SECRET:', process.env.CLIENT_SECRET ? '✅' : '❌');"
```

## Configuración Completa del .env

```env
# Discord Bot Token
DISCORD_TOKEN=tu_bot_token

# OAuth2 Configuración
CLIENT_ID=tu_client_id
CLIENT_SECRET=tu_client_secret
REDIRECT_URI=http://localhost:3000/callback

# Panel Web
WEB_PORT=3000
WEB_ENABLED=true
SESSION_SECRET=tu-secret-super-seguro-cambiar-en-produccion
```

## Pasos para Configurar OAuth2 en Discord

1. **Ve a Discord Developer Portal:**
   - https://discord.com/developers/applications

2. **Selecciona tu aplicación** (o crea una nueva)

3. **Ve a OAuth2 > General:**
   - Copia el **Client ID**
   - Copia el **Client Secret** (haz clic en "Reset Secret" si no lo tienes)

4. **En "Redirects", agrega:**
   ```
   http://localhost:3000/callback
   ```
   (Para producción, agrega tu dominio)

5. **Guarda los cambios**

6. **Actualiza tu `.env`** con los valores copiados

7. **Reinicia el bot**

## Notas Importantes

- ⚠️ **Nunca compartas tu CLIENT_SECRET** públicamente
- ⚠️ El Redirect URI debe coincidir **exactamente** (mayúsculas/minúsculas, espacios, etc.)
- ⚠️ Si cambias el Redirect URI en Discord, actualiza también tu `.env`
- ⚠️ Reinicia el bot después de cambiar variables de entorno





