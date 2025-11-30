# 🔧 Solución de Problemas - Panel Web

## Error: "Cuerpo del formulario no válido" (Invalid form body)

Este error ocurre cuando Discord rechaza la solicitud de OAuth2. Sigue estos pasos:

### ✅ Verificación 1: Redirect URI registrado

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecciona tu aplicación
3. Ve a **OAuth2** > **General**
4. En **Redirects**, verifica que tengas EXACTAMENTE:
   ```
   http://localhost:3000/callback
   ```
5. Si no está, agrégalo y guarda

### ✅ Verificación 2: Variables de entorno

Verifica que tu archivo `.env` en la **raíz del proyecto** tenga:

```env
CLIENT_ID=tu_client_id_aqui
CLIENT_SECRET=tu_client_secret_aqui
REDIRECT_URI=http://localhost:3000/callback
```

⚠️ **IMPORTANTE**:
- `CLIENT_ID` debe ser el mismo que usas para el bot
- `CLIENT_SECRET` es diferente al token del bot (lo obtienes de OAuth2)
- `REDIRECT_URI` debe coincidir EXACTAMENTE con el registrado en Discord

### ✅ Verificación 3: Reiniciar el servidor

Después de cambiar las variables de entorno:

1. Detén el bot (Ctrl+C)
2. Inicia nuevamente: `npm start`
3. Verifica en la consola que aparezca:
   ```
   🔐 OAuth2 configurado:
      Client ID: ✅ Configurado
      Client Secret: ✅ Configurado
      Redirect URI: http://localhost:3000/callback
   ```

### ✅ Verificación 4: URL correcta

Cuando hagas clic en "Login", la URL debe ser algo como:
```
https://discord.com/oauth2/authorize?client_id=TU_CLIENT_ID&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&response_type=code&scope=identify%20guilds&state=...
```

Si no aparece `client_id` en la URL, el problema es que `CLIENT_ID` no está configurado.

## Error: "Bot no disponible"

**Causa**: El bot no está ejecutándose o no se inyectó correctamente.

**Solución**:
1. Verifica que el bot esté ejecutándose
2. Verifica que `WEB_ENABLED=true` en `.env`
3. Reinicia el bot

## Error: "No se muestran servidores"

**Causa**: El bot no está en los servidores o el usuario no tiene permisos.

**Solución**:
1. Asegúrate de que el bot esté en los servidores
2. Verifica que el usuario esté autenticado correctamente
3. El panel solo muestra servidores donde el bot está presente

## Error: "Error de autenticación"

**Causa**: Problema con OAuth2 o sesión expirada.

**Solución**:
1. Cierra sesión y vuelve a iniciar
2. Verifica que `CLIENT_SECRET` sea correcto
3. Verifica que `REDIRECT_URI` coincida exactamente
4. Limpia las cookies del navegador si persiste

## El panel no se inicia

**Verifica**:
1. ¿Está `WEB_ENABLED=true` en `.env`?
2. ¿Están instaladas las dependencias? (`cd web && npm install`)
3. ¿Hay errores en la consola del bot?
4. ¿El puerto 3000 está disponible?

## Debugging

Para ver más información, revisa la consola del bot cuando inicies. Deberías ver:

```
✅ Panel web habilitado
🌐 Panel web iniciado en http://localhost:3000
🔐 OAuth2 configurado:
   Client ID: ✅ Configurado
   Client Secret: ✅ Configurado
   Redirect URI: http://localhost:3000/callback
```

Si ves errores, compártelos para diagnosticar el problema.






