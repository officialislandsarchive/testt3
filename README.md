# Chat App

A simple chat application using Flask, JavaScript, and Google's Gemini AI.

## Features
- User-friendly chat interface
- AI-powered responses using Gemini AI
- Saves chat history during the session
- Lightweight and easy to set up

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/chat-app.git
cd chat-app
```

### 2. Install Dependencies
Ensure you have Python installed, then run:
```bash
pip install -r requirements.txt
```

### 3. Set Up Environment Variables
Create a `.env` already file in the project root and add your Google API key:
```
GOOGLE_API_KEY=your_api_key_here
```
(Replace `your_api_key_here` with your actual Gemini AI API key.)

### 4. Run the Flask Server
```bash
python app.py
```
The server will start at `http://127.0.0.1:3000/`.

### 5. Open the Chat App
Simply open `http://127.0.0.1:3000/` in your browser.

## Dependencies
The app requires the following Python libraries:
```txt
flask
flask-cors
google-generativeai
python-dotenv
```
Install them with:
```bash
pip install -r requirements.txt
```

---

## Troubleshooting
- **Issue:** `GOOGLE_API_KEY not found`
  - Solution: Make sure `.env` is set up with your API key and restart the app.
- **Issue:** `ModuleNotFoundError: No module named 'flask'`
  - Solution: Run `pip install -r requirements.txt`.
- **Issue:** AI not responding
  - Solution: Check Flask logs for errors, ensure your API key is valid.

---

## License
MIT License. Feel free to use and modify this project!