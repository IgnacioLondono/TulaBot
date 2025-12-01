# 🐳 Configuración para Portainer - TulaBot

Esta guía te ayudará a configurar TulaBot en Portainer sin errores.

## 📋 Requisitos Previos

- Portainer instalado y funcionando
- Acceso al servidor donde está Portainer
- Token de Discord Bot configurado
- Variables de entorno preparadas

## 🚀 Pasos para Desplegar en Portainer

### Paso 1: Preparar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Discord Bot
DISCORD_TOKEN=tu_token_del_bot
CLIENT_ID=tu_client_id
CLIENT_SECRET=tu_client_secret_oauth2
DEFAULT_PREFIX=!

# Google Gemini AI
GEMINI_API_KEY=tu_api_key_gemini
GEMINI_MODEL=gemini-2.5-flash

# Tenor API (Opcional)
TENOR_API_KEY=

# MySQL
MYSQL_ROOT_PASSWORD=tu_password_root_seguro
MYSQL_DATABASE=tulabot
MYSQL_USER=tulabot
MYSQL_PASSWORD=tu_password_mysql_seguro
MYSQL_PORT=3306

# Base de Datos (para el bot)
DB_HOST=mysql
DB_PORT=3306
DB_USER=tulabot
DB_PASSWORD=tu_password_mysql_seguro
DB_NAME=tulabot

# Panel Web
REDIRECT_URI=http://tu-dominio.com:3000/callback
WEB_PORT=3000
SESSION_SECRET=tu-secret-super-seguro-para-sesiones
```

**⚠️ IMPORTANTE:**
- Cambia todas las contraseñas por valores seguros
- Si usas un dominio, actualiza `REDIRECT_URI`
- El `DB_HOST=mysql` debe ser `mysql` (nombre del servicio en docker-compose)

### Paso 2: Subir el Proyecto al Servidor

1. Sube todos los archivos del proyecto a tu servidor
2. Asegúrate de que el archivo `.env` esté en la raíz del proyecto
3. Verifica que los archivos `docker-compose.yml` y `Dockerfile` estén presentes

### Paso 3: Crear Stack en Portainer

1. **Accede a Portainer**
   - Abre tu navegador y ve a la URL de Portainer
   - Inicia sesión

2. **Crear un Stack**
   - En el menú lateral, ve a **Stacks**
   - Haz clic en **Add stack**
   - Nombre: `tulabot`

3. **Configurar el Stack**
   
   **Opción A: Usando Web Editor (Recomendado)**
   - Selecciona **Web editor**
   - Copia el contenido completo de `docker-compose.yml`
   - Pega en el editor
   
   **Opción B: Usando Repository**
   - Selecciona **Repository**
   - Repository URL: URL de tu repositorio Git
   - Compose path: `docker-compose.yml`
   - Auto-update: Activa si quieres actualizaciones automáticas

4. **Variables de Entorno**
   - En la sección **Environment variables**, agrega todas las variables del `.env`
   - O mejor aún, si Portainer lo soporta, carga el archivo `.env` directamente

5. **Deploy**
   - Haz clic en **Deploy the stack**
   - Espera a que los contenedores se creen e inicien

### Paso 4: Verificar el Despliegue

1. **Verificar Contenedores**
   - Ve a **Containers** en Portainer
   - Deberías ver 3 contenedores:
     - `tulabot-mysql` (Base de datos)
     - `tulabot-bot` (Bot de Discord)
     - `tulabot-web` (Panel web)

2. **Verificar Logs**
   - Haz clic en `tulabot-bot`
   - Ve a la pestaña **Logs**
   - Deberías ver: `✅ Bot conectado como TulaBot#XXXX`

3. **Verificar Health Checks**
   - Los contenedores deberían mostrar estado "healthy" después de unos minutos
   - Si algún contenedor muestra "unhealthy", revisa los logs

4. **Acceder al Panel Web**
   - Abre tu navegador en: `http://tu-servidor:3000`
   - O si configuraste un dominio: `https://tu-dominio.com`

## 🔧 Configuración Avanzada

### Volúmenes Persistentes

Los volúmenes ya están configurados:
- `mysql_data`: Datos de MySQL (persistente)
- `./logs`: Logs del bot (montado desde el host)
- `./data`: Datos del bot (montado desde el host)

### Redes

Los servicios están en la red `tulabot-network` y pueden comunicarse entre sí:
- `mysql` → Base de datos
- `bot` → Bot de Discord
- `web` → Panel web

### Health Checks

Todos los servicios tienen health checks configurados:
- MySQL: Verifica que la base de datos responda
- Bot: Verifica que la API del bot responda en `/health`
- Web: Verifica que el panel web responda en `/health`

## 🐛 Solución de Problemas

### El bot no se conecta

1. Verifica que `DISCORD_TOKEN` sea correcto
2. Revisa los logs: `docker-compose logs bot`
3. Verifica que el bot tenga los permisos necesarios en Discord

### Error de conexión a MySQL

1. Verifica que MySQL esté corriendo
2. Verifica las variables de entorno `DB_*`
3. Revisa los logs: `docker-compose logs mysql`
4. Asegúrate de que `DB_HOST=mysql` (no `localhost`)

### El panel web no carga

1. Verifica que el puerto 3000 esté abierto
2. Revisa los logs: `docker-compose logs web`
3. Verifica `CLIENT_SECRET` y `REDIRECT_URI`
4. Asegúrate de que el bot esté funcionando (el panel depende del bot)

### Error "Table doesn't exist"

El script de inicialización se ejecuta automáticamente al crear el contenedor MySQL. Si hay problemas:

1. Verifica que el archivo `docker/mysql/init.sql` exista
2. Revisa los logs de MySQL para ver si hay errores
3. Puedes ejecutar manualmente:
   ```bash
   docker-compose exec mysql mysql -u tulabot -p tulabot < docker/mysql/init.sql
   ```

### Health Check Falla

Si un contenedor muestra "unhealthy":

1. Revisa los logs del contenedor
2. Verifica que el servicio esté respondiendo en el puerto correcto
3. Espera unos minutos (los health checks tienen un `start_period` de 40s)

## 📊 Monitoreo

### Ver Logs en Portainer

1. Ve a **Containers**
2. Selecciona el contenedor
3. Haz clic en **Logs**
4. Puedes filtrar por nivel (info, error, warn)

### Reiniciar Servicios

1. Ve a **Stacks** → `tulabot`
2. Haz clic en **Editor**
3. Modifica lo que necesites
4. Haz clic en **Update the stack**

O desde la línea de comandos:
```bash
docker-compose restart bot
docker-compose restart web
docker-compose restart mysql
```

## 🔒 Seguridad

### Contraseñas Seguras

- Usa contraseñas fuertes para MySQL
- Cambia `SESSION_SECRET` por un valor aleatorio seguro
- No compartas tu `.env` públicamente

### Firewall

Asegúrate de que solo los puertos necesarios estén abiertos:
- `3000` (Panel web) - Solo si quieres acceso externo
- `3306` (MySQL) - Solo si necesitas acceso externo (no recomendado)

### HTTPS (Recomendado)

Para producción, configura un reverse proxy (Nginx/Traefik) con SSL:
- Usa Let's Encrypt para certificados gratuitos
- Configura HTTPS para el panel web

## ✅ Checklist de Despliegue

- [ ] Archivos subidos al servidor
- [ ] Archivo `.env` configurado con todas las variables
- [ ] Stack creado en Portainer
- [ ] Contenedores iniciados correctamente
- [ ] Bot conectado a Discord (verificar logs)
- [ ] Base de datos MySQL funcionando
- [ ] Panel web accesible
- [ ] Health checks pasando
- [ ] Logs sin errores críticos

## 📝 Notas Importantes

1. **Variables de Entorno**: Todas las variables deben estar configuradas antes de desplegar
2. **Dependencias**: El bot espera a que MySQL esté listo antes de iniciar
3. **Health Checks**: Los health checks tienen un período de inicio de 40 segundos
4. **Volúmenes**: Los datos de MySQL se almacenan en un volumen persistente
5. **Redes**: Todos los servicios están en la misma red Docker

---

¡Tu bot TulaBot debería estar funcionando en Portainer! 🎉

Si tienes problemas, revisa los logs y la sección de solución de problemas.

