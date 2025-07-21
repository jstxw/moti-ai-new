document.addEventListener("DOMContentLoaded", () => {
  const countdown = document.getElementById("countdownDisplay");

  // Get stored reminder data
  const reminderStart = localStorage.getItem("reminderStart");
  const reminderDuration = localStorage.getItem("reminderDuration");
  const reminderTask = localStorage.getItem("reminderTask");

  if (!reminderStart || !reminderDuration) {
    if (countdown) {
      countdown.textContent = "No active timer";
      countdown.style.color = "#666";
      countdown.style.fontSize = "1.2rem";
      countdown.style.textAlign = "center";
      countdown.style.marginTop = "20px";
    }
    return;
  }

  const startTime = parseInt(reminderStart);
  const duration = parseInt(reminderDuration);

  let timeLeft = duration * 60 - Math.floor((Date.now() - startTime) / 1000);

  if (timeLeft <= 0) {
    if (countdown) {
      countdown.textContent = "Time is up!";
      countdown.style.color = "#ff4444";
      countdown.style.fontSize = "1.4rem";
      countdown.style.textAlign = "center";
      countdown.style.marginTop = "20px";
    }

    // Clean up expired timer
    localStorage.removeItem("reminderStart");
    localStorage.removeItem("reminderDuration");

    // Show completion message
    alert(
      "Time to do your task!" +
        (reminderTask ? ` Remember: ${reminderTask}` : "")
    );
    return;
  }

  // Display task info if available
  if (reminderTask && countdown) {
    const taskInfo = document.createElement("div");
    taskInfo.textContent = `Task: ${reminderTask}`;
    taskInfo.style.textAlign = "center";
    taskInfo.style.marginBottom = "15px";
    taskInfo.style.fontSize = "1.1rem";
    taskInfo.style.color = "#ff66b2";
    taskInfo.style.fontWeight = "bold";
    countdown.parentNode.insertBefore(taskInfo, countdown);
  }

  updateCountdownDisplay(timeLeft);

  const timer = setInterval(() => {
    timeLeft--;
    updateCountdownDisplay(timeLeft);

    if (timeLeft <= 0) {
      clearInterval(timer);
      if (countdown) {
        countdown.textContent = "Time is up!";
        countdown.style.color = "#ff4444";
      }

      // Clean up
      localStorage.removeItem("reminderStart");
      localStorage.removeItem("reminderDuration");

      alert(
        "Time to do your task!" +
          (reminderTask ? ` Remember: ${reminderTask}` : "")
      );
    }
  }, 1000);

  function updateCountdownDisplay(seconds) {
    if (!countdown) return;

    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");

    countdown.textContent = `Time remaining: ${mins}:${secs}`;
    countdown.style.fontSize = "1.4rem";
    countdown.style.textAlign = "center";
    countdown.style.marginTop = "20px";
    countdown.style.color = timeLeft < 60 ? "#ff6b6b" : "#333";
    countdown.style.fontWeight = "bold";

    // Add urgency styling for last minute
    if (seconds < 60) {
      countdown.style.animation = "pulse 1s infinite";
    }
  }

  // Navigation handlers
  const navSet = document.getElementById("navSet");
  const navBot = document.getElementById("navBot");

  if (navSet) {
    navSet.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "popup.html";
    });
  }

  if (navBot) {
    navBot.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "bot.html";
    });
  }
});

// Add CSS animation for pulse effect
const style = document.createElement("style");
style.textContent = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;
document.head.appendChild(style);
