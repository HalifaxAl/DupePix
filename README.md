# DupePix: A Photo Management Tool

DupePix is a full-stack application designed to help you find and manage duplicate photos on your computer. The application uses a Python backend to scan a specified directory, calculate a unique hash for each photo, and identify duplicates. The results are then sent to a React and TypeScript frontend for a user-friendly experience.

## Features

- **Splash Screen:** A branded splash screen is displayed on startup for 5 seconds.
- **Directory Selection:** Select a local directory to scan for photos.
- **Photo Hashing:** The backend invokes `create_photo_hash_list.py` to process photos and generate hashes.
- **Backend API:** A Flask backend provides a RESTful API to communicate with the frontend.
- **User Feedback:** The frontend provides real-time status updates on the scanning process.

## Getting Started

### Prerequisites

You will need the following installed on your system:

* **Python 3.8+**
* **Node.js & npm** (version 14 or higher is recommended)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/dupepix.git](https://github.com/your-username/dupepix.git)
    cd dupepix
    ```

2.  **Set up the Backend:**
    Navigate to the `backend` directory, create and activate a Python virtual environment, and install the required packages.
    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```

3.  **Set up the Frontend:**
    In a **new terminal window**, navigate to the `frontend` directory and install the Node.js dependencies.
    ```bash
    cd ../frontend
    npm install
    ```

## Usage

1.  **Start the Backend Server:**
    From the `backend` directory, with the virtual environment activated:
    ```bash
    python3 backend.py
    ```

2.  **Start the Frontend Server:**
    From the `frontend` directory:
    ```bash
    npm start
    ```

The application will open in your default browser. Enter a directory path and click "Start Scan" to begin the process.

## Project Structure

DupePix/
├── backend/
│   ├── backend.py
│   ├── requirements.txt
│   └── venv/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── splash.png
│   ├── src/
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── index.tsx
│   │   └── react-app-env.d.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .gitignore
├── create_photo_hash_list.py
├── photo_duplicates.py
├── .gitignore
├── LICENSE.md
└── README.md

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue.

## License


This project is licensed under the MIT License.
