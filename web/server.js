// Cargar variables de entorno desde la raíz del proyecto
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const session = require('express-session');
const DiscordOauth2 = require('discord-oauth2');
const cors = require('cors');

const app = express();
const PORT = process.env.WEB_PORT || 3000;

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    console.error('❌ Faltan CLIENT_ID o CLIENT_SECRET en .env');
    process.exit(1);
}

const redirectUri = process.env.REDIRECT_URI || `http://localhost:${PORT}/callback`;

const oauth = new DiscordOauth2({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'cambia-esto-en-produccion',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24*60*60*1000, sameSite: 'lax' },
    name: 'tulabot.session'
}));

let botClient = null;

function setBotClient(client) { botClient = client; }

// Rutas de login y callback
app.get('/login', (req, res) => {
    const state = Math.random().toString(36).substring(7);
    req.session.oauthState = state;
    const url = oauth.generateAuthUrl({ scope: ['identify', 'guilds'], state });
    res.redirect(url);
});

app.get('/callback', async (req, res) => {
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

// Middleware de autenticación
function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// Rutas protegidas
app.get('/api/user', requireAuth, (req, res) => {
    res.json({ user: req.session.user, guilds: req.session.guilds });
});

app.get('/api/guilds', requireAuth, async (req, res) => {
    try {
        const guilds = req.session.guilds || [];
        const botGuilds = [];
        if (botClient) {
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
        }
        res.json(botGuilds);
    } catch (error) {
        console.error('Error obteniendo servidores:', error);
        res.status(500).json({ error: 'Error al obtener servidores' });
    }
});

app.get('/api/stats', requireAuth, (req, res) => {
    if (!botClient) {
        return res.status(500).json({ error: 'Bot no disponible' });
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

// Ruta principal
app.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`🌐 Panel web iniciado en http://localhost:${PORT}`);
}).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Error: El puerto ${PORT} ya está en uso`);
    } else {
        console.error(`❌ Error iniciando panel web:`, error);
    }
});

module.exports = { setBotClient, app, server };
