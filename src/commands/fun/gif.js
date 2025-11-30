const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gif')
        .setDescription('Busca un GIF aleatorio')
        .addStringOption(option =>
            option.setName('busqueda')
                .setDescription('Qué buscar')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction) {
        await interaction.deferReply();

        const query = interaction.options.getString('busqueda');
        
        try {
            let url;
            if (config.tenorApiKey) {
                const response = await axios.get(`https://g.tenor.com/v1/search?q=${encodeURIComponent(query)}&key=${config.tenorApiKey}&limit=1`);
                if (response.data.results && response.data.results.length > 0) {
                    url = response.data.results[0].media[0].gif.url;
                }
            } else {
                // Fallback a Giphy si no hay Tenor API
                const response = await axios.get(`https://api.giphy.com/v1/gifs/random?tag=${encodeURIComponent(query)}&api_key=dc6zaTOxFJmzC`);
                url = response.data.data.images.original.url;
            }

            if (!url) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('No se encontró ningún GIF.')]
                });
            }

            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle(`GIF: ${query}`)
                .setImage(url)
                .setFooter({ text: `Solicitado por ${interaction.user.tag}` });

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('No se pudo obtener el GIF.')]
            });
        }
    }
};













