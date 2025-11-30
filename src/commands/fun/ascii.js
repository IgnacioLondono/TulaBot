const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ascii')
        .setDescription('Convierte texto a ASCII art')
        .addStringOption(option =>
            option.setName('texto')
                .setDescription('Texto a convertir (máximo 10 caracteres)')
                .setRequired(true)),
    cooldown: 5,
    async execute(interaction) {
        const text = interaction.options.getString('texto').substring(0, 10).toUpperCase();

        // ASCII art simple
        const asciiMap = {
            'A': '  ██  \n ████ \n██  ██\n██████\n██  ██',
            'B': '████  \n██  ██\n████  \n██  ██\n████  ',
            'C': ' ████ \n██    \n██    \n██    \n ████ ',
            // ... más letras
        };

        let ascii = '';
        for (const char of text) {
            if (asciiMap[char]) {
                ascii += asciiMap[char] + '\n\n';
            } else {
                ascii += char + '\n\n';
            }
        }

        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle('ASCII Art')
                .setDescription(`\`\`\`\n${ascii}\`\`\``)
                .setFooter({ text: `Solicitado por ${interaction.user.tag}` })]
        });
    }
};













