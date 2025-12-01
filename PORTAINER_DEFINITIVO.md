# 🐳 Guía Definitiva de Despliegue en Portainer - TulaBot

Esta es la guía completa y definitiva para desplegar TulaBot en Portainer sin errores.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Preparación del Proyecto](#preparación-del-proyecto)
3. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
4. [Configuración de Discord](#configuración-de-discord)
5. [Despliegue en Portainer](#despliegue-en-portainer)
6. [Verificación del Despliegue](#verificación-del-despliegue)
7. [Configuración Post-Despliegue](#configuración-post-despliegue)
8. [Mantenimiento](#mantenimiento)
9. [Solución de Problemas](#solución-de-problemas)
10. [Checklist Final](#checklist-final)

---

## 📦 Requisitos Previos

### Software Necesario

- ✅ **Portainer** instalado y funcionando
  - Portainer CE 2.0+ o Portainer Business
  - Acceso web a la interfaz de Portainer
  
- ✅ **Docker** y **Docker Compose** en el servidor
  - Docker Engine 20.10+
  - Docker Compose 2.0+

- ✅ **Acceso al servidor**
  - SSH o acceso web a Portainer
  - Permisos para crear stacks y contenedores

### Recursos del Servidor Recomendados

- **CPU**: Mínimo 2 cores, recomendado 4 cores
- **RAM**: Mínimo 2GB, recomendado 4GB+
- **Disco**: Mínimo 10GB libres (para MySQL y logs)
- **Red**: Conexión estable a Internet

### Cuentas y Tokens Necesarios

- ✅ Cuenta de Discord
- ✅ Bot creado en Discord Developer Portal
- ✅ Token del bot de Discord
- ✅ Client ID y Client Secret de OAuth2
- ✅ (Opcional) API Key de Google Gemini
- ✅ (Opcional) API Key de Tenor

---

## 🚀 Preparación del Proyecto

### Paso 1: Subir Archivos al Servidor

Tienes varias opciones para subir el proyecto:

#### Opción A: Usando Git (Recomendado)

```bash
# En el servidor
cd /ruta/donde/quieres/el/proyecto
git clone https://tu-repositorio/tulabot.git
cd tulabot
```

#### Opción B: Usando SCP/SFTP

```bash
# Desde tu máquina local
scp -r TulaBot-1 usuario@servidor:/ruta/destino/
```

#### Opción C: Usando Portainer File Manager

1. En Portainer, ve a **Volumes**
2. Crea un volumen o usa uno existente
3. Usa el **File Manager** para subir los archivos

### Paso 2: Verificar Estructura de Archivos

Asegúrate de que estos archivos estén presentes:

```
TulaBot-1/
├── docker-compose.yml          ✅ OBLIGATORIO
├── docker-compose.prod.yml     ✅ OBLIGATORIO (para producción)
├── Dockerfile                   ✅ OBLIGATORIO
├── web/
│   └── Dockerfile               ✅ OBLIGATORIO
├── docker/
│   └── mysql/
│       └── init.sql             ✅ OBLIGATORIO
├── src/                         ✅ OBLIGATORIO
├── web/                         ✅ OBLIGATORIO
└── package.json                 ✅ OBLIGATORIO
```

---

## ⚙️ Configuración de Variables de Entorno

### Paso 1: Crear Archivo .env

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# ============================================
# TulaBot - Variables de Entorno para Portainer
# ============================================

# ============================================
# DISCORD BOT - OBLIGATORIO
# ============================================
# Token del bot de Discord
# Obténlo en: Discord Developer Portal > Bot > Token > Reset Token
DISCORD_TOKEN=tu_token_del_bot_aqui

# Client ID de la aplicación Discord
# Obténlo en: Discord Developer Portal > General Information > Application ID
CLIENT_ID=tu_client_id_aqui

# Client Secret de OAuth2 (para el panel web)
# Obténlo en: Discord Developer Portal > OAuth2 > Client Secret > Reset Secret
CLIENT_SECRET=tu_client_secret_aqui

# Prefijo por defecto para comandos de texto
DEFAULT_PREFIX=!

# ============================================
# GOOGLE GEMINI AI - OPCIONAL
# ============================================
# API Key de Google Gemini
# Obténlo en: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=tu_api_key_gemini_aqui

# Modelo de Gemini a usar
GEMINI_MODEL=gemini-2.5-flash

# ============================================
# TENOR API - OPCIONAL
# ============================================
# API Key de Tenor para comandos de GIF
# Obténlo en: https://developers.google.com/tenor/guides/quickstart
TENOR_API_KEY=tu_api_key_tenor_aqui

# ============================================
# MYSQL - Configuración de Base de Datos
# ============================================
# Contraseña del usuario root de MySQL
# IMPORTANTE: Genera una contraseña segura
# En Linux: openssl rand -base64 32
MYSQL_ROOT_PASSWORD=tu_password_root_seguro_aqui

# Nombre de la base de datos
MYSQL_DATABASE=tulabot

# Usuario de MySQL (no root)
MYSQL_USER=tulabot

# Contraseña del usuario de MySQL
# IMPORTANTE: Genera una contraseña segura diferente a la root
MYSQL_PASSWORD=tu_password_mysql_seguro_aqui

# Puerto de MySQL (por defecto 3306)
MYSQL_PORT=3306

# ============================================
# BASE DE DATOS - Configuración para el Bot
# ============================================
# Host de la base de datos
# EN DOCKER/PORTAINER: Debe ser "mysql" (nombre del servicio)
DB_HOST=mysql

# Puerto de la base de datos
DB_PORT=3306

# Usuario de la base de datos (debe coincidir con MYSQL_USER)
DB_USER=tulabot

# Contraseña de la base de datos (debe coincidir con MYSQL_PASSWORD)
DB_PASSWORD=tu_password_mysql_seguro_aqui

# Nombre de la base de datos (debe coincidir con MYSQL_DATABASE)
DB_NAME=tulabot

# ============================================
# PANEL WEB - Configuración del Panel Web
# ============================================
# URI de redirección para OAuth2
# IMPORTANTE: Debe coincidir EXACTAMENTE con la configurada en Discord
# Si usas dominio: https://tu-dominio.com/callback
# Si usas IP: http://tu-ip:3000/callback
REDIRECT_URI=http://tu-dominio-o-ip:3000/callback

# Puerto del panel web
WEB_PORT=3000

# Secret para las sesiones
# IMPORTANTE: Genera un secret aleatorio seguro
# En Linux: openssl rand -base64 32
SESSION_SECRET=tu-secret-super-seguro-para-sesiones-aqui

# ============================================
# CONFIGURACIÓN AVANZADA - No cambiar
# ============================================
# Entorno de ejecución
NODE_ENV=production

# Habilitar panel web
WEB_ENABLED=false

# Puerto de la API interna del bot
BOT_API_PORT=3001

# Host de la API interna del bot
BOT_API_HOST=0.0.0.0

# URL del bot API (para el panel web)
BOT_URL=http://bot:3001
```

### Paso 2: Generar Contraseñas Seguras

**En Linux/Mac:**
```bash
# Generar contraseña para MySQL Root
openssl rand -base64 32

# Generar contraseña para MySQL User
openssl rand -base64 32

# Generar SESSION_SECRET
openssl rand -base64 32
```

**En Windows (PowerShell):**
```powershell
# Generar contraseña
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Paso 3: Completar Variables Obligatorias

Asegúrate de completar estas variables en el `.env`:

- ✅ `DISCORD_TOKEN`
- ✅ `CLIENT_ID`
- ✅ `CLIENT_SECRET`
- ✅ `MYSQL_ROOT_PASSWORD`
- ✅ `MYSQL_PASSWORD`
- ✅ `DB_PASSWORD` (debe ser igual a `MYSQL_PASSWORD`)
- ✅ `SESSION_SECRET`
- ✅ `REDIRECT_URI`

---

## 🔐 Configuración de Discord

### Paso 1: Obtener Token del Bot

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecciona tu aplicación
3. Ve a **Bot** en el menú lateral
4. En la sección **Token**, haz clic en **Reset Token**
5. Copia el token y guárdalo de forma segura
6. Pega el token en `DISCORD_TOKEN` en tu archivo `.env`

### Paso 2: Obtener Client ID

1. En Discord Developer Portal, ve a **General Information**
2. Copia el **Application ID**
3. Pega el ID en `CLIENT_ID` en tu archivo `.env`

### Paso 3: Obtener Client Secret

1. En Discord Developer Portal, ve a **OAuth2**
2. En la sección **Client Secret**, haz clic en **Reset Secret**
3. ⚠️ **IMPORTANTE**: Solo puedes verlo una vez, cópialo inmediatamente
4. Pega el secret en `CLIENT_SECRET` en tu archivo `.env`

### Paso 4: Configurar OAuth2 Redirect URI

1. En Discord Developer Portal, ve a **OAuth2** > **General**
2. Desplázate a la sección **Redirects**
3. Haz clic en **Add Redirect**
4. Agrega la URL según tu configuración:

   **Si usas un dominio:**
   ```
   https://tu-dominio.com/callback
   ```

   **Si usas una IP:**
   ```
   http://tu-ip:3000/callback
   ```

5. ⚠️ **IMPORTANTE**: Esta URL debe coincidir **EXACTAMENTE** con `REDIRECT_URI` en tu `.env`
6. Haz clic en **Save Changes**

### Paso 5: Configurar Permisos del Bot

1. Ve a **Bot** en Discord Developer Portal
2. En **Privileged Gateway Intents**, activa:
   - ✅ **PRESENCE INTENT**
   - ✅ **SERVER MEMBERS INTENT**
   - ✅ **MESSAGE CONTENT INTENT**
3. Haz clic en **Save Changes**

---

## 🐳 Despliegue en Portainer

### Paso 1: Acceder a Portainer

1. Abre tu navegador
2. Ve a la URL de Portainer (ej: `http://tu-servidor:9000`)
3. Inicia sesión con tus credenciales

### Paso 2: Crear un Nuevo Stack

1. En el menú lateral, haz clic en **Stacks**
2. Haz clic en **Add stack**
3. Nombre del stack: `tulabot` (o el nombre que prefieras)

### Paso 3: Configurar el Stack

#### Opción A: Usando Web Editor (Recomendado para primera vez)

1. Selecciona **Web editor**
2. Abre el archivo `docker-compose.yml` en tu servidor
3. Copia **todo el contenido** del archivo
4. Pega el contenido en el editor de Portainer
5. Haz clic en **Editor** para ver el código YAML

#### Opción B: Usando Repository

1. Selecciona **Repository**
2. **Repository URL**: URL de tu repositorio Git
3. **Compose path**: `docker-compose.yml`
4. **Reference**: `main` o `master` (según tu rama)
5. **Auto-update**: Activa si quieres actualizaciones automáticas

### Paso 4: Configurar Variables de Entorno

**Método 1: Cargar desde archivo .env (Recomendado)**

1. En la sección **Environment variables**, busca **Load variables from .env file**
2. Sube tu archivo `.env` o pega su contenido
3. Portainer cargará automáticamente todas las variables

**Método 2: Agregar manualmente**

1. En la sección **Environment variables**, haz clic en **Add environment variable**
2. Agrega cada variable una por una:

```
DISCORD_TOKEN=tu_token
CLIENT_ID=tu_client_id
CLIENT_SECRET=tu_client_secret
MYSQL_ROOT_PASSWORD=tu_password
MYSQL_PASSWORD=tu_password
DB_PASSWORD=tu_password
SESSION_SECRET=tu_secret
REDIRECT_URI=http://tu-dominio:3000/callback
... (y todas las demás)
```

### Paso 5: Configurar Opciones Adicionales

1. **Always pull the image**: Activa si quieres actualizar imágenes automáticamente
2. **Enable stack webhook**: Activa si usas auto-update desde Git
3. **Enable access control**: Activa si quieres controlar quién puede modificar el stack

### Paso 6: Desplegar el Stack

1. Revisa toda la configuración
2. Haz clic en **Deploy the stack**
3. Espera a que Portainer cree los contenedores
4. Esto puede tardar varios minutos la primera vez (descarga de imágenes, construcción, etc.)

### Paso 7: Verificar el Despliegue

1. Ve a **Containers** en el menú lateral
2. Deberías ver 3 contenedores:
   - `tulabot-mysql` (Base de datos)
   - `tulabot-bot` (Bot de Discord)
   - `tulabot-web` (Panel web)
3. Todos deberían estar en estado **Running**

---

## ✅ Verificación del Despliegue

### Verificar Contenedores

1. En Portainer, ve a **Containers**
2. Verifica que los 3 contenedores estén en estado **Running**
3. Si algún contenedor está en estado **Restarting** o **Stopped**, revisa los logs

### Verificar Logs del Bot

1. Haz clic en el contenedor `tulabot-bot`
2. Ve a la pestaña **Logs**
3. Deberías ver mensajes como:
   ```
   ✅ Bot conectado como TulaBot#XXXX
   ✅ Base de datos MySQL inicializada
   ✅ Sistema de música inicializado
   🚀 API del bot iniciada en http://0.0.0.0:3001
   ```

### Verificar Logs de MySQL

1. Haz clic en el contenedor `tulabot-mysql`
2. Ve a la pestaña **Logs**
3. Deberías ver:
   ```
   MySQL init process done. Ready for start up.
   ```

### Verificar Logs del Panel Web

1. Haz clic en el contenedor `tulabot-web`
2. Ve a la pestaña **Logs**
3. Deberías ver:
   ```
   🌐 Panel web iniciado en http://0.0.0.0:3000
   ```

### Verificar Health Checks

1. En **Containers**, verifica la columna **Health**
2. Después de unos minutos, todos los contenedores deberían mostrar **Healthy**
3. Si algún contenedor muestra **Unhealthy**, revisa los logs

### Verificar Base de Datos

1. Haz clic en el contenedor `tulabot-mysql`
2. Ve a la pestaña **Console**
3. Ejecuta:
   ```bash
   mysql -u tulabot -p tulabot
   # Ingresa la contraseña cuando se solicite
   ```
4. Ejecuta:
   ```sql
   SHOW TABLES;
   ```
5. Deberías ver las tablas:
   - `key_value_store`
   - `warnings`
   - `guild_config`
   - `reminders`
   - `ai_conversations`

### Acceder al Panel Web

1. Abre tu navegador
2. Ve a la URL configurada:
   - Si usas dominio: `https://tu-dominio.com`
   - Si usas IP: `http://tu-ip:3000`
3. Deberías ver la página de login del panel web
4. Haz clic en **Iniciar sesión con Discord**
5. Autoriza la aplicación
6. Deberías ser redirigido al panel de control

---

## 🔧 Configuración Post-Despliegue

### Registrar Comandos en Discord

Los comandos slash deben registrarse manualmente la primera vez:

1. En Portainer, ve a **Containers**
2. Haz clic en `tulabot-bot`
3. Ve a la pestaña **Console**
4. Ejecuta:
   ```bash
   npm run deploy
   ```
5. Espera a que se registren todos los comandos (puede tardar unos minutos)

### Configurar Dominio y HTTPS (Opcional pero Recomendado)

Si quieres usar un dominio con HTTPS:

1. **Configura un reverse proxy** (Nginx, Traefik, etc.)
2. **Obtén un certificado SSL** (Let's Encrypt recomendado)
3. **Actualiza REDIRECT_URI** en:
   - Tu archivo `.env`
   - Discord Developer Portal > OAuth2 > Redirects
4. **Actualiza el stack** en Portainer con las nuevas variables

### Configurar Firewall

Asegúrate de que estos puertos estén abiertos:

- **3000**: Panel web (solo si quieres acceso externo)
- **3306**: MySQL (solo si necesitas acceso externo, no recomendado)

**Recomendación**: Usa un reverse proxy y solo expón el puerto 80/443.

---

## 🔄 Mantenimiento

### Ver Logs

**En Portainer:**
1. Ve a **Containers**
2. Selecciona el contenedor
3. Haz clic en **Logs**
4. Puedes filtrar por nivel (info, error, warn)

**Desde línea de comandos:**
```bash
# Logs del bot
docker logs tulabot-bot -f

# Logs del panel web
docker logs tulabot-web -f

# Logs de MySQL
docker logs tulabot-mysql -f
```

### Reiniciar Servicios

**En Portainer:**
1. Ve a **Containers**
2. Selecciona el contenedor
3. Haz clic en **Restart**

**Desde línea de comandos:**
```bash
docker restart tulabot-bot
docker restart tulabot-web
docker restart tulabot-mysql
```

### Actualizar el Bot

**Opción 1: Desde Portainer (Recomendado)**
1. Ve a **Stacks**
2. Selecciona `tulabot`
3. Haz clic en **Editor**
4. Si usas Repository, haz clic en **Pull and redeploy**
5. Si usas Web editor, actualiza el código y haz clic en **Update the stack**

**Opción 2: Desde línea de comandos**
```bash
cd /ruta/al/proyecto
git pull
docker-compose up -d --build
```

### Backup de Base de Datos

**Crear backup:**
```bash
docker exec tulabot-mysql mysqldump -u tulabot -p tulabot > backup_$(date +%Y%m%d).sql
```

**Restaurar backup:**
```bash
docker exec -i tulabot-mysql mysql -u tulabot -p tulabot < backup_20231130.sql
```

### Limpiar Logs

Los logs se almacenan en el volumen `./logs`. Para limpiarlos:

```bash
# Limpiar logs antiguos (más de 7 días)
find ./logs -name "*.log" -mtime +7 -delete
```

---

## 🐛 Solución de Problemas

### El bot no se conecta

**Síntomas:**
- El contenedor `tulabot-bot` está en estado **Restarting**
- Los logs muestran: `Error [TokenInvalid]: An invalid token was provided`

**Solución:**
1. Verifica que `DISCORD_TOKEN` sea correcto en el `.env`
2. Asegúrate de que no haya espacios antes o después del token
3. Si el token fue comprometido, genera uno nuevo en Discord Developer Portal
4. Actualiza el stack en Portainer con el nuevo token

### Error de conexión a MySQL

**Síntomas:**
- Los logs muestran: `Error conectando a MySQL`
- El bot no puede acceder a la base de datos

**Solución:**
1. Verifica que MySQL esté corriendo: `docker ps | grep mysql`
2. Verifica las variables `DB_*` en el `.env`:
   - `DB_HOST=mysql` (no `localhost`)
   - `DB_USER` debe coincidir con `MYSQL_USER`
   - `DB_PASSWORD` debe coincidir con `MYSQL_PASSWORD`
3. Verifica que MySQL esté saludable: revisa los health checks
4. Revisa los logs de MySQL: `docker logs tulabot-mysql`

### El panel web no carga

**Síntomas:**
- No puedes acceder a `http://tu-dominio:3000`
- Los logs muestran errores de OAuth2

**Solución:**
1. Verifica que el puerto 3000 esté abierto y accesible
2. Verifica que `CLIENT_ID` y `CLIENT_SECRET` estén configurados
3. Verifica que `REDIRECT_URI` coincida **EXACTAMENTE** con Discord:
   - Sin trailing slash
   - Mismo protocolo (http/https)
   - Mismo puerto
4. Revisa los logs del panel web: `docker logs tulabot-web`

### Error "Table doesn't exist"

**Síntomas:**
- El bot funciona pero no puede guardar datos
- Los logs muestran errores de SQL

**Solución:**
1. Verifica que el script de inicialización se ejecutó:
   ```bash
   docker logs tulabot-mysql | grep "init.sql"
   ```
2. Si no se ejecutó, ejecuta manualmente:
   ```bash
   docker exec -i tulabot-mysql mysql -u tulabot -p tulabot < docker/mysql/init.sql
   ```

### Health Check Falla

**Síntomas:**
- Los contenedores muestran estado **Unhealthy**

**Solución:**
1. Espera unos minutos (los health checks tienen un `start_period` de 40s)
2. Verifica que los servicios estén respondiendo:
   ```bash
   # Verificar bot API
   curl http://localhost:3001/health
   
   # Verificar panel web
   curl http://localhost:3000/health
   ```
3. Revisa los logs del contenedor
4. Verifica que los puertos estén correctamente mapeados

### Contenedor se reinicia constantemente

**Síntomas:**
- El contenedor está en estado **Restarting** continuamente

**Solución:**
1. Revisa los logs para ver el error específico
2. Verifica que todas las variables de entorno estén configuradas
3. Verifica que las dependencias estén correctas (MySQL debe estar saludable antes que el bot)
4. Verifica que no haya conflictos de puertos

### Problemas de Permisos

**Síntomas:**
- Errores al escribir en volúmenes
- Errores al acceder a archivos

**Solución:**
1. Verifica los permisos de los directorios:
   ```bash
   chmod -R 755 ./logs
   chmod -R 755 ./data
   ```
2. Verifica que el usuario de Docker tenga permisos

---

## ✅ Checklist Final

Antes de considerar el despliegue completo, verifica:

### Configuración Inicial
- [ ] Archivos del proyecto subidos al servidor
- [ ] Archivo `.env` creado y configurado
- [ ] Todas las variables obligatorias completadas
- [ ] Contraseñas generadas y seguras

### Discord
- [ ] Bot creado en Discord Developer Portal
- [ ] Token del bot obtenido y configurado
- [ ] Client ID obtenido y configurado
- [ ] Client Secret obtenido y configurado
- [ ] OAuth2 Redirect URI configurado en Discord
- [ ] Redirect URI coincide exactamente con `.env`
- [ ] Permisos del bot configurados (Intents)

### Portainer
- [ ] Stack creado en Portainer
- [ ] `docker-compose.yml` cargado correctamente
- [ ] Variables de entorno configuradas
- [ ] Stack desplegado exitosamente

### Verificación
- [ ] 3 contenedores creados y corriendo
- [ ] Bot conectado a Discord (verificar logs)
- [ ] Base de datos MySQL funcionando
- [ ] Tablas creadas correctamente
- [ ] Panel web accesible
- [ ] Health checks pasando
- [ ] OAuth2 funcionando (login con Discord)
- [ ] Comandos registrados en Discord

### Seguridad
- [ ] Contraseñas seguras y únicas
- [ ] `.env` no está en el repositorio
- [ ] Firewall configurado correctamente
- [ ] HTTPS configurado (si es producción)
- [ ] Backups configurados

---

## 📞 Soporte Adicional

Si tienes problemas que no se resuelven con esta guía:

1. **Revisa los logs** de todos los contenedores
2. **Verifica la documentación** en el repositorio
3. **Consulta los issues** en GitHub (si aplica)
4. **Revisa la configuración** paso a paso

---

## 🎉 ¡Despliegue Completado!

Si has completado todos los pasos y el checklist, tu bot TulaBot debería estar funcionando correctamente en Portainer.

**Próximos pasos:**
- Configura un dominio y HTTPS
- Configura backups automáticos
- Monitorea los logs regularmente
- Actualiza el bot periódicamente

---

**Última actualización**: 2024
**Versión**: 1.0.0

