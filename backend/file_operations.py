import os
import logging

def delete_files_from_disk(file_paths: list):
    """
    Deletes a list of files from the disk.

    Args:
        file_paths (list): A list of absolute string paths to the files to be deleted.

    Returns:
        tuple: A tuple containing (deleted_files, failed_files)
    """
    if not isinstance(file_paths, list):
        logging.error("Invalid input to delete_files_from_disk: not a list.")
        return [], [{"path": "N/A", "reason": "Invalid input type, expected a list."}]

    logging.info(f"Attempting to delete {len(file_paths)} files.")
    
    deleted_files = []
    failed_files = []

    for file_path in file_paths:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                deleted_files.append(file_path)
                logging.info(f"Successfully deleted: {file_path}")
            else:
                failed_files.append({"path": file_path, "reason": "File not found."})
                logging.warning(f"Could not delete, file not found: {file_path}")
        except Exception as e:
            failed_files.append({"path": file_path, "reason": str(e)})
            logging.error(f"Error deleting file {file_path}: {e}")
    
    return deleted_files, failed_files