# Dockerfile para TulaBot
FROM node:20-alpine

# Instalar dependencias del sistema para discord-player y ffmpeg
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    ffmpeg \
    opus \
    opus-dev

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
# Usar npm install porque package-lock.json puede no existir
RUN npm install --include=dev --legacy-peer-deps

# Copiar código fuente
COPY src/ ./src/

# CRÍTICO: Copiar la carpeta web COMPLETA para que el bot pueda cargar el módulo del servidor API
COPY web/ ./web/

# Crear directorios necesarios
RUN mkdir -p logs data

# Variables de entorno por defecto
ENV NODE_ENV=production

# Comando por defecto
CMD ["node", "src/index.js"]
