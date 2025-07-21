document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("sendBtn");
  const userInput = document.getElementById("userInput");
  const navSet = document.getElementById("navSet");

  if (sendBtn && userInput) {
    sendBtn.addEventListener("click", async () => {
      await sendMessage();
    });

    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    });
  }

  if (navSet) {
    navSet.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "popup.html";
    });
  }

  async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage("You", message);
    userInput.value = "";

    appendMessage("Bot", "Thinking...");

    try {
      const storedTask = localStorage.getItem("reminderTask") || "your task";

      const response = await fetch("http://127.0.0.1:5000/motivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: storedTask,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const chatLog = document.getElementById("chatLog");
      const lastMessage = chatLog.lastElementChild;
      if (lastMessage && lastMessage.textContent.includes("Thinking...")) {
        chatLog.removeChild(lastMessage);
      }

      appendMessage(
        "Bot",
        data.message || "I'm here to help you stay motivated!"
      );
    } catch (err) {
      const chatLog = document.getElementById("chatLog");
      const lastMessage = chatLog.lastElementChild;
      if (lastMessage && lastMessage.textContent.includes("Thinking...")) {
        chatLog.removeChild(lastMessage);
      }

      appendMessage(
        "Bot",
        "I'm having trouble connecting to the server right now, but remember: you've got this! Stay focused on your goals."
      );
      console.error("Error:", err);
    }
  }

  function appendMessage(sender, text) {
    const chatLog = document.getElementById("chatLog");
    if (!chatLog) return;

    const entry = document.createElement("div");
    entry.className = sender === "You" ? "user-message" : "bot-message";

    if (sender === "You") {
      entry.style.textAlign = "right";
      entry.style.backgroundColor = "#e6f3ff";
      entry.style.margin = "5px 0";
      entry.style.padding = "8px 12px";
      entry.style.borderRadius = "15px 15px 5px 15px";
    } else {
      entry.style.textAlign = "left";
      entry.style.backgroundColor = "#fff0f8";
      entry.style.margin = "5px 0";
      entry.style.padding = "8px 12px";
      entry.style.borderRadius = "15px 15px 15px 5px";
    }

    entry.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatLog.appendChild(entry);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  appendMessage(
    "Bot",
    "Hello! I'm here to help keep you motivated. How are you feeling about your tasks today?"
  );
});
