import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [scanDirectory, setScanDirectory] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000); 

    return () => clearTimeout(timer);
  }, []);

  const handleDirectorySelect = async () => {
    if (window.electronAPI) {
      try {
        const directoryPath = await window.electronAPI.selectDirectory();
        if (directoryPath) {
          setScanDirectory(directoryPath);
        }
      } catch (error) {
        setStatusMessage(`Error selecting directory: ${error}`);
      }
    } else {
      const fallbackPath = prompt("Enter directory path (e.g., C:\\Photos or /home/user/pictures/)");
      if (fallbackPath) {
        setScanDirectory(fallbackPath);
      }
    }
  };

  const pollScanStatus = async (currentScanId: string) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:5000/scan/status/${currentScanId}`);
        const data = await response.json();

        if (data.status === 'complete') {
          clearInterval(intervalId);
          setStatusMessage(`Scan complete! Found ${data.total} files.`);
          setIsScanning(false);
          fetchDuplicateReport(currentScanId);
        } else if (data.status === 'error') {
            clearInterval(intervalId);
            setStatusMessage(`Scan failed: ${data.message}`);
            setIsScanning(false);
        } else {
          setStatusMessage(`Scanning... Processed ${data.processed} of ${data.total} files.`);
        }
      } catch (error) {
        setStatusMessage(`Error fetching status: ${error}`);
        clearInterval(intervalId);
        setIsScanning(false);
      }
    }, 2000);
  };
  
  const fetchDuplicateReport = async (currentScanId: string) => {
      try {
          const response = await fetch(`http://localhost:5000/scan/report/${currentScanId}`);
          const data = await response.json();
          console.log("Received report data:", data);
          setStatusMessage("Report retrieved successfully. Check console for details.");
      } catch (error) {
          setStatusMessage(`Error retrieving report: ${error}`);
      }
  };

  const startScan = async () => {
    if (!scanDirectory) {
      setStatusMessage("Please select a directory first.");
      return;
    }

    setStatusMessage('Initiating scan...');
    setIsScanning(true);
    setScanId(null);

    try {
      const response = await fetch('http://localhost:5000/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scan_directory: scanDirectory }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const newScanId = responseData.scan_id;
        
      if (newScanId) {
        setScanId(newScanId);
        pollScanStatus(newScanId);
      } else {
        setStatusMessage("Scan initiated, but no scan ID was returned.");
        setIsScanning(false);
      }
    } else {
      const errorData = await response.json();
      setStatusMessage(`Error: ${errorData.error}`);
      setIsScanning(false);
    }
    } catch (error) {
      setStatusMessage(`Error connecting to backend: ${error}`);
      setIsScanning(false);
    }
  };

  if (showSplash) {
    return (
      <div className="splash-container">
        <img src="splash.png" alt="DupePix Splash Screen" className="splash-image" />
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>DupePix</h1>
        <p>
          Selected Directory: 
          <strong>
            {scanDirectory || 'None selected'}
          </strong>
        </p>
        <button onClick={handleDirectorySelect} className="select-dir-button">
          Select Directory
        </button>
        <button onClick={startScan} className="scan-button" disabled={!scanDirectory || isScanning}>
          Start Scan
        </button>
        <p className="status-message">{statusMessage}</p>
      </header>
    </div>
  );
}

export default App;