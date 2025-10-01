from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sys
import threading
import json
from datetime import datetime
import tempfile
import uuid
import logging

import create_photo_hash_list
import photo_duplicates

# --- Logging Configuration ---
# This is located here to ensure it runs before Flask's default logging setup.

# 1. Get the absolute path to the project's root directory.
#    os.path.abspath(__file__) -> /path/to/dupepix/backend/backend.py
#    os.path.dirname(...)      -> /path/to/dupepix/backend
#    os.path.dirname(...)      -> /path/to/dupepix
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 2. Create a timestamp string for the log filename.
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
log_filename_only = f"backend_{timestamp}.log"

# 3. Join the root path and filename to create a full, absolute path.
log_full_path = os.path.join(tempfile.gettempdir(), log_filename_only)

# 4. Configure the logging system using the full path.
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(threadName)s - %(message)s',
    filename=log_full_path,
    filemode='a'
)
# --- End of Logging Configuration ---

app = Flask(__name__)
CORS(app)

def perform_scan_and_analysis(directory_path, scan_id):
    logging.debug(f"--- [THREAD] perform_scan_and_analysis started for scan_id: {scan_id} ---")
    scan_directory = os.path.join(tempfile.gettempdir(), f"scan_progress_{scan_id}.json")
    output_path = os.path.join(tempfile.gettempdir(), f"photo_duplicates_{scan_id}.json")
    logging.debug(f"[THREAD] Progress file path: {scan_directory}")
    logging.debug(f"[THREAD] Output report path: {output_path}")
    
    try:
        # This function will be our progress callback.
        def update_hash_progress(processed, total):
            # --- IMPROVEMENT 2: Specific error handling for progress updates ---
            try:
                logging.debug(f"[THREAD] Progress callback triggered: {processed}/{total} files hashed.")
                progress_data = {
                    "status": "hashing", 
                    "message": f"Hashing file {processed} of {total}...", 
                    "hashed_files": processed,
                    "total_files": total
                }
                with open(scan_directory, 'w') as f:
                    json.dump(progress_data, f)
                logging.debug(f"[THREAD] Wrote progress to file: {progress_data}")
            except IOError as e:
                # Log a specific error if the progress file can't be written.
                # The main exception handler will still catch this and stop the thread.
                logging.error(f"[THREAD] Failed to write progress update for scan {scan_id}: {e}")
                # Re-raise the exception to ensure the main block catches it and terminates the scan.
                raise

        # Step 1: Generate hashes, passing our updated callback.
        logging.debug(f"[THREAD] Calling generate_photo_hashes for directory: {directory_path}")
        photo_hashes, _ = create_photo_hash_list.generate_photo_hashes(directory_path, progress_callback=update_hash_progress)
        logging.debug(f"[THREAD] generate_photo_hashes completed.")
        
        # --- IMPROVEMENT 1: Handle the "No Photos Found" scenario ---
        if not photo_hashes:
            logging.warning(f"[THREAD] No valid photos found in the directory for scan {scan_id}.")
            complete_data = {
                "status": "complete",
                "message": "Scan finished. No image files were found in the selected directory."
            }
            with open(scan_directory, 'w') as f:
                json.dump(complete_data, f)
            logging.debug("[THREAD] Wrote 'no photos found' status and exited thread.")
            return # End the thread execution early.

        # Calculate the final total number of files that were successfully hashed.
        total_hashed_files = sum(len(paths) for paths in photo_hashes.values())
        logging.debug(f"[THREAD] Total files successfully hashed: {total_hashed_files}")

        # Step 2: Update status to "analyzing". This also fits the HashingStatus shape.
        logging.debug("[THREAD] Updating status to 'analyzing'.")
        analyzing_data = {
            "status": "analyzing", 
            "message": "Analyzing for duplicates...", 
            "hashed_files": total_hashed_files,
            "total_files": total_hashed_files
        }
        with open(scan_directory, 'w') as f:
            json.dump(analyzing_data, f)
        logging.debug(f"[THREAD] Wrote analyzing status to file: {analyzing_data}")

        # Step 3: Find duplicates and save the report.
        logging.debug("[THREAD] Calling find_duplicates.")
        photo_duplicates.find_duplicates(photo_hashes, output_path)
        logging.debug(f"[THREAD] find_duplicates completed. Report saved to {output_path}")

        # Step 4: Final status update for success, matching the CompleteStatus interface.
        logging.debug("[THREAD] Updating status to 'complete'.")
        complete_data = {
            "status": "complete", 
            "message": f"Scan complete! Found duplicates among {total_hashed_files} files."
        }
        with open(scan_directory, 'w') as f:
            json.dump(complete_data, f)
        logging.info(f"Scan {scan_id} and analysis completed successfully.")
        logging.debug(f"[THREAD] Wrote complete status to file: {complete_data}")
        
    except Exception as e:
        logging.error(f"Error in scan thread for {scan_id}: {e}", exc_info=True)
        # Update status on error, matching the ErrorStatus interface.
        logging.debug("[THREAD] Updating status to 'error'.")
        error_data = {"status": "error", "message": str(e)}
        # Use a final try/except here in case the disk is full, to prevent a crash.
        try:
            with open(scan_directory, 'w') as f:
                json.dump(error_data, f)
            logging.debug(f"[THREAD] Wrote error status to file: {error_data}")
        except Exception as final_e:
            logging.critical(f"[THREAD] CRITICAL: Failed to write final error status to file for scan {scan_id}: {final_e}")

@app.route('/scan', methods=['POST'])
def start_scan():
    logging.info("--- Endpoint /scan HIT ---")
    
    data = request.get_json()
    logging.debug(f"Request JSON data: {data}")
    
    scan_directory = data.get('directory') # Corrected key

    if not scan_directory:
        logging.warning("Scan request failed: No 'directory' key provided.")
        return jsonify({"error": "No directory path provided."}), 400
        
    if not os.path.isdir(scan_directory):
        logging.warning(f"Scan request failed: Invalid directory path: {scan_directory}")
        return jsonify({"error": "Invalid directory path provided."}), 400

    # Generate a unique ID for this scan
    scan_id = str(uuid.uuid4())
    logging.info(f"Scan {scan_id} initiated for directory: {scan_directory}")

    # Start the scanning process in a new thread
    logging.debug(f"Creating and starting background thread for scan_id: {scan_id}")
    scan_thread = threading.Thread(target=perform_scan_and_analysis, args=(scan_directory, scan_id), name=f"ScanThread-{scan_id[:8]}")
    scan_thread.start()

    response_data = {"message": "Scan initiated. Check status endpoint for progress.", "scan_id": scan_id}
    logging.debug(f"Sending 202 response: {response_data}")
    return jsonify(response_data), 202

@app.route('/scan/status/<scan_id>', methods=['GET'])
def get_scan_status(scan_id):
    logging.info(f"--- Endpoint /scan/status/{scan_id} HIT ---")
    
    scan_progress_file = os.path.join(tempfile.gettempdir(), f"scan_progress_{scan_id}.json")
    logging.debug(f"Attempting to read progress file: {scan_progress_file}")
    
    try:
        with open(scan_progress_file, 'r') as f:
            progress = json.load(f)
        logging.debug(f"Successfully read progress file. Content: {progress}")
        return jsonify(progress)
    except FileNotFoundError:
        logging.warning(f"Progress file not found for scan_id: {scan_id}")
        return jsonify({"status": "waiting", "message": "Scan has not started yet or scan ID is invalid."}), 200
    except Exception as e:
        logging.error(f"Error reading status file for scan {scan_id}: {e}")
        return jsonify({"status": "error", "message": "An error occurred while retrieving scan status."}), 500
       
@app.route('/scan/results/<scan_id>', methods=['GET'])
def get_scan_results(scan_id):
    logging.info(f"--- Endpoint /scan/results/{scan_id} HIT ---")
    output_path = os.path.join(tempfile.gettempdir(), f"photo_duplicates_{scan_id}.json")
    logging.debug(f"Attempting to send results file: {output_path}")
        
    try:
        if not os.path.exists(output_path):
            logging.warning(f"Results file for scan {scan_id} not found.")
            return jsonify({"error": "Scan report is not ready or does not exist."}), 404
        
        logging.debug(f"Sending file: {output_path}")
        return send_file(output_path, mimetype='application/json')
    except Exception as e:
        logging.error(f"Error serving report for scan {scan_id}: {e}")
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    print(f"Current Working Directory: {os.getcwd()}")
    logging.info("--- Starting Flask Backend Server ---")
    print(f"Logging to file: {log_full_path}")
    app.run(debug=True, port=5000)