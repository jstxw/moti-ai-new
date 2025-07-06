document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.querySelector(".reminder__start-button");
  const countdown = document.getElementById("countdownDisplay");

  // Start timer when user clicks the button
  startBtn.addEventListener("click", () => {
    console.log("Start button clicked");

    const selectedRadio = document.querySelector(
      'input[name="duration"]:checked'
    );
    const manualInput = document.getElementById("timeInput").value;

    const duration = selectedRadio
      ? parseInt(selectedRadio.value)
      : parseInt(manualInput);

    if (isNaN(duration) || duration <= 0) {
      alert("Please enter a valid time in minutes.");
      return;
    }

    const startTime = Date.now();

    chrome.storage.local.set(
      {
        reminderStart: startTime,
        reminderDuration: duration,
      },
      () => {
        startCountdown(startTime, duration);
      }
    );
  });

  // Restore countdown on load if active
  chrome.storage.local.get(["reminderStart", "reminderDuration"], (data) => {
    const { reminderStart, reminderDuration } = data;

    if (!reminderStart || !reminderDuration) return;

    const elapsed = Math.floor((Date.now() - reminderStart) / 1000);
    const totalSeconds = reminderDuration * 60;
    const timeLeft = totalSeconds - elapsed;

    if (timeLeft > 0) {
      startCountdown(reminderStart, reminderDuration);
    } else {
      countdown.textContent = "Time is up!";
    }
  });

  // Countdown timer function
  function startCountdown(startTime, duration) {
    const totalSeconds = duration * 60;
    let timeLeft = totalSeconds - Math.floor((Date.now() - startTime) / 1000);

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
  }

  // Format time nicely
  function updateCountdownDisplay(seconds) {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    countdown.textContent = `Time remaining: ${mins}:${secs}`;
  }
});

// --- Page Toggle ---
const setReminderLink = document.querySelector('.reminder__nav-link[href="#"]');
const viewReminderLink = document.querySelectorAll(".reminder__nav-link")[1];
const botLink = document.getElementById("navBot"); // ✅ Get Bot tab link

const content = document.querySelector(".reminder__content");
const setSection = content.querySelectorAll(
  "label, .reminder__input-group, .reminder__radio-group, .reminder__button-row"
);
const viewSection = document.querySelector(".reminder__view");

setReminderLink.addEventListener("click", (e) => {
  e.preventDefault();
  setSection.forEach((el) => (el.style.display = ""));
  if (viewSection) viewSection.style.display = "none";
});

viewReminderLink.addEventListener("click", (e) => {
  e.preventDefault();
  setSection.forEach((el) => (el.style.display = "none"));
  if (viewSection) viewSection.style.display = "block";
});

// ✅ Navigate to bot.html when Bot tab is clicked
botLink.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "bot.html";
});
const input = document.querySelector(".reminder__input");
const button = document.querySelector(".reminder__button");

button.addEventListener("click", () => {
  const value = input.value.trim();

  document.getElementById(
    "displayReminder"
  ).textContent = `You wanted to be reminded of "${value}"`;
});
const input2 = document.querySelector(".reminder__input2");
const button2 = document.querySelector(".reminder__button2");
button2.addEventListener("click", () => {
  const value2 = input2.value2.trim();
  document.getElementById("displayReminder2").textContent = `"${value2}"`;
});
