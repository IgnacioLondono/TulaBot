const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

class Song {
    constructor(track, requestedBy) {
        // Extraer información del track de discord-player
        this.title = track.title || 'Sin título';
        this.url = track.url || track.uri || '';
        this.duration = track.duration || 'Desconocida';
        this.thumbnail = track.thumbnail || track.artwork || null;
        this.author = track.author || track.uploader || 'Desconocido';
        this.requestedBy = requestedBy;
        this.requester = requestedBy; // Alias para compatibilidad
        this.track = track; // Guardar el track original por si se necesita
        
        // Formatear duración si es un número (milisegundos)
        if (typeof this.duration === 'number') {
            const seconds = Math.floor(this.duration / 1000);
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            this.duration = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }

    createEmbed(isPaused = false, queueLength = 0) {
        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(isPaused ? '⏸️ Pausado' : '🎵 Reproduciendo')
            .setDescription(`**${this.title}**`)
            .addFields(
                { name: '👤 Artista', value: this.author, inline: true },
                { name: '⏱️ Duración', value: this.duration, inline: true }
            );

        if (this.thumbnail) {
            embed.setThumbnail(this.thumbnail);
        }

        if (this.url) {
            embed.setURL(this.url);
        }

        if (this.requestedBy) {
            const requesterName = this.requestedBy.tag || this.requestedBy.username || 'Desconocido';
            embed.setFooter({ text: `Solicitado por ${requesterName}${queueLength > 0 ? ` • ${queueLength} en cola` : ''}` });
        } else if (queueLength > 0) {
            embed.setFooter({ text: `${queueLength} en cola` });
        }

        return embed;
    }
}

module.exports = Song;
