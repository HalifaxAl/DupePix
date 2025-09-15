import { useState, useEffect, useRef } from 'react';

// This custom hook encapsulates all the logic for scanning
export function useScan() {
  const [scanDirectory, setScanDirectory] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('');

  // Using a ref to hold the interval ID is a robust way to manage it across re-renders
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // This useEffect hook manages the polling logic safely
  useEffect(() => {
    // Stop any existing interval if scanning stops or scanId is cleared
    if (!isScanning || !scanId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start a new interval
    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:5000/scan/status/${scanId}`);
        const data = await response.json();
        setCurrentStatus(data.status); // Update status for animation

        if (data.status === 'complete') {
          setStatusMessage(`Scan complete! Found ${data.total} files.`);
          setIsScanning(false); // This will trigger the cleanup in this useEffect
          fetchDuplicateReport(scanId);
        } else if (data.status === 'error') {
          setStatusMessage(`Scan failed: ${data.message}`);
          setIsScanning(false); // This will trigger the cleanup
        } else {
          const processed = data.processed || 0;
          const total = data.total || 0;
          setStatusMessage(`Status: ${data.status}... Processed ${processed} of ${total} files.`);
        }
      } catch (error) {
        setStatusMessage(`Error fetching status: ${error}`);
        setIsScanning(false); // This will trigger the cleanup
      }
    }, 2000);

    // The cleanup function: React runs this when the component unmounts
    // or when the dependencies [isScanning, scanId] change.
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isScanning, scanId]); // Re-run the effect if these values change

  const startScan = async () => {
    if (!scanDirectory) {
      setStatusMessage("Please select a directory first.");
      return;
    }

    setStatusMessage('Initiating scan...');
    setIsScanning(true);
    setCurrentStatus('starting');
    setScanId(null);

    try {
      const response = await fetch('http://localhost:5000/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_directory: scanDirectory }),
      });

      if (response.ok) {
        const responseData = await response.json();
        setScanId(responseData.scan_id); // This will trigger the useEffect to start polling
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

  // Return the state and functions that the UI component will need
  return {
    scanDirectory,
    setScanDirectory,
    statusMessage,
    isScanning,
    currentStatus,
    startScan,
  };
}