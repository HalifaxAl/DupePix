import unittest
import os
import shutil
import json
import time
from unittest.mock import patch, MagicMock
from flask import Flask

# Add project root to sys path
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import backend and core scripts for testing
from backend.backend import app, perform_scan_and_analysis
import create_photo_hash_list
import photo_duplicates

class TestBackendAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.test_dir = 'tests/test_data_api'
        self.photos_dir = os.path.join(self.test_dir, 'photos')
        self.backend_dir = 'backend'
        
        # Ensure a clean slate for each test
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
        if os.path.exists(os.path.join(self.backend_dir, 'scan_progress.json')):
            os.remove(os.path.join(self.backend_dir, 'scan_progress.json'))
            
        os.makedirs(self.photos_dir)
        
        # Create dummy photo files for the backend to process
        for i in range(10):
            with open(os.path.join(self.photos_dir, f'photo{i}.jpg'), 'w') as f:
                f.write('a' * i)
        
        with open(os.path.join(self.photos_dir, 'duplicate.jpg'), 'w') as f:
            f.write('a' * 5)
            
    def tearDown(self):
        shutil.rmtree(self.test_dir)
        
    def test_scan_api_endpoint(self):
        """Test the POST /scan endpoint and status polling."""
        # 1. Start a scan
        response = self.app.post('/scan', json={'scan_directory': self.photos_dir})
        self.assertEqual(response.status_code, 202)
        self.assertEqual(response.json['message'], 'Scan initiated. Check status endpoint for progress.')

        # 2. Poll for status (initial)
        # Give the background thread a moment to start
        time.sleep(1)
        response = self.app.get('/scan/status')
        self.assertEqual(response.status_code, 200)
        self.assertIn('processed', response.json)
        self.assertIn('total', response.json)
        self.assertEqual(response.json['total'], 11) # 10 unique + 1 duplicate

        # 3. Wait for scan to complete and poll again
        # We'll use a mock to speed this up in a real test environment,
        # but for a simple test we can just wait.
        while True:
            response = self.app.get('/scan/status')
            if response.json['status'] == 'complete':
                break
            time.sleep(1)
            
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['processed'], 11)

    def test_get_scan_report_endpoint(self):
        """Test the GET /scan/report endpoint after a scan is complete."""
        # 1. Manually run the full scan process to generate the report file
        perform_scan_and_analysis(self.photos_dir)

        # 2. Request the report from the API
        response = self.app.get('/scan/report')
        self.assertEqual(response.status_code, 200)
        
        # 3. Verify the report content
        report_data = json.loads(response.data)
        self.assertIn('summary', report_data)
        self.assertIn('duplicates', report_data)
        self.assertEqual(report_data['summary']['total_files_processed'], 11)
        self.assertEqual(report_data['summary']['duplicate_photos_found'], 1)
        
    @patch('os.path.isdir', return_value=False)
    def test_invalid_directory(self, mock_isdir):
        """Test that invalid directory paths are handled correctly."""
        response = self.app.post('/scan', json={'scan_directory': '/invalid/path'})
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid directory path', response.json['error'])

if __name__ == '__main__':
    unittest.main()