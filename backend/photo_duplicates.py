import json
import os
from datetime import datetime
from collections import defaultdict
import logging
# Add this at the top of the file
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='app.log',
    filemode='a'
)    

def find_duplicates(input_data, output_path):
    hash_to_path = defaultdict(list)
    for photo in input_data:
        hash_to_path[photo['hash']].append(photo)

    duplicates_list = []
    unique_hashes = 0
    total_files = 0
    total_storage_consumed = 0

    for photo_hash, photos in hash_to_path.items():
        if len(photos) > 1:
            # Sort to keep the first one as the 'original'
            photos.sort(key=lambda x: x['path'])
            original = photos[0]
            for duplicate in photos[1:]:
                duplicate['original_path'] = original['path']
                duplicates_list.append(duplicate)
            
            unique_hashes += 1
            total_files += len(photos)
            total_storage_consumed += sum(p['size'] for p in photos)
        else:
            unique_hashes += 1
            total_files += 1
            total_storage_consumed += photos[0]['size']

    summary = {
        'timestamp': datetime.now().isoformat(),
        'total_files_processed': total_files,
        'unique_photos_found': unique_hashes,
        'duplicate_photos_found': len(duplicates_list),
        'total_storage_consumed_bytes': total_storage_consumed
    }

    output_data = {
        'summary': summary,
        'duplicates': duplicates_list
    }

    try:
        with open(output_path, 'w') as f:
            json.dump(output_data, f, indent=4)
    except IOError as e:
        # Use logging instead of print for errors
        print(f"Error writing to output file: {e}")
        return None
    except TypeError as e:
        print(f"Error serializing data to JSON: {e}")
        return None

    return output_data

if __name__ == '__main__':
    import sys
    # Command-line usage is still supported for local testing
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else f"photo_duplicates_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.json"

        try:        
            with open(input_file, 'r') as f:
                data = json.load(f)
        except (IOError, json.JSONDecodeError) as e:
            logging.error(f"Error reading or parsing input file: {e}")
            print(f"Error reading or parsing input file: {e}")
            sys.exit(1)
        
        
        find_duplicates(data, output_file)
        logging.info(f"Duplicate report saved to {output_file}")
        print(f"Duplicate report saved to {output_file}")
    else:
        logging.error("Usage: python photo_duplicates.py <input_hash_file> [output_file]")
        print("Usage: python photo_duplicates.py <input_hash_file> [output_file]")