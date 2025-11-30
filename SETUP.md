# 🚀 Guía de Configuración del Bot

## Paso 1: Crear el Bot en Discord

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Haz clic en "New Application"
3. Dale un nombre a tu aplicación
4. Ve a la sección "Bot" en el menú lateral
5. Haz clic en "Add Bot" y confirma
6. En "Token", haz clic en "Reset Token" y copia el token
7. **IMPORTANTE**: Guarda este token de forma segura, no lo compartas

## Paso 2: Configurar Permisos

1. En la sección "Bot", desplázate hacia abajo
2. En "Privileged Gateway Intents", activa:
   - ✅ PRESENCE INTENT
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT

## Paso 3: Invitar el Bot

1. Ve a la sección "OAuth2" > "URL Generator"
2. En "SCOPES", selecciona:
   - ✅ bot
   - ✅ applications.commands
3. En "BOT PERMISSIONS", selecciona:
   - ✅ Administrar Mensajes
   - ✅ Expulsar Miembros
   - ✅ Banear Miembros
   - ✅ Gestionar Canales
   - ✅ Gestionar Roles
   - ✅ Conectar
   - ✅ Hablar
   - ✅ Usar Comandos de Aplicación
4. Copia la URL generada y ábrela en tu navegador
5. Selecciona el servidor donde quieres añadir el bot
6. Autoriza el bot

## Paso 4: Instalar Dependencias

```bash
npm install
```

## Paso 5: Configurar Variables de Entorno

1. Crea un archivo `.env` en la raíz del proyecto
2. Añade el siguiente contenido:

```env
DISCORD_TOKEN=tu_token_aqui
CLIENT_ID=tu_client_id_aqui
DEFAULT_PREFIX=!
TENOR_API_KEY=opcional_para_gifs
```

**Para obtener el CLIENT_ID:**
- Ve a "General Information" en Discord Developer Portal
- Copia el "Application ID"

## Paso 6: Registrar Comandos Slash

Ejecuta el siguiente comando para registrar todos los comandos:

```bash
npm run deploy
```

Esto registrará los 60 comandos en Discord. Puede tardar unos minutos.

## Paso 7: Iniciar el Bot

```bash
npm start
```

O para desarrollo con auto-reload:

```bash
npm run dev
```

## ✅ Verificación

Si todo está correcto, deberías ver:
- ✅ Mensajes de comandos cargados en la consola
- ✅ El bot aparece como "En línea" en Discord
- ✅ Puedes usar `/help` para ver todos los comandos

## 🔧 Solución de Problemas

### El bot no se conecta
- Verifica que el token sea correcto
- Asegúrate de que los intents estén activados
- Revisa que Node.js esté actualizado (v18+)

### Los comandos no aparecen
- Ejecuta `npm run deploy` nuevamente
- Espera unos minutos (Discord puede tardar)
- Verifica que el CLIENT_ID sea correcto

### Error de permisos
- Asegúrate de que el bot tenga los permisos necesarios en el servidor
- Verifica que el bot tenga un rol con permisos suficientes

### La música no funciona
- El bot debe estar en un canal de voz
- Verifica que el bot tenga permisos de "Conectar" y "Hablar"
- Algunos servidores pueden requerir permisos adicionales

## 📝 Notas Adicionales

- El bot usa `quick.db` para almacenar datos (se crea automáticamente)
- Los logs se guardan en la carpeta `logs/`
- Puedes personalizar el prefijo con `/setprefix`
- Algunas funciones requieren APIs externas (opcionales)

## 🎉 ¡Listo!

Tu bot está configurado y listo para usar. Disfruta de tus 60 comandos profesionales.













