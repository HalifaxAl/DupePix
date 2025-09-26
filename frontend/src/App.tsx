import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import DuplicateSet from './components/DuplicateSet';
import ImageGallery from './components/ImageGallery';
import './index.css';
import { useScan } from './useScan';
import HashingAnimation from './components/HashingAnimation';

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
    const { scanStatus, isScanning, duplicateSets, startScan } = useScan();

    const handleDirectorySelect = async () => {
        if (window.electronAPI) {
          const path = await window.electronAPI.selectDirectory();
          if (path) {
            setSelectedDirectory(path);
          }
        }
    };

    const handleStartScan = () => {
        if (selectedDirectory) {
          startScan(selectedDirectory);
        }
    };

    return (
		<div className="App">
			<header className="App-header">
				<h1>DupePix</h1>

				{/* New display box for the selected directory */}
				<div className="directory-display-box">
					<div className="box-label">Targeted Directory for Scanning Pictures</div>
					<div className="box-content">{selectedDirectory || 'None selected'}</div>
				</div>

				{/* Disable the button when a directory is selected */}
				<button onClick={handleDirectorySelect} className="select-dir-button" disabled={!!selectedDirectory}>
					Select Directory
				</button>
				<button onClick={handleStartScan} className="scan-button" disabled={!selectedDirectory || isScanning}>
					Start Scan
				</button>

				{isScanning && <p className="status-message">{scanStatus}</p>}
				{isScanning && <HashingAnimation />}

				{duplicateSets.length > 0 && (
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
