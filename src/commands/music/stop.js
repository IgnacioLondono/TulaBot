const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const config = require('../../config');
const MusicSystem = require('../../cogs/music/index');
const MusicControlView = require('../../cogs/music/components/MusicControlView');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Detiene la reproducción y limpia la cola'),
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
        musicQueue.clear();
        queue.delete();

        // Desactivar botones
        const view = new MusicControlView(musicSystem, interaction.guild.id);
        const disabledComponents = view.createDisabledComponents();
        if (musicSystem.musicMessages.has(interaction.guild.id)) {
            try {
                await musicSystem.musicMessages.get(interaction.guild.id).edit({
                    content: '🛑 Música detenida',
                    embeds: [],
                    components: disabledComponents
                });
            } catch (error) {
                // Ignorar errores
            }
        }

        return interaction.reply({
            embeds: [new EmbedBuilder().setColor(config.embedColor).setTitle('⏹️ Detenido').setDescription('La reproducción ha sido detenida y la cola limpiada.')]
        });
    }
};






