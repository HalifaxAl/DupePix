import json
import logging
import uuid
from datetime import datetime

def find_duplicates(photo_hashes, output_path):
    """
    Identifies duplicate photos from a dictionary of hashes and saves them to a file.

    Args:
        photo_hashes (dict): A dictionary mapping a hash to a list of file paths.
                             Example: {'hash123': ['path/a.jpg', 'path/b.jpg']}
        output_path (str): The path to save the JSON report of duplicates.
    """
    logging.debug("--- find_duplicates function started ---")
    
    # --- IMPROVEMENT 1: Input Validation ---
    if not isinstance(photo_hashes, dict):
        logging.error(f"Invalid input: photo_hashes is not a dictionary (type: {type(photo_hashes)}). Aborting.")
        # We raise an exception to ensure the calling process knows something went wrong.
        raise TypeError("photo_hashes must be a dictionary.")

    # --- IMPROVEMENT 2: Added Contextual Logging ---
    logging.debug(f"Received {len(photo_hashes)} unique hashes to analyze.")

    duplicate_sets = []
    
    for photo_hash, paths in photo_hashes.items():
        if len(paths) > 1:
            logging.debug(f"Found duplicate set for hash {photo_hash}: {paths}")
            
            formatted_duplicates = []
            for path in paths:
                formatted_duplicates.append({
                    "id": str(uuid.uuid4()),
                    "url": path
                })

            duplicate_sets.append({
                "id": photo_hash,
                "duplicates": formatted_duplicates
            })

    output_data = {"duplicates": duplicate_sets}
    
    # --- IMPROVEMENT 3: Added "No Duplicates" Logging ---
    if not duplicate_sets:
        logging.info("Analysis complete: No duplicate sets were found.")
    else:
        logging.debug(f"Found {len(duplicate_sets)} total sets of duplicates.")

    try:
        with open(output_path, 'w') as f:
            json.dump(output_data, f, indent=4)
        logging.info(f"Successfully wrote duplicate report to {output_path}")
    except IOError as e:
        logging.error(f"Failed to write duplicate report to {output_path}: {e}")
        raise

    logging.debug("--- find_duplicates function finished ---")

if __name__ == '__main__':
    import sys
    
    # --- IMPROVEMENT 4: Logging config moved here ---
    # This ensures it only runs for standalone execution, not when imported.
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler("photo_duplicates.log", mode='a'),
            logging.StreamHandler() # Also log to console
        ]
    )

    if len(sys.argv) > 1:
        input_file = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else f"photo_duplicates_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.json"

        try:        
            with open(input_file, 'r') as f:
                # In a real scenario, the input here would be the output of create_photo_hash_list
                # which is a dictionary of hash -> [paths]
                data = json.load(f)
        except (IOError, json.JSONDecodeError) as e:
            logging.error(f"Error reading or parsing input file: {e}")
            sys.exit(1)
        
        find_duplicates(data, output_file)
        logging.info(f"Duplicate report saved to {output_file}")
    else:
        logging.error("Usage: python photo_duplicates.py <input_hash_file> [output_file]")