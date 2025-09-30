import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import DuplicateSet from './components/DuplicateSet';
import ImageGallery from './components/ImageGallery';
import './index.css';
import { useScan } from './useScan';
import HashingFunnel from './components/HashingFunnel/HashingFunnel';

// Define types for our data structures
interface Duplicate {
	id: string;
	url: string; // In a real app, this might be a path or an ID to fetch the image
}

interface DuplicateSetData {
	id: string;
	duplicates: Duplicate[];
}

// Add a type for notifications
interface Notification {
	message: string;
	type: 'success' | 'error';
}

function App() {
    const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
    const [scanCompleted, setScanCompleted] = useState(false);
    const [hashedFileCount, setHashedFileCount] = useState(0);

    // Get the new resetScan function from the hook
    const { scanStatus, isScanning, duplicateSets, startScan, resetScan } = useScan();

    // This effect will simulate the file count increasing during a scan
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (isScanning) {
            // Reset count at the start of a new scan
            setHashedFileCount(0);
            interval = setInterval(() => {
                // Increment the count to simulate hashing
                setHashedFileCount(prevCount => prevCount + Math.floor(Math.random() * 5) + 1);
            }, 150); // Update every 150ms
        }

        // Cleanup function to clear interval when scanning stops or component unmounts
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isScanning]); // This effect runs whenever 'isScanning' changes


    const handleDirectorySelect = async () => {
         console.log('--- App:handleDirectorySelect called---');  
		const electronAPI = (window as any).electronAPI;
		if (electronAPI) {
		  const path = await electronAPI.selectDirectory();
		  if (path) {
			setSelectedDirectory(path);
		  }
		}
    };

    const handleStartScan = () => {
        if (selectedDirectory) {
          setScanCompleted(false);
          startScan(selectedDirectory).then(() => {
            setScanCompleted(true);
          });
        }
    };

    // This function will reset everything
    const handleRestart = () => {
        setSelectedDirectory(null);
        setScanCompleted(false);
        setHashedFileCount(0);
        resetScan(); // Call the reset function from the hook
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>DupePix</h1>

                {/* Only show the restart button after a scan is complete and we are not scanning */}
                {!isScanning && scanCompleted && (
                    <button onClick={handleRestart} className="restart-button">
                        Start Over
                    </button>
                )}

                <div className="directory-display-box">
                    <div className="box-label">Targeted Directory for Scanning Pictures</div>
                    <div className="box-content">{selectedDirectory || 'None selected'}</div>
                </div>

                <div className="controls">
                    <button onClick={handleDirectorySelect} className="select-dir-button" disabled={!!selectedDirectory}>
                        {selectedDirectory ? `Selected: ${selectedDirectory.split('/').pop()}` : 'Select Directory'}
                    </button>
                    <button onClick={handleStartScan} className="scan-button" disabled={!selectedDirectory || isScanning}>
                        Start Scan
                    </button>
                </div>

                {/* Show the new funnel animation ONLY when scanning */}
                {isScanning && <HashingFunnel />}

                {/* Display the hashing count ONLY when scanning */}
                {isScanning && (
                    <div className="hashing-status">
                        <span>Number of files hashed:</span>
                        <span>{hashedFileCount}</span>
                    </div>
                )}

                {/* Show the final status message ONLY after the scan is complete */}
                {!isScanning && scanCompleted && <p className="status-message">{scanStatus}</p>}

                {!isScanning && duplicateSets.length > 0 && (
                    <>
                        <h2>Duplicate Sets</h2>
                        {duplicateSets.map((set) => (
                            <DuplicateSet
                                key={set.id}
                                duplicates={set.duplicates}
                                onSelect={() => {}}
                            />
                        ))}
                    </>
                )}
            </header>
        </div>
    );
}

export default App;
