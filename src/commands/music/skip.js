const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const config = require('../../config');
const MusicSystem = require('../../cogs/music/index');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Salta a la siguiente canción'),
    cooldown: 3,
    async execute(interaction) {
        const musicSystem = interaction.client.musicSystem || new MusicSystem(interaction.client);
        if (!interaction.client.musicSystem) {
            interaction.client.musicSystem = musicSystem;
        }

        const queue = useQueue(interaction.guild.id);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('No hay música reproduciéndose.')],
                flags: 64
            });
        }

        const musicQueue = musicSystem.getQueue(interaction.guild.id);
        const currentTrack = musicQueue.current || queue.currentTrack;
        queue.node.skip();

        return interaction.reply({
            embeds: [new EmbedBuilder().setColor(config.embedColor).setTitle('⏭️ Saltado').setDescription(`Se saltó: **${currentTrack ? currentTrack.title : 'Canción actual'}**`)]
        });
    }
};






