import os
import json
import hashlib
from datetime import datetime
import tempfile
import logging

# New function to get the list of photos
def get_photo_list(directory):
    photo_list = []
    
    # use nested function to handle errors
    def log_walk_error(e):
        logging.error(f"Error accessing directory: {e}")
    
    for root, _, files in os.walk(directory, onerror=log_walk_error):
                logging.debug(f"root: {root}, files: {files}")
        
                for file in files:
                    if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                        photo_list.append(os.path.join(root, file))
    return photo_list

# Updated function to use a temporary directory for progress
def generate_photo_hashes(directory):
    photo_list = get_photo_list(directory)
    total_files = len(photo_list)
    processed_count = 0
    photo_hashes = []

    # Use a temporary file for progress
    temp_dir = tempfile.gettempdir()
    progress_path = os.path.join(temp_dir, 'scan_progress.json')
    
    # Use a dictionary in memory to track progress
    progress_data = {'processed': 0, 'total': total_files, 'status': 'scanning'}

    # Write initial progress to disk
    try:
        with open(progress_path, 'w') as f:
            json.dump(progress_data, f)
    except IOError as e:
        logging.error(f"Failed to write initial progress file: {e}")
        # I need to decide how to handle this error, e.g., continue without progress updates.

    for photo_path in photo_list:
        try:
            with open(photo_path, 'rb') as f:
                photo_hash = hashlib.sha256(f.read()).hexdigest()
            
            photo_hashes.append({
                'hash': photo_hash,
                'path': photo_path,
                'size': os.path.getsize(photo_path)
            })
            
            processed_count += 1
            
            # Update progress every 50 files or at the end
            if processed_count % 50 == 0 or processed_count == total_files:
                with open(progress_path, 'w') as f:
                    json.dump({'processed': processed_count, 'total': total_files, 'status': 'scanning'}, f)

        except FileNotFoundError:
            logging.warning(f"File not found: {photo_path}")
        except PermissionError:
            logging.warning(f"Permission denied for: {photo_path}")
        except Exception as e:
            logging.error(f"An unexpected error occurred processing {photo_path}: {e}")

    # Final status update in memory
    progress_data['status'] = 'complete'
    progress_data['processed'] = total_files
    
    # Final write to disk
    try:
        with open(progress_path, 'w') as f:
            json.dump(progress_data, f)
    except IOError as e:
        logging.error(f"Failed to write final progress file: {e}")
    
    # Return the full hash list and the progress file path
    return photo_hashes, progress_path
    
if __name__ == '__main__':
    # This block is for command-line use only. The backend will call the function directly.
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        filename='app.log', # The file to write to
        filemode='a')       # 'a' for append, 'w' for overwrite)
    
    import sys
    if len(sys.argv) > 1:
        directory_to_scan = os.path.abspath(sys.argv[1])
        logging.info(f"director_to_scan:  {directory_to_scan}")
        hashes, progress_path = generate_photo_hashes(directory_to_scan)
        
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        output_filename = f"photo_hashes_{timestamp}.json"
        logging.info(f"output file: {output_filename}")
        
        with open(output_filename, 'w') as f:
            json.dump(hashes, f, indent=4)
        
        print(f"Photo hashes saved to {output_filename}")
    else:
        print("Usage: python create_photo_hash_list.py <directory_path>")