import React, { useState, useEffect, useRef } from 'react';
import HashingAnimation from './HashingAnimation'; // Import the animation component
import './App.css';
import { useScan } from './useScan'; // Import the new hook

function App() {
// State for UI elements that are specific to this component
  const [showSplash, setShowSplash] = useState(true);

  // Use custom hook to manage all scanning logic and state
  const {
    scanDirectory,
    setScanDirectory,
    statusMessage,
    isScanning,
    currentStatus,
    startScan,
  } = useScan();

  // Effect for the splash screen timer
  
  // Effect for the splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(timer);
  }, []);



  // This function remains in the component because it directly interacts with the browser/Electron API
  const handleDirectorySelect = async () => {
    try {
      const directoryPath = await window.electronAPI.selectDirectory();
      if (directoryPath) {
        setScanDirectory(directoryPath); // Set state using the function from our hook
      }
    } catch (error) {
      // We could also return `setStatusMessage` from the hook to display this error
      console.error(`Error selecting directory: ${error}`);
    }
  };

  if (showSplash) {
    return (
      <div className="splash-container">
        <img src="splash.png" alt="DupePix Splash Screen" className="splash-image" />
      </div>
    );
  }

  // The JSX remains almost identical, but it's now powered by the clean hook
  return (
    <div className="App">
      <header className="App-header">
        <h1>DupePix</h1>
        <p>
          Selected Directory: <strong>{scanDirectory || 'None selected'}</strong>
        </p>
        <button onClick={handleDirectorySelect} className="select-dir-button">
          Select Directory
        </button>
        <button onClick={startScan} className="scan-button" disabled={!scanDirectory || isScanning}>
          {isScanning ? 'Scanning...' : 'Start Scan'}
        </button>
        
        {/* Show animation when hashing */}
        {currentStatus === 'hashing' && <HashingAnimation />}

        <p className="status-message">{statusMessage}</p>
      </header>
    </div>
  );
}

export default App;