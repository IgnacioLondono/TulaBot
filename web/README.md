# 🌐 Panel Web de TulaBot

Panel de administración web tipo Koya para el bot de Discord TulaBot.

## 🚀 Características

- ✅ Autenticación OAuth2 con Discord
- ✅ Envío de embeds personalizados
- ✅ Vista previa en tiempo real
- ✅ Panel de servidores y canales
- ✅ Estadísticas del bot
- ✅ Interfaz moderna y responsive

## 📋 Requisitos

- Node.js 18.0.0 o superior
- Bot de Discord configurado
- Aplicación de Discord con OAuth2 configurado

## ⚙️ Configuración

### 1. Configurar OAuth2 en Discord Developer Portal

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecciona tu aplicación
3. Ve a **OAuth2** > **General**
4. Agrega una URL de redirección: `http://localhost:3000/callback` (o tu dominio)
5. Copia el **Client Secret**

### 2. Variables de Entorno

Agrega estas variables a tu archivo `.env` en la raíz del proyecto:

```env
# Bot (ya deberías tenerlas)
DISCORD_TOKEN=tu_token_del_bot
CLIENT_ID=tu_client_id

# Panel Web (nuevas)
CLIENT_SECRET=tu_client_secret_de_oauth2
REDIRECT_URI=http://localhost:3000/callback
WEB_PORT=3000
WEB_ENABLED=true
SESSION_SECRET=tu-secret-super-seguro-para-sesiones
```

### 3. Instalar Dependencias

```bash
cd web
npm install
```

## 🎯 Uso

### Opción 1: Integrado con el bot (Recomendado)

El panel se inicia automáticamente cuando inicias el bot si `WEB_ENABLED=true`:

```bash
# Desde la raíz del proyecto
npm start
```

### Opción 2: Servidor independiente

Si prefieres ejecutar el panel por separado:

```bash
cd web
npm start
```

Luego inicia el bot normalmente desde la raíz.

## 🌐 Acceder al Panel

Una vez iniciado, abre tu navegador en:

```
http://localhost:3000
```

## 📝 Notas

- El panel requiere que el bot esté ejecutándose para funcionar correctamente
- Asegúrate de que el bot tenga permisos en los servidores que quieras administrar
- Para producción, cambia `REDIRECT_URI` a tu dominio real
- Usa un `SESSION_SECRET` seguro y único en producción

## 🔒 Seguridad

- El panel solo muestra servidores donde el bot está presente
- Los usuarios deben autenticarse con Discord
- Las sesiones expiran después de 24 horas
- En producción, usa HTTPS

## 🐛 Solución de Problemas

### "Bot no disponible"
- Asegúrate de que el bot esté ejecutándose
- Verifica que `WEB_ENABLED=true` en `.env`

### "Error de autenticación"
- Verifica que `CLIENT_SECRET` sea correcto
- Asegúrate de que `REDIRECT_URI` coincida con la configurada en Discord

### "No se muestran servidores"
- El bot debe estar en los servidores que quieres ver
- Verifica los permisos del bot





