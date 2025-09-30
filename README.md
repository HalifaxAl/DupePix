# DupePix: A Photo Management Tool

DupePix is a desktop application designed to help you find and manage duplicate images within a selected directory. It uses file hashing to accurately identify identical images, providing a simple and effective way to clean up your photo collections.

## Features

*   **Directory Selection:** Natively select any directory on your computer to scan for images.
*   **Duplicate Detection:** Utilizes a Python backend to perform an efficient hash-based scan, accurately identifying identical image files.
*   **Interactive UI:** A clean user interface built with React shows the scan progress, including a real-time count of hashed files.
*   **Visual Feedback:** An engaging animation provides visual feedback during the hashing process.
*   **Results Display:** Duplicate image sets are clearly displayed for review.
*   **Restart Functionality:** Easily start a new scan with the "Start Over" button, which resets the application to its initial state.

## Core Technologies

This project is built with a modern stack, separating the user interface, desktop integration, and backend logic into distinct parts:

*   **Frontend:** [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/) and [Vite](https://vitejs.dev/) for a fast, modern user interface.
*   **Desktop App:** [Electron](https://www.electronjs.org/) to wrap the web frontend into a cross-platform desktop application.
*   **Backend:** [Python](https://www.python.org/) with [Flask](https://flask.palletsprojects.com/) to handle the computationally intensive task of scanning directories and hashing image files.
-   **Styling:** CSS
## Project Structure

The project is structured as a monorepo with three main components. Key files and directories are highlighted below:

```
DupePix/
├── backend/
│   ├── backend.py        # Main Flask application file
│   └── requirements.txt  # Python dependencies
│
├── electron/
│   ├── main.ts           # Electron main process
│   ├── preload.ts        # Script to bridge main and renderer processes
│   └── package.json      # Electron-specific dependencies and scripts
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── App.tsx       # Main application component
│   │   └── useScan.ts    # Hook for backend communication
│   └── package.json      # Frontend dependencies and scripts
│
├── .gitignore
└── README.md
```

This extended view provides much more context about where the important logic resides in each part of the application, which is extremely valuable for anyone looking to understand or contribute to the code.

## Getting Started

### Prerequisites

You will need the following installed on your system:

*   [Node.js](https://nodejs.org/) (which includes npm)
*   [Python 3](https://www.python.org/downloads/) and `pip`

## Setup and Installation

Follow these steps to get the project running on your local machine.

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/HalifaxAl/dupepix.git
    cd dupepix
    ```

2.  **Set Up the Python Backend**
    *   Create and activate a virtual environment:
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```
    *   Install the required Python packages:
        ```bash
        pip install -r backend/requirements.txt
        ```

3.  **Install Frontend Dependencies**
    ```bash
    cd frontend
    npm install
    ```

4.  **Install Electron Dependencies**
    ```bash
    cd ../electron
    npm install
    ```

## Running the Application

To run DupePix, you need to start both the backend server and the Electron application in **separate terminals**.

### Terminal 1: Start the Backend

1.  Make sure you are in the project's root directory (`/dupepix`).
2.  Activate the virtual environment if it's not already active:
    ```bash
    source venv/bin/activate
    ```
3.  Run the Flask server:
    ```bash
    python backend/backend.py
    ```
4.  The server will start on `http://127.0.0.1:5000`. Keep this terminal running.

### Terminal 2: Start the Frontend & Electron App

1.  In a **new terminal**, navigate to the `electron` directory:
    ```bash
    cd electron
    ```
2.  Run the `dev` script. This command will automatically build the necessary files, start the Vite development server for the frontend, and launch the Electron window.
    ```bash
    npm run dev
    ```

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue.

## License

This project is licensed under the MIT License.