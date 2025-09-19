

# Advocate Chat System (Frontend-Heavy Edition)

A modern, real-time legal consultation platform connecting clients with advocates. This version is built with a minimal Python backend and a powerful, frontend-heavy architecture using Vanilla JavaScript.


*(Note: This is a representative image of the chat interface.)*

## 🌟 Core Features

-   **Minimal Python Backend**: Flask is used only for serving files and a simple API.
-   **Frontend-Driven Logic**: All major functionality is handled by client-side JavaScript.
-   **Separate Chat Histories**: Each advocate has a unique, persistent chat history stored in the browser's `localStorage`.
-   **Instant Video Calls**: Start a video call directly from the chat with a single click. No scheduling needed.
-   **WhatsApp-Style Video UI**: A professional, mobile-friendly video call interface.
-   **Dynamic Advocate Data**: Advocate information is loaded dynamically from a JSON file.
-   **No Login Required**: Instant access to chat and video features.

## 🛠️ Technologies Used

| Category      | Technology                                                                                                          |
| :------------ | :------------------------------------------------------------------------------------------------------------------ |
| **Backend**   | ![Python](https://   |
| **Frontend**  |  ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor    |
| **APIs**      | **WebRTC** (for video), **localStorage** (for storage)                                                              |
| **Styling**   | **Font Awesome** (for icons)                                                                                        |

## 📁 Project Structure

Here is the complete file structure of the project.

```
advocate_chat_app_v2/
├── app.py                    # Minimal Flask server for routing
├── requirements.txt          # Python dependencies (only Flask)
├── README.md                 # This documentation file
├── data/
│   └── advocates.json        # Static data for advocate profiles
├── static/
│   ├── css/
│   │   ├── style.css         # Main styles for landing and chat pages
│   │   └── video.css         # Styles for the video call page
│   └── js/
│       ├── chat.js           # Handles all chat functionality
│       ├── main.js           # Global utilities and helper functions
│       └── video.js          # Handles all video call functionality
└── templates/
    ├── base.html             # Base HTML template for all pages
    ├── chat.html             # The chat interface
    ├── index.html            # The landing page for advocate selection
    └── video-call.html       # The WhatsApp-style video call page
```

## ⚙️ Installation and Setup

Follow these steps to get the project running on your local machine.

### 1. Prerequisites

-   Python 3.7+ installed on your system.
-   A modern web browser like Chrome, Firefox, or Edge.

### 2. Dependencies

The only Python dependency is **Flask**.

```bash
# Install the required dependency
pip install Flask==2.3.3
```

### 3. Running the Application

1.  **Clone or Download** the project folder to your machine.
2.  **Open a terminal** or command prompt and navigate into the project directory.
    ```bash
    cd advocate_chat_app_v2
    ```
3.  **(Optional but Recommended)** Create and activate a virtual environment.
    ```bash
    # Create environment
    python -m venv venv
    
    # Activate on Windows
    venv\Scripts\activate
    
    # Activate on macOS/Linux
    source venv/bin/activate
    ```
4.  **Install the dependency** using the `requirements.txt` file.
    ```bash
    pip install -r requirements.txt
    ```
5.  **Run the Flask application.**
    ```bash
    python app.py
    ```
6.  **Access the application** by opening your web browser and navigating to:
    -   **URL**: `http://127.0.0.1:5000`

## 📄 File-by-File Explanation

| File Path                   | Description                                                                                                                                  |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `app.py`                    | A minimal Flask server. Its only jobs are to render HTML templates, serve static files (CSS, JS), and provide a simple API to get advocate data. |
| `data/advocates.json`       | A simple JSON file that acts as a database. It stores the profiles of all advocates (name, specialty, etc.).                                     |
| `templates/index.html`      | The landing page. It fetches advocate data from the API, displays them as cards, and lets the user enter their name.                           |
| `templates/chat.html`       | The chat interface. It includes the message area, input box, and buttons to send messages or start a video call.                                |
| `templates/video-call.html` | The WhatsApp-style video call page. This is a self-contained page for handling video communication.                                            |
| `static/js/chat.js`         | **The heart of the chat system.** It handles sending/receiving messages, creating video links, and saving chat history to `localStorage` for each advocate separately. |
| `static/js/video.js`        | **The logic for video calls.** It uses WebRTC to access the camera/mic, handles controls (mute, end call), and fetches the advocate's name. |
| `static/js/main.js`         | Contains helper functions (e.g., notifications, loaders) that can be used across the application.                                           |
| `static/css/*.css`          | Contains all the styling to make the application look modern and professional. `style.css` is for the main app, and `video.css` is for the call page. |

## 🚀 How It Works: The User Flow

1.  **Enter Name & Select Advocate**: The user lands on the `index.html` page, enters their name (which is saved in `localStorage`), and clicks "Start Chat" on an advocate's card.
2.  **Navigate to Chat**: The user is redirected to `chat.html?advocate=adv_id`. The `adv_id` in the URL tells the chat which advocate's history to load.
3.  **Chatting**: The `chat.js` script loads the specific chat history for that advocate from `localStorage` (e.g., from a key like `chatMessages_adv1`). Messages are sent and displayed instantly.
4.  **Start Video Call**: The user clicks the video button. `chat.js` generates a unique room ID and opens `video-call.html` in a new tab with the advocate's ID in the URL.
5.  **Video Call**: The `video.js` script on the new page accesses the camera, shows the WhatsApp-style UI, fetches the advocate's name using the ID from the URL, and handles all call controls.
6.  **End Call**: When the user clicks the end call button, `video.js` stops the camera/mic and automatically closes the tab.

## 🔧 Customization

-   **To add more advocates**: Simply add a new object to the array in the `data/advocates.json` file.
-   **To change the colors**: Modify the CSS variables and color codes in `static/css/style.css` and `static/css/video.css`.
-   **To change functionality**: Most logic can be modified in the JavaScript files (`chat.js` for chat, `video.js` for video calls).

