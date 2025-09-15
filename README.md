# DupePix: A Photo Management Tool

DupePix is a full-stack desktop application designed to help you find and manage duplicate photos on your computer. The application uses a Python backend to scan a specified directory and identify duplicates, and an Electron/React frontend for a user-friendly experience.

## Features

- **Splash Screen:** A branded splash screen is displayed on startup.
- **Native Directory Selection:** Uses the operating system's native file dialog to select a directory.
- **Photo Hashing & Analysis:** The backend processes photos to generate hashes and find duplicates.
- **User Feedback:** The frontend provides real-time status updates on the scanning process.

## Technology Stack

-   **Frontend:** React, TypeScript
-   **Desktop Framework:** Electron, TypeScript
-   **Backend:** Python, Flask
-   **Styling:** CSS

## Project Structure

The project is structured as a monorepo with three main components:

```
DupePix/
├── backend/        # Python Flask server for image processing
├── electron/       # Electron wrapper for the desktop application
├── frontend/       # React/TypeScript user interface
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

You will need the following installed on your system:

*   **Python 3.8+**
*   **Node.js & npm** (version 14 or higher is recommended)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/dupepix.git
    cd dupepix
    ```

2.  **Set up the Backend:**
    Create and activate a Python virtual environment, and install the required packages.
    ```bash
    # From the project root directory (dupepix/)
    python3 -m venv venv
    source venv/bin/activate
    pip install -r backend/requirements.txt
    ```

3.  **Set up the Frontend and Electron:**
    Install the Node.js dependencies for both the React app and the Electron wrapper.
    ```bash
    # Install frontend dependencies
    cd frontend
    npm install

    # Install Electron dependencies
    cd ../electron
    npm install
    ```

## Usage

To run the application for development, you will need two separate terminals running concurrently.

1.  **Start the Backend Server:**
    From the project root directory (`dupepix/`), with the virtual environment activated:
    ```bash
    source venv/bin/activate
    python backend/backend.py
    ```
    The backend will start on `http://localhost:5000`.

2.  **Start the Frontend & Electron App:**
    In a new terminal, navigate to the `electron` directory and run the `dev` script:
    ```bash
    cd electron
    npm run dev
    ```
    This command will compile the Electron TypeScript files, then launch both the React development server and the Electron application window.

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue.

## License

This project is licensed under the MIT License.