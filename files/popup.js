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

    const startTme = Date.now();

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
