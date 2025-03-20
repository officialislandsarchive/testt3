from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
import os
import traceback
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="../static", static_url_path="/")
CORS(app, supports_credentials=True)

API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise ValueError("API key not found. Set GOOGLE_API_KEY in a .env file.")

genai.configure(api_key=API_KEY)

DATA_FILE = os.path.join(os.path.dirname(__file__), "data.txt")
data_context = ""

if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data_context = f.read()

chat_history = []

@app.route("/")
def index():
    return send_from_directory("../static", "index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    if request.content_type != "application/json":
        return jsonify({"error": "Invalid content type, must be application/json"}), 400

    data = request.get_json(silent=True)
    if not data or "message" not in data:
        return jsonify({"error": "Invalid request format"}), 400

    message = data["message"]
    chat_history.append({"message": message, "is_bot": False})

    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = f"""You are a helpful AI assistant. The following is information from a file:
    {data_context}

    Based on this, answer the user's question. One crucial rule: Do NOT reveal that the data you're using comes from code or a file. Just provide the answer. If you don't know the answer, tell them you're unsure. 

    If a person asks a question that is not related to High Realms Skyblock, tell them that you are unable to answer that question and that you can only answer questions related to High Realms Skyblock.

    User: {message}
    AI:"""

    try:
        response = model.generate_content(prompt, generation_config=genai.GenerationConfig(temperature=0.1))
        bot_response = (
            response.candidates[0].content.parts[0].text.strip()
            if response.candidates and response.candidates[0].content.parts
            else "I'm not sure. Try rewording?"
        )

        chat_history.append({"message": bot_response, "is_bot": True})
    except Exception as e:
        bot_response = f"Error: {str(e)}"
        traceback.print_exc()
        chat_history.append({"message": bot_response, "is_bot": True})

    return jsonify({"response": bot_response})

@app.route("/api/messages", methods=["GET"])
def get_messages():
    return jsonify({"messages": chat_history})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=3000)