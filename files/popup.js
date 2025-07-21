document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.querySelector(".reminder__start-button");
  const startAnotherBtn = document.querySelector(".reminder__start-button--secondary");
  let timerCount = 0;

  // Create timers container if it doesn't exist
  function ensureTimersContainer() {
    let timersContainer = document.getElementById("timersContainer");
    if (!timersContainer) {
      timersContainer = document.createElement("div");
      timersContainer.id = "timersContainer";
      timersContainer.style.cssText = `
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      `;
      document.querySelector(".reminder__content").appendChild(timersContainer);
    }
    return timersContainer;
  }

  // Create individual timer display
  function createTimerDisplay(timerId, reminderText, duration) {
    const timerDiv = document.createElement("div");
    timerDiv.id = `timer-${timerId}`;
    timerDiv.style.cssText = `
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #667eea;
    `;

    timerDiv.innerHTML = `
      <div style="font-weight: 600; color: #374151; margin-bottom: 4px;">
        Timer ${timerId}: ${reminderText || "Reminder"}
      </div>
      <div style="font-size: 1.1rem; font-weight: 600; color: #667eea;" class="countdown-display">
        ${formatTime(duration * 60)}
      </div>
      <div style="font-size: 0.85rem; color: #6b7280; margin-top: 4px;">
        Duration: ${duration} minutes
      </div>
    `;

    return timerDiv;
  }

  // Helper function to format time
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  // Start timer function
  function startTimer(isNewTimer = false) {
    console.log("Timer button clicked");

    const selectedRadio = document.querySelector(
      'input[name="duration"]:checked'
    );
    const manualInput = document.getElementById("timeInput").value;
    const reminderText = document.getElementById("reminderInput").value.trim();

    const duration = selectedRadio
      ? parseInt(selectedRadio.value)
      : parseInt(manualInput);

    if (isNaN(duration) || duration <= 0) {
      alert("Please enter a valid time in minutes.");
      return;
    }

    timerCount++;
    const startTime = Date.now();
    const timerId = timerCount;

    // Create timer display
    const timersContainer = ensureTimersContainer();
    const timerDisplay = createTimerDisplay(timerId, reminderText, duration);
    timersContainer.appendChild(timerDisplay);

    // Store timer data
    const timerData = {
      id: timerId,
      startTime: startTime,
      duration: duration,
      reminderText: reminderText,
    };

    // Get existing timers and add new one
    const existingTimers = JSON.parse(localStorage.getItem('activeTimers') || '[]');
    existingTimers.push(timerData);
    localStorage.setItem('activeTimers', JSON.stringify(existingTimers));

    // Start countdown for this timer
    const countdownElement = timerDisplay.querySelector(".countdown-display");
    startCountdown(timerId, startTime, duration, reminderText, countdownElement);

    // Clear form for next timer
    if (isNewTimer) {
      document.getElementById("reminderInput").value = "";
      document.getElementById("timeInput").value = "";
      const checkedRadio = document.querySelector(
        'input[name="duration"]:checked'
      );
      if (checkedRadio) checkedRadio.checked = false;
      document.getElementById("displayReminder").textContent = "";
    }
  }

  // Event listeners for buttons
  startBtn.addEventListener("click", () => startTimer(false));
  startAnotherBtn.addEventListener("click", () => startTimer(true));

  // Restore timers on load
  const activeTimers = JSON.parse(localStorage.getItem('activeTimers') || '[]');
  console.log("Restoring timers:", activeTimers);

  activeTimers.forEach((timer) => {
    const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
    const totalSeconds = timer.duration * 60;
    const timeLeft = totalSeconds - elapsed;

    console.log(`Timer ${timer.id}: elapsed=${elapsed}s, timeLeft=${timeLeft}s`);

    if (timeLeft > 0) {
      // Create timer display
      const timersContainer = ensureTimersContainer();
      const timerDisplay = createTimerDisplay(
        timer.id,
        timer.reminderText,
        timer.duration
      );
      timersContainer.appendChild(timerDisplay);

      // Start countdown
      const countdownElement = timerDisplay.querySelector(".countdown-display");
      console.log(`Starting countdown for restored timer ${timer.id}`);
      startCountdown(
        timer.id,
        timer.startTime,
        timer.duration,
        timer.reminderText,
        countdownElement
      );

      // Update timer count
      if (timer.id > timerCount) {
        timerCount = timer.id;
      }
    }
  });

  // Clean up expired timers
  const validTimers = activeTimers.filter((timer) => {
    const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
    const totalSeconds = timer.duration * 60;
    return totalSeconds - elapsed > 0;
  });

  if (validTimers.length !== activeTimers.length) {
    localStorage.setItem('activeTimers', JSON.stringify(validTimers));
  }

  // Countdown timer function
  function startCountdown(timerId, startTime, duration, reminderText, timerElement) {
    console.log(`Starting countdown for timer ${timerId}, duration: ${duration} minutes`);
    const totalSeconds = duration * 60;
    let intervalId = null;

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const timeLeft = totalSeconds - elapsed;
      
      console.log(`Timer ${timerId}: elapsed=${elapsed}s, timeLeft=${timeLeft}s`);

      if (timeLeft <= 0) {
        if (intervalId) {
          clearInterval(intervalId);
        }
        timerElement.textContent = "Time is up!";
        timerElement.style.color = "#dc2626";
        alert(`Time to do your task: ${reminderText || "Your reminder"}`);

        // Remove completed timer from storage
        removeTimerFromStorage(timerId);

        // Remove timer display after 5 seconds
        setTimeout(() => {
          const timerDiv = document.getElementById(`timer-${timerId}`);
          if (timerDiv) {
            timerDiv.remove();
          }
        }, 5000);
        return;
      }

      updateCountdownDisplay(timerElement, timeLeft);
    };

    // Update immediately
    updateTimer();

    // Set up interval for updates
    intervalId = setInterval(updateTimer, 1000);
    console.log(`Interval set for timer ${timerId}:`, intervalId);
  }

  // Remove timer from storage
  function removeTimerFromStorage(timerId) {
    const activeTimers = JSON.parse(localStorage.getItem('activeTimers') || '[]');
    const updatedTimers = activeTimers.filter((timer) => timer.id !== timerId);
    localStorage.setItem('activeTimers', JSON.stringify(updatedTimers));
  }

  // Format time display
  function updateCountdownDisplay(element, seconds) {
    element.textContent = formatTime(seconds);
  }
});

// --- Page Toggle ---
document.addEventListener("DOMContentLoaded", () => {
  const setReminderLink = document.querySelector('#navSet');
  const botLink = document.getElementById("navBot");

  const content = document.querySelector(".reminder__content");
  const setSection = content.querySelectorAll(
    "label, .reminder__input-group, .reminder__radio-group, .reminder__button-row"
  );

  // Set reminder tab (already active by default)
  if (setReminderLink) {
    setReminderLink.addEventListener("click", (e) => {
      e.preventDefault();
      setSection.forEach((el) => (el.style.display = ""));
    });
  }

  // Navigate to bot.html when Bot tab is clicked
  if (botLink) {
    botLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "bot.html";
    });
  }

  // Task input functionality
  const input = document.querySelector(".reminder__input");
  const button = document.querySelector(".reminder__button");

  if (input && button) {
    button.addEventListener("click", () => {
      const value = input.value.trim();
      if (value) {
        document.getElementById("displayReminder").textContent = 
          `You wanted to be reminded of "${value}"`;
        // Store the task for later use
        localStorage.setItem('reminderTask', value);
      }
    });

    // Also trigger on Enter key
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        button.click();
      }
    });
  }

  // Motivation input functionality (fixed)
  const input2 = document.querySelector(".reminder__input2");
  const button2 = document.querySelector(".reminder__button2");
  
  if (input2 && button2) {
    button2.addEventListener("click", () => {
      const value2 = input2.value.trim(); // Fixed: was input2.value2
      if (value2) {
        document.getElementById("displayReminder2").textContent = 
          `Motivation level: "${value2}"`;
        localStorage.setItem('motivationLevel', value2);
      }
    });

    // Also trigger on Enter key
    input2.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        button2.click();
      }
    });
  }
});