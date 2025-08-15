import unittest
import os
import shutil
import json
from datetime import datetime
import sys
import hashlib

# Add the project root to the sys path to import the scripts
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import create_photo_hash_list
import photo_duplicates

class TestDupePix(unittest.TestCase):
    def setUp(self):
        """Set up test directories and dummy files before each test."""
        self.test_dir = 'tests/test_data'
        self.photos_dir = os.path.join(self.test_dir, 'photos')
        self.subfolder = os.path.join(self.photos_dir, 'subfolder')
        
        # Ensure a clean slate for each test
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
        
        os.makedirs(self.subfolder)
        
        # Create dummy photo files
        with open(os.path.join(self.photos_dir, 'photo1.jpg'), 'w') as f:
            f.write('abc') # Duplicate content 1
        with open(os.path.join(self.photos_dir, 'photo2.jpg'), 'w') as f:
            f.write('abc') # Duplicate content 1
        with open(os.path.join(self.photos_dir, 'photo3.png'), 'w') as f:
            f.write('xyz') # Unique content
        with open(os.path.join(self.photos_dir, 'photo4.jpg'), 'w') as f:
            f.write('def') # Duplicate content 2
        with open(os.path.join(self.subfolder, 'photo5.jpg'), 'w') as f:
            f.write('def') # Duplicate content 2

    def tearDown(self):
        """Clean up test directories after each test."""
        shutil.rmtree(self.test_dir)

    def test_create_photo_hash_list(self):
        """Test the functionality of create_photo_hash_list.py."""
        # Run the hash generation script
        create_photo_hash_list.generate_photo_hashes(self.photos_dir, output_dir=self.test_dir)
        
        # Find the generated file
        generated_file = None
        for file in os.listdir(self.test_dir):
            if file.startswith('photo_hashes_') and file.endswith('.json'):
                generated_file = os.path.join(self.test_dir, file)
                break
        
        self.assertIsNotNone(generated_file, "photo_hashes JSON file was not created.")
        
        # Verify the content of the generated file
        with open(generated_file, 'r') as f:
            data = json.load(f)
            
        self.assertEqual(len(data), 5, "Should have processed 5 files.")
        
        # Check for expected keys and hash values
        hashes = [item['hash'] for item in data]
        
        # Expected hashes for 'abc', 'def', and 'xyz'
        hash_abc = hashlib.sha256('abc'.encode()).hexdigest()
        hash_def = hashlib.sha256('def'.encode()).hexdigest()
        hash_xyz = hashlib.sha256('xyz'.encode()).hexdigest()
        
        self.assertEqual(hashes.count(hash_abc), 2, "Should have two hashes for 'abc'.")
        self.assertEqual(hashes.count(hash_def), 2, "Should have two hashes for 'def'.")
        self.assertEqual(hashes.count(hash_xyz), 1, "Should have one hash for 'xyz'.")
        
        # Verify the 'size' key exists
        self.assertTrue('size' in data[0], "Each entry should have a 'size' key.")
    
    def test_photo_duplicates_script(self):
        """Test the functionality of photo_duplicates.py."""
        # First, create a dummy input file for the duplicates script
        input_data = [
            {"hash": "hash_abc", "path": "path1", "size": 100},
            {"hash": "hash_xyz", "path": "path2", "size": 200},
            {"hash": "hash_abc", "path": "path3", "size": 100}, # Duplicate
            {"hash": "hash_def", "path": "path4", "size": 300},
            {"hash": "hash_def", "path": "path5", "size": 300}, # Duplicate
            {"hash": "hash_def", "path": "path6", "size": 300}, # Duplicate
        ]
        
        input_file_path = os.path.join(self.test_dir, 'dummy_hashes.json')
        with open(input_file_path, 'w') as f:
            json.dump(input_data, f)
            
        # Run the duplicates script
        photo_duplicates.find_duplicates(input_file=input_file_path)
        
        # Verify the output file was created
        generated_file = None
        for file in os.listdir(self.test_dir):
            if file.startswith('photo_duplicates_') and file.endswith('.json'):
                generated_file = os.path.join(self.test_dir, file)
                break
                
        self.assertIsNotNone(generated_file, "photo_duplicates JSON file was not created.")
        
        with open(generated_file, 'r') as f:
            output_data = json.load(f)
            
        # Check summary details
        summary = output_data['summary']
        self.assertEqual(summary['total_files_processed'], 6)
        self.assertEqual(summary['unique_photos_found'], 3)
        self.assertEqual(summary['duplicate_photos_found'], 3)
        self.assertEqual(summary['total_storage_consumed_bytes'], 700) # 100 + 300 + 300
        
        # Check duplicates list
        duplicates_list = output_data['duplicates']
        self.assertEqual(len(duplicates_list), 3)
        
        # Verify original_path key exists and is correct
        duplicate_1 = duplicates_list[0]
        self.assertEqual(duplicate_1['path'], 'path3')
        self.assertEqual(duplicate_1['original_path'], 'path1')
        
        # Verify all duplicate entries have the original path key
        for item in duplicates_list:
            self.assertIn('original_path', item, "Duplicate entry must have 'original_path' key.")

    def test_end_to_end_workflow(self):
        """Test the full workflow from hash generation to duplicate analysis."""
        # Step 1: Generate hashes
        create_photo_hash_list.generate_photo_hashes(self.photos_dir, output_dir=self.test_dir)
        
        # Find the generated hash file
        hash_file_path = None
        for file in os.listdir(self.test_dir):
            if file.startswith('photo_hashes_'):
                hash_file_path = os.path.join(self.test_dir, file)
                break
        
        self.assertIsNotNone(hash_file_path, "Hash file was not generated.")
        
        # Step 2: Run the duplicate analysis script on the generated file
        photo_duplicates.find_duplicates(input_file=hash_file_path)
        
        # Find the generated duplicates file
        dupes_file_path = None
        for file in os.listdir(self.test_dir):
            if file.startswith('photo_duplicates_'):
                dupes_file_path = os.path.join(self.test_dir, file)
                break
        
        self.assertIsNotNone(dupes_file_path, "Duplicates file was not generated.")
        
        # Verify the content of the duplicates file
        with open(dupes_file_path, 'r') as f:
            output_data = json.load(f)
            
        summary = output_data['summary']
        duplicates_list = output_data['duplicates']
        
        self.assertEqual(summary['total_files_processed'], 5, "Total files processed mismatch.")
        self.assertEqual(summary['unique_photos_found'], 3, "Unique photos mismatch.")
        self.assertEqual(summary['duplicate_photos_found'], 2, "Duplicate photos mismatch.")
        
        # Check that the two duplicate files are correctly identified
        self.assertEqual(len(duplicates_list), 2)
        
        # Verify the original path for a duplicate
        for dup in duplicates_list:
            if 'subfolder' in dup['path']:
                # This is photo5.jpg, its original should be photo4.jpg
                self.assertIn('photo4.jpg', dup['original_path'], "Original path for photo5 is incorrect.")
            else:
                # This is photo2.jpg, its original should be photo1.jpg
                self.assertIn('photo1.jpg', dup['original_path'], "Original path for photo2 is incorrect.")

if __name__ == '__main__':
    # Add a check to ensure we can import the scripts correctly
    try:
        import create_photo_hash_list
        import photo_duplicates
    except ImportError:
        print("Could not import scripts. Please ensure you are running the test from the project root.")
        sys.exit(1)
        
    unittest.main()
    
