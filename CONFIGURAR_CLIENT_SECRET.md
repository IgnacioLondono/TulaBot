# 🔑 Cómo Obtener y Configurar CLIENT_SECRET

## Paso 1: Obtener el Client Secret de Discord

1. **Ve a Discord Developer Portal:**
   - Abre: https://discord.com/developers/applications
   - Inicia sesión con tu cuenta de Discord

2. **Selecciona tu aplicación:**
   - Busca la aplicación con Client ID: `1444530753168871487`
   - O crea una nueva aplicación si no tienes una

3. **Ve a la sección OAuth2:**
   - En el menú lateral, haz clic en **"OAuth2"**
   - Luego haz clic en **"General"**

4. **Copia el Client Secret:**
   - En la sección **"Client Secret"**, verás un botón que dice **"Reset Secret"** o **"Copy"**
   - Si no ves el secret (aparece como `••••••••`), haz clic en **"Reset Secret"**
   - ⚠️ **IMPORTANTE:** Copia el secret inmediatamente, solo se muestra una vez
   - Si lo pierdes, tendrás que resetearlo de nuevo

## Paso 2: Actualizar el archivo .env

1. **Abre el archivo `.env`** en la raíz del proyecto

2. **Encuentra la línea:**
   ```env
   CLIENT_SECRET=tu_client_secret_aqui
   ```

3. **Reemplázala con tu Client Secret real:**
   ```env
   CLIENT_SECRET=tu_secret_real_aqui_sin_espacios
   ```
   
   **Ejemplo:**
   ```env
   CLIENT_SECRET=abc123xyz789def456ghi012jkl345mno678pqr901
   ```

4. **Guarda el archivo**

## Paso 3: Verificar Redirect URI en Discord

1. **En Discord Developer Portal > OAuth2 > General**

2. **En la sección "Redirects"**, asegúrate de tener:
   ```
   http://localhost:3000/callback
   ```
   
   - Si no está, haz clic en **"Add Redirect"**
   - Agrega exactamente: `http://localhost:3000/callback`
   - Sin barra al final (`/`)
   - Sin espacios
   - Todo en minúsculas

3. **Guarda los cambios** (botón "Save Changes" en la parte inferior)

## Paso 4: Reiniciar el Bot

1. **Detén el bot** si está corriendo (Ctrl+C)

2. **Inicia el bot de nuevo:**
   ```bash
   npm start
   ```

3. **Verifica en la consola** que aparezca:
   ```
   🔐 OAuth2 configurado:
      Client ID: ✅ Configurado
      Client Secret: ✅ Configurado
      Redirect URI: http://localhost:3000/callback
   ```

## Paso 5: Probar la Autenticación

1. **Abre tu navegador** y ve a: `http://localhost:3000`

2. **Haz clic en "Iniciar Sesión con Discord"**

3. **Autoriza la aplicación** en Discord

4. **Deberías ser redirigido** al dashboard sin errores

## ⚠️ Notas Importantes

- **NUNCA compartas tu CLIENT_SECRET** públicamente
- **NO lo subas a GitHub** (asegúrate de que `.env` esté en `.gitignore`)
- Si reseteas el Client Secret, actualiza también tu `.env`
- El Redirect URI debe coincidir **exactamente** en Discord y en `.env`

## 🔍 Verificación Rápida

Para verificar que tu `.env` está correcto, ejecuta:

```powershell
# Verificar que las variables estén cargadas
node -e "require('dotenv').config(); console.log('CLIENT_ID:', process.env.CLIENT_ID ? '✅' : '❌'); console.log('CLIENT_SECRET:', process.env.CLIENT_SECRET && process.env.CLIENT_SECRET !== 'tu_client_secret_aqui' ? '✅' : '❌');"
```

Si ves `✅` en ambos, la configuración está correcta.





