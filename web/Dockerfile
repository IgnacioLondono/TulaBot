# Dockerfile para Panel Web de TulaBot
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
# Usar npm install porque package-lock.json puede no existir
RUN npm install --omit=dev --legacy-peer-deps

# Copiar código fuente
COPY public/ ./public/
COPY server.js ./

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production

# Comando por defecto
CMD ["node", "server.js"]

