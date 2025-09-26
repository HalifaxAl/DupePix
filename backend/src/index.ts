import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3001;

const dbPath = path.join(__dirname, 'db.json');

interface Duplicate {
  id: string;
  url: string;
}

interface DuplicateSet {
  id: string;
  duplicates: Duplicate[];
}

const initialData: DuplicateSet[] = [
  {
    id: 'set1',
    duplicates: [
      { id: '1a', url: 'https://via.placeholder.com/150/0000FF/808080?Text=Image1A' },
      { id: '1b', url: 'https://via.placeholder.com/150/0000FF/808080?Text=Image1B' },
    ],
  },
  {
    id: 'set2',
    duplicates: [
      { id: '2a', url: 'https://via.placeholder.com/150/FF0000/FFFFFF?Text=Image2A' },
      { id: '2b', url: 'https://via.placeholder.com/150/FF0000/FFFFFF?Text=Image2B' },
      { id: '2c', url: 'https://via.placeholder.com/150/FF0000/FFFFFF?Text=Image2C' },
    ],
  },
];

const readData = (): DuplicateSet[] => {
  try {
    if (fs.existsSync(dbPath)) {
      const rawData = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(rawData);
    } else {
      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
      return initialData;
    }
  } catch (error) {
    console.error('Error reading database, returning initial data:', error);
    return initialData;
  }
};

const writeData = (data: DuplicateSet[]) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to database:', error);
  }
};

app.use(cors());
app.use(express.json());

// Mock data is now managed via db.json

app.post('/api/scan', (req, res) => {
  console.log('Received scan request. Simulating a fresh scan...');
  // Reset the database to initial state to simulate a new scan finding the same duplicates.
  writeData(initialData);

  setTimeout(() => {
    console.log('Scan complete. Sending duplicate sets.');
    const data = readData();
    res.json(data);
  }, 2000);
});

app.post('/api/delete', (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Invalid request: "ids" array is required.' });
  }
  console.log('Received request to delete image IDs:', ids);
  
  const currentData = readData();
  
  // Filter out the deleted items from our mock data
  const updatedData = currentData
    .map(set => ({
      ...set,
      duplicates: set.duplicates.filter(d => !ids.includes(d.id)),
    }))
    .filter(set => set.duplicates.length > 1);

  writeData(updatedData);

  res.status(200).json({ message: 'Deletion request processed.', deletedIds: ids });
});

// Add a new endpoint to reset the database state for testing
app.post('/api/reset', (req, res) => {
  console.log('Resetting database to initial state.');
  writeData(initialData);
  res.status(200).json({ message: 'Database reset successfully.' });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
