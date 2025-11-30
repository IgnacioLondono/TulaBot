# 🐳 Docker - TulaBot

Este directorio contiene archivos relacionados con Docker y la configuración de microservicios.

## 📁 Estructura

```
docker/
├── mysql/
│   └── init.sql          # Script de inicialización de MySQL
└── migrate-json-to-mysql.js  # Script de migración de JSON a MySQL
```

## 🗄️ Base de Datos MySQL

### Inicialización

El archivo `mysql/init.sql` se ejecuta automáticamente cuando se crea el contenedor MySQL por primera vez. Crea las siguientes tablas:

- `key_value_store` - Almacenamiento clave-valor (reemplazo de database.json)
- `warnings` - Advertencias de usuarios
- `guild_config` - Configuración de servidores
- `reminders` - Recordatorios
- `ai_conversations` - Historial de conversaciones de IA

### Migración de Datos

Si tienes datos en `data/database.json` que quieres migrar a MySQL:

```bash
# Desde el contenedor del bot
docker-compose exec bot node docker/migrate-json-to-mysql.js

# O desde el host (si tienes Node.js instalado)
node docker/migrate-json-to-mysql.js
```

El script:
1. Lee `data/database.json`
2. Aplana la estructura anidada
3. Inserta los datos en MySQL
4. Muestra un resumen de la migración

## 🔧 Configuración

### Variables de Entorno

Asegúrate de configurar las siguientes variables en tu `.env`:

```env
DB_HOST=mysql
DB_PORT=3306
DB_USER=tulabot
DB_PASSWORD=tu_password
DB_NAME=tulabot
```

### Conectar a MySQL Manualmente

```bash
# Desde el contenedor
docker-compose exec mysql mysql -u tulabot -p tulabot

# Desde el host (si MySQL está expuesto)
mysql -h localhost -P 3306 -u tulabot -p tulabot
```

## 📊 Backup y Restauración

### Crear Backup

```bash
docker-compose exec mysql mysqldump -u tulabot -p tulabot > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar Backup

```bash
docker-compose exec -T mysql mysql -u tulabot -p tulabot < backup_20231130_120000.sql
```

## 🐛 Solución de Problemas

### Error: "Table doesn't exist"

Ejecuta manualmente el script de inicialización:

```bash
docker-compose exec mysql mysql -u root -p tulabot < docker/mysql/init.sql
```

### Error: "Access denied"

Verifica las credenciales en `.env` y que coincidan con las del contenedor MySQL.

### Error: "Can't connect to MySQL server"

1. Verifica que el contenedor MySQL esté corriendo: `docker-compose ps`
2. Verifica que `DB_HOST=mysql` (nombre del servicio, no `localhost`)
3. Espera a que MySQL termine de inicializarse (puede tardar 30-60 segundos)

