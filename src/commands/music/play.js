const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useMainPlayer, useQueue } = require('discord-player');
const YouTube = require('youtube-sr').default;
const config = require('../../config');
const Song = require('../../cogs/music/Song');
const MusicQueue = require('../../cogs/music/MusicQueue');
const SearchResultView = require('../../cogs/music/components/SearchResultView');
const MusicSystem = require('../../cogs/music/index');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce música desde YouTube, Spotify, etc.')
        .addStringOption(option =>
            option.setName('busqueda')
                .setDescription('URL de YouTube/Spotify/Apple Music o término de búsqueda')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction) {
        const musicSystem = interaction.client.musicSystem || new MusicSystem(interaction.client);
        if (!interaction.client.musicSystem) {
            interaction.client.musicSystem = musicSystem;
        }

        const voiceChannel = interaction.member.voice.channel;
        
        if (!voiceChannel) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('Debes estar en un canal de voz.')],
                flags: 64
            });
        }

        if (!voiceChannel.joinable) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('❌ Error').setDescription('No puedo unirme a tu canal de voz. Verifica los permisos.')],
                flags: 64
            });
        }

        await interaction.deferReply();

        const query = interaction.options.getString('busqueda');
        const player = useMainPlayer();
        const isUrl = query.startsWith('http://') || query.startsWith('https://');

        try {
            // Si es una URL, procesar directamente
            if (isUrl) {
                const result = await player.search(query, {
                    requestedBy: interaction.user
                });

                if (!result || !result.hasTracks()) {
                    return interaction.editReply({
                        embeds: [new EmbedBuilder()
                            .setColor('#FFA500')
                            .setTitle('❌ Sin Resultados')
                            .setDescription(`No se encontraron resultados para: **${query}**`)]
                    });
                }

                const { track } = await player.play(voiceChannel, result, {
                    requestedBy: interaction.user,
                    nodeOptions: {
                        metadata: {
                            channel: interaction.channel,
                            client: interaction.guild.members.me,
                            requestedBy: interaction.user.tag
                        },
                        selfDeaf: true,
                        skipFFmpeg: false
                    }
                });

                const song = new Song(track, interaction.user);
                const queue = musicSystem.getQueue(interaction.guild.id);
                const queuePlayer = useQueue(interaction.guild.id);
                
                if (!queuePlayer || !queuePlayer.isPlaying()) {
                    queue.add(song);
                    queue.current = song;
                    
                    // Si hay múltiples tracks (playlist), agregarlos todos
                    if (result.playlist) {
                        result.tracks.slice(1).forEach(t => {
                            const s = new Song(t, interaction.user);
                            queue.add(s);
                        });
                    }
                    
                    await musicSystem.sendMusicEmbed(interaction.guild.id, interaction.channel, song);
                    if (result.playlist && result.tracks.length > 1) {
                        await interaction.editReply({
                            embeds: [new EmbedBuilder()
                                .setColor(config.embedColor)
                                .setTitle('✅ Playlist añadida')
                                .setDescription(`**${result.playlist.title}** con ${result.tracks.length} canciones`)]
                        });
                    }
                } else {
                    // Si ya hay música reproduciéndose, agregar a ambas colas
                    queue.add(song);
                    
                    // Agregar a la cola de discord-player
                    try {
                        queuePlayer.addTrack(track);
                    } catch (error) {
                        console.error('Error agregando track a la cola:', error);
                    }
                    
                    // Si hay múltiples tracks (playlist), agregarlos todos
                    if (result.playlist) {
                        result.tracks.slice(1).forEach(t => {
                            const s = new Song(t, interaction.user);
                            queue.add(s);
                            // Agregar también a la cola de discord-player
                            try {
                                queuePlayer.addTrack(t);
                            } catch (error) {
                                console.error('Error agregando track de playlist:', error);
                            }
                        });
                    }
                    
                    if (result.playlist && result.tracks.length > 1) {
                        await interaction.editReply({
                            embeds: [new EmbedBuilder()
                                .setColor(config.embedColor)
                                .setTitle('✅ Playlist añadida')
                                .setDescription(`**${result.playlist.title}** con ${result.tracks.length} canciones agregada a la cola`)]
                        });
                    } else {
                        await interaction.editReply({
                            embeds: [new EmbedBuilder()
                                .setColor(config.embedColor)
                                .setTitle('✅ Añadido a la cola')
                                .setDescription(`**${song.title}** agregada a la cola`)]
                        });
                    }
                }
                return;
            }

            // Si es una búsqueda de texto, mostrar opciones
            let searchResults = [];
            
            // Buscar usando youtube-sr
            try {
                searchResults = await YouTube.search(query, { 
                    limit: 10, 
                    type: 'video',
                    safeSearch: false
                });
            } catch (searchError) {
                console.error('Error en búsqueda youtube-sr:', searchError);
            }

            // Si no hay resultados, intentar con discord-player
            if (!searchResults || searchResults.length === 0) {
                try {
                    const result = await player.search(query, {
                        requestedBy: interaction.user
                    });
                    
                    if (result && result.hasTracks()) {
                        searchResults = result.tracks.slice(0, 10).map(track => {
                            // Asegurar que la URL sea válida
                            let url = track.url;
                            if (!url && track.id) {
                                url = `https://www.youtube.com/watch?v=${track.id}`;
                            }
                            
                            return {
                                title: track.title,
                                url: url || track.url,
                                duration: track.duration,
                                thumbnail: track.thumbnail,
                                author: track.author,
                                id: track.id || (url ? url.match(/[?&]v=([^&]+)/)?.[1] : null)
                            };
                        });
                    }
                } catch (playerError) {
                    console.error('Error en búsqueda player:', playerError);
                }
            }

            if (!searchResults || searchResults.length === 0) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor('#FFA500')
                        .setTitle('❌ Sin Resultados')
                        .setDescription(`No se encontraron resultados para: **${query}**\n\nIntenta con:\n- El nombre completo de la canción\n- Una URL de YouTube válida\n- El nombre del artista y canción`)]
                });
            }

            // Si hay un solo resultado muy relevante, reproducir directamente
            if (searchResults.length === 1) {
                const video = searchResults[0];
                const result = await player.search(video.url, {
                    requestedBy: interaction.user
                });

                if (result && result.hasTracks()) {
                    const { track } = await player.play(voiceChannel, result, {
                        requestedBy: interaction.user,
                        nodeOptions: {
                            metadata: {
                                channel: interaction.channel,
                                client: interaction.guild.members.me,
                                requestedBy: interaction.user.tag
                            },
                            selfDeaf: true,
                            skipFFmpeg: false
                        }
                    });

                const song = new Song(track, interaction.user);
                const queue = musicSystem.getQueue(interaction.guild.id);
                const queuePlayer = useQueue(interaction.guild.id);
                
                if (!queuePlayer || !queuePlayer.isPlaying()) {
                    queue.add(song);
                    queue.current = song;
                    await musicSystem.sendMusicEmbed(interaction.guild.id, interaction.channel, song);
                    return interaction.editReply({
                        embeds: [new EmbedBuilder()
                            .setColor(config.embedColor)
                            .setTitle('🎵 Reproduciendo')
                            .setDescription(`**${song.title}** está ahora reproduciéndose`)]
                    });
                } else {
                    // Si ya hay música reproduciéndose, agregar a ambas colas
                    queue.add(song);
                    
                    // También agregar a la cola de discord-player
                    try {
                        queuePlayer.addTrack(track);
                    } catch (error) {
                        console.error('Error agregando track a la cola:', error);
                    }
                    
                    return interaction.editReply({
                        embeds: [new EmbedBuilder()
                            .setColor(config.embedColor)
                            .setTitle('🎵 Añadido a la cola')
                            .setDescription(`**${song.title}** agregada a la cola`)]
                    });
                }
                }
            }

            // Mostrar opciones para elegir (máximo 5)
            const tracks = searchResults.slice(0, 5);
            
            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle('🔍 Resultados de Búsqueda')
                .setDescription(`Se encontraron **${searchResults.length}** resultados para: **${query}**\n\nSelecciona una opción:`)
                .setFooter({ text: 'Los resultados expiran en 60 segundos' });

            // Agregar información de cada resultado
            tracks.forEach((result, index) => {
                const title = result.title || 'Sin título';
                const author = result.author || 'Desconocido';
                const duration = result.duration || 'Desconocida';
                let url = result.url || '';
                
                // Asegurar que la URL sea válida
                if (!url && result.id) {
                    url = `https://www.youtube.com/watch?v=${result.id}`;
                }

                embed.addFields({
                    name: `**${index + 1}.** ${title.substring(0, 80)}${title.length > 80 ? '...' : ''}`,
                    value: `👤 ${author.substring(0, 50)}${author.length > 50 ? '...' : ''} • ⏱️ ${duration}${url ? `\n🔗 [YouTube](${url.substring(0, 150)})` : ''}`,
                    inline: false
                });
            });

            // Guardar resultados temporalmente
            if (!interaction.client.searchResults) {
                interaction.client.searchResults = new Map();
            }
            
            // Normalizar tracks y asegurar URLs válidas
            const normalizedTracks = tracks.map((track, index) => {
                let url = track.url;
                let id = track.id;
                
                // Si es un objeto de youtube-sr (Video), extraer datos correctamente
                if (track.constructor && track.constructor.name === 'Video') {
                    // youtube-sr puede tener la URL en diferentes propiedades
                    url = track.url || track.shortURL || track.link || track.uri || track.webpage_url;
                    id = track.id || track.videoId;
                    
                    // Si hay ID pero no URL, construirla
                    if (id && !url) {
                        url = `https://www.youtube.com/watch?v=${id}`;
                    }
                    
                    // Extraer ID de la URL si existe
                    if (url && !id) {
                        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/);
                        if (match) {
                            id = match[1];
                        }
                    }
                } else {
                    // Si no hay URL pero hay ID, construirla
                    if (!url && id) {
                        url = `https://www.youtube.com/watch?v=${id}`;
                    }
                    
                    // Si aún no hay URL, intentar extraerla de otras propiedades
                    if (!url) {
                        if (track.link) url = track.link;
                        else if (track.uri) url = track.uri;
                        else if (track.webpage_url) url = track.webpage_url;
                        else if (track.shortURL) url = track.shortURL;
                    }
                    
                    // Extraer ID de la URL si existe pero no hay ID
                    if (url && !id) {
                        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/);
                        if (match) {
                            id = match[1];
                        }
                    }
                }
                
                // Si aún no hay URL válida, intentar construir desde el título (búsqueda)
                if (!url || !url.startsWith('http')) {
                    // Guardar el título para búsqueda alternativa
                    console.warn(`[Play] Track ${index + 1} sin URL válida: ${track.title || 'Sin título'}, ID: ${id}`);
                } else {
                    console.log(`[Play] Track ${index + 1} normalizado: ${track.title} -> ${url}`);
                }
                
                return {
                    title: track.title || 'Sin título',
                    url: url || '', // Mantener vacío si no hay URL, se intentará búsqueda por título
                    id: id || null,
                    duration: track.duration || track.durationFormatted || 'Desconocida',
                    author: track.author || track.channel?.name || track.uploader || 'Desconocido',
                    thumbnail: track.thumbnail?.url || track.thumbnail || null
                };
            }).filter(track => {
                // Filtrar tracks que no tengan al menos título o URL o ID
                const hasValidData = track.title && (track.url || track.id);
                if (!hasValidData) {
                    console.warn(`[Play] Track filtrado por falta de datos:`, track);
                }
                return hasValidData;
            });
            
            if (normalizedTracks.length === 0) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor('#FFA500')
                        .setTitle('❌ Error')
                        .setDescription('No se pudieron procesar los resultados de búsqueda.')]
                });
            }
            
            interaction.client.searchResults.set(`${interaction.user.id}_${interaction.id}`, {
                tracks: normalizedTracks,
                voiceChannel: voiceChannel,
                user: interaction.user,
                channel: interaction.channel
            });

            // Limpiar después de 60 segundos
            setTimeout(() => {
                if (interaction.client.searchResults) {
                    interaction.client.searchResults.delete(`${interaction.user.id}_${interaction.id}`);
                }
            }, 60000);

            // Crear vista con botones
            const view = new SearchResultView(musicSystem, interaction.guild.id, normalizedTracks, interaction.user);
            const components = view.createComponents();

            return interaction.editReply({ 
                embeds: [embed],
                components
            });

        } catch (error) {
            console.error('Error en play:', error);
            let errorMessage = error.message || 'Error desconocido';
            
            // Si el error es sobre FFmpeg, dar un mensaje más claro
            if (errorMessage.includes('ffmpeg') || errorMessage.includes('FFmpeg')) {
                errorMessage = 'FFmpeg no está instalado o no se puede encontrar. Por favor, instala FFmpeg en tu sistema o usa `ffmpeg-static`.';
            } else if (errorMessage.length > 1000) {
                // Truncar mensajes muy largos
                errorMessage = errorMessage.substring(0, 997) + '...';
            }
            
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('❌ Error')
                    .setDescription(`No se pudo buscar o reproducir la canción.\n\`\`\`${errorMessage.substring(0, 1000)}\`\`\``)]
            });
        }
    }
};
