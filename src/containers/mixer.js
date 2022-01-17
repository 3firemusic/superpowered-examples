import React, { useState, useEffect, useRef } from "react";
import {
  SuperpoweredGlue,
  SuperpoweredWebAudio,
} from "../lib/superpowered/SuperpoweredWebAudio.js";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const Mixer = () => {
  const webaudioManager = useRef();
  const processorNode = useRef();
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);

  const [statusText, setStatusText] = useState('Downloading assets and decoding....');

  useEffect(() => {
    loadSP();
  }, []);

  const loadSP = async () => {
    
    const superpowered = await SuperpoweredGlue.fetch(
      "/superpowered-examples/superpowered/superpowered.wasm"
    );
    superpowered.Initialize({
      licenseKey: "ExampleLicenseKey-WillExpire-OnNextUpdate",
      enableAudioAnalysis: true,
      enableFFTAndFrequencyDomain: true,
      enableAudioTimeStretching: true,
      enableAudioEffects: true,
      enableAudioPlayerAndDecoder: true,
      enableCryptographics: false,
      enableNetworking: false,
    });
    webaudioManager.current = new SuperpoweredWebAudio(48000, superpowered);

    processorNode.current = await webaudioManager.current.createAudioNodeAsync(
      "/superpowered-examples/processorScripts/MultitrackPlayerDemoProcessor.js",
      "MultitrackPlayerDemoProcessor",
      onMessageProcessorAudioScope
    );
    processorNode.current.connect(
      webaudioManager.current.audioContext.destination
    );
    processorNode.current.onprocessorerror = (e) => {
      console.error(e);
    };

    loadAssets();
  };

  const onMessageProcessorAudioScope = (message) => {
    if (message.event === "assetsLoaded") {
      setAssetsLoaded(true);
      setStatusText('Assets loaded and read to play! This song stores around 110MB of decoded audio into RAM.');
    }
  };

  const loadAssets = () => {
    processorNode.current.sendMessageToAudioScope({
      type: "command",
      payload: {
        id: "loadPlayerAssets",
        assets: [
          {
            url: "/superpowered-examples/audio/1205/Choir_Christmas_coventry_carol_Alto.mp4"
          },
          {
            url: "/superpowered-examples/audio/1205/Choir_Christmas_coventry_carol_BAND.mp4"
          },
          {
            url: "/superpowered-examples/audio/1205/Choir_Christmas_coventry_carol_bass.mp4"
          },
          {
            url: "/superpowered-examples/audio/1205/Choir_Christmas_coventry_carol_Soprano.mp4"
          },
          {
            url: "/superpowered-examples/audio/1205/Choir_Christmas_coventry_carol_Tenor.mp4"
          },
        ],
      },
    });
  };

  const sendPlayCommand = () => {    
    setPlaying(!playing);
    setStatusText(!playing ? 'Playing. Merry Christmas!': 'Paused');
    webaudioManager.current.audioContext.resume();
    processorNode.current.sendMessageToAudioScope({
      type: "command",
      payload: {
        id: playing? "stopPlayback" : "startPlayback",
      },
    });
  };

  return (
    <Box sx={{  padding: '10px 20px', borderRadius: '15px', width: "80%", marginBottom: "10px" }}>
        <h4 style={{maxWidth: 400, margin: '20px auto'}}>{statusText}</h4>
      
        {assetsLoaded && <Button
          variant="contained"
          disabled={!assetsLoaded}
          onClick={() => sendPlayCommand()}
        >
        Play/Pause
        </Button>}

      </Box>
  );
};

export default Mixer;
