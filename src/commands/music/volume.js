const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Ajusta el volumen (0-100)')
        .addIntegerOption(option =>
            option.setName('volumen')
                .setDescription('Volumen (0-100)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)),
    cooldown: 3,
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);
        const volume = interaction.options.getInteger('volumen');

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('No hay música reproduciéndose.')],
                flags: 64
            });
        }

        queue.node.setVolume(volume);

        return interaction.reply({
            embeds: [new EmbedBuilder().setColor(config.embedColor).setTitle('🔊 Volumen').setDescription(`Volumen establecido en ${volume}%`)]
        });
    }
};






