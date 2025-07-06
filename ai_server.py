from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import openai
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI()


# Set up Flask app
app = Flask(__name__)
CORS(app)  # Allow requests from different origins like Chrome Extensions

@app.route('/motivate', methods=['POST'])
def motivate():
    data = request.get_json()
    task = data.get("task", "your task")

    prompt = f"Give me a short, encouraging motivational message to help someone focus on: {task}."

    try:
        response = client.responses.create(
            model="gpt-4.1",
            input=[
                {"role": "system", "content": "You are a helpful, fun, motivational assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        message = (response.output_text)
        print(message)
    except Exception as e:
        print("OpenAI Error:", e)
        print(openai.api_key)
        message = "Stay strong! You're doing great."

    return jsonify({"message": message})

@app.route('/chat', methods=['POST'])
def chat():
    print("hi")
    return jsonify({"test": "test"})

if __name__ == '__main__':
    app.run(debug=True)  # Runs on http://localhost:5000
