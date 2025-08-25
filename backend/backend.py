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

app = Flask(__name__)
CORS(app)

def perform_scan_and_analysis(directory_path, scan_id):
    progress_file_path = os.path.join(tempfile.gettempdir(), f"scan_progress_{scan_id}.json")
    output_path = os.path.join(tempfile.gettempdir(), f"photo_duplicates_{scan_id}.json")
    
    # Initialize the status to "scanning"
    try:
        with open(progress_file_path, 'w') as f:
            json.dump({"status": "scanning", "message": "Scan initiated."}, f)
    except IOError as e:
        logging.error(f"Failed to create initial progress file for scan {scan_id}: {e}")
        return

    try:
        # Step 1: Generate hashes and get the list of photo data
        photo_hashes, _ = create_photo_hash_list.generate_photo_hashes(directory_path)
        
        # Step 2: Find duplicates and save the report
        photo_duplicates.find_duplicates(photo_hashes, output_path)

        # Final status update for success
        with open(progress_file_path, 'w') as f:
            json.dump({"status": "complete", "message": "Scan and analysis complete."}, f)
        logging.info(f"Scan {scan_id} and analysis completed successfully.")
        
    except Exception as e:
        # Final status update for error
        with open(progress_file_path, 'w') as f:
            json.dump({"status": "error", "message": f"Scan failed: {str(e)}"}, f)
        logging.error(f"An error occurred during scan {scan_id}: {e}")

@app.route('/scan', methods=['POST'])
def start_scan():
    logging.info("Received scan request.")
    
    data = request.get_json()
    
    # This is the requested debug log
    logging.debug(f"Incoming message from /scan: {data}")
    
    scan_directory = data.get('scan_directory')

    if not scan_directory:
        logging.warning("Scan request received with no directory provided.")
        return jsonify({"error": "No directory path provided."}), 400
        
    if not os.path.isdir(scan_directory):
        logging.warning(f"Scan request received for an invalid directory: {scan_directory}")
        return jsonify({"error": "Invalid directory path provided."}), 400

    # Generate a unique ID for this scan
    scan_id = str(uuid.uuid4())
    logging.info(f"Scan {scan_id} initiated for directory: {scan_directory}")

    # Start the scanning process in a new thread
    scan_thread = threading.Thread(target=perform_scan_and_analysis, args=(scan_directory, scan_id))
    scan_thread.start()

    return jsonify({"message": "Scan initiated. Check status endpoint for progress.", "scan_id": scan_id}), 202

@app.route('/scan/status/<scan_id>', methods=['GET'])
def get_scan_status(scan_id):

    # No request.get_json() here
    logging.info(f"Status request received for scan ID: {scan_id}")
    
    progress_file_path = os.path.join(tempfile.gettempdir(), f"scan_progress_{scan_id}.json")
    logging.debug(f"Looking for progress file at: {progress_file_path}")
    
    try:
        with open(progress_file_path, 'r') as f:
            progress = json.load(f)
        return jsonify(progress)
    except FileNotFoundError:
        return jsonify({"status": "waiting", "message": "Scan has not started yet or scan ID is invalid."}), 200
    except Exception as e:
        logging.error(f"Error reading status file for scan {scan_id}: {e}")
        return jsonify({"status": "error", "message": "An error occurred while retrieving scan status."}), 500
       
       
@app.route('/scan/report/<scan_id>', methods=['GET'])
def get_scan_report(scan_id):

    # No request.get_json() here
    logging.info(f"Report request received for scan ID: {scan_id}")
    output_path = os.path.join(tempfile.gettempdir(), f"photo_duplicates_{scan_id}.json")
    logging.debug(f"Looking for report file at: {output_path}")
        
    try:
        if not os.path.exists(output_path):
            logging.warning(f"Report for scan {scan_id} not found.")
            return jsonify({"error": "Scan report is not ready or does not exist."}), 404
        return send_file(output_path, mimetype='application/json')
    except Exception as e:
        logging.error(f"Error serving report for scan {scan_id}: {e}")
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(levelname)s - %(message)s',
        filename='backend.log',
        filemode='a'
    )
    logging.info("Starting backend server.")
    app.run(debug=True, port=5000)