# 🔧 Solución de Problemas con Gemini

## Error: "404 Not Found" o "El modelo especificado no está disponible"

Si todos los modelos dan error 404, sigue estos pasos:

### 1. Verificar la API Key

Ejecuta el script de verificación mejorado:

```bash
npm run verify-gemini
```

Este script ahora:
- Verifica si tu API key es válida
- Lista los modelos disponibles desde la API de Google
- Prueba los modelos directamente

### 2. Verificar el archivo .env

Abre tu archivo `.env` y verifica:

```env
GEMINI_API_KEY=tu_api_key_aqui
```

**Problemas comunes:**
- ❌ Espacios extra: `GEMINI_API_KEY = tu_key` (incorrecto)
- ✅ Correcto: `GEMINI_API_KEY=tu_key` (sin espacios alrededor del `=`)
- ❌ Comillas innecesarias: `GEMINI_API_KEY="tu_key"` (puede causar problemas)
- ✅ Correcto: `GEMINI_API_KEY=tu_key` (sin comillas)

### 3. Obtener una nueva API Key

Si tu API key no funciona:

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key" o "Get API Key"
4. Copia la nueva API key
5. Reemplázala en tu archivo `.env`
6. Reinicia el bot

### 4. Verificar acceso a Gemini

Algunas cuentas pueden tener restricciones:

- Verifica que tu cuenta de Google tenga acceso a Gemini
- Algunas regiones pueden tener restricciones
- Asegúrate de que tu cuenta no esté en una organización con restricciones

### 5. Probar directamente en Google AI Studio

1. Ve a [Google AI Studio](https://aistudio.google.com/)
2. Inicia sesión
3. Prueba hacer una pregunta directamente en la interfaz web
4. Si funciona ahí, el problema está en la configuración del bot

### 6. Verificar la versión de la librería

Asegúrate de tener la última versión:

```bash
npm install @google/generative-ai@latest
```

### 7. Modelos alternativos

Si ningún modelo funciona, puede ser que:

- Tu API key no tenga acceso a los modelos nuevos
- Necesites usar una API key diferente
- Haya restricciones regionales

**Solución temporal:** Puedes desactivar la función de IA eliminando o comentando `GEMINI_API_KEY` en tu `.env`:

```env
# GEMINI_API_KEY=tu_key (comentado)
```

## Error: "401 Unauthorized" o "403 Forbidden"

- Tu API key no es válida
- Tu API key fue revocada
- Tu API key no tiene los permisos necesarios

**Solución:** Obtén una nueva API key en [Google AI Studio](https://aistudio.google.com/app/apikey)

## Error: "429 Too Many Requests"

- Has excedido la cuota gratuita
- Estás haciendo demasiadas solicitudes

**Solución:**
- Espera unos minutos antes de intentar de nuevo
- Considera actualizar a un plan de pago si necesitas más cuota

## Error: "SAFETY" o contenido bloqueado

- Tu mensaje viola las políticas de seguridad de Google

**Solución:** Reformula tu mensaje de manera más apropiada

## Verificación paso a paso

1. ✅ Verifica que `GEMINI_API_KEY` esté en tu `.env`
2. ✅ Ejecuta `npm run verify-gemini`
3. ✅ Si todos los modelos fallan, obtén una nueva API key
4. ✅ Prueba la API key directamente en Google AI Studio
5. ✅ Si funciona en AI Studio pero no en el bot, verifica espacios/comillas en `.env`
6. ✅ Reinicia el bot después de cambiar el `.env`

## Contacto y Recursos

- [Google AI Studio](https://aistudio.google.com/)
- [Documentación de Gemini](https://ai.google.dev/docs)
- [Límites y Cuotas](https://ai.google.dev/pricing)


