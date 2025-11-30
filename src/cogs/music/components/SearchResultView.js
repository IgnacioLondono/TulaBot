const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class SearchResultView {
    constructor(musicCog, guildId, searchResults, requester) {
        this.musicCog = musicCog;
        this.guildId = guildId;
        this.searchResults = searchResults;
        this.requester = requester;
        this.timeout = 60000; // 60 segundos
    }

    createComponents() {
        const rows = [];
        const maxButtons = Math.min(5, this.searchResults.length);

        for (let i = 0; i < maxButtons; i++) {
            const rowIndex = Math.floor(i / 3);
            if (!rows[rowIndex]) {
                rows[rowIndex] = new ActionRowBuilder();
            }

            const result = this.searchResults[i];
            const title = result.title || 'Sin título';
            const label = `${i + 1}. ${title.substring(0, 40)}${title.length > 40 ? '...' : ''}`;

            const button = new ButtonBuilder()
                .setCustomId(`search_select_${i}_${this.requester.id}`)
                .setLabel(label)
                .setStyle(ButtonStyle.Secondary);

            rows[rowIndex].addComponents(button);
        }

        return rows;
    }
}

module.exports = SearchResultView;






