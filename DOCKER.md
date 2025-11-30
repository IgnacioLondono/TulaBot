# 🐳 Guía Rápida de Docker - TulaBot

Guía rápida para usar Docker con TulaBot.

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
cp .env.example .env
# Edita .env con tus valores
```

### 2. Construir y Levantar Servicios

```bash
docker-compose up -d --build
```

### 3. Ver Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo el bot
docker-compose logs -f bot

# Solo el panel web
docker-compose logs -f web

# Solo MySQL
docker-compose logs -f mysql
```

### 4. Detener Servicios

```bash
docker-compose down
```

### 5. Reiniciar Servicios

```bash
docker-compose restart
```

## 📦 Servicios

- **mysql**: Base de datos MySQL
- **bot**: Bot de Discord
- **web**: Panel web

## 🔧 Comandos Útiles

```bash
# Ver estado de contenedores
docker-compose ps

# Ejecutar comando en el bot
docker-compose exec bot node src/deploy-commands.js

# Migrar datos de JSON a MySQL
docker-compose exec bot node docker/migrate-json-to-mysql.js

# Acceder a MySQL
docker-compose exec mysql mysql -u tulabot -p tulabot

# Ver uso de recursos
docker stats
```

## 📚 Más Información

- Ver `PORTAINER_SETUP.md` para desplegar en Portainer
- Ver `docker/README.md` para detalles de la base de datos

