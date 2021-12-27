
import { SuperpoweredWebAudio, SuperpoweredTrackLoader } from "../superpowered/SuperpoweredWebAudio.js";
import MixerEngine from './mixerEngine.js';

class MultitrackPlayerDemoProcessor extends SuperpoweredWebAudio.AudioWorkletProcessor {
 
  onReady() {
    this.started = false;
    this.assetsLoaded = 0;
    this.mixerEngine = new MixerEngine(this.Superpowered, this.samplerate, 5);

    this.loadAssetFromProcessor = this.loadAssetFromProcessor.bind(this);

    this.sendMessageToMainScope({ event: "ready" });
  }

  loadAssetFromProcessor(url) {
    SuperpoweredTrackLoader.downloadAndDecode(
      url,
      this
    );
  }

  onMessageFromMainScope(message) {
    if (message.type === "command") {
      this.handleIncomingCommand(message);
    }
    if (message.SuperpoweredLoaded) {
      this.handleAssetLoaded(message);
      if (this.assetsLoaded === 5) {
        this.sendMessageToMainScope({ event: "assetsLoaded" });
        // demo track had silence at the start
        this.mixerEngine.seekAllChannels(3500);
      }
    }
  }

  handleAssetLoaded(message) {
    const foundAsset = this.mixerAssets.find(a => a.url === message.SuperpoweredLoaded.url);
    const destinationChannelIndex = this.mixerAssets.indexOf(foundAsset);
    this.mixerEngine.channels[destinationChannelIndex].loadBuffer(message.SuperpoweredLoaded.buffer, foundAsset);
    this.assetsLoaded++;
  }

  handleIncomingCommand(message) {
      if (message.payload?.id === "loadPlayerAssets") {
        this.mixerAssets = message.payload.assets;
        this.mixerAssets.forEach((asset) => {
          this.loadAssetFromProcessor(asset.url);
        });
      }
      if (message.payload?.id === "startPlayback") {
        this.mixerEngine.togglePlay();
      }
      if (message.payload?.id === "stopPlayback") {
        this.mixerEngine.togglePlay();
      }
  }

  handleIncomingParameterChange(scope, paramName, channelIndex, value) {
    if (scope === 'global') this.applyGlobalParamChange(paramName, channelIndex, value);
  }

  processAudio(inputBuffer, outputBuffer, buffersize, parameters) {
    this.mixerEngine.process(inputBuffer, outputBuffer, buffersize);
  }
}

// The following code registers the processor script in the browser, notice the label and reference
if (typeof AudioWorkletProcessor !== "undefined")
  registerProcessor("MultitrackPlayerDemoProcessor", MultitrackPlayerDemoProcessor);
export default MultitrackPlayerDemoProcessor;
