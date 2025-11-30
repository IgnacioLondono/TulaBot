const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const Song = require('../cogs/music/Song');
const MusicSystem = require('../cogs/music/index');

module.exports = {
    name: 'player',
    execute(queue, event) {
        const { track, error } = event;

        switch (event.type) {
            case 'trackStart':
                // Agregar a nuestra cola personalizada
                if (queue.metadata && queue.metadata.client && queue.metadata.client.musicSystem) {
                    const musicSystem = queue.metadata.client.musicSystem;
                    const musicQueue = musicSystem.getQueue(queue.guild.id);
                    
                    // Verificar si la canción ya está en la cola
                    if (!musicQueue.current || musicQueue.current.url !== track.url) {
                        const song = new Song(track, track.requestedBy);
                        musicQueue.current = song;
                        
                        // Enviar embed con botones
                        if (queue.metadata.channel) {
                            musicSystem.sendMusicEmbed(queue.guild.id, queue.metadata.channel, song, false);
                        }
                    }
                } else {
                    // Fallback al método anterior
                    const embed = new EmbedBuilder()
                        .setColor(config.embedColor)
                        .setTitle('🎵 Reproduciendo')
                        .setDescription(`**${track.title}**\n${track.url}`)
                        .setThumbnail(track.thumbnail)
                        .setFooter({ text: `Solicitado por ${track.requestedBy.tag}` });
                    if (queue.metadata && queue.metadata.channel) {
                        queue.metadata.channel.send({ embeds: [embed] }).catch(console.error);
                    }
                }
                break;

            case 'trackEnd':
                // Track terminó - actualizar cola
                if (queue.metadata && queue.metadata.client && queue.metadata.client.musicSystem) {
                    const musicSystem = queue.metadata.client.musicSystem;
                    const musicQueue = musicSystem.getQueue(queue.guild.id);
                    
                    // Si hay más canciones en la cola, la siguiente se reproducirá automáticamente
                    // Si no, el player manejará la desconexión
                }
                break;

            case 'error':
                if (queue.metadata && queue.metadata.channel) {
                    queue.metadata.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor('#FFA500')
                            .setTitle('❌ Error de Reproducción')
                            .setDescription(`Ocurrió un error: ${error.message || 'Error desconocido'}`)]
                    }).catch(console.error);
                }
                break;
        }
    }
};






