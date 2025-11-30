const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue, QueueRepeatMode } = require('discord-player');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Activa/desactiva el bucle')
        .addStringOption(option =>
            option.setName('modo')
                .setDescription('Modo de bucle')
                .setRequired(true)
                .addChoices(
                    { name: 'Desactivado', value: 'off' },
                    { name: 'Canción', value: 'track' },
                    { name: 'Cola', value: 'queue' }
                )),
    cooldown: 3,
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);
        const mode = interaction.options.getString('modo');

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('No hay música reproduciéndose.')],
                flags: 64
            });
        }

        let repeatMode;
        let description;

        switch (mode) {
            case 'off':
                repeatMode = QueueRepeatMode.OFF;
                description = 'Bucle desactivado';
                break;
            case 'track':
                repeatMode = QueueRepeatMode.TRACK;
                description = 'Bucle de canción activado';
                break;
            case 'queue':
                repeatMode = QueueRepeatMode.QUEUE;
                description = 'Bucle de cola activado';
                break;
            default:
                repeatMode = QueueRepeatMode.OFF;
                description = 'Bucle desactivado';
        }

        queue.setRepeatMode(repeatMode);

        return interaction.reply({
            embeds: [new EmbedBuilder().setColor(config.embedColor).setTitle('🔁 Bucle').setDescription(description)]
        });
    }
};


