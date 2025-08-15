import os
import hashlib
import json
import datetime

def generate_photo_hashes(directory, output_dir="."):
    """
    Recursively scans a directory for photos, calculates their SHA256 hash,
    and records the file path and size. The output file will have a timestamp
    in its name.

    Args:
        directory (str): The path to the directory to scan.
        output_dir (str): The directory where the output JSON file will be saved.
    """
    photo_hashes = []
    photo_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp')

    for dirpath, _, filenames in os.walk(directory):
        for filename in filenames:
            if filename.lower().endswith(photo_extensions):
                file_path = os.path.join(dirpath, filename)
                
                try:
                    sha256_hash = hashlib.sha256()
                    with open(file_path, "rb") as f:
                        for byte_block in iter(lambda: f.read(4096), b""):
                            sha256_hash.update(byte_block)
                    
                    file_size = os.path.getsize(file_path)

                    photo_hashes.append({
                        "hash": sha256_hash.hexdigest(),
                        "path": file_path,
                        "size": file_size
                    })
                except Exception as e:
                    print(f"Error processing file {file_path}: {e}")

    # Generate a timestamped filename
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"photo_hashes_{timestamp}.json"
    
    # Construct the full output path
    output_path = os.path.join(output_dir, output_filename)

    with open(output_path, 'w') as f:
        json.dump(photo_hashes, f, indent=4)
    print(f"Processed {len(photo_hashes)} files. Data saved to {output_path}")

# Example usage (assuming you are passing the directory to scan as a command-line argument)
if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python create_photo_hash_list.py <directory_to_scan>")
    else:
        target_directory = sys.argv[1]
        generate_photo_hashes(target_directory)