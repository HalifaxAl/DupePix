import json
import argparse
import os
import time
import datetime

def find_duplicates(input_file):
    """
    Finds duplicate entries in a JSON file, including the path to the original,
    calculates the total storage consumed by duplicates, and saves the results
    in a structured, timestamped JSON file.

    Args:
        input_file (str): The path to the input JSON file.
    """
    start_time = time.time()

    if not os.path.exists(input_file):
        print(f"Error: The file '{input_file}' was not found.")
        return

    try:
        with open(input_file, 'r') as f:
            photo_data = json.load(f)
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from '{input_file}'.")
        return

    seen_hashes = {}
    duplicates = []
    total_size_bytes = 0
    unique_count = 0
    
    for entry in photo_data:
        hash_value = entry.get("hash")
        size_value = entry.get("size")
        path_value = entry.get("path")
        
        if hash_value and size_value is not None and path_value:
            if hash_value in seen_hashes:
                # This is a duplicate. Add the original path.
                duplicate_entry = {
                    "hash": hash_value,
                    "path": path_value,
                    "size": size_value,
                    "original_path": seen_hashes[hash_value]
                }
                duplicates.append(duplicate_entry)
                total_size_bytes += size_value
            else:
                # This is the first time we've seen this hash.
                seen_hashes[hash_value] = path_value
                unique_count += 1
    
    end_time = time.time()
    duration = end_time - start_time
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M")
    output_filename = f"photo_duplicates_{timestamp}.json"
    
    summary = {
        "input_file_path": input_file,
        "output_file_name": output_filename,
        "total_files_processed": len(photo_data),
        "unique_photos_found": unique_count,
        "duplicate_photos_found": len(duplicates),
        "total_storage_consumed_bytes": total_size_bytes,
        "script_duration_seconds": round(duration, 2)
    }

    output_data = {
        "summary": summary,
        "duplicates": duplicates
    }
    
    output_path = os.path.join(os.path.dirname(input_file), output_filename)

    with open(output_path, 'w') as f:
        json.dump(output_data, f, indent=4)
    
    print(f"Duplicate analysis saved to '{output_path}'.")
    print("\n--- Summary ---")
    print(f"Input file processed: {summary['input_file_path']}")
    print(f"Output file created: {summary['output_file_name']}")
    print(f"Total files processed: {summary['total_files_processed']}")
    print(f"Unique photos found: {summary['unique_photos_found']}")
    print(f"Duplicate photos found: {summary['duplicate_photos_found']}")
    
    if summary['total_storage_consumed_bytes'] > 0:
        total_size_mb = summary['total_storage_consumed_bytes'] / (1024 * 1024)
        total_size_gb = summary['total_storage_consumed_bytes'] / (1024 * 1024 * 1024)
        print(f"Total storage consumed by duplicates: {total_size_mb:.2f} MB ({total_size_gb:.2f} GB)")
    
    print(f"Script duration: {summary['script_duration_seconds']:.2f} seconds")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Find duplicate photo hashes in a JSON file.")
    parser.add_argument("input_file", help="Path to the photo_hashes.json file.")
    args = parser.parse_args()

    find_duplicates(args.input_file)