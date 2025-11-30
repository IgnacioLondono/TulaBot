# Dockerfile para TulaBot
FROM node:18-alpine

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
RUN npm ci --only=production

# Copiar código fuente
COPY src/ ./src/
COPY verificar-*.js ./

# Crear directorios necesarios
RUN mkdir -p logs data

# Variables de entorno por defecto
ENV NODE_ENV=production

# Comando por defecto
CMD ["node", "src/index.js"]

