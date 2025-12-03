// ⚠️ IMPORTANTE: Configurar cifrado ANTES de importar discord-player
// Esto asegura que discord-voip use los métodos de cifrado correctos
process.env.DISCORD_VOICE_ENCRYPTION_MODE = 'aead_aes256_gcm_rtpsize';

// Verificar que @noble/ciphers esté instalado (se cargará automáticamente cuando sea necesario)
try {
    require.resolve('@noble/ciphers');
    console.log('✅ @noble/ciphers disponible');
} catch (e) {
    console.warn('⚠️ @noble/ciphers no encontrado. Instálalo con: npm install @noble/ciphers');
}

const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const { Player } = require('discord-player');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Configurar ytdl-core para usar @distube/ytdl-core
// Esto asegura que discord-player use la versión más estable
try {
    const ytdl = require('@distube/ytdl-core');
    // Forzar que discord-player use @distube/ytdl-core
    if (typeof ytdl !== 'undefined') {
        console.log('✅ @distube/ytdl-core cargado correctamente');
    }
} catch (e) {
    console.warn('⚠️ No se pudo cargar @distube/ytdl-core:', e.message);
}

// Verificar compatibilidad de cifrado
const crypto = require('node:crypto');
const ciphers = crypto.getCiphers();
const hasAES256GCM = ciphers.includes('aes-256-gcm');

if (hasAES256GCM) {
    console.log('✅ Node.js soporta AES-256-GCM nativamente');
} else {
    console.warn('⚠️ AES-256-GCM no disponible en Node.js, usando @noble/ciphers');
}

// Inicializar Discord Player con configuración optimizada
const player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
        filter: 'audioonly',
        requestOptions: {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        }
    },
    connectionTimeout: 30000, // Reducido a 30 segundos
    smoothVolume: true,
    skipFFmpeg: false,
    useLegacyFFmpeg: false,
    // Optimizaciones para mejorar el rendimiento
    bufferingTimeout: 5000,
    leaveOnStop: false,
    leaveOnEmpty: true,
    leaveOnEmptyCooldown: 60000,
    leaveOnEnd: false
});

// Registrar extractores de forma específica para evitar conflictos
(async () => {
    try {
        // En discord-player@7.1.0+ se usa loadMulti en lugar de loadDefault
        const { DefaultExtractors } = require('@discord-player/extractor');
        await player.extractors.loadMulti(DefaultExtractors);
        
        // Verificar que se cargaron correctamente
        const loadedExtractors = Array.from(player.extractors.store.keys());
        console.log('✅ Extractores cargados correctamente:', loadedExtractors.join(', '));
    } catch (error) {
        console.error('⚠️ Error cargando extractores:', error);
        // Intentar cargar extractores individualmente como fallback
        try {
            const extractors = require('@discord-player/extractor');
            if (extractors.YouTubeExtractor) {
                await player.extractors.register(extractors.YouTubeExtractor, {});
                console.log('✅ Extractores cargados (solo YouTube)');
            } else {
                console.error('⚠️ YouTubeExtractor no disponible');
            }
        } catch (fallbackError) {
            console.error('⚠️ Error crítico cargando extractores:', fallbackError);
        }
    }
})();

client.player = player;

// Inicializar sistema de música
const MusicSystem = require('./cogs/music/index');
client.musicSystem = new MusicSystem(client);
console.log('✅ Sistema de música inicializado');

// Eventos del player
player.events.on('playerStart', (queue, track) => {
    const metadata = queue.metadata;
    if (metadata && metadata.channel && client.musicSystem) {
        const Song = require('./cogs/music/Song');
        const musicQueue = client.musicSystem.getQueue(queue.guild.id);
        
        // Agregar canción actual a la cola
        if (!musicQueue.current || musicQueue.current.url !== track.url) {
            const song = new Song(track, track.requestedBy);
            musicQueue.current = song;
            
            // Enviar embed con botones
            client.musicSystem.sendMusicEmbed(queue.guild.id, metadata.channel, song, false);
        }
    } else if (metadata && metadata.channel) {
        // Fallback al método anterior
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor(require('./config').embedColor)
            .setTitle('🎵 Reproduciendo')
            .setDescription(`**${track.title}**\n${track.url}`)
            .setThumbnail(track.thumbnail)
            .setFooter({ text: `Solicitado por ${track.requestedBy.tag}` });
        metadata.channel.send({ embeds: [embed] }).catch(console.error);
    }
});

player.events.on('error', (queue, error) => {
    console.error('Error del player:', error);
    const metadata = queue.metadata;
    if (metadata && metadata.channel) {
        metadata.channel.send({
            embeds: [new (require('discord.js').EmbedBuilder)()
                .setColor('#FFA500')
                .setTitle('❌ Error de Reproducción')
                .setDescription(`Ocurrió un error: ${error.message || 'Error desconocido'}`)]
        }).catch(console.error);
    }
});

// Evento cuando se vacía la cola
player.events.on('emptyQueue', (queue) => {
    if (client.musicSystem) {
        const musicQueue = client.musicSystem.getQueue(queue.guild.id);
        musicQueue.clear();
        
        // Desactivar botones
        const MusicControlView = require('./cogs/music/components/MusicControlView');
        const view = new MusicControlView(client.musicSystem, queue.guild.id);
        const disabledComponents = view.createDisabledComponents();
        
        if (client.musicSystem.musicMessages.has(queue.guild.id)) {
            try {
                client.musicSystem.musicMessages.get(queue.guild.id).edit({
                    content: '🎵 La cola ha terminado',
                    embeds: [],
                    components: disabledComponents
                }).catch(console.error);
            } catch (error) {
                // Ignorar errores
            }
        }
    }
});

player.events.on('playerError', (queue, error) => {
    console.error('Error del player (playerError):', error);
    const metadata = queue.metadata;
    if (metadata && metadata.channel) {
        metadata.channel.send({
            embeds: [new (require('discord.js').EmbedBuilder)()
                .setColor('#FFA500')
                .setTitle('❌ Error de Reproducción')
                .setDescription(`No se pudo reproducir la canción. Intenta con otra.`)]
        }).catch(console.error);
    }
});

player.events.on('debug', (queue, message) => {
    // Solo loguear errores importantes
    if (message.includes('Failed') || message.includes('Error') || message.includes('ERR_')) {
        console.log(`[Player Debug] ${message}`);
    }
});
client.commands = new Collection();
client.cooldowns = new Collection();

// Inicializar base de datos MySQL
const database = require('./utils/database');
database.init().then(() => {
    console.log('✅ Base de datos MySQL inicializada');
}).catch(error => {
    console.error('❌ Error inicializando base de datos:', error.message);
    console.warn('⚠️ El bot continuará funcionando, pero algunas funciones pueden no estar disponibles.');
    console.warn('💡 Verifica las variables de entorno: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    // No detener el bot, permitir que continúe funcionando
    // Las funciones que requieren DB fallarán de forma controlada
});

// Cargar comandos
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`✅ Comando cargado: ${command.data.name}`);
        } else {
            console.log(`⚠️ El comando en ${filePath} no tiene las propiedades requeridas.`);
        }
    }
}

// Cargar eventos
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Manejo de errores
process.on('unhandledRejection', error => {
    console.error('Error no manejado:', error);
});

// Iniciar servidor API del bot
// El servidor API debe iniciarse cuando BOT_API_PORT está definido (modo Docker)
// En Docker, el archivo web/server.js se copia como web_api.js en la raíz del proyecto
// (fs y path ya están importados al inicio del archivo)

// Solo intentar cargar el módulo del servidor API si BOT_API_PORT está definido
if (process.env.BOT_API_PORT) {
    try {
        let apiModule = null;
        const webApiPath = path.join(__dirname, '..', 'web_api.js');
        const webServerPath = path.join(__dirname, '..', 'web', 'server.js');
        
        // Intentar cargar desde web_api.js (Docker) primero
        if (fs.existsSync(webApiPath)) {
            try {
                apiModule = require(webApiPath);
            } catch (e) {
                console.warn('⚠️ No se pudo cargar web_api.js:', e.message);
            }
        }
        
        // Si no se cargó, intentar desde web/server.js (desarrollo)
        if (!apiModule && fs.existsSync(webServerPath)) {
            try {
                apiModule = require(webServerPath);
            } catch (e) {
                console.warn('⚠️ No se pudo cargar web/server.js:', e.message);
            }
        }
        
        if (apiModule && apiModule.setBotClient && apiModule.startServer) {
            const { setBotClient, startServer } = apiModule;
            
            // Inyectar cliente e iniciar servidor cuando el bot esté listo
            client.once('ready', () => {
                // Inyectar el cliente de Discord en el módulo de la API
                setBotClient(client);
                
                const apiPort = parseInt(process.env.BOT_API_PORT) || 3001;
                const apiHost = process.env.BOT_API_HOST || '0.0.0.0';
                
                console.log(`🚀 Iniciando servidor API del bot en ${apiHost}:${apiPort}...`);
                startServer(apiPort, apiHost);
            });
        } else {
            console.log('ℹ️ Módulo del servidor API no disponible. El panel web no estará disponible.');
            console.log('💡 En Docker, el panel web se ejecuta como un servicio separado.');
        }
    } catch (error) {
        console.warn('⚠️ Error cargando módulo del servidor API:', error.message);
        console.log('💡 El bot continuará funcionando, pero el panel web no estará disponible.');
        console.log('💡 En Docker, el panel web se ejecuta como un servicio separado.');
    }
} else {
    console.log('ℹ️ BOT_API_PORT no está definido. El servidor API no se iniciará.');
    console.log('💡 En Docker, el panel web se ejecuta como un servicio separado.');
}

// Validar token antes de iniciar sesión
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN no está definido en las variables de entorno');
    console.error('💡 Configura DISCORD_TOKEN en tu archivo .env o variables de entorno');
    process.exit(1);
}

// Iniciar sesión con Discord
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('❌ Error al iniciar sesión con Discord:', error.message);
    if (error.code === 'TokenInvalid') {
        console.error('💡 El token de Discord es inválido. Verifica DISCORD_TOKEN en tus variables de entorno.');
    }
    process.exit(1);
});

