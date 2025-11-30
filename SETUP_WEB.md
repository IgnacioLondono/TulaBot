# 🌐 Guía de Configuración del Panel Web

## Paso 1: Configurar OAuth2 en Discord

⚠️ **IMPORTANTE**: Este paso es crítico. Si no lo haces correctamente, verás el error "Cuerpo del formulario no válido".

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecciona tu aplicación
3. Ve a **OAuth2** en el menú lateral
4. En la sección **Redirects**, haz clic en **Add Redirect**
5. Agrega EXACTAMENTE esta URL (sin espacios, sin trailing slash):
   ```
   http://localhost:3000/callback
   ```
   ⚠️ **CRÍTICO**: La URL debe coincidir EXACTAMENTE con la que uses en `.env`
6. Haz clic en **Save Changes**
7. En la sección **General**, copia el **Client Secret**
   - Si no lo ves, haz clic en **Reset Secret** y cópialo
   - ⚠️ Solo se muestra una vez, guárdalo bien
8. También copia el **Client ID** (Application ID) de la sección **General Information**

## Paso 2: Actualizar Variables de Entorno

Edita tu archivo `.env` en la raíz del proyecto y agrega:

```env
# Panel Web
CLIENT_SECRET=tu_client_secret_aqui
REDIRECT_URI=http://localhost:3000/callback
WEB_PORT=3000
WEB_ENABLED=true
SESSION_SECRET=genera-un-secret-aleatorio-y-seguro-aqui
```

**Para generar un SESSION_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Paso 3: Instalar Dependencias del Panel

```bash
cd web
npm install
```

## Paso 4: Iniciar el Bot (con Panel Web)

Desde la raíz del proyecto:

```bash
npm start
```

El panel web se iniciará automáticamente en `http://localhost:3000`

## Paso 5: Acceder al Panel

1. Abre tu navegador en `http://localhost:3000`
2. Haz clic en "Login" (serás redirigido a Discord)
3. Autoriza la aplicación
4. ¡Listo! Ya puedes usar el panel

## 🎯 Funcionalidades

### Dashboard
- Ver todos los servidores donde el bot está presente
- Información de cada servidor

### Enviar Embed
- Seleccionar servidor y canal
- Crear embeds personalizados con:
  - Título y descripción
  - Color personalizado
  - Imágenes y miniaturas
  - Campos (fields)
  - Footer y timestamp
- Vista previa en tiempo real
- Enviar directamente a Discord

### Estadísticas
- Servidores totales
- Usuarios totales
- Canales totales
- Ping del bot
- Comandos disponibles
- Tiempo activo (uptime)

## 🔧 Configuración Avanzada

### Cambiar Puerto

Edita `.env`:
```env
WEB_PORT=8080
```

### Deshabilitar Panel Web

```env
WEB_ENABLED=false
```

### Producción

Para producción, asegúrate de:

1. Cambiar `REDIRECT_URI` a tu dominio real
2. Usar HTTPS
3. Configurar un proxy reverso (nginx, etc.)
4. Usar un `SESSION_SECRET` seguro y único
5. Configurar variables de entorno en tu servidor

## 🐛 Solución de Problemas

### Error: "Cannot find module '../web/server'"
- Asegúrate de estar ejecutando desde la raíz del proyecto
- Verifica que la carpeta `web/` existe

### Error: "CLIENT_SECRET is required"
- Verifica que `CLIENT_SECRET` esté en tu `.env`
- Reinicia el bot después de agregar la variable

### No se muestran servidores
- El bot debe estar en los servidores
- Verifica que el bot tenga los intents necesarios
- Asegúrate de que el usuario esté autenticado correctamente

### Error de autenticación
- Verifica que `REDIRECT_URI` coincida exactamente con la configurada en Discord
- Asegúrate de que `CLIENT_SECRET` sea correcto
- Verifica que la aplicación tenga los scopes `identify` y `guilds`

