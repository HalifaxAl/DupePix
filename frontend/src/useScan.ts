import { useState, useRef } from 'react';

// Define a specific interface for each possible status from the backend
interface HashingStatus {
    status: 'hashing' | 'analyzing'; // The "discriminant" property
    message: string;
    hashed_files: number;
    total_files: number;
}

interface CompleteStatus {
    status: 'complete';
    message: string;
}

interface ErrorStatus {
    status: 'error';
    message: string;
}

// Create a "union" type of all possible status objects
type ScanStatus = HashingStatus | CompleteStatus | ErrorStatus;

// Add a new interface for the deletion result
interface FailedFile {
    path: string;
    reason: string;
}

interface DeletionResult {
    message: string;
    deleted: string[];
    failed: FailedFile[];
}

export const useScan = () => {
    const [scanStatus, setScanStatus] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [duplicateSets, setDuplicateSets] = useState<any[]>([]);
    const [hashedFileCount, setHashedFileCount] = useState(0);
    const [totalFiles, setTotalFiles] = useState(0);
    // New state to hold the outcome of the delete operation
    const [deletionResult, setDeletionResult] = useState<DeletionResult | null>(null);

    const pollingRef = useRef<number | undefined>();

    const checkStatus = async (scanId: string) => {
        console.log(`%c[Polling] Checking status for scan_id: ${scanId}`, 'color: blue');
        try {
            const response = await fetch(`http://127.0.0.1:5000/scan/status/${scanId}`);
            if (!response.ok) throw new Error(`Status check failed with status: ${response.status}`);
            
            const data: ScanStatus = await response.json();
            console.log('[Polling] Received data:', data);

            setScanStatus(data.message || '');

            switch (data.status) {
                case 'hashing':
                case 'analyzing':
                    console.log('[Polling] Status is "hashing" or "analyzing". Updating counts.');
                    setHashedFileCount(data.hashed_files);
                    setTotalFiles(data.total_files);
                    break;

                case 'complete':
                case 'error':
                    console.log(`%c[Polling] Status is "${data.status}". Stopping polling.`, 'color: green');
                    setIsScanning(false);
                    clearInterval(pollingRef.current);
                    
                    if (data.status === 'complete') {
                        console.log('[Results] Fetching final results...');
                        const resultsResponse = await fetch(`http://127.0.0.1:5000/scan/results/${scanId}`);
                        if (!resultsResponse.ok) throw new Error(`Fetching results failed with status: ${resultsResponse.status}`);
                        
                        const resultsData = await resultsResponse.json();
                        console.log('[Results] Received final results:', resultsData);
                        setDuplicateSets(resultsData.duplicates || []);
                    }
                    break;
            }
        } catch (error) {
            console.error('[Polling] CRITICAL ERROR during status check:', error);
            setScanStatus('Error checking status. See console.');
            setIsScanning(false);
            clearInterval(pollingRef.current);
        }
    };

    const startScan = async (directory: string) => {
        console.log(`--- startScan called with directory: ${directory} ---`);
        setIsScanning(true);
        setScanStatus('Initiating scan...');
        setDuplicateSets([]);
        setHashedFileCount(0);
        setTotalFiles(0);

        try {
            const response = await fetch('http://127.0.0.1:5000/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ directory }),
            });

            if (!response.ok) throw new Error(`Failed to start scan with status: ${response.status}`);
            
            const { scan_id } = await response.json();
            console.log(`Scan initiated successfully. Received scan_id: ${scan_id}`);
            
            if (scan_id) {
                console.log('Starting polling interval...');
                pollingRef.current = window.setInterval(() => {
                    checkStatus(scan_id);
                }, 1000);
            } else {
                throw new Error("Did not receive a scan_id from the backend.");
            }

        } catch (error) {
            console.error('CRITICAL ERROR during scan initiation:', error);
            setScanStatus('Error starting scan. See console.');
            setIsScanning(false);
        }
    };

    const deleteFiles = async (filesToDelete: string[]) => {
        console.log('%c[Deletion] Attempting to delete files:', 'color: red', filesToDelete);
        try {
            const response = await fetch('http://127.0.0.1:5000/delete_photos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: filesToDelete }),
            });
            const result: DeletionResult = await response.json();
            console.log('%c[Deletion] Received result:', 'color: red', result);
            setDeletionResult(result); // Store the result in state
            return result;
        } catch (error) {
            console.error('CRITICAL ERROR during file deletion:', error);
            const errorResult = {
                message: 'A critical network or server error occurred during deletion.',
                deleted: [],
                failed: filesToDelete.map(f => ({ path: f, reason: 'Network/server error' }))
            };
            setDeletionResult(errorResult);
            return errorResult;
        }
    };

    const resetScan = () => {
        console.log('--- resetScan called ---');
        setScanStatus('');
        setIsScanning(false);
        setDuplicateSets([]);
        setHashedFileCount(0);
        setTotalFiles(0);
        setDeletionResult(null); // Clear deletion results on reset
        clearInterval(pollingRef.current);
    };

    // Expose the new state and function
    return { 
        scanStatus, 
        isScanning, 
        duplicateSets, 
        startScan, 
        resetScan, 
        hashedFileCount, 
        totalFiles,
        deleteFiles,      // <-- new function
        deletionResult    // <-- new state
    };
};