const { EmbedBuilder, Collection } = require('discord.js');
const logger = require('../utils/logger');
const Embeds = require('../utils/embeds');
const config = require('../config');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Manejar botones
        if (interaction.isButton()) {
            const MusicSystem = require('../cogs/music/index');
            const musicSystem = interaction.client.musicSystem || new MusicSystem(interaction.client);
            if (!interaction.client.musicSystem) {
                interaction.client.musicSystem = musicSystem;
            }

            // Manejar selección de resultados de búsqueda
            if (interaction.customId.startsWith('search_select_')) {
                await musicSystem.handleSearchSelection(interaction);
                return;
            }

            // Manejar controles de música
            if (interaction.customId.startsWith('music_')) {
                // Extraer la acción correctamente (puede ser pause_resume, skip, stop, shuffle, etc.)
                const parts = interaction.customId.split('_');
                let action = parts[1];
                // Si hay más partes, combinarlas (ej: pause_resume)
                if (parts.length > 3) {
                    action = parts.slice(1, -1).join('_');
                }
                await musicSystem.handleMusicControl(interaction, action);
                return;
            }

            // Manejar selección de música (legacy - mantener por compatibilidad)
            if (interaction.customId.startsWith('play_')) {
                const [_, index, userId] = interaction.customId.split('_');
                
                if (userId !== interaction.user.id) {
                    try {
                        return await interaction.reply({
                            embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('Este mensaje no es para ti.')],
                            flags: 64
                        });
                    } catch (e) {
                        if (e.code !== 10062) console.error('Error al responder:', e);
                        return;
                    }
                }

                const searchKey = `${interaction.user.id}_${interaction.message.interaction?.id}`;
                const searchData = interaction.client.searchResults?.get(searchKey);

                if (!searchData) {
                    try {
                        return await interaction.reply({
                            embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('Los resultados de búsqueda expiraron. Busca nuevamente.')],
                            flags: 64
                        });
                    } catch (e) {
                        if (e.code !== 10062) console.error('Error al responder:', e);
                        return;
                    }
                }

                const selectedTrack = searchData.tracks[parseInt(index)];
                if (!selectedTrack) {
                    try {
                        return await interaction.reply({
                            embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('Resultado no válido.')],
                            flags: 64
                        });
                    } catch (e) {
                        if (e.code !== 10062) console.error('Error al responder:', e);
                        return;
                    }
                }

                try {
                    // Intentar deferReply, pero si la interacción expiró, simplemente retornar
                    try {
                        await interaction.deferReply({ flags: 64 });
                    } catch (deferError) {
                        if (deferError.code === 10062 || deferError.message?.includes('Unknown interaction')) {
                            console.log('⚠️ Interacción expirada, ignorando...');
                            return;
                        }
                        throw deferError;
                    }

                    const player = require('discord-player').useMainPlayer();
                    
                    // Obtener la URL del track seleccionado
                    let trackUrl;
                    if (typeof selectedTrack === 'string') {
                        trackUrl = selectedTrack;
                    } else if (selectedTrack.url) {
                        trackUrl = selectedTrack.url;
                    } else if (selectedTrack.id) {
                        // Si es un objeto de youtube-sr, construir la URL
                        trackUrl = `https://www.youtube.com/watch?v=${selectedTrack.id}`;
                    } else {
                        try {
                            return await interaction.editReply({
                                embeds: [new EmbedBuilder()
                                    .setColor('#FFA500')
                                    .setTitle('❌ Error')
                                    .setDescription('URL de la canción no válida.')]
                            });
                        } catch (e) {
                            if (e.code !== 10062) console.error('Error al responder:', e);
                            return;
                        }
                    }

                    if (!trackUrl || trackUrl.length > 2000) {
                        try {
                            return await interaction.editReply({
                                embeds: [new EmbedBuilder()
                                    .setColor('#FFA500')
                                    .setTitle('❌ Error')
                                    .setDescription('URL de la canción inválida o demasiado larga.')]
                            });
                        } catch (e) {
                            if (e.code !== 10062) console.error('Error al responder:', e);
                            return;
                        }
                    }

                    // Buscar y reproducir
                    const result = await player.search(trackUrl, {
                        requestedBy: interaction.user
                    });

                    if (!result || !result.hasTracks()) {
                        try {
                            return await interaction.editReply({
                                embeds: [new EmbedBuilder()
                                    .setColor('#FFA500')
                                    .setTitle('❌ Error')
                                    .setDescription('No se pudo cargar la canción seleccionada. Intenta buscarla nuevamente.')]
                            });
                        } catch (e) {
                            if (e.code !== 10062) console.error('Error al responder:', e);
                            return;
                        }
                    }

                    const { track } = await player.play(searchData.voiceChannel, result, {
                        requestedBy: interaction.user,
                        nodeOptions: {
                            metadata: {
                                channel: searchData.channel,
                                client: interaction.guild.members.me,
                                requestedBy: interaction.user.tag
                            },
                            selfDeaf: true,
                            skipFFmpeg: false
                        }
                    });

                    const embed = new EmbedBuilder()
                        .setColor(config.embedColor)
                        .setTitle('🎵 Añadido a la cola')
                        .setDescription(`**${track.title}**\n${track.url}`)
                        .setThumbnail(track.thumbnail)
                        .setFooter({ text: `Duración: ${track.duration}` });

                    try {
                        await interaction.editReply({ embeds: [embed] });
                    } catch (e) {
                        if (e.code !== 10062) console.error('Error al responder:', e);
                    }
                    
                    // Eliminar resultados usados
                    if (interaction.client.searchResults) {
                        interaction.client.searchResults.delete(searchKey);
                    }
                } catch (error) {
                    console.error('Error al reproducir selección:', error);
                    
                    // Si la interacción expiró, no intentar responder
                    if (error.code === 10062 || error.message?.includes('Unknown interaction')) {
                        console.log('⚠️ Interacción expirada durante la reproducción');
                        return;
                    }
                    
                    let errorMsg = error.message || error.toString() || 'Error desconocido';
                    
                    // Si el error es sobre FFmpeg, dar un mensaje más claro
                    if (errorMsg.includes('ffmpeg') || errorMsg.includes('FFmpeg')) {
                        errorMsg = 'FFmpeg no está instalado o no se puede encontrar. Por favor, instala FFmpeg en tu sistema o usa `ffmpeg-static`.';
                    } else if (errorMsg.length > 1000) {
                        // Truncar mensajes muy largos (máximo 1000 caracteres para código)
                        errorMsg = errorMsg.substring(0, 997) + '...';
                    }
                    
                    // Intentar responder con el error, pero si falla, no crashear
                    try {
                        await interaction.editReply({
                            embeds: [new EmbedBuilder()
                                .setColor('#FFA500')
                                .setTitle('❌ Error')
                                .setDescription(`No se pudo reproducir la canción seleccionada.\n\`\`\`${errorMsg.substring(0, 500)}\`\`\``)]
                        });
                    } catch (replyError) {
                        if (replyError.code !== 10062) {
                            console.error('Error al responder:', replyError);
                        }
                    }
                }
                return;
            }

            // Manejar trivia
            if (interaction.customId.startsWith('trivia_')) {
                const triviaData = interaction.client.triviaAnswers?.[interaction.message.interaction?.id];
                
                if (!triviaData) {
                    return interaction.reply({
                        embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('Esta trivia ya expiró.')],
                        flags: 64
                    });
                }

                const answerIndex = parseInt(interaction.customId.split('_')[1]);
                const selectedAnswer = triviaData.answers[answerIndex];
                const isCorrect = selectedAnswer === triviaData.correct;

                const embed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle(isCorrect ? '✅ ¡Correcto!' : '❌ Incorrecto')
                    .setDescription(isCorrect 
                        ? `¡Bien hecho, ${interaction.user}! La respuesta correcta era: **${triviaData.correct}**`
                        : `Lo siento, la respuesta correcta era: **${triviaData.correct}**`)
                    .setFooter({ text: `Respondido por ${interaction.user.tag}` });

                await interaction.reply({ embeds: [embed], flags: 64 });
                delete interaction.client.triviaAnswers[interaction.message.interaction?.id];
            }
            return;
        }

        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            logger.warn(`Comando no encontrado: ${interaction.commandName}`);
            return;
        }

        // Cooldown
        const { cooldowns } = interaction.client;
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownDuration = (command.cooldown ?? 3) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + defaultCooldownDuration;

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                return interaction.reply({
                    embeds: [Embeds.error('Cooldown', `Espera <t:${expiredTimestamp}:R> antes de usar \`${command.data.name}\` nuevamente.`)],
                    flags: 64
                });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), defaultCooldownDuration);

        // Ejecutar comando
        try {
            await command.execute(interaction);
            logger.info(`${interaction.user.tag} usó el comando ${command.data.name}`);
        } catch (error) {
            logger.error(`Error ejecutando ${command.data.name}: ${error}`);
            
            // Verificar si la interacción aún es válida
            if (error.code === 10062 || error.message?.includes('Unknown interaction')) {
                logger.warn(`Interacción expirada para comando ${command.data.name}`);
                return; // La interacción expiró, no intentar responder
            }
            
            const errorMessage = {
                embeds: [Embeds.error('Error', 'Ocurrió un error al ejecutar este comando.')],
                flags: 64 // MessageFlags.Ephemeral
            };

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            } catch (replyError) {
                // Si falla al responder, solo loguear el error
                if (replyError.code !== 10062) {
                    logger.error(`Error al responder con mensaje de error: ${replyError}`);
                }
            }
        }
    }
};

