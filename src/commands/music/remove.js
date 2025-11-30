const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const config = require('../../config');
const MusicSystem = require('../../cogs/music/index');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Elimina una canción de la cola')
        .addIntegerOption(option =>
            option.setName('posicion')
                .setDescription('Posición de la canción en la cola')
                .setRequired(true)
                .setMinValue(1)),
    cooldown: 3,
    async execute(interaction) {
        const musicSystem = interaction.client.musicSystem || new MusicSystem(interaction.client);
        if (!interaction.client.musicSystem) {
            interaction.client.musicSystem = musicSystem;
        }

        const musicQueue = musicSystem.getQueue(interaction.guild.id);
        const position = interaction.options.getInteger('posicion');

        if (!musicQueue || musicQueue.queue.length === 0) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('La cola está vacía.')],
                flags: 64
            });
        }

        if (position > musicQueue.queue.length) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('Posición inválida.')],
                flags: 64
            });
        }

        const song = musicQueue.queue[position - 1];
        if (!song) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('No se encontró la canción en esa posición.')],
                flags: 64
            });
        }

        musicQueue.remove(position - 1);

        // También remover del player si existe
        const queue = useQueue(interaction.guild.id);
        if (queue && queue.tracks.size > 0) {
            const track = queue.tracks.at(position - 1);
            if (track) {
                queue.removeTrack(track);
            }
        }

        return interaction.reply({
            embeds: [new EmbedBuilder().setColor(config.embedColor).setTitle('🗑️ Eliminado').setDescription(`Se eliminó: **${song.title}**`)]
        });
    }
};


