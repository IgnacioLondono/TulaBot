# 🔧 Solución para Error de Encriptación

## Problema
Error: `No compatible encryption modes. Available include: aead_aes256_gcm_rtpsize, aead_xchacha20_poly1305_rtpsize`

Este error ocurre porque Discord cambió los métodos de cifrado en noviembre de 2024, eliminando soporte para `xsalsa20_poly1305*`.

## Solución

### Paso 1: Instalar dependencias actualizadas

Ejecuta estos comandos en tu terminal:

```bash
npm install @discordjs/voice@latest @noble/ciphers@latest
npm update discord-player discord.js
```

### Paso 2: Verificar compatibilidad

El código ya incluye verificación automática de compatibilidad. Si ves un mensaje de advertencia, asegúrate de tener instalado `@noble/ciphers`.

### Paso 3: Reiniciar el bot

Después de instalar las dependencias, reinicia tu bot:

```bash
npm start
```

## Alternativas de bibliotecas de cifrado

Si `@noble/ciphers` no funciona, puedes probar:

1. **sodium-native** (más rápido, requiere compilación):
   ```bash
   npm install sodium-native
   ```

2. **libsodium-wrappers** (JavaScript puro):
   ```bash
   npm install libsodium-wrappers
   ```

3. **sodium** (alternativa):
   ```bash
   npm install sodium
   ```

## Verificación

Para verificar que tu sistema es compatible, ejecuta en Node.js:

```javascript
require('node:crypto').getCiphers().includes('aes-256-gcm')
```

Si devuelve `true`, puedes usar la biblioteca incorporada de Node.js. Si devuelve `false`, necesitas instalar una de las bibliotecas mencionadas arriba.

## Notas

- Discord.js v14.14.1+ ya incluye soporte para los nuevos métodos de cifrado
- @discordjs/voice v0.18.0+ es necesario para compatibilidad completa
- El error debería desaparecer después de actualizar las dependencias






