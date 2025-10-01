import React, { useState } from 'react';
import DuplicateSet from './components/DuplicateSet';
import './index.css';
import { useScan } from './useScan';
import HashingFunnel from './components/HashingFunnel/HashingFunnel';

// These interfaces are for the final results, not the scan status
interface Duplicate {
    id: string;
    url: string;
}

interface DuplicateSetData {
    id: string;
    duplicates: Duplicate[];
}

function App() {
    const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
    const [scanCompleted, setScanCompleted] = useState(false);
    
    const { 
        scanStatus, 
        isScanning, 
        duplicateSets, 
        startScan, 
        resetScan, 
        hashedFileCount, 
        totalFiles // Destructure the totalFiles count
    } = useScan();

    // The old simulation useEffect block should be completely gone.

    const handleDirectorySelect = async () => {
        const path = await window.electronAPI.selectDirectory();
        if (path) {
            setSelectedDirectory(path);
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

    const handleRestart = () => {
        setSelectedDirectory(null);
        setScanCompleted(false);
        resetScan();
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>DupePix</h1>

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

                {isScanning && <HashingFunnel />}

                {/* This is the key display change */}
                {isScanning && (
                    <div className="hashing-status">
                        <span>Files Hashed:</span>
                        <span>{hashedFileCount} / {totalFiles}</span>
                    </div>
                )}

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
