const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Salta a un tiempo específico en la canción')
        .addStringOption(option =>
            option.setName('tiempo')
                .setDescription('Tiempo (formato: MM:SS o segundos)')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);
        const timeString = interaction.options.getString('tiempo');

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('No hay música reproduciéndose.')],
                flags: 64
            });
        }

        let timeMs = 0;
        if (timeString.includes(':')) {
            const [minutes, seconds] = timeString.split(':').map(Number);
            timeMs = (minutes * 60 + seconds) * 1000;
        } else {
            timeMs = parseInt(timeString) * 1000;
        }

        try {
            const success = await queue.node.seek(timeMs);
            if (success) {
                return interaction.reply({
                    embeds: [new EmbedBuilder().setColor(config.embedColor).setTitle('⏩ Saltado').setDescription(`Saltado a ${timeString}`)]
                });
            } else {
                return interaction.reply({
                    embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('No se pudo saltar a ese tiempo.')],
                    flags: 64
                });
            }
        } catch (error) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription(`Tiempo inválido: ${error.message}`)],
                flags: 64
            });
        }
    }
};


