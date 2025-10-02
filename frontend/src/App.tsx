import React, { useState } from 'react';
import { useScan } from './useScan';
import HashingFunnel from './components/HashingFunnel/HashingFunnel';
import DuplicateSet from './components/DuplicateSet';
import './index.css';

function App() {
    const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
    const [scanCompleted, setScanCompleted] = useState(false);
    const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

    const { 
        scanStatus, 
        isScanning, 
        duplicateSets, 
        startScan, 
        resetScan, 
        hashedFileCount, 
        totalFiles,
        deleteFiles,      // <-- Get new function from hook
        deletionResult    // <-- Get new state from hook
    } = useScan();

    const handleDirectorySelect = async () => {
        const path = await window.electronAPI.selectDirectory();
        if (path) setSelectedDirectory(path);
    };

    const handleStartScan = () => {
        if (selectedDirectory) {
          setScanCompleted(false);
          setFilesToDelete([]);
          startScan(selectedDirectory).then(() => setScanCompleted(true));
        }
    };

    const handleRestart = () => {
        setSelectedDirectory(null);
        setScanCompleted(false);
        setFilesToDelete([]);
        resetScan();
    };

    const handleSelectionChange = (filePath: string) => {
        setFilesToDelete(prev => 
            prev.includes(filePath)
                ? prev.filter(p => p !== filePath)
                : [...prev, filePath]
        );
    };

    const handleDeleteSelected = async () => {
        if (filesToDelete.length === 0) return;
        
        // Call the new function from our hook
        await deleteFiles(filesToDelete);

        // After deletion, we should refresh the data. The user can now see the
        // deletion result and then choose to re-scan the directory.
        // For simplicity, we will prompt them to re-scan.
        alert("Deletion complete. Please re-scan the directory to see the updated results.");
        
        // Reset the UI to a state where a new scan is possible
        setFilesToDelete([]);
        setScanCompleted(false); // Allows the scan button to be active again
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

                {/* Display Deletion Results if they exist */}
                {deletionResult && deletionResult.failed.length > 0 && (
                    <div className="deletion-failures">
                        <h3>Failed to Delete:</h3>
                        <ul>
                            {deletionResult.failed.map((file, index) => (
                                <li key={index}>
                                    <strong>File:</strong> {file.path} <br />
                                    <strong>Reason:</strong> {file.reason}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isScanning && duplicateSets.length > 0 && (
                    <>
                        <h2>Duplicate Sets</h2>
                        <button 
                            onClick={handleDeleteSelected} 
                            className="delete-button"
                            disabled={filesToDelete.length === 0}
                        >
                            Delete {filesToDelete.length} Selected Photos
                        </button>

                        {/* RENAMED: 'set' is now 'duplicateSetItem' to avoid using a reserved word. */}
                        {duplicateSets.map((duplicateSetItem) => (
                            <DuplicateSet
                                key={duplicateSetItem.id}
                                duplicateSet={duplicateSetItem}
                                selectedFiles={filesToDelete}
                                onSelectionChange={handleSelectionChange}
                            />
                        ))}
                    </>
                )}
            </header>
        </div>
    );
}

export default App;
