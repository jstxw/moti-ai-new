Moti-AI is a friendly and lightweight Chrome extension designed to help you stay on track by delivering timely, motivational reminders. Whether you're battling procrastination, building new habits, or just need a gentle nudge, Moti-AI keeps you focused with custom-timed prompts and encouragement.
Features
Custom Timer: Set a timer for your reminders with preset or custom durations.
Pause/Resume: Pause and resume your main timer at any time.
Multiple Timers: Start additional independent timers for different tasks.
Task List: Add, select, and delete tasks. Each timer can be associated with a task.
Task Display: The currently selected or input task is displayed above the timer.
Emoji Selector: Choose an emoji to associate with each task for a fun, visual touch.
Motivational Audio: Background music plays automatically when the popup opens, with a button to pause or resume playback.
Persistent State: Timer and task state are saved using Chrome's storage API, so your reminders persist even if you close the popup.
AI Chatbot: Integrated with OpenAI's GPT-3.5-turbo for motivational chat and productivity advice (API key required).
Modern UI: Clean, consistent, and responsive design with intuitive controls.
Installation
Clone or Download the Repository:
Open Chrome and Navigate to Extensions:
Go to chrome://extensions/
Enable "Developer mode" (top right)
Click "Load unpacked" and select the extension boilerplate/files directory.
(Optional) Set Up OpenAI API Key:
Open bot.js and replace the apiKey placeholder with your OpenAI API key for chatbot functionality.
Usage
Open the Extension: Click the Moti-AI icon in your Chrome toolbar.
Set a Reminder:
Enter a task in the input box.
Select a duration or enter a custom time.
Click "Start Timer For Reminder" to begin.
Manage Tasks:
Use the green button to add tasks to your list.
Click on a task to select it, or use the "×" button to delete.
Multiple Timers: Click "Start Another Reminder" to create additional timers.
Pause/Resume: Use the "Pause Timer" button to pause or resume the main timer.
Motivational Music: Music plays automatically; use the "Pause Music" button to control playback.
Chatbot: Switch to the chatbot tab for motivational advice or productivity tips.
File Structure
popup.html, popup.js, style.css: Main extension popup UI and logic.
bot.html, bot.js: AI chatbot interface and logic.
manifest.json: Chrome extension manifest.
ai_server.py: (If used) Backend server for advanced AI features.
dropdown.js, view_reminder.html: Additional UI components.
Development Notes
For local testing outside Chrome, a mock for chrome.storage.local is included in popup.js.
The extension uses the Chrome Scripting API for certain features (e.g., grayscale mode).
Ensure all file paths in manifest.json are correct and permissions are set as needed.
License
MIT License
