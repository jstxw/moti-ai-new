<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", () => {
  const chatLog = document.getElementById("chatLog");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");

  // Test server connection on load
  testServerConnection();

  // Initialize chat with welcome message
  addMessage(
    "MotiAI",
    "Hello! I'm your personal productivity assistant. How can I help you today? I can give you motivation, productivity tips, or help you track your goals!",
    "bot"
  );

  // Send message function
  function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
      addMessage("You", message, "user");
      userInput.value = "";

      // Process message and generate response
      setTimeout(() => {
        generateResponse(message).then(response => {
          addMessage("MotiAI", response, "bot");
        });
      }, 500);
    }
  }

  // Add message to chat
  function addMessage(sender, message, type) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}-message`;

    const time = new Date().toLocaleTimeString();
    messageDiv.innerHTML = `
      <div class="message-header">
        <strong>${sender}</strong>
        <span class="message-time">${time}</span>
      </div>
      <div class="message-content">${message}</div>
    `;

    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // Test server connection
  async function testServerConnection() {
    try {
      const response = await fetch('http://localhost:5000/test');
      if (response.ok) {
        console.log('AI server is running!');
        return true;
      }
    } catch (error) {
      console.error('AI server is not running:', error);
      return false;
    }
  }

  // Generate AI response
  async function generateResponse(userMessage) {
    try {
      const response = await fetch('http://localhost:5000/motivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: userMessage
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.message;
      } else {
        console.error('Server error:', response.status);
        return "I'm having trouble connecting right now. Please try again later.";
      }
    } catch (error) {
      console.error('Error calling AI server:', error);
      return "I'm having trouble connecting right now. Please try again later.";
    }
  }

  // Get user statistics
  function getUserStats() {
    const completedTasks = JSON.parse(
      localStorage.getItem("completedTasks") || "[]"
    );
    const motivationLevels = JSON.parse(
      localStorage.getItem("motivationLevels") || "[]"
    );
    const goals = JSON.parse(localStorage.getItem("goals") || "[]");
    const moodHistory = JSON.parse(localStorage.getItem("moodHistory") || "[]");

    return {
      totalTasks: completedTasks.length,
      avgMotivation:
        motivationLevels.length > 0
          ? Math.round(
              motivationLevels.reduce((a, b) => a + b, 0) /
                motivationLevels.length
            )
          : 0,
      activeGoals: goals.filter((g) => !g.completed).length,
      completedGoals: goals.filter((g) => g.completed).length,
      recentMood:
        moodHistory.length > 0
          ? moodHistory[moodHistory.length - 1].mood
          : null,
    };
  }

  // Motivational responses
  function getMotivationalResponse(stats) {
    const responses = [
      "You've got this! Every small step forward is progress. Remember, consistency beats perfection every time.",
      "Your dedication is inspiring! You've completed ${stats.totalTasks} tasks so far. Keep that momentum going!",
      "Motivation comes and goes, but discipline lasts forever. You're building great habits!",
      "Think of how far you've come, not just how far you have to go. You're doing amazing!",
      "Success is not final, failure is not fatal: it is the courage to continue that counts. Keep pushing forward!",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Goal-related responses
  function getGoalResponse(stats) {
    if (stats.activeGoals > 0) {
      return `You have ${stats.activeGoals} active goals and ${stats.completedGoals} completed goals. That's a great balance! Remember to break down big goals into smaller, manageable tasks. What's your next step?`;
    } else if (stats.completedGoals > 0) {
      return `Congratulations! You've completed ${stats.completedGoals} goals. That's fantastic progress! Ready to set some new challenges?`;
    } else {
      return "Setting goals is the first step in turning the invisible into the visible. What would you like to achieve? I can help you break it down into actionable steps!";
    }
  }

  // Productivity tips
  function getProductivityTips(stats) {
    const tips = [
      "Try the Pomodoro Technique: 25 minutes of focused work, then a 5-minute break.",
      "Start your day with your most important task - it sets the tone for everything else.",
      "Eliminate distractions by putting your phone in another room during focused work time.",
      "Use the 2-minute rule: if something takes less than 2 minutes, do it now instead of later.",
      "Batch similar tasks together to reduce context switching and increase efficiency.",
      "Take regular breaks to maintain mental clarity and prevent burnout.",
    ];

    return `Here's a productivity tip for you: ${
      tips[Math.floor(Math.random() * tips.length)]
    }`;
  }

  // Mood responses
  function getMoodResponse(stats) {
    if (stats.recentMood) {
      const moodResponses = {
        excellent:
          "That's wonderful! Your positive energy is contagious. Use this momentum to tackle your most challenging tasks!",
        good: "Great! A good mood is perfect for productivity. What would you like to accomplish today?",
        okay: "It's okay to have okay days. Sometimes the best thing you can do is take small steps forward.",
        bad: "I'm sorry you're feeling down. Remember, it's okay to take it easy today. Maybe try a small, achievable task to build momentum?",
        terrible:
          "I'm here for you. On difficult days, be kind to yourself. Maybe focus on self-care today, and we can tackle tasks when you're feeling better.",
      };

      return (
        moodResponses[stats.recentMood] ||
        "How you're feeling matters. What can I do to support you today?"
      );
    }

    return "How are you feeling today? Tracking your mood can help you understand your productivity patterns!";
  }

  // Stats response
  function getStatsResponse(stats) {
    return `Here's your current progress:
Tasks completed: ${stats.totalTasks}
Average motivation: ${stats.avgMotivation}/10
Active goals: ${stats.activeGoals}
Completed goals: ${stats.completedGoals}

You're making great progress! Keep up the excellent work!`;
  }

  // Help response
  function getHelpResponse() {
    return `I'm your personal productivity assistant! Here's what I can help you with:

Motivation: Ask me for encouragement and motivation
Goals: Get help with goal setting and tracking
Productivity: Receive personalized productivity tips
Mood: Talk about how you're feeling and get support
Stats: Check your progress and achievements

Just ask me anything related to productivity, motivation, or your goals!`;
  }

  // Event listeners
  sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // Navigation
  const setReminderLink = document.querySelector("#navSet");
  if (setReminderLink) {
    setReminderLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "popup.html";
    });
  }
});
=======
document.getElementById("sendBtn").addEventListener("click", async () => {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;

  appendMessage("You", message);
  input.value = "";

  try {
    const response = await fetch("http://127.0.0.1:5000/motivate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    appendMessage("Bot", data.message);
  } catch (err) {
    appendMessage("Bot", "Could not reach server.");
    console.error(err);
  }
});

function appendMessage(sender, text) {
  const chatLog = document.getElementById("chatLog");
  const entry = document.createElement("div");
  entry.textContent = `${sender}: ${text}`;
  chatLog.appendChild(entry);
  chatLog.scrollTop = chatLog.scrollHeight;
}

document.getElementById("navSet").addEventListener("click", () => {
  window.location.href = "popup.html";
});
>>>>>>> 87f593da069f3f8423aa2d40f63701d86336ff72
