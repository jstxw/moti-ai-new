# moti-ai
Moti-AI is a friendly and lightweight Chrome extension designed to help you stay on track by delivering timely, motivational reminders. Whether you're battling procrastination, building new habits, or just need a gentle nudge, Moti-AI keeps you focused with custom-timed prompts and encouragement.

💡 How Flask Powered Our Backend API
In our project Moti-AI, Flask served as the lightweight backend API framework that allowed us to dynamically generate motivational content based on user input. Specifically, we used Flask to:

✅ 1. Build a Custom API to Deliver Motivation
We created a /motivate endpoint that accepts a user-defined task (e.g., "finish my homework"), and returns a short, encouraging message tailored to that task. This motivational message is powered by OpenAI's GPT model, accessed securely through our Flask server.

🧠 Why Flask? It’s fast to set up, easy to integrate with modern frontend tools (like Chrome Extensions), and ideal for small, focused APIs like ours.

✅ 2. Handle Requests from a Chrome Extension
Our frontend (a Chrome Extension) sends POST requests to the Flask API when users set a reminder. The Flask server responds with a motivational message like:

“You're doing great! Just focus on one small win.”

This message is then displayed in the extension, giving users a positive push when they need it most.

✅ 3. Allow for Future Expansion
We included a /chat endpoint as a placeholder to demonstrate how Flask can handle multi-route conversational features in the future (e.g., journaling, check-ins, chatbot interactions).

🧠 How We Used OpenAI's GPT-4.1 Model in Moti-AI
One of the key features of Moti-AI is its ability to deliver empathetic, task-specific motivational messages — and this is powered by the GPT-4.1 model from OpenAI.

🔹 Why GPT-4.1?
The GPT-4.1 model represents OpenAI's latest evolution in language modeling, offering:

More accurate and context-aware responses

Faster inference times

Improved emotional tone and style matching

Better alignment with user intent, even from short prompts

For a project like Moti-AI — which aims to give friendly, helpful, and emotionally intelligent nudges — GPT-4.1 gave us exactly the right balance of conciseness, human warmth, and contextual sensitivity.

Note: Flask was run on a .venv to avoid repetition when importing python libraries.
1. .\.venv\Scripts\Activate.ps1
2. pip install flask openai@latest python-dotenv flask-cors
3. python3 ai_server.py

Challenges: First time using flask, bot always returning undefined. Mentors helped me troubleshoot the problem, and taught me how to debug. for example on of the problems was OPENAI updates its implementation, needing me to go into quickstart and changing the old code. Another challenge was deciding the functionality of the app, so that it is both useful but also focused and realistic . 

Learning: Learned how API endpoints work, talk about how I made two for future expansion, learned how to utilize flask as python backend, learned how to make a google chrome extension, learned how to make a functioning timer (even though it is not working here.) learned how to design bubbly and enticing UI. 
