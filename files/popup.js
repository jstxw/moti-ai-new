// Mock chrome.storage.local for local testing (REMOVE FOR PRODUCTION)
if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
  window.chrome = {
    storage: {
      local: {
        set: (obj, cb) => {
          const existing = JSON.parse(localStorage.getItem("reminder") || "{}")
          localStorage.setItem("reminder", JSON.stringify({ ...existing, ...obj }));
          if (cb) cb();
        },
        get: (keys, cb) => {
          const data = JSON.parse(localStorage.getItem("reminder") || "{}");
          if (Array.isArray(keys)) {
            const result = {};
            keys.forEach(k => { result[k] = data[k]; });
            cb(result);
          } else if (typeof keys === "object") {
            const result = {};
            Object.keys(keys).forEach(k => { result[k] = data[k]; });
            cb(result);
          } else {
            cb(data);
          }
        }
      }
    }
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.querySelector(".reminder__start-button");
  const countdown = document.getElementById("countdownDisplay");
  const pauseBtn = document.getElementById("pauseTimerBtn");
  const reminderTaskDisplay = document.getElementById("reminderTaskDisplay");

  let timer = null; // Track the timer interval globally
  let paused = false;
  let pausedTimeLeft = null;
  let currentTask = "";

  // Start timer when user clicks the button
  startBtn.addEventListener("click", () => {
    console.log("Start button clicked");

    const selectedRadio = document.querySelector(
      'input[name="duration"]:checked'
    );
    const manualInput = document.getElementById("timeInput").value;
    const reminderInput = document.getElementById("reminderInput").value.trim();

    let duration = null;
    if (selectedRadio) {
      duration = parseInt(selectedRadio.value);
    } else if (manualInput && !isNaN(parseInt(manualInput))) {
      duration = parseInt(manualInput);
    }

    if (!duration || isNaN(duration) || duration <= 0) {
      countdown.textContent = "Please select or enter a valid time in minutes.";
      alert("Please enter a valid time in minutes.");
      return;
    }

    // Save the current task
    currentTask = reminderInput;
    reminderTaskDisplay.textContent = currentTask ? `Task: ${currentTask}` : "";

    const startTime = Date.now();

    chrome.storage.local.set(
      {
        reminderStart: startTime,
        reminderDuration: duration,
        reminderPaused: false,
        reminderPausedTimeLeft: null,
        reminderTask: currentTask,
      },
      () => {
        if (timer) clearInterval(timer); // Clear any previous timer
        paused = false;
        pausedTimeLeft = null;
        pauseBtn.textContent = "Pause Timer";
        startCountdown(startTime, duration);
      }
    );
  });

  // Restore countdown on load if active
  chrome.storage.local.get(["reminderStart", "reminderDuration", "reminderPaused", "reminderPausedTimeLeft", "reminderTask"], (data) => {
    const { reminderStart, reminderDuration, reminderPaused, reminderPausedTimeLeft, reminderTask } = data;

    if (!reminderStart || !reminderDuration) return;

    let timeLeft;
    if (reminderPaused && reminderPausedTimeLeft) {
      paused = true;
      pausedTimeLeft = reminderPausedTimeLeft;
      timeLeft = reminderPausedTimeLeft;
      pauseBtn.textContent = "Resume Timer";
      updateCountdownDisplay(timeLeft);
      reminderTaskDisplay.textContent = reminderTask ? `Task: ${reminderTask}` : "";
    } else {
      const elapsed = Math.floor((Date.now() - reminderStart) / 1000);
      const totalSeconds = reminderDuration * 60;
      timeLeft = totalSeconds - elapsed;
      if (timeLeft > 0) {
        if (timer) clearInterval(timer);
        paused = false;
        pausedTimeLeft = null;
        pauseBtn.textContent = "Pause Timer";
        startCountdown(reminderStart, reminderDuration);
        reminderTaskDisplay.textContent = reminderTask ? `Task: ${reminderTask}` : "";
      } else {
        countdown.textContent = "Time is up!";
        reminderTaskDisplay.textContent = "";
      }
    }
  });

  // Countdown timer function
  function startCountdown(startTime, duration, resumeFromPaused) {
    let totalSeconds = duration * 60;
    let timeLeft;
    if (resumeFromPaused && pausedTimeLeft) {
      timeLeft = pausedTimeLeft;
    } else {
      timeLeft = totalSeconds - Math.floor((Date.now() - startTime) / 1000);
    }

    if (timeLeft <= 0) {
      countdown.textContent = "Time is up!";
      return;
    }

    updateCountdownDisplay(timeLeft);

    if (timer) clearInterval(timer); // Clear any previous timer
    timer = setInterval(() => {
      if (!paused) {
        timeLeft--;
        updateCountdownDisplay(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(timer);
          timer = null;
          countdown.textContent = "Time is up!";
          alert("Time to do your task!");
          chrome.storage.local.set({ reminderPaused: false, reminderPausedTimeLeft: null });
        }
      }
    }, 1000);
  }

  // Format time nicely
  function updateCountdownDisplay(seconds) {
    if (seconds <= 0) {
      countdown.textContent = "Time is up!";
      return;
    }
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    countdown.textContent = `Time remaining: ${mins}:${secs}`;
  }

  // Pause/Resume button logic
  pauseBtn.addEventListener("click", () => {
    // If timer is not running and not paused, do nothing
    if (!timer && !paused) return;

    if (!paused) {
      // Pause the timer
      paused = true;
      pauseBtn.textContent = "Resume Timer";
      // Save the remaining time
      // Find the currently displayed time
      const text = countdown.textContent;
      const match = text.match(/(\d{2}):(\d{2})/);
      let secondsLeft = 0;
      if (match) {
        secondsLeft = parseInt(match[1]) * 60 + parseInt(match[2]);
      }
      pausedTimeLeft = secondsLeft;
      chrome.storage.local.set({ reminderPaused: true, reminderPausedTimeLeft: secondsLeft });
    } else {
      // Resume the timer
      paused = false;
      pauseBtn.textContent = "Pause Timer";
      chrome.storage.local.get(["reminderStart", "reminderDuration"], (data) => {
        // Use pausedTimeLeft as the new countdown
        if (timer) clearInterval(timer);
        startCountdown(Date.now() - ((data.reminderDuration * 60 - pausedTimeLeft) * 1000), data.reminderDuration, true);
        chrome.storage.local.set({ reminderPaused: false, reminderPausedTimeLeft: null });
      });
    }
  });
});

// --- Page Toggle ---
const setReminderLink = document.querySelector('.reminder__nav-link[href="#"]');
const viewReminderLink = document.querySelectorAll(".reminder__nav-link")[1];
const botLink = document.getElementById("navBot");

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

// Navigate to bot.html when Bot tab is clicked
botLink.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "bot.html";
});

// Task dropdown functionality
const input = document.querySelector(".reminder__input");
const button = document.querySelector(".reminder__button");
let tasks = []; // Store all tasks
let selectedTask = null;

// Create dropdown container
const dropdownContainer = document.createElement("div");
dropdownContainer.className = "task-dropdown-container";
dropdownContainer.style.display = "none";
input.parentNode.insertBefore(dropdownContainer, input.nextSibling);

button.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevent document click from closing dropdown immediately
  const value = input.value.trim();

  if (value) {
    // Add task to the list if it's not already there
    if (!tasks.includes(value)) {
      tasks.push(value);
    }

    selectedTask = value;
    updateDropdown();
    showDropdown();

    // Clear input
    input.value = "";
  }
});

function updateDropdown() {
  dropdownContainer.innerHTML = "";

  if (tasks.length === 0) {
    dropdownContainer.style.display = "none";
    return;
  }

  // Add header
  const header = document.createElement("div");
  header.className = "dropdown-header";
  header.textContent = "Your Tasks:";
  dropdownContainer.appendChild(header);

  // Add each task
  tasks.forEach((task, index) => {
    const taskItem = document.createElement("div");
    taskItem.className = "dropdown-item";
    if (task === selectedTask) {
      taskItem.classList.add("selected");
    }

    const taskText = document.createElement("span");
    taskText.textContent = task;
    taskText.className = "task-text";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.className = "delete-task-btn";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      removeTask(index);
    };

    taskItem.appendChild(taskText);
    taskItem.appendChild(deleteBtn);

    taskItem.addEventListener("click", () => {
      selectedTask = task;
      updateDropdown();
      document.getElementById(
        "displayReminder"
      ).textContent = `Selected task: "${task}"`;
    });

    dropdownContainer.appendChild(taskItem);
  });

  // Show selected task info
  if (selectedTask) {
    document.getElementById(
      "displayReminder"
    ).textContent = `Selected task: "${selectedTask}"`;
  }
}

function showDropdown() {
  if (tasks.length > 0) {
    dropdownContainer.style.display = "block";
  }
}

function hideDropdown() {
  dropdownContainer.style.display = "none";
}

function removeTask(index) {
  const removedTask = tasks[index];
  tasks.splice(index, 1);

  // If we removed the selected task, clear selection
  if (selectedTask === removedTask) {
    selectedTask = tasks.length > 0 ? tasks[0] : null;
    if (selectedTask) {
      document.getElementById(
        "displayReminder"
      ).textContent = `Selected task: "${selectedTask}"`;
    } else {
      document.getElementById("displayReminder").textContent = "";
    }
  }

  updateDropdown();

  if (tasks.length === 0) {
    hideDropdown();
  }
}

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (
    !dropdownContainer.contains(e.target) &&
    !input.contains(e.target) &&
    !button.contains(e.target)
  ) {
    hideDropdown();
  }
});

// Show dropdown when clicking on input (if there are tasks)
input.addEventListener("click", (e) => {
  e.stopPropagation();
  if (tasks.length > 0) {
    showDropdown();
  }
});

// Motivation level functionality (keeping original)
const input2 = document.querySelector(".reminder__input2");
const button2 = document.querySelector(".reminder__button2");
button2.addEventListener("click", () => {
  const value2 = input2.value.trim();
  document.getElementById(
    "displayReminder2"
  ).textContent = `Motivation level: "${value2}"`;
});
