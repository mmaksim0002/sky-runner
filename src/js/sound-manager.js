export class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window['.webkitAudioContext'])();
        this.buffers = {};
    }

    async load(name, url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        this.buffers[name] = await this.ctx.decodeAudioData(arrayBuffer);
    } 
    
    async loadAll(soundList) {
        const promises = Object.entries(soundList).map(([name, url]) => this.load(name, url));
        await Promise.all(promises);
    }

    play(name, volume = 0.1) {
        if (this.ctx.state === "suspended") this.ctx.resume();
        if (!this.buffers[name]) return;

        const source = this.ctx.createBufferSource();
        source.buffer = this.buffers[name];

        const gainNode = this.ctx.createGain();
        gainNode.gain.value = volume;

        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(0);
    }
}