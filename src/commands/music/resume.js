const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const config = require('../../config');
const MusicSystem = require('../../cogs/music/index');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Reanuda la reproducción'),
    cooldown: 3,
    async execute(interaction) {
        const musicSystem = interaction.client.musicSystem || new MusicSystem(interaction.client);
        if (!interaction.client.musicSystem) {
            interaction.client.musicSystem = musicSystem;
        }

        const queue = useQueue(interaction.guild.id);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('No hay música pausada.')],
                flags: 64
            });
        }

        if (!queue.node.isPaused()) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('▶️ Ya reproduciéndose').setDescription('La música ya está reproduciéndose.')],
                flags: 64
            });
        }

        queue.node.setPaused(false);

        // Actualizar embed si existe
        const musicQueue = musicSystem.getQueue(interaction.guild.id);
        if (musicQueue.current) {
            await musicSystem.sendMusicEmbed(interaction.guild.id, interaction.channel, musicQueue.current, false);
        }

        return interaction.reply({
            embeds: [new EmbedBuilder().setColor(config.embedColor).setTitle('▶️ Reanudado').setDescription('La reproducción ha sido reanudada.')]
        });
    }
};






