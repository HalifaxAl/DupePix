from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os
import sys

# Ensure DupePix scripts are in the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import create_photo_hash_list

app = Flask(__name__)
CORS(app)  # This is crucial for allowing the frontend to make requests

@app.route('/scan', methods=['POST'])
def scan_directory():
    data = request.get_json()
    scan_directory = data.get('scan_directory')

    if not scan_directory:
        return jsonify({"error": "No directory path provided."}), 400

    if not os.path.isdir(scan_directory):
        return jsonify({"error": "The provided path is not a valid directory."}), 400

    try:
        # Construct the command to call the script.
        # This will call the script's main function with the provided directory.
        create_photo_hash_list.generate_photo_hashes(scan_directory)
        
        # You could also use subprocess if your scripts are not in the path
        # subprocess.run(["python3", "create_photo_hash_list.py", scan_directory], check=True)
        
        return jsonify({"message": f"Scan of '{scan_directory}' initiated successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)