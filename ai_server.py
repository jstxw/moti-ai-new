from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import openai
from openai import OpenAI

<<<<<<< HEAD

=======
# Load environment variables from .env file
>>>>>>> 87f593da069f3f8423aa2d40f63701d86336ff72
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI()


<<<<<<< HEAD
app = Flask(__name__)
CORS(app) 
=======
# Set up Flask app
app = Flask(__name__)
CORS(app)  # Allow requests from different origins like Chrome Extensions
>>>>>>> 87f593da069f3f8423aa2d40f63701d86336ff72

@app.route('/motivate', methods=['POST'])
def motivate():
    data = request.get_json()
<<<<<<< HEAD
    task = data.get("task", "I am not sure what to focus on")

    prompt = task
=======
    task = data.get("task", "your task")

    prompt = f"Give me a short, encouraging motivational message to help someone focus on: {task}."
>>>>>>> 87f593da069f3f8423aa2d40f63701d86336ff72

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful, fun, motivational assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150
        )
        message = response.choices[0].message.content
        print(message)
    except Exception as e:
        print("OpenAI Error:", e)
        print("API Key:", openai.api_key[:10] + "..." if openai.api_key else "Not set")
        message = "Stay strong! You're doing great."

    return jsonify({"message": message})

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"status": "Server is running!", "message": "AI server is accessible"})

@app.route('/chat', methods=['POST'])
def chat():
    print("hi")
    return jsonify({"test": "test"})

if __name__ == '__main__':
    print("Starting AI server on http://localhost:5000")
    print("Make sure your OpenAI API key is set in .env file")
    app.run(debug=True, host='0.0.0.0', port=5000)
