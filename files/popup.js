document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.querySelector(".reminder__start-button");
  const countdown = document.getElementById("countdown");

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

    localStorage.setItem("reminderStart", startTime.toString());
    localStorage.setItem("reminderDuration", duration.toString());

    startCountdown(startTime, duration);
  });

  const reminderStart = localStorage.getItem("reminderStart");
  const reminderDuration = localStorage.getItem("reminderDuration");

  if (reminderStart && reminderDuration) {
    const startTime = parseInt(reminderStart);
    const duration = parseInt(reminderDuration);

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const totalSeconds = duration * 60;
    const timeLeft = totalSeconds - elapsed;

    if (timeLeft > 0) {
      startCountdown(startTime, duration);
    } else {
      if (countdown) countdown.textContent = "Time is up!";

      localStorage.removeItem("reminderStart");
      localStorage.removeItem("reminderDuration");
    }
  }

  function startCountdown(startTime, duration) {
    if (!countdown) return;

    const totalSeconds = duration * 60;
    let timeLeft = totalSeconds - Math.floor((Date.now() - startTime) / 1000);

    if (timeLeft <= 0) {
      countdown.textContent = "Time is up!";
      localStorage.removeItem("reminderStart");
      localStorage.removeItem("reminderDuration");
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
        localStorage.removeItem("reminderStart");
        localStorage.removeItem("reminderDuration");
      }
    }, 1000);
  }

  function updateCountdownDisplay(seconds) {
    if (!countdown) return;

    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    countdown.textContent = `Time remaining: ${mins}:${secs}`;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const setReminderLink = document.querySelector("#navSet");
  const botLink = document.getElementById("navBot");

  const content = document.querySelector(".reminder__content");
  const setSection = content.querySelectorAll(
    "label, .reminder__input-group, .reminder__radio-group, .reminder__button-row"
  );

  if (setReminderLink) {
    setReminderLink.addEventListener("click", (e) => {
      e.preventDefault();
      setSection.forEach((el) => (el.style.display = ""));
    });
  }

  if (botLink) {
    botLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "bot.html";
    });
  }

  const input = document.querySelector(".reminder__input");
  const button = document.querySelector(".reminder__button");

  if (input && button) {
    button.addEventListener("click", () => {
      const value = input.value.trim();
      if (value) {
        document.getElementById(
          "displayReminder"
        ).textContent = `You wanted to be reminded of "${value}"`;

        localStorage.setItem("reminderTask", value);
      }
    });

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        button.click();
      }
    });
  }

  const input2 = document.querySelector(".reminder__input2");
  const button2 = document.querySelector(".reminder__button2");

  if (input2 && button2) {
    button2.addEventListener("click", () => {
      const value2 = input2.value.trim();
      if (value2) {
        document.getElementById(
          "displayReminder2"
        ).textContent = `Motivation level: "${value2}"`;
        localStorage.setItem("motivationLevel", value2);
      }
    });

    input2.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        button2.click();
      }
    });
  }
});
