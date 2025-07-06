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
