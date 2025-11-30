# 🐳 Guía de Despliegue en Portainer - TulaBot

Esta guía te ayudará a desplegar TulaBot en Portainer usando Docker Compose con microservicios.

## 📋 Requisitos Previos

- Servidor con Docker y Portainer instalados
- Acceso SSH al servidor o acceso web a Portainer
- Token de Discord Bot configurado
- Variables de entorno preparadas

## 🚀 Paso 1: Preparar el Proyecto

### 1.1 Subir archivos al servidor

Sube todos los archivos del proyecto a tu servidor. Puedes usar:
- Git: `git clone` o `git pull`
- SCP/SFTP
- Portainer File Manager (si está habilitado)

### 1.2 Crear archivo `.env`

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Discord Bot
DISCORD_TOKEN=tu_token_del_bot
CLIENT_ID=tu_client_id
CLIENT_SECRET=tu_client_secret_oauth2
DEFAULT_PREFIX=!
TENOR_API_KEY=opcional_para_gifs

# Google Gemini AI
GEMINI_API_KEY=tu_api_key_gemini
GEMINI_MODEL=gemini-2.5-flash

# Base de Datos MySQL
MYSQL_ROOT_PASSWORD=tu_password_root_seguro
MYSQL_DATABASE=tulabot
MYSQL_USER=tulabot
MYSQL_PASSWORD=tu_password_mysql_seguro
MYSQL_PORT=3306

# Panel Web
REDIRECT_URI=http://tu-dominio.com:3000/callback
WEB_PORT=3000
SESSION_SECRET=tu-secret-super-seguro-para-sesiones

# Configuración de Base de Datos (para el bot)
DB_HOST=mysql
DB_PORT=3306
DB_USER=tulabot
DB_PASSWORD=tu_password_mysql_seguro
DB_NAME=tulabot
```

**⚠️ IMPORTANTE:** 
- Cambia todas las contraseñas por valores seguros
- Si usas un dominio, actualiza `REDIRECT_URI`
- El `DB_HOST=mysql` debe ser `mysql` (nombre del servicio en docker-compose)

## 🐳 Paso 2: Desplegar en Portainer

### Opción A: Usando Docker Compose Stack (Recomendado)

1. **Accede a Portainer**
   - Abre tu navegador y ve a `http://tu-servidor:9000` (o tu puerto de Portainer)
   - Inicia sesión

2. **Crear un Stack**
   - En el menú lateral, ve a **Stacks**
   - Haz clic en **Add stack**
   - Nombre: `tulabot`

3. **Configurar el Stack**
   - **Build method**: Selecciona **Repository** o **Web editor**
   
   **Si usas Repository:**
   - Repository URL: URL de tu repositorio Git
   - Compose path: `docker-compose.yml`
   - Auto-update: Activa si quieres actualizaciones automáticas
   
   **Si usas Web editor:**
   - Copia el contenido de `docker-compose.yml` en el editor
   - Asegúrate de que las variables de entorno estén configuradas

4. **Variables de Entorno**
   - En la sección **Environment variables**, agrega todas las variables del `.env`
   - O mejor aún, usa el archivo `.env` directamente si Portainer lo soporta

5. **Deploy**
   - Haz clic en **Deploy the stack**
   - Espera a que los contenedores se creen e inicien

### Opción B: Usando Docker Compose desde SSH

Si prefieres usar la línea de comandos:

```bash
# Navegar al directorio del proyecto
cd /ruta/a/tulabot

# Construir y levantar los servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps
```

## 📊 Paso 3: Verificar el Despliegue

### 3.1 Verificar contenedores

En Portainer:
- Ve a **Containers**
- Deberías ver 3 contenedores:
  - `tulabot-mysql` (Base de datos)
  - `tulabot-bot` (Bot de Discord)
  - `tulabot-web` (Panel web)

### 3.2 Verificar logs

1. En Portainer, ve a **Containers**
2. Haz clic en `tulabot-bot`
3. Ve a la pestaña **Logs**
4. Deberías ver: `✅ Bot conectado como TulaBot#XXXX`

### 3.3 Verificar base de datos

1. En Portainer, ve a **Containers**
2. Haz clic en `tulabot-mysql`
3. Ve a **Console**
4. Ejecuta:
```bash
mysql -u tulabot -p tulabot
# Ingresa la contraseña
SHOW TABLES;
```

### 3.4 Acceder al panel web

Abre tu navegador en:
```
http://tu-servidor:3000
```

O si configuraste un dominio:
```
https://tu-dominio.com
```

## 🔄 Paso 4: Migrar Datos (Si aplica)

Si tienes datos en `data/database.json` que quieres migrar a MySQL:

```bash
# Ejecutar script de migración
docker-compose exec bot node docker/migrate-json-to-mysql.js
```

## 🛠️ Paso 5: Configuración Avanzada

### 5.1 Volúmenes Persistentes

Los volúmenes ya están configurados en `docker-compose.yml`:
- `mysql_data`: Datos de MySQL (persistente)
- `./logs`: Logs del bot (montado desde el host)
- `./data`: Datos del bot (montado desde el host)

### 5.2 Redes

Los servicios están en la red `tulabot-network` y pueden comunicarse entre sí usando los nombres de servicio:
- `mysql` → Base de datos
- `bot` → Bot de Discord
- `web` → Panel web

### 5.3 Health Checks

MySQL tiene un health check configurado. El bot esperará a que MySQL esté listo antes de iniciar.

### 5.4 Reiniciar Servicios

En Portainer:
- Ve a **Stacks** → `tulabot`
- Haz clic en **Editor**
- Modifica lo que necesites
- Haz clic en **Update the stack**

O desde SSH:
```bash
docker-compose restart bot
docker-compose restart web
docker-compose restart mysql
```

## 🔒 Paso 6: Seguridad

### 6.1 Contraseñas Seguras

- Usa contraseñas fuertes para MySQL
- Cambia `SESSION_SECRET` por un valor aleatorio seguro
- No compartas tu `.env` públicamente

### 6.2 Firewall

Asegúrate de que solo los puertos necesarios estén abiertos:
- `3000` (Panel web) - Solo si quieres acceso externo
- `3306` (MySQL) - Solo si necesitas acceso externo (no recomendado)

### 6.3 HTTPS (Recomendado)

Para producción, configura un reverse proxy (Nginx/Traefik) con SSL:
- Usa Let's Encrypt para certificados gratuitos
- Configura HTTPS para el panel web

## 📝 Paso 7: Monitoreo y Mantenimiento

### 7.1 Ver Logs

En Portainer:
- **Containers** → Selecciona contenedor → **Logs**

O desde SSH:
```bash
# Logs del bot
docker-compose logs -f bot

# Logs del panel web
docker-compose logs -f web

# Logs de MySQL
docker-compose logs -f mysql
```

### 7.2 Backup de Base de Datos

```bash
# Crear backup
docker-compose exec mysql mysqldump -u tulabot -p tulabot > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker-compose exec -T mysql mysql -u tulabot -p tulabot < backup_20231130.sql
```

### 7.3 Actualizar el Bot

```bash
# Desde Portainer: Update the stack
# O desde SSH:
cd /ruta/a/tulabot
git pull  # Si usas Git
docker-compose up -d --build
```

## 🐛 Solución de Problemas

### El bot no se conecta

1. Verifica que `DISCORD_TOKEN` sea correcto
2. Revisa los logs: `docker-compose logs bot`
3. Verifica que el bot tenga los permisos necesarios en Discord

### Error de conexión a MySQL

1. Verifica que MySQL esté corriendo: `docker-compose ps`
2. Verifica las variables de entorno `DB_*`
3. Revisa los logs: `docker-compose logs mysql`

### El panel web no carga

1. Verifica que el puerto 3000 esté abierto
2. Revisa los logs: `docker-compose logs web`
3. Verifica `CLIENT_SECRET` y `REDIRECT_URI`

### Error "Table doesn't exist"

Ejecuta el script de inicialización:
```bash
docker-compose exec mysql mysql -u tulabot -p tulabot < docker/mysql/init.sql
```

## 📚 Recursos Adicionales

- [Documentación de Portainer](https://docs.portainer.io/)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [Documentación de MySQL](https://dev.mysql.com/doc/)

## ✅ Checklist de Despliegue

- [ ] Archivos subidos al servidor
- [ ] Archivo `.env` configurado con todas las variables
- [ ] Stack creado en Portainer
- [ ] Contenedores iniciados correctamente
- [ ] Bot conectado a Discord (verificar logs)
- [ ] Base de datos MySQL funcionando
- [ ] Panel web accesible
- [ ] Migración de datos completada (si aplica)
- [ ] Backups configurados
- [ ] Seguridad configurada (firewall, contraseñas)

---

¡Tu bot TulaBot debería estar funcionando en Portainer! 🎉

