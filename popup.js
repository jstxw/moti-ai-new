// Mock chrome.storage.local for local testing (REMOVE FOR PRODUCTION)
if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
  window.chrome = {
    storage: {
      local: {
        set: (obj, cb) => {
          const existing = JSON.parse(localStorage.getItem("reminder") || "{}");
          localStorage.setItem(
            "reminder",
            JSON.stringify({ ...existing, ...obj })
          );
          if (cb) cb();
        },
        get: (keys, cb) => {
          const data = JSON.parse(localStorage.getItem("reminder") || "{}");
          if (Array.isArray(keys)) {
            const result = {};
            keys.forEach((k) => {
              result[k] = data[k];
            });
            cb(result);
          } else if (typeof keys === "object") {
            const result = {};
            Object.keys(keys).forEach((k) => {
              result[k] = data[k];
            });
            cb(result);
          } else {
            cb(data);
          }
        },
      },
    },
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("popupAudio");
  const pauseMusicBtn = document.getElementById("pauseMusicBtn");
  if (audio) {
    audio.play().catch((e) => {
      console.log("Autoplay blocked:", e);
    });
    if (pauseMusicBtn) {
      pauseMusicBtn.addEventListener("click", () => {
        if (audio.paused) {
          audio.play();
          pauseMusicBtn.textContent = "Pause Music";
        } else {
          audio.pause();
          pauseMusicBtn.textContent = "Play Music";
        }
      });
    }
  }
  const startBtn = document.querySelector(".reminder__start-button");
  const countdown = document.getElementById("countdownDisplay");
  const pauseBtn = document.getElementById("pauseTimerBtn");
  const reminderTaskDisplay = document.getElementById("reminderTaskDisplay");
  const anotherTimerBtn = document.querySelector(
    ".reminder__start-button--secondary"
  );
  const timersContainer = document.getElementById("timersContainer");
  const removeMainTimerBtn = document.getElementById("removeMainTimerBtn");

  let timer = null; // Track the timer interval globally
  let paused = false;
  let pausedTimeLeft = null;
  let currentTask = "";

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
        if (timer) clearInterval(timer);
        paused = false;
        pausedTimeLeft = null;
        pauseBtn.textContent = "Pause Timer";
        startCountdown(startTime, duration);
        showMainTimerControls();
      }
    );
  });

  // Restore countdown on load if active
  chrome.storage.local.get(
    [
      "reminderStart",
      "reminderDuration",
      "reminderPaused",
      "reminderPausedTimeLeft",
      "reminderTask",
    ],
    (data) => {
      const {
        reminderStart,
        reminderDuration,
        reminderPaused,
        reminderPausedTimeLeft,
        reminderTask,
      } = data;

      if (!reminderStart || !reminderDuration) return;

      let timeLeft;
      if (reminderPaused && reminderPausedTimeLeft) {
        paused = true;
        pausedTimeLeft = reminderPausedTimeLeft;
        timeLeft = reminderPausedTimeLeft;
        pauseBtn.textContent = "Resume Timer";
        updateCountdownDisplay(timeLeft);
        reminderTaskDisplay.textContent = reminderTask
          ? `Task: ${reminderTask}`
          : "";
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
          reminderTaskDisplay.textContent = reminderTask
            ? `Task: ${reminderTask}`
            : "";
          showMainTimerControls();
        } else {
          countdown.textContent = "Time is up!";
        }
      }
    }
  );

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
          chrome.storage.local.set({
            reminderPaused: false,
            reminderPausedTimeLeft: null,
          });
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
      chrome.storage.local.set({
        reminderPaused: true,
        reminderPausedTimeLeft: secondsLeft,
      });
    } else {
      // Resume the timer
      paused = false;
      pauseBtn.textContent = "Pause Timer";
      chrome.storage.local.get(
        ["reminderStart", "reminderDuration"],
        (data) => {
          // Use pausedTimeLeft as the new countdown
          if (timer) clearInterval(timer);
          startCountdown(
            Date.now() - (data.reminderDuration * 60 - pausedTimeLeft) * 1000,
            data.reminderDuration,
            true
          );
          chrome.storage.local.set({
            reminderPaused: false,
            reminderPausedTimeLeft: null,
          });
        }
      );
    }
  });

  // Remove main timer functionality
  removeMainTimerBtn.addEventListener("click", () => {
    if (timer) clearInterval(timer);
    timer = null;
    countdown.textContent = "Time remaining: 00:00";
    pauseBtn.style.display = "none";
    removeMainTimerBtn.style.display = "none";
    reminderTaskDisplay.textContent = "";
  });

  // Show pause and remove buttons when timer is started
  function showMainTimerControls() {
    pauseBtn.style.display = "";
    removeMainTimerBtn.style.display = "";
  }

  // Start Another Reminder button logic
  if (anotherTimerBtn) {
    anotherTimerBtn.addEventListener("click", () => {
      let timersContainer = document.getElementById("timersContainer");
      if (!timersContainer) {
        timersContainer = document.createElement("div");
        timersContainer.id = "timersContainer";
        // Insert after the main timer area
        const mainTimerBox =
          document.getElementById("mainCountdownBox")?.parentElement;
        if (mainTimerBox && mainTimerBox.parentNode) {
          mainTimerBox.parentNode.insertBefore(
            timersContainer,
            mainTimerBox.nextSibling
          );
        } else {
          document.body.appendChild(timersContainer);
        }
      }
      // Timer creation logic
      const selectedRadio = document.querySelector(
        'input[name="duration"]:checked'
      );
      const manualInput = document.getElementById("timeInput").value;
      let duration = null;
      if (selectedRadio) {
        duration = parseInt(selectedRadio.value);
      } else if (manualInput && !isNaN(parseInt(manualInput))) {
        duration = parseInt(manualInput);
      }
      if (!duration || isNaN(duration) || duration <= 0) {
        alert("Please enter a valid time in minutes.");
        return;
      }
      const timerDiv = document.createElement("div");
      timerDiv.className = "additional-timer";
      timerDiv.style.marginTop = "16px";
      timerDiv.style.padding = "12px 16px";
      timerDiv.style.background = "#f8fafc";
      timerDiv.style.border = "1.5px solid #e2e8f0";
      timerDiv.style.borderRadius = "8px";
      timerDiv.style.display = "flex";
      timerDiv.style.alignItems = "center";
      timerDiv.style.gap = "16px";

      // Countdown (styled like main timer)
      const countdownSpan = document.createElement("span");
      countdownSpan.style.fontFamily = "monospace";
      countdownSpan.style.fontSize = "1.1rem";
      countdownSpan.style.fontWeight = "bold";
      countdownSpan.style.color = "#374151";
      countdownSpan.style.background = "#f8fafc";
      countdownSpan.style.padding = "8px 16px";
      countdownSpan.style.borderRadius = "8px";
      countdownSpan.style.border = "1px solid #e2e8f0";
      timerDiv.appendChild(countdownSpan);

      // Pause/Resume button
      const pauseBtn = document.createElement("button");
      pauseBtn.textContent = "Pause Timer";
      pauseBtn.className = "reminder__button";
      pauseBtn.style.marginLeft = "12px";
      timerDiv.appendChild(pauseBtn);

      // Remove button
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "×";
      removeBtn.className = "delete-task-btn";
      removeBtn.style.marginLeft = "8px";
      timerDiv.appendChild(removeBtn);

      timersContainer.appendChild(timerDiv);
      console.log("Created new additional timer:", duration);

      // Timer logic
      let totalSeconds = duration * 60;
      let timeLeft = totalSeconds;
      let paused = false;
      let interval = null;

      function updateCountdownDisplay() {
        if (timeLeft <= 0) {
          countdownSpan.textContent = "Time is up!";
          return;
        }
        const mins = Math.floor(timeLeft / 60)
          .toString()
          .padStart(2, "0");
        const secs = (timeLeft % 60).toString().padStart(2, "0");
        countdownSpan.textContent = `Time remaining: ${mins}:${secs}`;
      }

      function startTimer() {
        updateCountdownDisplay();
        interval = setInterval(() => {
          if (!paused) {
            timeLeft--;
            updateCountdownDisplay();
            if (timeLeft <= 0) {
              clearInterval(interval);
              countdownSpan.textContent = "Time is up!";
              alert("Time to do your task!");
            }
          }
        }, 1000);
      }

      pauseBtn.addEventListener("click", () => {
        if (!paused) {
          paused = true;
          pauseBtn.textContent = "Resume";
        } else {
          paused = false;
          pauseBtn.textContent = "Pause";
        }
      });

      removeBtn.addEventListener("click", () => {
        clearInterval(interval);
        timerDiv.remove();
      });

      startTimer();
    });
  }
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

// Black & White mode for the whole page (Sound tab)
const changeColorBtn = document.getElementById("changeColor");
if (changeColorBtn && chrome.tabs && chrome.scripting) {
  changeColorBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        let style = document.getElementById("bw-global-style");
        if (style) {
          style.remove();
        } else {
          style = document.createElement("style");
          style.id = "bw-global-style";
          style.textContent = "html { filter: grayscale(1) !important; }";
          document.head.appendChild(style);
        }
      },
    });
  });
}

// Task dropdown functionality
const input = document.querySelector(".reminder__input");
const button = document.querySelector(".reminder__button");
let tasks = [];
let selectedTask = null;

const dropdownContainer = document.createElement("div");
dropdownContainer.className = "task-dropdown-container";
dropdownContainer.style.display = "none";
const inputGroup = document.querySelector(".reminder__input-group");
inputGroup.parentNode.insertBefore(dropdownContainer, inputGroup.nextSibling);

button.addEventListener("click", (e) => {
  e.stopPropagation();
  const value = input.value.trim();

  if (value) {
    if (!tasks.includes(value)) {
      tasks.push(value);
    }

    selectedTask = value;
    updateDropdown();
    showDropdown();

    input.value = "";
  }
});

function updateDropdown() {
  dropdownContainer.innerHTML = "";

  if (tasks.length === 0) {
    dropdownContainer.style.display = "none";
    return;
  }

  dropdownContainer.style.display = "block";

  const header = document.createElement("div");
  header.className = "dropdown-header";
  header.textContent = "Your Tasks:";
  dropdownContainer.appendChild(header);

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

input.addEventListener("click", (e) => {
  e.stopPropagation();
  if (tasks.length > 0) {
    showDropdown();
  }
});

// --- Emoji Selector Logic ---
let currentEmoji = "😊"; // Default emoji
document.addEventListener("DOMContentLoaded", () => {
  const emojiBtns = document.querySelectorAll(".emoji-btn");
  if (emojiBtns.length > 0) {
    emojiBtns[0].classList.add("selected");
    currentEmoji = emojiBtns[0].textContent;
  }
  emojiBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      emojiBtns.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      currentEmoji = btn.textContent;
    });
  });
});
