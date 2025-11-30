# 📦 Instalación Rápida

## Requisitos Previos

- Node.js 18.0.0 o superior
- npm (viene con Node.js)
- Token de Discord Bot

## Pasos de Instalación

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DISCORD_TOKEN=tu_token_aqui
CLIENT_ID=tu_client_id_aqui
DEFAULT_PREFIX=!
```

### 3. Registrar Comandos

```bash
npm run deploy
```

### 4. Iniciar el Bot

```bash
npm start
```

## 🎯 Comandos Disponibles

- `npm start` - Inicia el bot
- `npm run dev` - Inicia con auto-reload (requiere nodemon)
- `npm run deploy` - Registra comandos slash en Discord

## ⚠️ Importante

1. Asegúrate de tener los **intents** activados en Discord Developer Portal
2. El bot necesita permisos de administrador o permisos específicos
3. Para música, el bot necesita estar en un canal de voz

## 📚 Documentación Completa

Consulta `SETUP.md` para una guía detallada de configuración.













