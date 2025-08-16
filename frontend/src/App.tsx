import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [scanDirectory, setScanDirectory] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000); 

    return () => clearTimeout(timer);
  }, []);

  const handleDirectoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScanDirectory(event.target.value);
  };

  const startScan = async () => {
    setStatusMessage('Scanning in progress...');

    try {
      const response = await fetch('http://localhost:5000/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scan_directory: scanDirectory }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatusMessage(data.message);
      } else {
        const errorData = await response.json();
        setStatusMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      setStatusMessage(`Error connecting to backend: ${error}`);
    }
  };

  if (showSplash) {
    return (
      <div className="splash-container"> 
        <img src={process.env.PUBLIC_URL + `/splash.png`} alt="DupePix Splash Screen" className="splash-image" />
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>DupePix</h1>
        <p>Enter the directory to scan for duplicate photos.</p>
        <input
          type="text"
          value={scanDirectory}
          onChange={handleDirectoryChange}
          placeholder="Enter directory path (e.g., /home/alex/Pictures)"
          className="directory-input"
        />
        <button onClick={startScan} className="scan-button">
          Start Scan
        </button>
        <p className="status-message">{statusMessage}</p>
      </header>
    </div>
  );
}

export default App;