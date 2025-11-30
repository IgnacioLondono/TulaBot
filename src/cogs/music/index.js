const { useMainPlayer, useQueue } = require('discord-player');
const YouTube = require('youtube-sr').default;
const Song = require('./Song');
const MusicQueue = require('./MusicQueue');
const SearchResultView = require('./components/SearchResultView');
const MusicControlView = require('./components/MusicControlView');
const config = require('../../config');

class MusicSystem {
    constructor(client) {
        this.client = client;
        this.queues = new Map(); // {guildId: MusicQueue}
        this.musicMessages = new Map(); // {guildId: Message}
        this.player = useMainPlayer();
    }

    getQueue(guildId) {
        if (!this.queues.has(guildId)) {
            this.queues.set(guildId, new MusicQueue());
        }
        return this.queues.get(guildId);
    }

    async sendMusicEmbed(guildId, channel, song, isPaused = false) {
        const queue = this.getQueue(guildId);
        const embed = song.createEmbed(isPaused, queue.queue.length);
        const view = new MusicControlView(this, guildId);
        const components = view.createComponents(isPaused);

        // Si ya existe un mensaje, actualizarlo
        if (this.musicMessages.has(guildId)) {
            try {
                const message = this.musicMessages.get(guildId);
                await message.edit({ embeds: [embed], components });
                return;
            } catch (error) {
                // Si falla (mensaje eliminado), crear uno nuevo
                this.musicMessages.delete(guildId);
            }
        }

        // Crear nuevo mensaje
        try {
            const message = await channel.send({ embeds: [embed], components });
            this.musicMessages.set(guildId, message);
        } catch (error) {
            console.error('Error enviando embed de música:', error);
        }
    }

    async handleSearchSelection(interaction) {
        const customId = interaction.customId;
        const parts = customId.split('_');
        const selectedIndex = parseInt(parts[2]);
        const userId = parts[3];

        if (userId !== interaction.user.id) {
            return interaction.reply({
                embeds: [new (require('discord.js').EmbedBuilder)()
                    .setColor('#FFA500')
                    .setTitle('❌ Error')
                    .setDescription('Solo quien realizó la búsqueda puede seleccionar un resultado.')],
                flags: 64
            });
        }

        await interaction.deferReply({ flags: 64 });

        // Buscar en todos los resultados posibles
        let searchData = null;
        let searchKey = null;
        
        // Intentar con el ID de la interacción del mensaje
        if (interaction.message.interaction?.id) {
            searchKey = `${interaction.user.id}_${interaction.message.interaction.id}`;
            searchData = this.client.searchResults?.get(searchKey);
        }
        
        // Si no se encuentra, buscar por cualquier clave que coincida con el usuario
        if (!searchData && this.client.searchResults) {
            for (const [key, data] of this.client.searchResults.entries()) {
                if (key.startsWith(`${interaction.user.id}_`)) {
                    searchData = data;
                    searchKey = key;
                    break;
                }
            }
        }

        if (!searchData) {
            return interaction.editReply({
                embeds: [new (require('discord.js').EmbedBuilder)()
                    .setColor('#FFA500')
                    .setTitle('❌ Error')
                    .setDescription('Los resultados de búsqueda expiraron. Busca nuevamente.')]
            });
        }

        const selectedTrack = searchData.tracks[parseInt(selectedIndex)];
        if (!selectedTrack) {
            return interaction.editReply({
                embeds: [new (require('discord.js').EmbedBuilder)()
                    .setColor('#FFA500')
                    .setTitle('❌ Error')
                    .setDescription('Resultado no válido.')]
            });
        }

        try {
            // Desactivar todos los botones
            const view = new SearchResultView(this, interaction.guild.id, searchData.tracks, interaction.user);
            const components = view.createComponents();
            components.forEach(row => {
                row.components.forEach(button => button.setDisabled(true));
            });
            await interaction.message.edit({ components }).catch(() => {});

            const player = useMainPlayer();
            const voiceChannel = searchData.voiceChannel;

            // Validar que la URL sea válida
            if (!selectedTrack.url || !selectedTrack.url.startsWith('http')) {
                // Si no hay URL válida pero hay ID, construir la URL
                if (selectedTrack.id) {
                    selectedTrack.url = `https://www.youtube.com/watch?v=${selectedTrack.id}`;
                } else {
                    return interaction.editReply({
                        embeds: [new (require('discord.js').EmbedBuilder)()
                            .setColor('#FFA500')
                            .setTitle('❌ Error')
                            .setDescription('La URL de la canción no es válida. Intenta buscar nuevamente.')]
                    });
                }
            }

            console.log(`[Music] Intentando cargar: ${selectedTrack.url}`);
            console.log(`[Music] Track info:`, { title: selectedTrack.title, id: selectedTrack.id, url: selectedTrack.url });

            // Verificar que los extractores estén cargados
            const extractors = player.extractors.store;
            const availableExtractors = Array.from(extractors.keys());
            console.log(`[Music] Extractores disponibles:`, availableExtractors);

            // Intentar buscar la canción
            let result;
            try {
                // Intentar búsqueda con la URL
                console.log(`[Music] Buscando con URL: ${selectedTrack.url}`);
                
                result = await player.search(selectedTrack.url, {
                    requestedBy: interaction.user
                });
                
                console.log(`[Music] Resultado de búsqueda:`, {
                    hasTracks: result?.hasTracks(),
                    tracksCount: result?.tracks?.length || 0,
                    playlist: result?.playlist ? 'Sí' : 'No',
                    searchResultType: result?.searchResult?.type || 'unknown'
                });
                
                // Si no tiene tracks, intentar con búsqueda por título
                if (!result || !result.hasTracks()) {
                    if (selectedTrack.title) {
                        console.log(`[Music] No hay tracks con URL, intentando búsqueda por título: ${selectedTrack.title}`);
                        result = await player.search(selectedTrack.title, {
                            requestedBy: interaction.user
                        });
                        console.log(`[Music] Búsqueda por título:`, {
                            hasTracks: result?.hasTracks(),
                            tracksCount: result?.tracks?.length || 0
                        });
                    }
                }
                
            } catch (searchError) {
                console.error('[Music] Error en búsqueda:', searchError);
                console.error('[Music] Stack:', searchError.stack);
                
                // Si falla, intentar buscar por título
                if (selectedTrack.title) {
                    console.log(`[Music] Intentando búsqueda por título como fallback: ${selectedTrack.title}`);
                    try {
                        result = await player.search(selectedTrack.title, {
                            requestedBy: interaction.user
                        });
                        console.log(`[Music] Búsqueda por título exitosa:`, {
                            hasTracks: result?.hasTracks(),
                            tracksCount: result?.tracks?.length || 0
                        });
                    } catch (titleError) {
                        console.error('[Music] Error en búsqueda por título:', titleError);
                        throw new Error(`No se pudo encontrar la canción. Intenta con otra búsqueda.`);
                    }
                } else {
                    throw new Error(`Error al buscar la canción. Intenta con otra búsqueda.`);
                }
            }

            if (!result) {
                console.error('[Music] Result es null o undefined');
                return interaction.editReply({
                    embeds: [new (require('discord.js').EmbedBuilder)()
                        .setColor('#FFA500')
                        .setTitle('❌ Error')
                        .setDescription('No se obtuvo ningún resultado de la búsqueda. Intenta con otra canción.')]
                });
            }

            if (!result.hasTracks()) {
                console.error('[Music] Result no tiene tracks. Tipo:', typeof result, 'Keys:', Object.keys(result || {}));
                return interaction.editReply({
                    embeds: [new (require('discord.js').EmbedBuilder)()
                        .setColor('#FFA500')
                        .setTitle('❌ Error')
                        .setDescription('No se encontraron resultados para la canción seleccionada. Intenta con otra búsqueda.')]
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
                    skipFFmpeg: false,
                    // Optimizaciones para mejorar el rendimiento
                    bufferingTimeout: 3000,
                    connectionTimeout: 30000
                },
                // Opciones de búsqueda optimizadas
                searchOptions: {
                    fallbackSearchEngine: 'youtube'
                }
            });

            const song = new Song(track, interaction.user);
            const queue = this.getQueue(interaction.guild.id);
            const queuePlayer = useQueue(interaction.guild.id);
            
            // Si no hay nada reproduciéndose, empezar a reproducir
            if (!queuePlayer || !queuePlayer.isPlaying()) {
                queue.add(song);
                queue.current = song;
                await this.sendMusicEmbed(interaction.guild.id, interaction.channel, song);
                await interaction.editReply({
                    embeds: [new (require('discord.js').EmbedBuilder)()
                        .setColor(config.embedColor)
                        .setTitle('✅ Reproduciendo')
                        .setDescription(`**${song.title}** está ahora reproduciéndose`)]
                });
            } else {
                // Si ya hay música reproduciéndose, agregar a ambas colas
                queue.add(song);
                
                // También agregar a la cola de discord-player para que funcione el skip
                try {
                    const searchResult = await this.player.search(song.url, {
                        requestedBy: interaction.user
                    });
                    
                    if (searchResult && searchResult.hasTracks()) {
                        // Agregar el track a la cola de discord-player
                        queuePlayer.addTrack(searchResult.tracks[0]);
                    }
                } catch (error) {
                    console.error('Error agregando track a la cola de discord-player:', error);
                    // Continuar de todas formas, la canción está en nuestra cola personalizada
                }
                
                await interaction.editReply({
                    embeds: [new (require('discord.js').EmbedBuilder)()
                        .setColor(config.embedColor)
                        .setTitle('✅ Añadido a la cola')
                        .setDescription(`**${song.title}** agregada a la cola`)]
                });
            }

            // Eliminar resultados usados
            if (this.client.searchResults) {
                this.client.searchResults.delete(searchKey);
            }
        } catch (error) {
            console.error('Error al reproducir selección:', error);
            
            // Limitar la longitud del mensaje de error (máximo 4096 caracteres para embeds)
            let errorMessage = error.message || 'Error desconocido';
            
            // Si el error es sobre FFmpeg, dar un mensaje más claro
            if (errorMessage.includes('ffmpeg') || errorMessage.includes('FFmpeg')) {
                errorMessage = 'FFmpeg no está instalado o no se puede encontrar. Por favor, instala FFmpeg en tu sistema o usa `ffmpeg-static`.';
            } else if (errorMessage.length > 1000) {
                // Truncar mensajes muy largos
                errorMessage = errorMessage.substring(0, 997) + '...';
            }
            
            await interaction.editReply({
                embeds: [new (require('discord.js').EmbedBuilder)()
                    .setColor('#FFA500')
                    .setTitle('❌ Error')
                    .setDescription(`No se pudo reproducir la canción: ${errorMessage}`)]
            });
        }
    }

    async handleMusicControl(interaction, action) {
        try {
            const customId = interaction.customId;
            const parts = customId.split('_');
            
            // Extraer guildId correctamente (puede estar en diferentes posiciones)
            let guildId = null;
            if (parts.length >= 3) {
                // Formato: music_action_guildId
                guildId = parts[parts.length - 1];
            }
            
            // Verificar que el guildId coincida
            if (guildId && interaction.guild.id !== guildId) {
                return await interaction.reply({
                    embeds: [new (require('discord.js').EmbedBuilder)()
                        .setColor('#FFA500')
                        .setTitle('❌ Error')
                        .setDescription('Este botón no es para este servidor.')],
                    flags: 64
                });
            }

            const queue = useQueue(interaction.guild.id);
            const musicQueue = this.getQueue(interaction.guild.id);

            switch (action) {
                case 'pause':
                case 'resume':
                case 'pause_resume':
                    if (!queue || !queue.isPlaying()) {
                        return await interaction.reply({
                            embeds: [new (require('discord.js').EmbedBuilder)()
                                .setColor('#FFA500')
                                .setTitle('❌ Error')
                                .setDescription('No hay música reproduciéndose.')],
                            flags: 64
                        });
                    }

                    const isPaused = queue.node.isPaused();
                    queue.node.setPaused(!isPaused);
                    
                    if (musicQueue.current) {
                        await this.sendMusicEmbed(interaction.guild.id, interaction.channel, musicQueue.current, !isPaused);
                    }
                    
                    await interaction.reply({ 
                        content: !isPaused ? '⏸️ Música pausada' : '▶️ Música reanudada', 
                        flags: 64 
                    });
                    break;

                case 'skip':
                    if (!queue || !queue.isPlaying()) {
                        return await interaction.reply({
                            embeds: [new (require('discord.js').EmbedBuilder)()
                                .setColor('#FFA500')
                                .setTitle('❌ Error')
                                .setDescription('No hay música reproduciéndose.')],
                            flags: 64
                        });
                    }

                    const current = musicQueue.current;
                    
                    // Obtener la siguiente canción de nuestra cola personalizada
                    const nextSong = musicQueue.next();
                    
                    // Sincronizar: si nuestra cola tiene canciones pero la de discord-player está vacía
                    if (musicQueue.queue.length > 0 && queue.tracks.size === 0) {
                        // Agregar todas las canciones pendientes a la cola de discord-player
                        for (const song of musicQueue.queue) {
                            try {
                                const searchResult = await this.player.search(song.url, {
                                    requestedBy: song.requester
                                });
                                
                                if (searchResult && searchResult.hasTracks()) {
                                    queue.addTrack(searchResult.tracks[0]);
                                }
                            } catch (error) {
                                console.error('Error sincronizando canción:', error);
                            }
                        }
                    }
                    
                    // Saltar la canción actual
                    queue.node.skip();
                    
                    // Actualizar la cola personalizada
                    if (nextSong) {
                        musicQueue.current = nextSong;
                    } else {
                        musicQueue.current = null;
                    }
                    
                    await interaction.reply({
                        content: `⏭️ Saltando: **${current ? current.title : 'Canción actual'}**`,
                        flags: 64
                    });
                    break;

                case 'stop':
                    if (!queue) {
                        return await interaction.reply({
                            embeds: [new (require('discord.js').EmbedBuilder)()
                                .setColor('#FFA500')
                                .setTitle('❌ Error')
                                .setDescription('No hay música reproduciéndose.')],
                            flags: 64
                        });
                    }

                    musicQueue.clear();
                    queue.delete();

                    // Desactivar botones
                    const view = new MusicControlView(this, interaction.guild.id);
                    const disabledComponents = view.createDisabledComponents();
                    if (this.musicMessages.has(interaction.guild.id)) {
                        try {
                            await this.musicMessages.get(interaction.guild.id).edit({
                                content: '🛑 Música detenida',
                                embeds: [],
                                components: disabledComponents
                            });
                        } catch (error) {
                            // Ignorar errores
                        }
                    }

                    await interaction.reply({ content: '🛑 Música detenida', flags: 64 });
                    break;

                case 'shuffle':
                    if (!musicQueue || musicQueue.queue.length < 2) {
                        return await interaction.reply({
                            embeds: [new (require('discord.js').EmbedBuilder)()
                                .setColor('#FFA500')
                                .setTitle('❌ Error')
                                .setDescription('Necesitas al menos 2 canciones en la cola para aleatorizar.')],
                            flags: 64
                        });
                    }

                    musicQueue.shuffle();
                    await interaction.reply({ content: '🔀 Cola aleatorizada', flags: 64 });
                    break;

                default:
                    await interaction.reply({
                        embeds: [new (require('discord.js').EmbedBuilder)()
                            .setColor('#FFA500')
                            .setTitle('❌ Error')
                            .setDescription(`Acción desconocida: ${action}`)],
                        flags: 64
                    });
            }
        } catch (error) {
            console.error('Error en handleMusicControl:', error);
            try {
                await interaction.reply({
                    embeds: [new (require('discord.js').EmbedBuilder)()
                        .setColor('#FFA500')
                        .setTitle('❌ Error')
                        .setDescription('Ocurrió un error al procesar la acción.')],
                    flags: 64
                });
            } catch (replyError) {
                // Ignorar errores de respuesta
            }
        }
    }
}

module.exports = MusicSystem;

