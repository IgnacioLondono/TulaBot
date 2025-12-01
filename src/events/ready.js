const { ActivityType } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    name: 'clientReady',
    once: true,
    execute(client) {
        logger.info(`✅ Bot conectado como ${client.user.tag}`);
        logger.info(`📊 Servidores: ${client.guilds.cache.size}`);
        logger.info(`👥 Usuarios: ${client.users.cache.size}`);
        logger.info(`📝 Comandos cargados: ${client.commands.size}`);

        // Inyectar el cliente en el servidor web cuando el bot esté listo
        if (process.env.WEB_ENABLED === 'true') {
            try {
                // Intentar cargar el módulo del servidor web
                const webServer = require('../../web/server');
                if (webServer && webServer.setBotClient) {
                    webServer.setBotClient(client);
                    logger.info('✅ Cliente del bot inyectado en el panel web');
                    logger.info(`   Bot está listo: ${client.isReady()}`);
                    logger.info(`   Servidores: ${client.guilds.cache.size}`);
                } else {
                    logger.error('⚠️ setBotClient no está disponible en el módulo del servidor web');
                }
            } catch (error) {
                logger.error('⚠️ Error inyectando cliente en panel web:', error.message);
                logger.error('   Stack:', error.stack);
            }
        }

        // Actividades rotativas
        const activities = [
            { name: `${client.guilds.cache.size} servidores`, type: ActivityType.Watching },
            { name: '!help para ayuda', type: ActivityType.Playing },
            { name: 'Música y Moderación', type: ActivityType.Listening }
        ];

        let i = 0;
        setInterval(() => {
            client.user.setActivity(activities[i]);
            i = (i + 1) % activities.length;
        }, 10000);
    }
};


