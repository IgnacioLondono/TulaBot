const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];

// Cargar todos los comandos
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }
    }
}

// Construir y preparar una instancia del módulo REST
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy comandos
(async () => {
    try {
        console.log(`🔄 Registrando ${commands.length} comandos...`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID || process.env.DISCORD_TOKEN.split('.')[0]),
            { body: commands }
        );

        console.log(`✅ Se registraron ${data.length} comandos exitosamente.`);
    } catch (error) {
        console.error('❌ Error al registrar comandos:', error);
    }
})();













