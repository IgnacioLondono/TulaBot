const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const config = require('../../config');
const MusicSystem = require('../../cogs/music/index');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Muestra la cola de reproducción'),
    cooldown: 3,
    async execute(interaction) {
        const musicSystem = interaction.client.musicSystem || new MusicSystem(interaction.client);
        if (!interaction.client.musicSystem) {
            interaction.client.musicSystem = musicSystem;
        }

        const queue = useQueue(interaction.guild.id);
        const musicQueue = musicSystem.getQueue(interaction.guild.id);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('No hay música reproduciéndose.')],
                flags: 64
            });
        }

        const info = musicQueue.getQueueInfo();

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle('📋 Cola de Música')
            .setDescription(info)
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};


