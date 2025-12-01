# 🚀 Inicio Rápido - Configuración de TulaBot

## ⚡ Configuración Rápida (5 minutos)

### 1. Ejecutar Script de Configuración

```powershell
# En PowerShell
.\configurar.ps1
```

Este script:
- ✅ Verifica o crea el archivo `.env`
- ✅ Genera contraseñas seguras
- ✅ Verifica qué variables faltan

### 2. Completar Variables de Discord

Abre el archivo `.env` y completa estas variables:

```env
DISCORD_TOKEN=tu_token_del_bot
CLIENT_ID=tu_client_id
CLIENT_SECRET=tu_client_secret
```

**¿Dónde obtener estos valores?**

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Crea una nueva aplicación o selecciona una existente
3. **DISCORD_TOKEN**: Bot > Token > Reset Token
4. **CLIENT_ID**: General Information > Application ID
5. **CLIENT_SECRET**: OAuth2 > Client Secret > Reset Secret

### 3. Configurar OAuth2 en Discord

1. En Discord Developer Portal, ve a **OAuth2** > **Redirects**
2. Haz clic en **Add Redirect**
3. Agrega: `http://localhost:3000/callback`
4. Haz clic en **Save Changes**

### 4. Configurar Base de Datos

**Opción A: Con Docker (Recomendado)**
```powershell
# Las contraseñas ya están en .env, solo inicia Docker
docker-compose up -d mysql
```

**Opción B: MySQL Local**
1. Instala MySQL
2. Crea la base de datos:
   ```sql
   CREATE DATABASE tulabot;
   CREATE USER 'tulabot'@'localhost' IDENTIFIED BY 'tu_password';
   GRANT ALL PRIVILEGES ON tulabot.* TO 'tulabot'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. Ejecuta el script de inicialización:
   ```bash
   mysql -u tulabot -p tulabot < docker/mysql/init.sql
   ```

### 5. Iniciar el Bot

```powershell
npm start
```

Deberías ver:
- ✅ Bot conectado como TulaBot#XXXX
- ✅ Base de datos MySQL inicializada
- ✅ Panel web iniciado en http://localhost:3000

### 6. Registrar Comandos

```powershell
npm run deploy
```

Esto registrará todos los comandos slash en Discord.

---

## 📚 Documentación Completa

Para una guía detallada paso a paso, consulta:

- **[CONFIGURAR_TODO.md](CONFIGURAR_TODO.md)** - Guía completa de configuración
- **[PORTAINER_CONFIG.md](PORTAINER_CONFIG.md)** - Configuración para Portainer
- **[README.md](README.md)** - Documentación general del proyecto

---

## 🔧 Estructura de Archivos de Configuración

```
TulaBot-1/
├── .env                    # Variables de entorno (crear/editar)
├── configurar.ps1          # Script de ayuda para configuración
├── CONFIGURAR_TODO.md      # Guía completa de configuración
├── PORTAINER_CONFIG.md     # Guía para Portainer
└── docker-compose.yml      # Configuración de Docker
```

---

## ✅ Checklist de Configuración

- [ ] Archivo `.env` creado y configurado
- [ ] `DISCORD_TOKEN` configurado
- [ ] `CLIENT_ID` configurado
- [ ] `CLIENT_SECRET` configurado
- [ ] OAuth2 Redirect URI configurado en Discord
- [ ] Contraseñas de MySQL generadas y configuradas
- [ ] `SESSION_SECRET` generado
- [ ] Base de datos creada y accesible
- [ ] Bot iniciado correctamente
- [ ] Panel web accesible en http://localhost:3000
- [ ] Comandos registrados en Discord

---

## 🐛 Problemas Comunes

### Error: "TokenInvalid"
- Verifica que `DISCORD_TOKEN` sea correcto
- Asegúrate de que no haya espacios extra

### Error: "CLIENT_SECRET incorrecto"
- Verifica que `CLIENT_SECRET` sea correcto
- Asegúrate de que `REDIRECT_URI` coincida exactamente con Discord

### Error: "No se puede conectar a MySQL"
- Verifica que MySQL esté corriendo
- Verifica las variables `DB_*` en `.env`
- En Docker, usa `DB_HOST=mysql`
- En local, usa `DB_HOST=localhost`

---

¡Listo para empezar! 🎉

