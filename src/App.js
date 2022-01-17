import { useState } from "react";
import Mixer from "./containers/mixer.js";
import Button from "@mui/material/Button";
import packageJson from '../package.json';
import "./App.css";

const App = () => {
  const [launched, setLaunched] = useState(false);
  return (
    <div className="App">
      <main>
        <h1 style={{margin: 0, display: 'flex', margin: 10}}><img src="images/navbar-logo.svg" style={{height:50, marginRight:20}} alt="3 Fire Music logo"/>Superpowered demo</h1>
        <small>v{packageJson.version}</small>
        {launched && <Mixer />}
        {!launched && <>
        <p style={{maxWidth: 400}}>The following demo uses Superpowered to download, decode and schedule 5 channels of stereo audio in WebAssembly.<br/><br/>
        There is one more optimisation that can be applied for iOS where the audio scheduling and UI threads are seperated, but this will come later.</p>
        <Button variant="contained" onClick={()=>setLaunched(true)}>Download and decode assets</Button>
        </>}
        
      </main>
    </div>
  );
};

export default App;
