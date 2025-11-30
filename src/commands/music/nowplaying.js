const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const config = require('../../config');
const MusicSystem = require('../../cogs/music/index');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Muestra la canción que se está reproduciendo'),
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

        if (!musicQueue.current) {
            // Si no hay en nuestra cola, usar la del player
            const track = queue.currentTrack;
            const song = new (require('../../cogs/music/Song'))(track, track.requestedBy);
            const embed = song.createEmbed(queue.node.isPaused(), musicQueue.queue.length);
            
            let progress = '';
            try {
                progress = queue.node.createProgressBar();
            } catch (e) {
                const timestamp = queue.node.getTimestamp();
                progress = timestamp ? `${timestamp.current.label} / ${track.duration}` : track.duration;
            }
            embed.setFooter({ text: progress });

            return interaction.reply({ embeds: [embed] });
        }

        const embed = musicQueue.current.createEmbed(queue.node.isPaused(), musicQueue.queue.length);
        
        let progress = '';
        try {
            progress = queue.node.createProgressBar();
        } catch (e) {
            const timestamp = queue.node.getTimestamp();
            progress = timestamp ? `${timestamp.current.label} / ${musicQueue.current.duration}` : musicQueue.current.duration;
        }
        embed.setFooter({ text: progress });

        return interaction.reply({ embeds: [embed] });
    }
};


