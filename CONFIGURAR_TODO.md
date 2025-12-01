# 🔧 Guía Completa de Configuración - TulaBot

Esta guía te ayudará a configurar completamente el bot, el panel web y la base de datos.

## 📋 Índice

1. [Configuración de Discord](#1-configuración-de-discord)
2. [Configuración del Archivo .env](#2-configuración-del-archivo-env)
3. [Configuración de la Base de Datos](#3-configuración-de-la-base-de-datos)
4. [Configuración del Panel Web](#4-configuración-del-panel-web)
5. [Verificación](#5-verificación)

---

## 1. Configuración de Discord

### 1.1 Crear la Aplicación y Bot

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Haz clic en **"New Application"**
3. Dale un nombre (ej: "TulaBot")
4. Haz clic en **"Create"**

### 1.2 Obtener el Token del Bot

1. En el menú lateral, ve a **"Bot"**
2. Haz clic en **"Add Bot"** y confirma
3. En la sección **"Token"**, haz clic en **"Reset Token"**
4. **Copia el token** y guárdalo de forma segura
   - ⚠️ **NUNCA** compartas este token
   - ⚠️ Si alguien lo obtiene, haz clic en "Reset Token" inmediatamente

### 1.3 Obtener el Client ID

1. Ve a **"General Information"** en el menú lateral
2. Copia el **"Application ID"** (este es tu CLIENT_ID)

### 1.4 Obtener el Client Secret (para el Panel Web)

1. Ve a **"OAuth2"** en el menú lateral
2. En la sección **"Client Secret"**, haz clic en **"Reset Secret"**
3. **Copia el secret** y guárdalo de forma segura
   - ⚠️ Solo puedes verlo una vez, guárdalo bien

### 1.5 Configurar OAuth2 Redirect URI

1. En **"OAuth2"** > **"General"**, desplázate a **"Redirects"**
2. Haz clic en **"Add Redirect"**
3. Agrega la URL según tu entorno:

   **Para desarrollo local:**
   ```
   http://localhost:3000/callback
   ```

   **Para producción:**
   ```
   https://tu-dominio.com/callback
   ```

4. Haz clic en **"Save Changes"**

### 1.6 Configurar Permisos del Bot

1. Ve a **"Bot"** en el menú lateral
2. En **"Privileged Gateway Intents"**, activa:
   - ✅ **PRESENCE INTENT**
   - ✅ **SERVER MEMBERS INTENT**
   - ✅ **MESSAGE CONTENT INTENT**
3. Haz clic en **"Save Changes"**

### 1.7 Invitar el Bot a tu Servidor

1. Ve a **"OAuth2"** > **"URL Generator"**
2. En **"SCOPES"**, selecciona:
   - ✅ **bot**
   - ✅ **applications.commands**
3. En **"BOT PERMISSIONS"**, selecciona:
   - ✅ **Administrar Mensajes**
   - ✅ **Expulsar Miembros**
   - ✅ **Banear Miembros**
   - ✅ **Gestionar Canales**
   - ✅ **Gestionar Roles**
   - ✅ **Conectar** (para música)
   - ✅ **Hablar** (para música)
   - ✅ **Usar Comandos de Aplicación**
   - ✅ **Leer Historial de Mensajes**
4. Copia la URL generada
5. Abre la URL en tu navegador
6. Selecciona el servidor donde quieres añadir el bot
7. Haz clic en **"Autorizar"**

---

## 2. Configuración del Archivo .env

### 2.1 Abrir el Archivo .env

El archivo `.env` ya está creado en la raíz del proyecto. Ábrelo con tu editor de texto.

### 2.2 Completar Variables de Discord

```env
# Reemplaza estos valores con los que obtuviste en Discord Developer Portal
DISCORD_TOKEN=tu_token_del_bot_aqui
CLIENT_ID=tu_client_id_aqui
CLIENT_SECRET=tu_client_secret_aqui
```

### 2.3 Generar Contraseñas Seguras

Para generar contraseñas seguras, puedes usar:

**En PowerShell (Windows):**
```powershell
# Generar contraseña para MySQL Root
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Generar contraseña para MySQL User
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Generar SESSION_SECRET
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**En Linux/Mac:**
```bash
# Generar contraseñas
openssl rand -base64 32
```

Actualiza estas variables en el `.env`:
```env
MYSQL_ROOT_PASSWORD=tu_contraseña_generada_aqui
MYSQL_PASSWORD=tu_contraseña_generada_aqui
SESSION_SECRET=tu_secret_generado_aqui
```

### 2.4 Configurar Base de Datos

**Para desarrollo local (sin Docker):**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=tulabot
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=tulabot
```

**Para Docker/Portainer:**
```env
DB_HOST=mysql
DB_PORT=3306
DB_USER=tulabot
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=tulabot
```

### 2.5 Configurar Panel Web

```env
# Para desarrollo local
REDIRECT_URI=http://localhost:3000/callback

# Para producción (cambiar cuando despliegues)
# REDIRECT_URI=https://tu-dominio.com/callback

WEB_PORT=3000
SESSION_SECRET=tu_secret_generado_aqui
```

### 2.6 APIs Opcionales

**Google Gemini (para comandos de IA):**
```env
GEMINI_API_KEY=tu_api_key_gemini
GEMINI_MODEL=gemini-2.5-flash
```
Obtén la API Key en: https://makersuite.google.com/app/apikey

**Tenor (para GIFs):**
```env
TENOR_API_KEY=tu_api_key_tenor
```
Obtén la API Key en: https://developers.google.com/tenor/guides/quickstart

---

## 3. Configuración de la Base de Datos

### Opción A: Usando Docker (Recomendado)

Si usas Docker, la base de datos se configurará automáticamente. Solo asegúrate de que las variables en `.env` coincidan:

```env
MYSQL_ROOT_PASSWORD=tu_password_root
MYSQL_DATABASE=tulabot
MYSQL_USER=tulabot
MYSQL_PASSWORD=tu_password_user
```

### Opción B: MySQL Local

Si prefieres usar MySQL local:

1. **Instalar MySQL:**
   - Windows: Descarga desde [mysql.com](https://dev.mysql.com/downloads/mysql/)
   - Linux: `sudo apt install mysql-server` (Ubuntu/Debian)
   - Mac: `brew install mysql`

2. **Crear la base de datos:**
   ```sql
   CREATE DATABASE tulabot;
   CREATE USER 'tulabot'@'localhost' IDENTIFIED BY 'tu_password';
   GRANT ALL PRIVILEGES ON tulabot.* TO 'tulabot'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Ejecutar el script de inicialización:**
   ```bash
   mysql -u tulabot -p tulabot < docker/mysql/init.sql
   ```

4. **Configurar en .env:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=tulabot
   DB_PASSWORD=tu_password
   DB_NAME=tulabot
   ```

---

## 4. Configuración del Panel Web

### 4.1 Verificar Variables OAuth2

Asegúrate de que estas variables estén correctas en `.env`:

```env
CLIENT_ID=tu_client_id
CLIENT_SECRET=tu_client_secret
REDIRECT_URI=http://localhost:3000/callback
SESSION_SECRET=tu_secret_generado
```

### 4.2 Verificar Redirect URI en Discord

El `REDIRECT_URI` en tu `.env` **DEBE coincidir exactamente** con el configurado en Discord Developer Portal:

1. Ve a Discord Developer Portal > OAuth2 > General
2. Verifica que la URL en "Redirects" sea exactamente la misma que en tu `.env`

### 4.3 Configurar para Producción

Cuando despliegues en producción:

1. Cambia `REDIRECT_URI` en `.env`:
   ```env
   REDIRECT_URI=https://tu-dominio.com/callback
   ```

2. Agrega la nueva URL en Discord Developer Portal > OAuth2 > Redirects

3. Si usas HTTPS, asegúrate de tener un certificado SSL válido

---

## 5. Verificación

### 5.1 Verificar Archivo .env

Asegúrate de que todas las variables obligatorias estén configuradas:

```bash
# Verificar que el archivo existe
ls .env

# Verificar contenido (sin mostrar valores sensibles)
cat .env | grep -E "^[A-Z_]+=" | cut -d'=' -f1
```

### 5.2 Probar Conexión a Base de Datos

**Con Docker:**
```bash
docker-compose up -d mysql
docker-compose exec mysql mysql -u tulabot -p tulabot
```

**Sin Docker:**
```bash
mysql -u tulabot -p tulabot
```

### 5.3 Iniciar el Bot

```bash
npm start
```

Deberías ver:
- ✅ Bot conectado como TulaBot#XXXX
- ✅ Base de datos MySQL inicializada
- ✅ Panel web iniciado en http://localhost:3000

### 5.4 Probar el Panel Web

1. Abre tu navegador en: `http://localhost:3000`
2. Deberías ver la página de login
3. Haz clic en "Iniciar sesión con Discord"
4. Autoriza la aplicación
5. Deberías ser redirigido al panel

### 5.5 Registrar Comandos en Discord

```bash
npm run deploy
```

Esto registrará todos los comandos slash en Discord. Puede tardar unos minutos.

---

## 🔒 Seguridad

### Checklist de Seguridad

- [ ] El archivo `.env` está en `.gitignore`
- [ ] Las contraseñas son seguras y únicas
- [ ] El token de Discord no está compartido
- [ ] El Client Secret está guardado de forma segura
- [ ] El SESSION_SECRET es aleatorio y único
- [ ] En producción, usas HTTPS
- [ ] Las contraseñas de MySQL son diferentes entre root y usuario

### Buenas Prácticas

1. **Nunca subas `.env` al repositorio**
2. **Usa contraseñas diferentes** para cada servicio
3. **Genera contraseñas aleatorias** de al menos 32 caracteres
4. **Rota las contraseñas** periódicamente
5. **Usa HTTPS en producción**
6. **Limita el acceso** al panel web con autenticación

---

## 🐛 Solución de Problemas

### Error: "TokenInvalid"

- Verifica que `DISCORD_TOKEN` sea correcto
- Asegúrate de que no haya espacios antes o después del token
- Si el token fue comprometido, genera uno nuevo en Discord Developer Portal

### Error: "CLIENT_SECRET incorrecto"

- Verifica que `CLIENT_SECRET` sea correcto
- Asegúrate de que `REDIRECT_URI` coincida exactamente con Discord
- Verifica que OAuth2 esté habilitado en Discord Developer Portal

### Error: "No se puede conectar a MySQL"

- Verifica que MySQL esté corriendo
- Verifica las variables `DB_*` en `.env`
- En Docker, usa `DB_HOST=mysql`
- En local, usa `DB_HOST=localhost`
- Verifica que el usuario y contraseña sean correctos

### El panel web no carga

- Verifica que el puerto 3000 esté libre
- Revisa los logs: `npm start`
- Verifica que `CLIENT_ID` y `CLIENT_SECRET` estén configurados
- Asegúrate de que `REDIRECT_URI` coincida con Discord

---

## ✅ Checklist Final

Antes de desplegar, verifica:

- [ ] Token de Discord configurado y válido
- [ ] Client ID configurado
- [ ] Client Secret configurado
- [ ] Redirect URI configurado y coincidiendo con Discord
- [ ] Contraseñas de MySQL generadas y configuradas
- [ ] SESSION_SECRET generado
- [ ] Base de datos creada y accesible
- [ ] Panel web accesible en http://localhost:3000
- [ ] Bot conectado a Discord
- [ ] Comandos registrados (`npm run deploy`)

---

¡Tu bot debería estar completamente configurado! 🎉

Si tienes problemas, revisa la sección de solución de problemas o los logs del bot.

