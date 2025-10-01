import os
import json
import hashlib
from datetime import datetime
import tempfile
import logging

# This helper function is good. Added debug logging.
def get_photo_list(directory):
    """Walks a directory and returns a list of paths to potential photo files."""
    photo_list = []
    logging.debug(f"Starting directory walk for: {directory}")
    
    def log_walk_error(e):
        logging.error(f"Error accessing directory during os.walk: {e}")
    
    for root, _, files in os.walk(directory, onerror=log_walk_error):
        logging.debug(f"Scanning directory: {root}")
        for file in files:
            # Check for common image file extensions
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff')):
                full_path = os.path.join(root, file)
                photo_list.append(full_path)
                logging.debug(f"Found potential photo: {full_path}")
    
    logging.debug(f"Found a total of {len(photo_list)} potential photos.")
    return photo_list

# This is the new, replacement function with callbacks, error handling, and logging.
def generate_photo_hashes(directory_path, progress_callback=None):
    """
    Generates SHA256 hashes for all image files in a directory.

    Args:
        directory_path (str): The absolute path to the directory to scan.
        progress_callback (function, optional): A function to call with progress updates.
                                                 It will be called with (processed_count, total_files).
    
    Returns:
        tuple: A tuple containing (photo_hashes, photo_data)
               - photo_hashes: dict mapping hashes to lists of file paths (for finding duplicates).
               - photo_data: list of dicts with details for each photo (for potential reports).
    """
    logging.debug("--- generate_photo_hashes function started ---")
    
    # Step 1: Get the list of files to process
    photo_list = get_photo_list(directory_path)
    total_files = len(photo_list)
    logging.debug(f"Total files to process: {total_files}")

    # Initialize variables
    processed_count = 0
    photo_hashes = {}  # Dict for mapping hash -> [paths]
    photo_data = []    # List for storing {'path': ..., 'hash': ...}

    # Step 2: Loop through each photo and generate a hash
    for photo_path in photo_list:
        try:
            # Open file in binary read mode
            with open(photo_path, 'rb') as f:
                # Read the entire file's content and generate a hash
                photo_hash = hashlib.sha256(f.read()).hexdigest()
            
            logging.debug(f"Successfully hashed {photo_path} -> {photo_hash}")

            # Store the hash for duplicate detection
            if photo_hash in photo_hashes:
                photo_hashes[photo_hash].append(photo_path)
            else:
                photo_hashes[photo_hash] = [photo_path]
            
            # Store the detailed data
            photo_data.append({
                'hash': photo_hash,
                'path': photo_path,
                'size': os.path.getsize(photo_path)
            })
            
            processed_count += 1
            
            # Call the progress callback if it exists
            # Update every 25 files or on the very last file to ensure 100% is reported
            if progress_callback and (processed_count % 25 == 0 or processed_count == total_files):
                logging.debug(f"Calling progress_callback with ({processed_count}, {total_files})")
                progress_callback(processed_count, total_files)

        # Replicating the error handling from your previous version
        except FileNotFoundError:
            logging.warning(f"File not found during hashing, skipping: {photo_path}")
        except PermissionError:
            logging.warning(f"Permission denied for file, skipping: {photo_path}")
        except Exception as e:
            logging.error(f"An unexpected error occurred processing {photo_path}: {e}")

    logging.debug(f"--- generate_photo_hashes function finished. Processed {processed_count} files. ---")
    
    return photo_hashes, photo_data
    
if __name__ == '__main__':
    # This block is for command-line use only. The backend will call the function directly.
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        filename='create_hash_list.log', # Log file for standalone runs
        filemode='w') # 'w' for overwrite
    
    # Also log to console for immediate feedback
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    logging.getLogger('').addHandler(console_handler)

    import sys
    if len(sys.argv) > 1:
        directory_to_scan = os.path.abspath(sys.argv[1])
        logging.info(f"Starting standalone scan for directory: {directory_to_scan}")
        
        # Example of a simple callback for command-line use
        def cli_progress(processed, total):
            print(f"Progress: {processed} / {total} files hashed.")

        hashes, data = generate_photo_hashes(directory_to_scan, progress_callback=cli_progress)
        
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        output_filename = f"photo_hashes_{timestamp}.json"
        
        logging.info(f"Saving hash data to output file: {output_filename}")
        with open(output_filename, 'w') as f:
            json.dump(data, f, indent=4)
        
        print(f"\nScan complete. Photo hash data saved to {output_filename}")
    else:
        print("Usage: python create_photo_hash_list.py <directory_path>")