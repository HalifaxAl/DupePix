import { useState } from 'react';

export const useScan = () => {
    const [scanStatus, setScanStatus] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [duplicateSets, setDuplicateSets] = useState<any[]>([]);

    const startScan = async (directory: string) => {
        setIsScanning(true);
        setScanStatus('Starting scan...');
        setDuplicateSets([]); // Clear previous results

        try {
            const response = await fetch('http://127.0.0.1:5000/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ directory }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setDuplicateSets(data.duplicates || []);
            setScanStatus(data.message || 'Scan complete!');
        } catch (error) {
            console.error('Error during scan:', error);
            setScanStatus('Error during scan. See console for details.');
        } finally {
            setIsScanning(false);
        }
    };

    // Add this new function to reset the hook's state
    const resetScan = () => {
        setScanStatus('');
        setIsScanning(false);
        setDuplicateSets([]);
    };

    // Expose the new function
    return { scanStatus, isScanning, duplicateSets, startScan, resetScan };
};