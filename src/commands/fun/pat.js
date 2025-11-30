const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pat')
        .setDescription('Acaricia a alguien')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario a acariciar')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('usuario');
        
        try {
            const response = await axios.get('https://api.waifu.pics/sfw/pat');
            const gifUrl = response.data.url;

            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle('👋 Caricia')
                .setDescription(`${interaction.user} acarició a ${user}`)
                .setImage(gifUrl)
                .setFooter({ text: `Solicitado por ${interaction.user.tag}` });

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('No se pudo obtener el GIF.')]
            });
        }
    }
};













