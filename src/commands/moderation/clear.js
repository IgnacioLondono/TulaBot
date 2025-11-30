const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Embeds = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Elimina mensajes del canal')
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Cantidad de mensajes a eliminar (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    cooldown: 5,
    async execute(interaction) {
        const amount = interaction.options.getInteger('cantidad');

        try {
            const messages = await interaction.channel.bulkDelete(amount, true);
            return interaction.reply({
                embeds: [Embeds.success('Mensajes Eliminados', `Se eliminaron ${messages.size} mensajes.`)],
                flags: 64
            });
        } catch (error) {
            return interaction.reply({
                embeds: [Embeds.error('Error', 'No se pudieron eliminar los mensajes.')],
                flags: 64
            });
        }
    }
};






