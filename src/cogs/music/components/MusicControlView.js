const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class MusicControlView {
    constructor(musicCog, guildId) {
        this.musicCog = musicCog;
        this.guildId = guildId;
    }

    createComponents(isPaused = false) {
        const row = new ActionRowBuilder();

        // Botón Anterior (placeholder)
        const previousButton = new ButtonBuilder()
            .setCustomId(`music_previous_${this.guildId}`)
            .setEmoji('⏮️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true); // Deshabilitado por ahora

        // Botón Pausar/Reanudar
        const pauseResumeButton = new ButtonBuilder()
            .setCustomId(`music_pause_resume_${this.guildId}`)
            .setEmoji(isPaused ? '▶️' : '⏯️')
            .setStyle(ButtonStyle.Primary);

        // Botón Saltar
        const skipButton = new ButtonBuilder()
            .setCustomId(`music_skip_${this.guildId}`)
            .setEmoji('⏭️')
            .setStyle(ButtonStyle.Secondary);

        // Botón Detener
        const stopButton = new ButtonBuilder()
            .setCustomId(`music_stop_${this.guildId}`)
            .setEmoji('⏹️')
            .setStyle(ButtonStyle.Danger);

        // Botón Aleatorizar
        const shuffleButton = new ButtonBuilder()
            .setCustomId(`music_shuffle_${this.guildId}`)
            .setEmoji('🔀')
            .setStyle(ButtonStyle.Secondary);

        row.addComponents(previousButton, pauseResumeButton, skipButton, stopButton, shuffleButton);

        return [row];
    }

    createDisabledComponents() {
        const row = new ActionRowBuilder();

        const buttons = [
            new ButtonBuilder()
                .setCustomId(`music_previous_${this.guildId}`)
                .setEmoji('⏮️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId(`music_pause_resume_${this.guildId}`)
                .setEmoji('⏯️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId(`music_skip_${this.guildId}`)
                .setEmoji('⏭️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId(`music_stop_${this.guildId}`)
                .setEmoji('⏹️')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId(`music_shuffle_${this.guildId}`)
                .setEmoji('🔀')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        ];

        row.addComponents(...buttons);
        return [row];
    }
}

module.exports = MusicControlView;






