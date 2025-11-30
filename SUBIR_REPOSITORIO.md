# 📤 Guía para Subir el Proyecto a un Repositorio

Este documento te guiará paso a paso para subir TulaBot a GitHub, GitLab u otro servicio de Git.

## ✅ Estado Actual

El repositorio Git local ya está inicializado y el commit inicial está hecho:
- ✅ Repositorio Git inicializado
- ✅ Archivos agregados al staging
- ✅ Commit inicial creado

## 🚀 Opción 1: GitHub

### Paso 1: Crear Repositorio en GitHub

1. Ve a [GitHub](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** (arriba a la derecha) → **"New repository"**
3. Completa el formulario:
   - **Repository name**: `tulabot` (o el nombre que prefieras)
   - **Description**: "Bot de Discord profesional con Docker, MySQL y Panel Web"
   - **Visibility**: 
     - ✅ **Public** (si quieres que sea público)
     - ✅ **Private** (si quieres que sea privado)
   - ⚠️ **NO** marques "Initialize this repository with a README" (ya tenemos uno)
4. Haz clic en **"Create repository"**

### Paso 2: Conectar y Subir

Abre PowerShell o Git Bash en el directorio del proyecto y ejecuta:

```bash
# Agregar el repositorio remoto (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/tulabot.git

# Verificar que se agregó correctamente
git remote -v

# Cambiar a la rama main (si GitHub usa main en lugar de master)
git branch -M main

# Subir el código
git push -u origin main
```

Si GitHub usa `master` en lugar de `main`:

```bash
# Subir el código
git push -u origin master
```

### Paso 3: Autenticación

Si te pide autenticación:
- **Usuario**: Tu usuario de GitHub
- **Contraseña**: Usa un **Personal Access Token** (no tu contraseña normal)

Para crear un Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Selecciona los scopes: `repo` (todos los permisos de repositorio)
4. Genera y copia el token
5. Úsalo como contraseña cuando Git te lo pida

---

## 🦊 Opción 2: GitLab

### Paso 1: Crear Proyecto en GitLab

1. Ve a [GitLab](https://gitlab.com) e inicia sesión
2. Haz clic en **"New project"** o el botón **"+"**
3. Selecciona **"Create blank project"**
4. Completa el formulario:
   - **Project name**: `tulabot`
   - **Project slug**: Se genera automáticamente
   - **Visibility Level**: 
     - ✅ **Public** (público)
     - ✅ **Private** (privado)
   - ⚠️ **NO** marques "Initialize repository with a README"
5. Haz clic en **"Create project"**

### Paso 2: Conectar y Subir

```bash
# Agregar el repositorio remoto
git remote add origin https://gitlab.com/TU_USUARIO/tulabot.git

# Verificar
git remote -v

# Cambiar a main (si GitLab usa main)
git branch -M main

# Subir el código
git push -u origin main
```

---

## 📦 Opción 3: Otros Servicios

### Bitbucket

```bash
git remote add origin https://bitbucket.org/TU_USUARIO/tulabot.git
git push -u origin master
```

### Gitea / Self-hosted

```bash
git remote add origin https://tu-servidor.com/TU_USUARIO/tulabot.git
git push -u origin master
```

---

## 🔄 Comandos Útiles para el Futuro

### Ver Estado del Repositorio

```bash
git status
```

### Agregar Cambios

```bash
# Agregar todos los archivos modificados
git add .

# O agregar archivos específicos
git add archivo1.js archivo2.js
```

### Hacer Commit

```bash
git commit -m "Descripción de los cambios"
```

### Subir Cambios

```bash
git push
```

### Actualizar desde el Repositorio

```bash
git pull
```

### Ver Historial

```bash
git log
```

### Crear una Nueva Rama

```bash
git checkout -b nombre-rama
git push -u origin nombre-rama
```

---

## ⚠️ Importante: Archivos que NO se Suben

Gracias al `.gitignore`, estos archivos **NO** se subirán al repositorio:

- ✅ `.env` - Variables de entorno (contiene tokens y secrets)
- ✅ `node_modules/` - Dependencias
- ✅ `logs/` - Archivos de log
- ✅ `data/` - Datos locales
- ✅ `*.log` - Archivos de log
- ✅ Archivos de backup

**Esto es correcto y seguro.** No quieres subir información sensible.

---

## 🔐 Seguridad

### Si Accidentalmente Subiste un Secret

Si por error subiste un archivo con información sensible:

1. **Eliminar del historial de Git:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

2. **O usar BFG Repo-Cleaner** (más fácil):
   - Descarga [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
   - Ejecuta: `java -jar bfg.jar --delete-files .env`
   - Fuerza push: `git push --force`

3. **Cambiar inmediatamente** todos los tokens/secrets que estaban en el archivo

### Mejores Prácticas

- ✅ **NUNCA** subas archivos `.env`
- ✅ Usa `.env.example` como plantilla
- ✅ Revisa `git status` antes de hacer commit
- ✅ Revisa `git diff` para ver qué cambios vas a subir

---

## 📝 Siguiente Paso: Configurar CI/CD (Opcional)

Una vez subido, puedes configurar:

### GitHub Actions

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Server

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          # Comandos para desplegar
```

### GitLab CI/CD

Crea `.gitlab-ci.yml`:

```yaml
deploy:
  script:
    - docker-compose up -d --build
```

---

## ✅ Checklist Final

Antes de considerar que todo está listo:

- [ ] Repositorio creado en GitHub/GitLab/etc.
- [ ] Repositorio remoto agregado (`git remote add origin`)
- [ ] Código subido (`git push`)
- [ ] README.md visible en el repositorio
- [ ] `.gitignore` funcionando (no se ven archivos sensibles)
- [ ] Documentación completa visible

---

## 🎉 ¡Listo!

Tu proyecto TulaBot ahora está en el repositorio remoto. Otros desarrolladores pueden:

```bash
git clone https://github.com/TU_USUARIO/tulabot.git
cd tulabot
```

Y seguir las instrucciones del README.md para configurarlo.

---

**¿Necesitas ayuda?** Revisa la documentación de Git o del servicio que estés usando.

