import MixerChannel from './mixerChannel.js';

class MixerEngine {

    constructor(superpoweredInstance, samplerate, numChannels) {
        this.Superpowered = superpoweredInstance;
        this.stereoMixer1 = new this.Superpowered.StereoMixer();
        this.masterMixer = new this.Superpowered.StereoMixer();
        this.channels = new Array(numChannels);
        for (let channelIndex = 0; channelIndex < numChannels; channelIndex++) {
            this.channels[channelIndex] = new MixerChannel(this.Superpowered, samplerate);
        }
    }

    togglePlay() {
        for (const channel of this.channels) {
            channel.togglePlay();
        }
    }

    seekAllChannels(time) {
        for (const channel of this.channels) {
            channel.seek(time);
        }
    }

    process(inputBuffer, outputBuffer, bufferSize) {
        for (let channel = 0; channel < this.channels.length; channel++) {
            this.channels[channel].process(bufferSize);
        }

        //add togtehr the fist 4 channels
        this.stereoMixer1.process(
            this.channels[0].channelOutputBuffer,
            this.channels[1].channelOutputBuffer,
            this.channels[2].channelOutputBuffer,
            this.channels[3].channelOutputBuffer,
            outputBuffer,
            bufferSize
        );
        
        // then add in the final 5th channel
        this.masterMixer.process(
            outputBuffer,
            this.channels[4].channelOutputBuffer,
            0,
            0,
            outputBuffer,
            bufferSize
        );
    }
}

export default MixerEngine