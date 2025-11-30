const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config');
const conversationManager = require('../../utils/ai-conversation');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai')
        .setDescription('Habla con la IA usando Google Gemini')
        .addStringOption(option =>
            option.setName('mensaje')
                .setDescription('Tu mensaje para la IA')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('nuevo')
                .setDescription('Iniciar una nueva conversación (limpiar historial)')
                .setRequired(false)),
    cooldown: 5,
    async execute(interaction) {
        // Verificar que la API key esté configurada
        if (!process.env.GEMINI_API_KEY) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error de Configuración')
                    .setDescription('La API key de Gemini no está configurada.\n\nPor favor, agrega `GEMINI_API_KEY=tu_api_key` a tu archivo `.env`.\n\nObtén tu API key en: https://makersuite.google.com/app/apikey')],
                flags: 64
            });
        }

        await interaction.deferReply();

        try {
            const message = interaction.options.getString('mensaje');
            const newConversation = interaction.options.getBoolean('nuevo') || false;
            const userId = interaction.user.id;
            const channelId = interaction.channel.id;

            // Limpiar historial si se solicita
            if (newConversation) {
                conversationManager.clearHistory(userId, channelId);
            }

            // Inicializar Gemini
            const apiKey = process.env.GEMINI_API_KEY?.trim();
            if (!apiKey) {
                throw new Error('GEMINI_API_KEY no está configurada');
            }
            
            const genAI = new GoogleGenerativeAI(apiKey);
            
            // Obtener modelo configurado (eliminar espacios)
            const modeloConfigurado = process.env.GEMINI_MODEL?.trim();
            
            // Lista de modelos a intentar (en orden de preferencia)
            const modelosDisponibles = [
                modeloConfigurado, // Si está configurado, intentarlo primero
                'gemini-2.5-flash', // Modelo más reciente y gratuito
                'gemini-1.5-flash',
                'gemini-1.5-flash-latest',
                'gemini-1.5-pro',
                'gemini-1.5-pro-latest',
                'gemini-pro',
            ].filter(Boolean); // Eliminar valores undefined/null
            
            // Si no hay modelo configurado, usar los modelos por defecto
            if (!modeloConfigurado) {
                modelosDisponibles.shift(); // Eliminar el undefined
            }
            
            let model;
            let modelName = modelosDisponibles[0]; // Empezar con el primer modelo
            
            // Log para debugging (solo en desarrollo)
            if (process.env.NODE_ENV === 'development') {
                console.log(`[AI] Intentando usar modelo: ${modelName}`);
                console.log(`[AI] Modelos disponibles para fallback: ${modelosDisponibles.join(', ')}`);
            }
            
            // Crear el modelo (no probarlo todavía, lo probaremos al usarlo)
            model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            });

            // Obtener historial formateado
            const chatHistory = conversationManager.getFormattedHistory(userId, channelId);

            // Iniciar chat con historial
            let chat = model.startChat({
                history: chatHistory,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            });

            // Enviar mensaje y obtener respuesta
            let result;
            let response;
            let text;
            let lastError;
            
            // Intentar enviar el mensaje, si falla, probar otros modelos
            try {
                result = await chat.sendMessage(message);
                response = await result.response;
                text = response.text();
            } catch (error) {
                // Si el primer modelo falla, intentar otros
                lastError = error;
                
                if (error.status === 404 || error.message?.includes('not found')) {
                    // Intentar otros modelos
                    for (let i = 1; i < modelosDisponibles.length; i++) {
                        try {
                            modelName = modelosDisponibles[i];
                            const newModel = genAI.getGenerativeModel({ 
                                model: modelName,
                                generationConfig: {
                                    temperature: 0.7,
                                    topK: 40,
                                    topP: 0.95,
                                    maxOutputTokens: 2048,
                                }
                            });
                            
                            const newChat = newModel.startChat({
                                history: chatHistory,
                                generationConfig: {
                                    temperature: 0.7,
                                    topK: 40,
                                    topP: 0.95,
                                    maxOutputTokens: 2048,
                                }
                            });
                            
                            result = await newChat.sendMessage(message);
                            response = await result.response;
                            text = response.text();
                            model = newModel;
                            chat = newChat;
                            break; // Éxito, salir del loop
                        } catch (err) {
                            lastError = err;
                            continue; // Intentar siguiente modelo
                        }
                    }
                    
                    // Si todos los modelos fallaron, lanzar error
                    if (!text) {
                        throw lastError;
                    }
                } else {
                    // Si no es un error 404, lanzar el error original
                    throw error;
                }
            }

            // Guardar en historial
            conversationManager.addToHistory(userId, channelId, 'user', message);
            conversationManager.addToHistory(userId, channelId, 'model', text);

            // Crear embed con la respuesta
            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle('🤖 Respuesta de la IA')
                .setDescription(text.length > 4096 ? text.substring(0, 4093) + '...' : text)
                .addFields(
                    { name: '💬 Tu mensaje', value: message.length > 1024 ? message.substring(0, 1021) + '...' : message, inline: false }
                )
                .setFooter({ 
                    text: `Solicitado por ${interaction.user.tag} • Modelo: ${modelName}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            // Si la respuesta es muy larga, dividirla en múltiples mensajes
            if (text.length > 4096) {
                await interaction.editReply({ embeds: [embed] });
                
                // Enviar el resto en mensajes adicionales
                let remainingText = text.substring(4096);
                while (remainingText.length > 0) {
                    const chunk = remainingText.substring(0, 4096);
                    remainingText = remainingText.substring(4096);
                    
                    const chunkEmbed = new EmbedBuilder()
                        .setColor(config.embedColor)
                        .setDescription(chunk);
                    
                    await interaction.followUp({ embeds: [chunkEmbed], flags: 64 });
                }
            } else {
                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Error en comando AI:', error);
            
            let errorMessage = 'Ocurrió un error al procesar tu solicitud.';
            let errorDetails = error.message || error.toString();
            
            // Detectar errores específicos
            if (error.status === 404 || errorDetails.includes('404') || errorDetails.includes('not found')) {
                errorMessage = 'No se pudo encontrar un modelo disponible de Gemini.\n\n**Solución:**\n';
                errorMessage += '1. Ejecuta `npm run verify-gemini` para ver qué modelos están disponibles\n';
                errorMessage += '2. Verifica que tu API key sea válida en: https://aistudio.google.com/app/apikey\n';
                errorMessage += '3. Configura `GEMINI_MODEL=gemini-2.5-flash` en tu `.env` (o elimina la variable para usar el modelo por defecto)\n';
                errorMessage += '4. Reinicia el bot después de cambiar el `.env`';
            } else if (errorDetails.includes('API_KEY') || error.status === 401) {
                errorMessage = 'La API key de Gemini no es válida. Verifica tu configuración en el archivo `.env`.';
            } else if (errorDetails.includes('QUOTA') || error.status === 429) {
                errorMessage = 'Se ha excedido la cuota de la API. Intenta más tarde o verifica tus límites en Google AI Studio.';
            } else if (errorDetails.includes('SAFETY')) {
                errorMessage = 'Tu mensaje fue bloqueado por los filtros de seguridad de Google.';
            } else if (errorDetails.includes('403') || error.status === 403) {
                errorMessage = 'Acceso denegado. Verifica que tu API key tenga los permisos necesarios.';
            }
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Error')
                .setDescription(errorMessage)
                .setFooter({ text: `Código: ${error.status || 'N/A'}` });

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: 64 });
            }
        }
    }
};

