# DupePix

DupePix is a command-line tool designed to help you find and manage duplicate photos in your digital photo collection. It works by generating unique cryptographic hashes for each photo and then analyzing these hashes to identify duplicates. The tool provides a detailed report, including the total storage space consumed by duplicate files, to assist you in cleaning up your photo library.

## Features

-   **Hash Generation**: Recursively scans a specified directory to generate a unique SHA256 hash for each photo.
-   **File Metadata**: Captures essential metadata, including file size and path, for each photo.
-   **Duplicate Detection**: Identifies all duplicate photos based on their unique hashes.
-   **Comprehensive Reports**: Generates a detailed JSON report that includes:
    -   A summary of the analysis (total files, unique photos, duplicates).
    -   The total storage space that can be reclaimed.
    -   The path of the original photo for each duplicate, allowing for easy verification.
    -   A timestamp to ensure unique report names.

## Getting Started

### Prerequisites

-   Python 3.6 or higher

### Installation

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/HalifaxAl/DupePix.git](https://github.com/HalifaxAl/DupePix.git)
    cd DupePix
    ```

### Usage

The workflow involves two main steps:

1.  **Generate a hash list of your photos**:
    Run the `create_photo_hash_list.py` script, providing the path to your photo directory. This will create a timestamped `photo_hashes_YYYYMMDD_HHMMSS.json` file in the specified directory.

    ```bash
    python3 create_photo_hash_list.py "/path/to/your/photo/directory"
    ```

2.  **Analyze the hash list to find duplicates**:
    Run the `photo_duplicates.py` script, providing the path to the JSON file you just created. This will generate a `photo_duplicates_YYYYMMDD_HHMM.json` report in the same directory.

    ```bash
    python3 photo_duplicates.py "/path/to/your/photo/directory/photo_hashes_YYYYMMDD_HHMMSS.json"
    ```

    The generated report will contain a `summary` and a `duplicates` section, which includes the original file path for each duplicate.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.