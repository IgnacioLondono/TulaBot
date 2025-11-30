# 🚀 Guía Completa de Configuración - TulaBot con Docker y Portainer

Esta guía te llevará paso a paso para configurar y desplegar TulaBot en tu servidor usando Docker y Portainer.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
3. [Configuración de Discord](#configuración-de-discord)
4. [Despliegue en Portainer](#despliegue-en-portainer)
5. [Despliegue con Docker Compose](#despliegue-con-docker-compose)
6. [Migración de Datos](#migración-de-datos)
7. [Verificación y Pruebas](#verificación-y-pruebas)
8. [Mantenimiento y Backup](#mantenimiento-y-backup)
9. [Solución de Problemas](#solución-de-problemas)
10. [Configuración Avanzada](#configuración-avanzada)

---

## 📦 Requisitos Previos

### Software Necesario

- **Servidor con Docker instalado**
  - Docker Engine 20.10+
  - Docker Compose 2.0+
  
- **Portainer** (opcional pero recomendado)
  - Portainer CE o Portainer Business
  - Acceso web o SSH al servidor

- **Acceso a Discord Developer Portal**
  - Cuenta de Discord
  - Bot creado y configurado

### Recursos del Servidor Recomendados

- **CPU**: Mínimo 2 cores, recomendado 4 cores
- **RAM**: Mínimo 2GB, recomendado 4GB+
- **Disco**: Mínimo 10GB libres
- **Red**: Conexión estable a Internet

---

## ⚙️ Configuración de Variables de Entorno

### Crear Archivo `.env`

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# ============================================
# TulaBot - Variables de Entorno
# ============================================

# ============================================
# DISCORD BOT - OBLIGATORIO
# ============================================
# Token del bot (obtener en Discord Developer Portal > Bot > Token)
DISCORD_TOKEN=tu_token_del_bot_aqui

# Client ID (obtener en Discord Developer Portal > General Information > Application ID)
CLIENT_ID=tu_client_id_aqui

# Client Secret (obtener en Discord Developer Portal > OAuth2 > Client Secret)
CLIENT_SECRET=tu_client_secret_oauth2_aqui

# Prefijo por defecto para comandos (opcional, por defecto: !)
DEFAULT_PREFIX=!

# ============================================
# APIS EXTERNAS (OPCIONAL)
# ============================================
# API Key de Tenor para GIFs (opcional)
# Obtener en: https://developers.google.com/tenor/guides/quickstart
TENOR_API_KEY=

# ============================================
# GOOGLE GEMINI AI (OPCIONAL)
# ============================================
# API Key de Google Gemini (opcional)
# Obtener en: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=tu_api_key_gemini_aqui

# Modelo de Gemini a usar (por defecto: gemini-2.5-flash)
# Opciones: gemini-2.5-flash, gemini-1.5-flash, gemini-1.5-pro
GEMINI_MODEL=gemini-2.5-flash

# ============================================
# BASE DE DATOS MYSQL
# ============================================
# Contraseña del usuario root de MySQL (CAMBIAR POR UNA SEGURA)
MYSQL_ROOT_PASSWORD=cambiar_por_password_seguro_minimo_16_caracteres

# Nombre de la base de datos
MYSQL_DATABASE=tulabot

# Usuario de MySQL (no root)
MYSQL_USER=tulabot

# Contraseña del usuario de MySQL (CAMBIAR POR UNA SEGURA)
MYSQL_PASSWORD=cambiar_por_password_seguro_minimo_16_caracteres

# Puerto de MySQL (por defecto: 3306)
# Solo cambiar si necesitas otro puerto
MYSQL_PORT=3306

# ============================================
# CONFIGURACIÓN DE BASE DE DATOS (PARA EL BOT)
# ============================================
# IMPORTANTE: En Docker, usar 'mysql' como host (nombre del servicio)
# En desarrollo local, usar 'localhost'
DB_HOST=mysql

# Puerto de MySQL (debe coincidir con MYSQL_PORT)
DB_PORT=3306

# Usuario de MySQL (debe coincidir con MYSQL_USER)
DB_USER=tulabot

# Contraseña de MySQL (debe coincidir con MYSQL_PASSWORD)
DB_PASSWORD=cambiar_por_password_seguro_minimo_16_caracteres

# Nombre de la base de datos (debe coincidir con MYSQL_DATABASE)
DB_NAME=tulabot

# ============================================
# PANEL WEB
# ============================================
# URL de redirección después de OAuth2
# En desarrollo: http://localhost:3000/callback
# En producción: https://tu-dominio.com/callback o http://tu-ip:3000/callback
REDIRECT_URI=http://localhost:3000/callback

# Puerto del panel web (por defecto: 3000)
WEB_PORT=3000

# Habilitar panel web (true/false)
# En Docker, el panel web corre en un contenedor separado, así que esto debe ser false
WEB_ENABLED=false

# Secret para sesiones (CAMBIAR POR UN SECRET ALEATORIO Y SEGURO)
# Generar con: openssl rand -base64 32
SESSION_SECRET=generar_un_secret_aleatorio_y_seguro_minimo_32_caracteres

# ============================================
# ENTORNO
# ============================================
# Entorno de ejecución (production/development)
NODE_ENV=production
```

### 🔐 Generar Secrets Seguros

#### Generar SESSION_SECRET

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Online:**
- Usa un generador de strings aleatorios
- Mínimo 32 caracteres

#### Generar Contraseñas Seguras

Usa un generador de contraseñas seguro con:
- Mínimo 16 caracteres
- Letras mayúsculas y minúsculas
- Números
- Caracteres especiales

---

## 🎮 Configuración de Discord

### Paso 1: Crear Bot en Discord

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Haz clic en **"New Application"**
3. Dale un nombre (ej: "TulaBot")
4. Haz clic en **"Create"**

### Paso 2: Configurar el Bot

1. Ve a la sección **"Bot"** en el menú lateral
2. Haz clic en **"Add Bot"** y confirma
3. En **"Token"**, haz clic en **"Reset Token"** y copia el token
   - ⚠️ **GUARDA ESTE TOKEN DE FORMA SEGURA**
   - Este es tu `DISCORD_TOKEN`
4. En **"Privileged Gateway Intents"**, activa:
   - ✅ **PRESENCE INTENT**
   - ✅ **SERVER MEMBERS INTENT**
   - ✅ **MESSAGE CONTENT INTENT**

### Paso 3: Obtener Client ID y Secret

1. Ve a **"General Information"**
   - Copia el **"Application ID"** → Este es tu `CLIENT_ID`

2. Ve a **"OAuth2"** > **"General"**
   - Haz clic en **"Reset Secret"** y copia el Client Secret
   - ⚠️ **GUARDA ESTE SECRET DE FORMA SEGURA**
   - Este es tu `CLIENT_SECRET`

### Paso 4: Configurar OAuth2 Redirect URI

1. En **"OAuth2"** > **"General"**
2. En **"Redirects"**, agrega:
   - Desarrollo: `http://localhost:3000/callback`
   - Producción: `http://tu-ip:3000/callback` o `https://tu-dominio.com/callback`
3. Haz clic en **"Save Changes"**

### Paso 5: Invitar el Bot a tu Servidor

1. Ve a **"OAuth2"** > **"URL Generator"**
2. En **"SCOPES"**, selecciona:
   - ✅ `bot`
   - ✅ `applications.commands`
3. En **"BOT PERMISSIONS"**, selecciona:
   - ✅ Administrar Mensajes
   - ✅ Expulsar Miembros
   - ✅ Banear Miembros
   - ✅ Gestionar Canales
   - ✅ Gestionar Roles
   - ✅ Conectar (para música)
   - ✅ Hablar (para música)
   - ✅ Usar Comandos de Aplicación
   - ✅ Leer Historial de Mensajes
4. Copia la URL generada y ábrela en tu navegador
5. Selecciona el servidor y autoriza

---

## 🐳 Despliegue en Portainer

### Opción A: Usando Git Repository (Recomendado)

#### Paso 1: Preparar Repositorio

1. Sube tu código a un repositorio Git (GitHub, GitLab, etc.)
2. Asegúrate de que el archivo `.env` esté en `.gitignore`
3. Crea un archivo `.env.example` con valores de ejemplo

#### Paso 2: Crear Stack en Portainer

1. **Accede a Portainer**
   - Abre tu navegador: `http://tu-servidor:9000`
   - Inicia sesión

2. **Navegar a Stacks**
   - En el menú lateral, haz clic en **"Stacks"**
   - Haz clic en **"Add stack"**

3. **Configurar Stack**
   - **Name**: `tulabot`
   - **Build method**: Selecciona **"Repository"**
   - **Repository URL**: URL de tu repositorio Git
   - **Repository reference**: `main` o `master` (tu rama principal)
   - **Compose path**: `docker-compose.yml`
   - **Auto-update**: ✅ Activar (opcional, para actualizaciones automáticas)

4. **Variables de Entorno**
   - Haz clic en **"Environment variables"**
   - Agrega todas las variables del archivo `.env`
   - O mejor aún, si tienes acceso SSH, crea el archivo `.env` directamente en el servidor

5. **Deploy**
   - Haz clic en **"Deploy the stack"**
   - Espera a que los contenedores se creen e inicien (puede tardar 2-5 minutos)

### Opción B: Usando Web Editor

1. **Accede a Portainer** → **Stacks** → **Add stack**

2. **Configurar Stack**
   - **Name**: `tulabot`
   - **Build method**: Selecciona **"Web editor"**

3. **Pegar docker-compose.yml**
   - Abre el archivo `docker-compose.yml` de tu proyecto
   - Copia todo el contenido
   - Pégalo en el editor de Portainer

4. **Variables de Entorno**
   - Haz clic en **"Environment variables"**
   - Agrega todas las variables del archivo `.env`

5. **Deploy**
   - Haz clic en **"Deploy the stack"**

### Opción C: Subir Archivos Manualmente

1. **Subir Archivos al Servidor**
   ```bash
   # Usando SCP
   scp -r /ruta/local/tulabot usuario@servidor:/ruta/destino/
   
   # O usando SFTP, FileZilla, etc.
   ```

2. **Crear Stack en Portainer**
   - **Name**: `tulabot`
   - **Build method**: **"Repository"**
   - **Repository URL**: Deja vacío o usa ruta local
   - **Compose path**: `/ruta/destino/tulabot/docker-compose.yml`

3. **Variables de Entorno**
   - Agrega todas las variables

4. **Deploy**

---

## 🐋 Despliegue con Docker Compose

Si prefieres usar Docker Compose directamente desde la línea de comandos:

### Paso 1: Subir Archivos al Servidor

```bash
# Conectarse al servidor
ssh usuario@tu-servidor

# Navegar al directorio (o crear uno nuevo)
cd /opt/tulabot  # o la ruta que prefieras

# Si usas Git
git clone tu-repositorio .
```

### Paso 2: Crear Archivo .env

```bash
# Crear archivo .env
nano .env
# O usar vi, vim, etc.

# Pegar el contenido del .env (ver sección anterior)
# Guardar y salir (Ctrl+X, Y, Enter en nano)
```

### Paso 3: Construir y Levantar Servicios

```bash
# Construir imágenes y levantar contenedores
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f bot
docker-compose logs -f web
docker-compose logs -f mysql
```

### Paso 4: Verificar Estado

```bash
# Ver estado de contenedores
docker-compose ps

# Deberías ver 3 contenedores corriendo:
# - tulabot-mysql
# - tulabot-bot
# - tulabot-web
```

---

## 📊 Migración de Datos

Si tienes datos en `data/database.json` que quieres migrar a MySQL:

### Opción 1: Desde Contenedor

```bash
# Ejecutar script de migración
docker-compose exec bot node docker/migrate-json-to-mysql.js
```

### Opción 2: Desde Host (si tienes Node.js)

```bash
# Asegúrate de tener las variables de entorno configuradas
node docker/migrate-json-to-mysql.js
```

### Verificar Migración

```bash
# Conectar a MySQL
docker-compose exec mysql mysql -u tulabot -p tulabot

# Dentro de MySQL
SHOW TABLES;
SELECT COUNT(*) FROM key_value_store;
EXIT;
```

---

## ✅ Verificación y Pruebas

### 1. Verificar Contenedores

**En Portainer:**
- Ve a **"Containers"**
- Deberías ver 3 contenedores con estado **"Running"**:
  - `tulabot-mysql`
  - `tulabot-bot`
  - `tulabot-web`

**Desde SSH:**
```bash
docker-compose ps
```

### 2. Verificar Logs del Bot

**En Portainer:**
- **Containers** → `tulabot-bot` → **Logs**
- Busca: `✅ Bot conectado como TulaBot#XXXX`

**Desde SSH:**
```bash
docker-compose logs bot | grep "conectado"
```

### 3. Verificar Base de Datos

```bash
# Conectar a MySQL
docker-compose exec mysql mysql -u tulabot -p tulabot

# Verificar tablas
SHOW TABLES;

# Deberías ver:
# - key_value_store
# - warnings
# - guild_config
# - reminders
# - ai_conversations

# Verificar datos
SELECT COUNT(*) FROM key_value_store;
EXIT;
```

### 4. Verificar Panel Web

1. Abre tu navegador: `http://tu-servidor:3000`
2. Deberías ver la página de login
3. Haz clic en **"Iniciar Sesión con Discord"**
4. Autoriza la aplicación
5. Deberías ser redirigido al panel

### 5. Probar Comandos del Bot

En Discord:
- `/ping` - Debería responder con la latencia
- `/help` - Debería mostrar la lista de comandos
- `/stats` - Debería mostrar estadísticas del bot

---

## 🔧 Mantenimiento y Backup

### Backup de Base de Datos

#### Crear Backup Manual

```bash
# Crear backup con fecha
docker-compose exec mysql mysqldump -u tulabot -p tulabot > backup_$(date +%Y%m%d_%H%M%S).sql

# O sin fecha
docker-compose exec mysql mysqldump -u tulabot -p tulabot > backup.sql
```

#### Restaurar Backup

```bash
# Restaurar desde archivo
docker-compose exec -T mysql mysql -u tulabot -p tulabot < backup_20231130_120000.sql
```

#### Script de Backup Automático

Crea un script `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/tulabot"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker-compose exec -T mysql mysqldump -u tulabot -p$MYSQL_PASSWORD tulabot > $BACKUP_DIR/backup_$DATE.sql

# Eliminar backups antiguos (más de 7 días)
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup creado: $BACKUP_DIR/backup_$DATE.sql"
```

Hacer ejecutable y programar con cron:

```bash
chmod +x backup.sh

# Agregar a crontab (backup diario a las 2 AM)
crontab -e
# Agregar línea:
0 2 * * * /ruta/a/backup.sh
```

### Actualizar el Bot

#### Desde Portainer

1. **Stacks** → `tulabot` → **Editor**
2. Si usas Git, haz clic en **"Pull and redeploy"**
3. O modifica el `docker-compose.yml` y haz clic en **"Update the stack"**

#### Desde SSH

```bash
# Si usas Git
cd /ruta/a/tulabot
git pull

# Reconstruir y reiniciar
docker-compose up -d --build

# O solo reiniciar (si no hay cambios en código)
docker-compose restart
```

### Ver Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo el bot
docker-compose logs -f bot

# Últimas 100 líneas del bot
docker-compose logs --tail=100 bot

# Logs desde una fecha específica
docker-compose logs --since="2023-11-30T10:00:00" bot
```

### Reiniciar Servicios

```bash
# Reiniciar todos
docker-compose restart

# Reiniciar solo el bot
docker-compose restart bot

# Reiniciar solo el panel web
docker-compose restart web

# Reiniciar solo MySQL
docker-compose restart mysql
```

### Detener y Eliminar Todo

```bash
# Detener contenedores (mantiene volúmenes)
docker-compose down

# Detener y eliminar volúmenes (⚠️ PERDERÁS DATOS)
docker-compose down -v
```

---

## 🐛 Solución de Problemas

### El Bot No Se Conecta

**Síntomas:**
- El contenedor `tulabot-bot` está corriendo pero no se conecta a Discord
- Logs muestran errores de autenticación

**Soluciones:**
1. Verifica que `DISCORD_TOKEN` sea correcto
   ```bash
   docker-compose exec bot env | grep DISCORD_TOKEN
   ```

2. Verifica que el token no tenga espacios extra
   ```bash
   # En .env, asegúrate de que no haya comillas alrededor del token
   DISCORD_TOKEN=tu_token_sin_comillas
   ```

3. Verifica que el bot esté habilitado en Discord Developer Portal
   - Ve a Discord Developer Portal → Bot
   - Asegúrate de que el bot esté activo

4. Revisa los logs
   ```bash
   docker-compose logs bot
   ```

### Error de Conexión a MySQL

**Síntomas:**
- El bot no puede conectarse a MySQL
- Logs muestran: "Error conectando a MySQL"

**Soluciones:**
1. Verifica que MySQL esté corriendo
   ```bash
   docker-compose ps mysql
   ```

2. Verifica las variables de entorno
   ```bash
   docker-compose exec bot env | grep DB_
   ```

3. Verifica que `DB_HOST=mysql` (no `localhost`)
   - En Docker, los servicios se comunican por nombre

4. Espera a que MySQL termine de inicializarse
   - MySQL puede tardar 30-60 segundos en inicializarse
   - El bot espera automáticamente gracias al `depends_on`

5. Verifica la conexión manualmente
   ```bash
   docker-compose exec mysql mysql -u tulabot -p tulabot
   ```

### Error "Table doesn't exist"

**Síntomas:**
- El bot funciona pero da errores al usar la base de datos
- Logs muestran errores de tablas no encontradas

**Soluciones:**
1. Ejecuta el script de inicialización manualmente
   ```bash
   docker-compose exec mysql mysql -u root -p tulabot < docker/mysql/init.sql
   ```

2. O reinicia MySQL para que ejecute el script automáticamente
   ```bash
   docker-compose down mysql
   docker-compose up -d mysql
   # Espera 30-60 segundos
   docker-compose up -d bot
   ```

### El Panel Web No Carga

**Síntomas:**
- No puedes acceder a `http://tu-servidor:3000`
- Error de conexión

**Soluciones:**
1. Verifica que el contenedor esté corriendo
   ```bash
   docker-compose ps web
   ```

2. Verifica que el puerto esté abierto
   ```bash
   # Ver puertos expuestos
   docker-compose ps
   # Deberías ver: 0.0.0.0:3000->3000/tcp
   ```

3. Verifica el firewall
   ```bash
   # Ubuntu/Debian
   sudo ufw allow 3000/tcp
   
   # CentOS/RHEL
   sudo firewall-cmd --add-port=3000/tcp --permanent
   sudo firewall-cmd --reload
   ```

4. Verifica las variables de entorno
   ```bash
   docker-compose exec web env | grep -E "CLIENT_ID|CLIENT_SECRET|REDIRECT_URI"
   ```

5. Revisa los logs
   ```bash
   docker-compose logs web
   ```

### Error de OAuth2

**Síntomas:**
- El panel web carga pero no puedes iniciar sesión
- Error "Invalid redirect URI"

**Soluciones:**
1. Verifica que `REDIRECT_URI` coincida exactamente con Discord
   - En `.env`: `REDIRECT_URI=http://tu-ip:3000/callback`
   - En Discord Developer Portal → OAuth2 → Redirects: `http://tu-ip:3000/callback`
   - Deben ser **exactamente iguales** (incluyendo http/https, puerto, etc.)

2. Verifica `CLIENT_SECRET`
   ```bash
   docker-compose exec web env | grep CLIENT_SECRET
   ```

3. Verifica que `SESSION_SECRET` esté configurado
   ```bash
   docker-compose exec web env | grep SESSION_SECRET
   ```

### MySQL No Inicia

**Síntomas:**
- El contenedor `tulabot-mysql` se reinicia constantemente
- Logs muestran errores de MySQL

**Soluciones:**
1. Verifica los logs
   ```bash
   docker-compose logs mysql
   ```

2. Verifica que las contraseñas sean válidas
   - MySQL requiere contraseñas seguras
   - Mínimo 8 caracteres recomendado

3. Verifica permisos de volúmenes
   ```bash
   # Verificar que el volumen existe
   docker volume ls | grep mysql
   ```

4. Elimina y recrea el volumen (⚠️ PERDERÁS DATOS)
   ```bash
   docker-compose down -v
   docker-compose up -d mysql
   ```

### Contenedor Se Reinicia Constantemente

**Síntomas:**
- El contenedor se reinicia cada pocos segundos
- Estado muestra "Restarting"

**Soluciones:**
1. Revisa los logs para ver el error
   ```bash
   docker-compose logs --tail=50 nombre_contenedor
   ```

2. Verifica las variables de entorno
   ```bash
   docker-compose config
   ```

3. Verifica que todas las variables requeridas estén configuradas

### Puerto Ya en Uso

**Síntomas:**
- Error al iniciar: "port is already allocated"

**Soluciones:**
1. Encuentra qué proceso usa el puerto
   ```bash
   # Linux
   sudo netstat -tulpn | grep :3000
   sudo lsof -i :3000
   
   # O con docker
   docker ps | grep 3000
   ```

2. Cambia el puerto en `.env`
   ```env
   WEB_PORT=3001
   ```

3. O detén el proceso que usa el puerto
   ```bash
   # Si es otro contenedor Docker
   docker stop nombre_contenedor
   ```

---

## 🚀 Configuración Avanzada

### Usar docker-compose.prod.yml

Para producción, puedes usar configuraciones adicionales:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Esto aplica:
- Límites de recursos
- Health checks adicionales
- Configuraciones optimizadas

### Configurar Reverse Proxy (Nginx)

Para usar HTTPS y un dominio personalizado:

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Actualizar .env:**
```env
REDIRECT_URI=https://tu-dominio.com/callback
```

### Configurar SSL con Let's Encrypt

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com
```

### Monitoreo con Portainer

Portainer incluye monitoreo básico:
- **Containers** → Ver uso de CPU/RAM
- **Stacks** → Ver estado general
- **Logs** → Ver logs en tiempo real

### Configurar Alertas

Puedes configurar alertas en Portainer para:
- Contenedores que se detienen
- Uso alto de recursos
- Errores en logs

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Portainer Documentation](https://docs.portainer.io/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Discord.js Documentation](https://discord.js.org/)

### Comandos Útiles

```bash
# Ver uso de recursos
docker stats

# Limpiar recursos no usados
docker system prune -a

# Ver información de un contenedor
docker inspect tulabot-bot

# Ejecutar comando en contenedor
docker-compose exec bot node src/deploy-commands.js

# Ver variables de entorno de un contenedor
docker-compose exec bot env

# Reiniciar solo un servicio
docker-compose restart bot

# Ver logs en tiempo real
docker-compose logs -f bot

# Detener todo
docker-compose down

# Levantar todo
docker-compose up -d
```

---

## ✅ Checklist de Despliegue

Antes de considerar el despliegue completo, verifica:

### Pre-Despliegue
- [ ] Archivo `.env` creado con todas las variables
- [ ] Contraseñas seguras generadas
- [ ] Bot creado en Discord Developer Portal
- [ ] Token, Client ID y Client Secret obtenidos
- [ ] OAuth2 Redirect URI configurado en Discord
- [ ] Bot invitado al servidor de Discord

### Despliegue
- [ ] Archivos subidos al servidor
- [ ] Stack creado en Portainer (o docker-compose configurado)
- [ ] Variables de entorno configuradas
- [ ] Contenedores iniciados correctamente
- [ ] MySQL inicializado (verificar tablas)

### Post-Despliegue
- [ ] Bot conectado a Discord (verificar logs)
- [ ] Panel web accesible
- [ ] Login con Discord funciona
- [ ] Comandos del bot funcionan (`/ping`, `/help`)
- [ ] Base de datos funciona (probar comando que use DB)
- [ ] Migración de datos completada (si aplica)

### Seguridad
- [ ] Contraseñas cambiadas de valores por defecto
- [ ] Firewall configurado (solo puertos necesarios)
- [ ] SSL/HTTPS configurado (si es producción)
- [ ] Backups configurados
- [ ] `.env` no está en el repositorio Git

---

## 🎉 ¡Listo!

Tu bot TulaBot debería estar funcionando correctamente en tu servidor con Docker y Portainer.

Si tienes problemas, revisa la sección de [Solución de Problemas](#solución-de-problemas) o consulta los logs de los contenedores.

**¡Disfruta de tu bot!** 🚀

---

## 📞 Soporte

Si necesitas ayuda adicional:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica la configuración: `docker-compose config`
3. Consulta la documentación oficial
4. Revisa los issues en el repositorio (si es público)

---

**Última actualización:** Noviembre 2024
**Versión:** 1.0.0

