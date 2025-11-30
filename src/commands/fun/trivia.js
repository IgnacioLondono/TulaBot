const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('Juega una trivia')
        .addStringOption(option =>
            option.setName('dificultad')
                .setDescription('Dificultad')
                .addChoices(
                    { name: 'Fácil', value: 'easy' },
                    { name: 'Medio', value: 'medium' },
                    { name: 'Difícil', value: 'hard' }
                )
                .setRequired(false)),
    cooldown: 5,
    async execute(interaction) {
        await interaction.deferReply();

        const difficulty = interaction.options.getString('dificultad') || 'medium';

        try {
            const response = await axios.get(`https://opentdb.com/api.php?amount=1&difficulty=${difficulty}&type=multiple&lang=es`);
            const question = response.data.results[0];

            const answers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
            
            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle('❓ Trivia')
                .setDescription(question.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'"))
                .addFields(
                    { name: 'Categoría', value: question.category, inline: true },
                    { name: 'Dificultad', value: question.difficulty, inline: true }
                )
                .setFooter({ text: 'Tienes 30 segundos para responder' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('trivia_0').setLabel(answers[0].substring(0, 80)).setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('trivia_1').setLabel(answers[1].substring(0, 80)).setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('trivia_2').setLabel(answers[2].substring(0, 80)).setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('trivia_3').setLabel(answers[3].substring(0, 80)).setStyle(ButtonStyle.Primary)
                );

            await interaction.editReply({ embeds: [embed], components: [row] });

            // Guardar respuesta correcta temporalmente
            interaction.client.triviaAnswers = interaction.client.triviaAnswers || {};
            interaction.client.triviaAnswers[interaction.id] = {
                correct: question.correct_answer,
                answers: answers
            };

            setTimeout(() => {
                delete interaction.client.triviaAnswers[interaction.id];
            }, 30000);
        } catch (error) {
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('No se pudo obtener la pregunta.')]
            });
        }
    }
};













