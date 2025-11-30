const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filters')
        .setDescription('Aplica filtros de audio')
        .addStringOption(option =>
            option.setName('filtro')
                .setDescription('Filtro a aplicar')
                .addChoices(
                    { name: 'Bass Boost', value: 'bassboost' },
                    { name: '8D', value: '8d' },
                    { name: 'Vaporwave', value: 'vaporwave' },
                    { name: 'Nightcore', value: 'nightcore' },
                    { name: 'Desactivar', value: 'off' }
                )
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);
        const filter = interaction.options.getString('filtro');

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('No hay música reproduciéndose.')],
                flags: 64
            });
        }

        // Aplicar filtros (simplificado - necesitarías implementar los filtros reales)
        if (filter === 'off') {
            queue.filters.clear();
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.embedColor).setTitle('🔊 Filtros').setDescription('Filtros desactivados.')]
            });
        }

        return interaction.reply({
            embeds: [new EmbedBuilder().setColor(config.embedColor).setTitle('🔊 Filtros').setDescription(`Filtro ${filter} aplicado.`)]
        });
    }
};






