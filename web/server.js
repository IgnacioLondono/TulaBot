// Cargar variables de entorno desde la raíz del proyecto
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const session = require('express-session');
const DiscordOauth2 = require('discord-oauth2');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Determinar el puerto: BOT_API_PORT para el contenedor del bot, WEB_PORT para el frontend
// En Docker, el bot usa 3001 y el frontend usa 3000
const PORT = process.env.BOT_API_PORT || (process.env.WEB_ENABLED === 'true' ? (process.env.WEB_PORT || 3000) : 3001);
const WEB_ENABLED = process.env.WEB_ENABLED === 'true';

// Solo requerir CLIENT_ID y CLIENT_SECRET si el frontend está habilitado
if (WEB_ENABLED) {
    if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
        console.error('❌ Faltan CLIENT_ID o CLIENT_SECRET en .env (requeridos para frontend)');
        process.exit(1);
    }
}

// Configurar OAuth2 solo si el frontend está habilitado
let oauth = null;
if (WEB_ENABLED) {
    const redirectUri = process.env.REDIRECT_URI || `http://localhost:${PORT}/callback`;
    oauth = new DiscordOauth2({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri
    });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos solo si el frontend está habilitado
if (WEB_ENABLED) {
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(session({
        secret: process.env.SESSION_SECRET || 'cambia-esto-en-produccion',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, httpOnly: true, maxAge: 24*60*60*1000, sameSite: 'lax' },
        name: 'tulabot.session'
    }));
}

let botClient = null;

function setBotClient(client) { 
    botClient = client; 
    console.log('✅ botClient inyectado en el servidor web');
    console.log(`   Bot está listo: ${client.isReady()}`);
    console.log(`   Servidores: ${client.guilds.cache.size}`);
}

// Almacenar logs recientes
const recentLogs = [];
const MAX_LOGS = 500;

// Interceptar console.log para capturar logs
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

function addLog(level, message) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message: typeof message === 'string' ? message : JSON.stringify(message)
    };
    recentLogs.push(logEntry);
    if (recentLogs.length > MAX_LOGS) {
        recentLogs.shift();
    }
}

console.log = function(...args) {
    originalLog.apply(console, args);
    addLog('info', args.join(' '));
};

console.error = function(...args) {
    originalError.apply(console, args);
    addLog('error', args.join(' '));
};

console.warn = function(...args) {
    originalWarn.apply(console, args);
    addLog('warn', args.join(' '));
};

// Rutas de login y callback (solo si el frontend está habilitado)
if (WEB_ENABLED) {
    app.get('/login', (req, res) => {
        if (!oauth) {
            return res.status(503).send('Frontend no habilitado');
        }
        const state = Math.random().toString(36).substring(7);
        req.session.oauthState = state;
        const url = oauth.generateAuthUrl({ scope: ['identify', 'guilds'], state });
        res.redirect(url);
    });

    app.get('/callback', async (req, res) => {
        if (!oauth) {
            return res.status(503).send('Frontend no habilitado');
        }
        try {
            const { code, state } = req.query;
            if (!code || state !== req.session.oauthState) return res.redirect('/login?error=auth_failed');
            
            const tokenData = await oauth.tokenRequest({ code, scope: 'identify guilds', grantType: 'authorization_code' });
            const user = await oauth.getUser(tokenData.access_token);
            const guilds = await oauth.getUserGuilds(tokenData.access_token);
            
            req.session.user = user;
            req.session.guilds = guilds || [];
            delete req.session.oauthState;
            req.session.save(() => res.redirect('/'));
        } catch {
            res.redirect('/login?error=auth_failed');
        }
    });

    app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });
}

// Middleware de autenticación
function requireAuth(req, res, next) {
    // Si el frontend no está habilitado, permitir acceso sin autenticación (solo API)
    if (!WEB_ENABLED) {
        return next();
    }
    
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// Ruta de diagnóstico del bot
app.get('/api/bot-status', requireAuth, (req, res) => {
    res.json({
        available: botClient !== null,
        ready: botClient?.isReady() || false,
        guilds: botClient?.guilds.cache.size || 0,
        users: botClient?.users.cache.size || 0
    });
});

// Rutas protegidas
app.get('/api/user', requireAuth, (req, res) => {
    res.json({ user: req.session.user, guilds: req.session.guilds });
});

app.get('/api/guilds', requireAuth, async (req, res) => {
    try {
        if (!botClient) {
            return res.status(503).json({ error: 'Bot no disponible. Esperando conexión...' });
        }
        
        if (!botClient.isReady()) {
            return res.status(503).json({ error: 'Bot aún no está listo. Esperando conexión...' });
        }
        
        const guilds = req.session.guilds || [];
        const botGuilds = [];
        
        for (const guild of guilds) {
            const botGuild = botClient.guilds.cache.get(guild.id);
            if (botGuild) {
                botGuilds.push({
                    id: guild.id,
                    name: guild.name,
                    icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
                    permissions: guild.permissions,
                    botGuild: {
                        memberCount: botGuild.memberCount,
                        channels: botGuild.channels.cache.filter(c => c.type === 0 || c.type === 2).map(c => ({
                            id: c.id,
                            name: c.name,
                            type: c.type
                        }))
                    }
                });
            }
        }
        res.json(botGuilds);
    } catch (error) {
        console.error('Error obteniendo servidores:', error);
        res.status(500).json({ error: 'Error al obtener servidores' });
    }
});

app.get('/api/guild/:guildId/channels', requireAuth, async (req, res) => {
    try {
        const { guildId } = req.params;
        
        if (!botClient || !botClient.isReady()) {
            return res.status(503).json({ error: 'Bot no disponible. Esperando conexión...' });
        }

        const guild = botClient.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'Servidor no encontrado' });
        }

        // Verificar que el usuario tenga permisos en el servidor
        const userGuild = req.session.guilds?.find(g => g.id === guildId);
        if (!userGuild) {
            return res.status(403).json({ error: 'No tienes acceso a este servidor' });
        }

        const channels = guild.channels.cache
            .filter(channel => channel.type === 0 || channel.type === 2) // Solo texto y voz
            .map(channel => ({
                id: channel.id,
                name: channel.name,
                type: channel.type,
                typeName: channel.type === 0 ? 'texto' : 'voz'
            }));

        res.json(channels);
    } catch (error) {
        console.error('Error obteniendo canales:', error);
        res.status(500).json({ error: 'Error al obtener canales' });
    }
});

app.post('/api/send-embed', requireAuth, async (req, res) => {
    try {
        const { guildId, channelId, embed } = req.body;

        if (!botClient || !botClient.isReady()) {
            return res.status(503).json({ error: 'Bot no disponible. Esperando conexión...' });
        }

        const guild = botClient.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'Servidor no encontrado' });
        }

        const channel = guild.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'Canal no encontrado' });
        }

        // Verificar permisos
        if (!channel.permissionsFor(guild.members.me)?.has(['SendMessages', 'EmbedLinks'])) {
            return res.status(403).json({ error: 'El bot no tiene permisos en este canal' });
        }

        // Crear embed usando discord.js
        const { EmbedBuilder } = require('discord.js');
        const discordEmbed = new EmbedBuilder();

        if (embed.title) discordEmbed.setTitle(embed.title);
        if (embed.description) discordEmbed.setDescription(embed.description);
        if (embed.color) discordEmbed.setColor(parseInt(embed.color, 16));
        if (embed.footer) discordEmbed.setFooter({ text: embed.footer });
        if (embed.image) discordEmbed.setImage(embed.image);
        if (embed.thumbnail) discordEmbed.setThumbnail(embed.thumbnail);
        if (embed.timestamp) discordEmbed.setTimestamp();
        if (embed.author) {
            discordEmbed.setAuthor({
                name: embed.author.name || '',
                iconURL: embed.author.iconURL,
                url: embed.author.url
            });
        }
        if (embed.fields && Array.isArray(embed.fields)) {
            embed.fields.forEach(field => {
                if (field.name && field.value) {
                    discordEmbed.addFields({
                        name: field.name,
                        value: field.value,
                        inline: field.inline || false
                    });
                }
            });
        }

        await channel.send({ embeds: [discordEmbed] });

        console.log(`[Embed] ${req.session.user.username} envió un embed en ${guild.name}/${channel.name}`);

        res.json({ success: true, message: 'Embed enviado correctamente' });
    } catch (error) {
        console.error('Error enviando embed:', error);
        res.status(500).json({ error: error.message || 'Error al enviar embed' });
    }
});

app.get('/api/stats', requireAuth, (req, res) => {
    if (!botClient) {
        return res.status(503).json({ error: 'Bot no disponible. Esperando conexión...' });
    }
    
    if (!botClient.isReady()) {
        return res.status(503).json({ error: 'Bot aún no está listo. Esperando conexión...' });
    }
    
    res.json({
        guilds: botClient.guilds.cache.size,
        users: botClient.users.cache.size,
        channels: botClient.channels.cache.size,
        uptime: botClient.uptime,
        ping: botClient.ws.ping,
        commands: botClient.commands?.size || 0,
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
    });
});

app.get('/api/logs', requireAuth, (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const level = req.query.level;
    
    let logs = recentLogs.slice(-limit);
    if (level) {
        logs = logs.filter(log => log.level === level);
    }
    
    res.json(logs.reverse());
});

app.get('/api/commands', requireAuth, (req, res) => {
    if (!botClient) {
        return res.status(503).json({ error: 'Bot no disponible. Esperando conexión...' });
    }
    
    if (!botClient.isReady()) {
        return res.status(503).json({ error: 'Bot aún no está listo. Esperando conexión...' });
    }
    
    if (!botClient.commands) {
        return res.status(500).json({ error: 'Comandos no disponibles' });
    }

    const commandsPath = path.join(__dirname, '..', 'src', 'commands');
    
    const commands = Array.from(botClient.commands.values()).map(cmd => {
        // Intentar obtener la categoría de la ruta del archivo
        let category = 'other';
        
        // Buscar el archivo del comando en las carpetas
        try {
            const categories = ['config', 'fun', 'moderation', 'music', 'utility'];
            for (const cat of categories) {
                const catPath = path.join(commandsPath, cat);
                if (fs.existsSync(catPath)) {
                    const files = fs.readdirSync(catPath);
                    if (files.includes(`${cmd.data.name}.js`)) {
                        category = cat;
                        break;
                    }
                }
            }
        } catch (e) {
            console.error('Error determinando categoría:', e);
        }
        
        return {
            name: cmd.data.name,
            description: cmd.data.description || 'Sin descripción',
            category: category,
            options: (cmd.data.options || []).map(opt => ({
                name: opt.name,
                description: opt.description || 'Sin descripción',
                type: opt.type,
                required: opt.required || false
            }))
        };
    });

    res.json(commands);
});

app.get('/api/guild/:guildId/info', requireAuth, async (req, res) => {
    try {
        const { guildId } = req.params;
        
        if (!botClient || !botClient.isReady()) {
            return res.status(503).json({ error: 'Bot no disponible. Esperando conexión...' });
        }

        const guild = botClient.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'Servidor no encontrado' });
        }

        const userGuild = req.session.guilds?.find(g => g.id === guildId);
        if (!userGuild) {
            return res.status(403).json({ error: 'No tienes acceso a este servidor' });
        }

        const info = {
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL({ dynamic: true, size: 256 }),
            owner: {
                id: guild.ownerId,
                tag: guild.members.cache.get(guild.ownerId)?.user?.tag || 'Desconocido'
            },
            memberCount: guild.memberCount,
            channelCount: guild.channels.cache.size,
            roleCount: guild.roles.cache.size,
            createdAt: guild.createdAt.toISOString(),
            features: guild.features,
            verificationLevel: guild.verificationLevel,
            premiumTier: guild.premiumTier,
            premiumSubscriptionCount: guild.premiumSubscriptionCount || 0,
            channels: {
                text: guild.channels.cache.filter(c => c.type === 0).size,
                voice: guild.channels.cache.filter(c => c.type === 2).size,
                category: guild.channels.cache.filter(c => c.type === 4).size
            },
            roles: guild.roles.cache.map(role => ({
                id: role.id,
                name: role.name,
                color: role.hexColor,
                position: role.position,
                members: role.members.size
            })).sort((a, b) => b.position - a.position).slice(0, 20),
            emojis: guild.emojis.cache.size,
            stickers: guild.stickers?.cache?.size || 0
        };

        res.json(info);
    } catch (error) {
        console.error('Error obteniendo información del servidor:', error);
        res.status(500).json({ error: 'Error al obtener información del servidor' });
    }
});

app.post('/api/moderate', requireAuth, async (req, res) => {
    try {
        const { guildId, action, userId, reason } = req.body;

        if (!botClient || !botClient.isReady()) {
            return res.status(503).json({ error: 'Bot no disponible. Esperando conexión...' });
        }

        const guild = botClient.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'Servidor no encontrado' });
        }

        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const moderator = req.session.user.username;
        const actionReason = reason || `Moderado por ${moderator} desde el panel web`;

        let result;
        switch (action) {
            case 'kick':
                await member.kick(actionReason);
                result = { success: true, message: `Usuario ${member.user.tag} expulsado` };
                break;
            case 'ban':
                await member.ban({ reason: actionReason });
                result = { success: true, message: `Usuario ${member.user.tag} baneado` };
                break;
            case 'timeout':
                const duration = req.body.duration || 600000; // 10 minutos por defecto
                await member.timeout(duration, actionReason);
                result = { success: true, message: `Usuario ${member.user.tag} silenciado` };
                break;
            case 'removeTimeout':
                await member.timeout(null);
                result = { success: true, message: `Timeout removido de ${member.user.tag}` };
                break;
            default:
                return res.status(400).json({ error: 'Acción no válida' });
        }

        console.log(`[Moderación] ${moderator} ejecutó ${action} en ${member.user.tag} en ${guild.name}`);
        res.json(result);
    } catch (error) {
        console.error('Error en moderación:', error);
        res.status(500).json({ error: error.message || 'Error al ejecutar acción de moderación' });
    }
});

app.get('/api/guild/:guildId/members', requireAuth, async (req, res) => {
    try {
        const { guildId } = req.params;
        const query = req.query.q || '';
        
        if (!botClient || !botClient.isReady()) {
            return res.status(503).json({ error: 'Bot no disponible. Esperando conexión...' });
        }

        const guild = botClient.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'Servidor no encontrado' });
        }

        await guild.members.fetch();
        
        let members = Array.from(guild.members.cache.values())
            .filter(m => !m.user.bot)
            .map(m => ({
                id: m.user.id,
                username: m.user.username,
                discriminator: m.user.discriminator,
                tag: m.user.tag,
                avatar: m.user.displayAvatarURL({ dynamic: true }),
                joinedAt: m.joinedAt?.toISOString(),
                roles: m.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.hexColor }))
            }));

        if (query) {
            const lowerQuery = query.toLowerCase();
            members = members.filter(m => 
                m.username.toLowerCase().includes(lowerQuery) ||
                m.tag.toLowerCase().includes(lowerQuery)
            );
        }

        res.json(members.slice(0, 50));
    } catch (error) {
        console.error('Error obteniendo miembros:', error);
        res.status(500).json({ error: 'Error al obtener miembros' });
    }
});

// Ruta principal (solo si el frontend está habilitado)
if (WEB_ENABLED) {
    app.get('/', (req, res) => {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
} else {
    // Si solo es API, responder con información del servidor
    app.get('/', (req, res) => {
        res.json({
            service: 'TulaBot API',
            status: 'running',
            botReady: botClient?.isReady() || false,
            endpoints: {
                stats: '/api/stats',
                guilds: '/api/guilds',
                commands: '/api/commands',
                botStatus: '/api/bot-status'
            }
        });
    });
}

// Iniciar servidor
// Escuchar en 0.0.0.0 para permitir acceso desde otros contenedores Docker
const HOST = process.env.BOT_API_HOST || '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
    if (WEB_ENABLED) {
        console.log(`🌐 Panel web iniciado en http://${HOST}:${PORT}`);
    } else {
        console.log(`🌐 Servidor API iniciado en http://${HOST}:${PORT}`);
        console.log(`   Modo: Solo API (frontend deshabilitado)`);
    }
}).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Error: El puerto ${PORT} ya está en uso`);
    } else {
        console.error(`❌ Error iniciando servidor:`, error);
    }
});

module.exports = { setBotClient, app, server };
