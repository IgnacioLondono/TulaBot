class MusicQueue {
    constructor() {
        this.queue = [];
        this.current = null;
        this.loop = false;
        this.loopQueue = false;
    }

    add(song) {
        this.queue.push(song);
    }

    addPlaylist(songs) {
        this.queue.push(...songs);
    }

    next() {
        if (this.loop && this.current) {
            return this.current;
        }

        if (this.queue.length > 0) {
            this.current = this.queue.shift();
            if (this.loopQueue && this.current) {
                this.queue.push(this.current);
            }
            return this.current;
        }

        this.current = null;
        return null;
    }

    clear() {
        this.queue = [];
        this.current = null;
    }

    remove(index) {
        if (index >= 0 && index < this.queue.length) {
            this.queue.splice(index, 1);
            return true;
        }
        return false;
    }

    shuffle() {
        for (let i = this.queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
        }
    }

    getQueueInfo() {
        if (!this.current && this.queue.length === 0) {
            return 'La cola está vacía.';
        }

        const info = [];
        if (this.current) {
            info.push(`**🎵 Reproduciendo:** ${this.current.title}`);
        }

        if (this.queue.length > 0) {
            info.push(`\n**📋 Cola (${this.queue.length} canciones):**`);
            this.queue.slice(0, 10).forEach((song, index) => {
                info.push(`${index + 1}. ${song.title}`);
            });
            if (this.queue.length > 10) {
                info.push(`... y ${this.queue.length - 10} más`);
            }
        }

        return info.join('\n');
    }
}

module.exports = MusicQueue;






