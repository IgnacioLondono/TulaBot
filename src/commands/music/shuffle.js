const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const config = require('../../config');
const MusicSystem = require('../../cogs/music/index');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Mezcla la cola de reproducción'),
    cooldown: 3,
    async execute(interaction) {
        const musicSystem = interaction.client.musicSystem || new MusicSystem(interaction.client);
        if (!interaction.client.musicSystem) {
            interaction.client.musicSystem = musicSystem;
        }

        const musicQueue = musicSystem.getQueue(interaction.guild.id);

        if (!musicQueue || musicQueue.queue.length < 2) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('Necesitas al menos 2 canciones en la cola para aleatorizar.')],
                flags: 64
            });
        }

        musicQueue.shuffle();

        return interaction.reply({
            embeds: [new EmbedBuilder().setColor(config.embedColor).setTitle('🔀 Mezclado').setDescription('La cola ha sido mezclada.')]
        });
    }
};






