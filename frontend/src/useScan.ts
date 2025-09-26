import { useState } from 'react';

// Define the structure of a duplicate set
interface DuplicateSet {
  id: string;
  duplicates: { id: string; url: string }[];
}

export const useScan = () => {
  const [scanStatus, setScanStatus] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [duplicateSets, setDuplicateSets] = useState<DuplicateSet[]>([]);

  const startScan = async (directory: string) => {
    setIsScanning(true);
    setScanStatus('Starting scan...');
    setDuplicateSets([]); // Clear previous results

    try {
      const response = await fetch('http://localhost:5000/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scan_directory: directory }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Backend scan failed');
      }

      const results = await response.json();
      setScanStatus('Scan complete!');
      // Here you would process the results to fit the DuplicateSet structure
      // For now, we'll assume the backend returns data in the correct format
      setDuplicateSets(results.duplicate_sets || []);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setScanStatus(`Error: ${errorMessage}`);
      console.error('Scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  return { scanStatus, isScanning, duplicateSets, startScan };
};