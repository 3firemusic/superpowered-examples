class MixerChannel {
    constructor(superpoweredInstance, samplerate) {
        this.Superpowered = superpoweredInstance;
        this.channelOutputBuffer = new this.Superpowered.Float32Buffer(4096);
        this.player = new this.Superpowered.AdvancedAudioPlayer(
            samplerate,
            2,
            2,
            0,
            0.501,
            2,
            false
        );
    }

    loadBuffer(buffer, assetDefinition) {
        this.player.openMemory(this.Superpowered.arrayBufferToWASM(buffer), false, false);
        this.assetLoaded = true;
    }

    togglePlay(isMaster) {
        if (!this.playing) {
            this.player.play();
        } else {
            this.player.pause();
        }
        this.playing = !this.playing;
    }

    seek(time) {
        this.player.setPosition(time, true, false, false, false);
    }

    process(bufferSize) {
        // Generate player buffers (or silence)
        if (!this.player.processStereo(this.channelOutputBuffer.pointer, false, bufferSize, 0.5)) {
            for (let n = 0; n < bufferSize; n++) this.channelOutputBuffer.array[n] = 0;
        }
    }

    destroy() {
        this.player.destroy();
    }
}

export default MixerChannel