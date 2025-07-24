document.addEventListener("DOMContentLoaded", () => {
  const countdown = document.getElementById("countdownDisplay");

  chrome.storage.local.get(["reminderStart", "reminderDuration"], (data) => {
    const { reminderStart, reminderDuration } = data;

    if (!reminderStart || !reminderDuration) {
      countdown.textContent = "No active timer";
      return;
    }

    let timeLeft =
      reminderDuration * 60 - Math.floor((Date.now() - reminderStart) / 1000);

    if (timeLeft <= 0) {
      countdown.textContent = "Time is up!";
      return;
    }

    updateCountdownDisplay(timeLeft);

    const timer = setInterval(() => {
      timeLeft--;
      updateCountdownDisplay(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timer);
        countdown.textContent = "Time is up!";
        alert("Time to do your task!");
      }
    }, 1000);
  });

  function updateCountdownDisplay(seconds) {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    countdown.textContent = `Time remaining: ${mins}:${secs} seconds`;
  }

  document.getElementById("navSet").addEventListener("click", () => {
    window.location.href = "popup.html";

    document.getElementById("navBot").addEventListener("click", () => {
      window.location.href = ".html";
    });
  });
});
