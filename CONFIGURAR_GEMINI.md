# Configuración de Google Gemini AI

Este bot incluye integración con Google Gemini para proporcionar capacidades de IA conversacional.

## 📋 Requisitos Previos

1. Una cuenta de Google
2. Acceso a Google AI Studio (makersuite.google.com)

## 🔑 Obtener API Key

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key" (Crear API Key)
4. Copia la API key generada

## ⚙️ Configuración

1. Abre tu archivo `.env` en la raíz del proyecto
2. Agrega la siguiente línea:

```env
GEMINI_API_KEY=tu_api_key_aqui
```

3. (Opcional) Puedes especificar el modelo a usar:

```env
GEMINI_MODEL=gemini-2.5-flash
```

**Modelos disponibles (versión gratuita):**
- `gemini-2.5-flash` (por defecto) - Modelo más reciente, rápido y gratuito, recomendado
- `gemini-1.5-flash` - Modelo rápido y gratuito
- `gemini-1.5-pro` - Modelo más potente (puede requerir cuota de pago)
- `gemini-pro` - Modelo legacy (puede no estar disponible)

**Nota:** Para ver qué modelos están disponibles con tu API key, ejecuta:
```bash
npm run verify-gemini
```

## 📝 Comandos Disponibles

### `/ai`
Habla con la IA usando Google Gemini.

**Opciones:**
- `mensaje` (requerido): Tu mensaje para la IA
- `nuevo` (opcional): Iniciar una nueva conversación (limpiar historial)

**Ejemplo:**
```
/ai mensaje: ¿Qué es JavaScript?
/ai mensaje: Explícame más sobre eso nuevo:true
```

### `/ai-clear`
Limpia el historial de conversación con la IA.

**Ejemplo:**
```
/ai-clear
```

## 🧠 Características

- **Memoria de Conversación**: La IA recuerda el contexto de la conversación
- **Historial por Usuario/Canal**: Cada usuario tiene su propio historial en cada canal
- **Límite de Historial**: Se mantienen las últimas 10 interacciones (20 mensajes)
- **Limpieza Automática**: El historial se limpia automáticamente si es muy largo

## ⚠️ Limitaciones

- **Cuota de API**: Google proporciona una cuota gratuita limitada
- **Tamaño de Respuesta**: Las respuestas muy largas se dividen en múltiples mensajes
- **Filtros de Seguridad**: Google puede bloquear contenido inapropiado

## 🔒 Seguridad

- **Nunca compartas tu API key** públicamente
- Mantén tu archivo `.env` en `.gitignore`
- Si tu API key se compromete, revócala inmediatamente en Google AI Studio

## 💡 Consejos

1. Usa `/ai-clear` si la conversación se vuelve confusa
2. El parámetro `nuevo:true` es útil para cambiar de tema
3. Las respuestas pueden tardar unos segundos dependiendo de la complejidad

## 🆘 Solución de Problemas

### Error: "La API key de Gemini no está configurada"
- Verifica que `GEMINI_API_KEY` esté en tu archivo `.env`
- Asegúrate de que el archivo `.env` esté en la raíz del proyecto
- Reinicia el bot después de agregar la variable

### Error: "El modelo especificado no está disponible" o "404 Not Found"
- **Ejecuta el script de verificación**: `npm run verify-gemini`
- Este script probará todos los modelos disponibles y te dirá cuál usar
- Si tienes `GEMINI_MODEL` en tu `.env`, elimínalo o cámbialo según el resultado del script
- El bot intentará automáticamente modelos alternativos si uno falla

### Error: "La API key de Gemini no es válida"
- Verifica que la API key sea correcta
- Asegúrate de que no haya espacios extra en el `.env`
- Obtén una nueva API key si es necesario en: https://aistudio.google.com/app/apikey

### Error: "Se ha excedido la cuota de la API"
- Has alcanzado el límite de solicitudes gratuitas
- Espera un tiempo antes de intentar de nuevo
- Considera actualizar a un plan de pago si necesitas más cuota

### Error: "Tu mensaje fue bloqueado por los filtros de seguridad"
- El contenido de tu mensaje viola las políticas de Google
- Reformula tu mensaje de manera más apropiada

## 🔍 Verificar Modelos Disponibles

Para ver qué modelos de Gemini están disponibles con tu API key, ejecuta:

```bash
npm run verify-gemini
```

Este script probará varios modelos y te mostrará cuáles funcionan. Usa el modelo recomendado en tu `.env` o elimina `GEMINI_MODEL` para usar el modelo por defecto.

## 📚 Recursos

- [Documentación de Google Gemini](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Límites y Cuotas](https://ai.google.dev/pricing)

