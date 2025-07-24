// dropdown.js - Task Dropdown Management

class TaskDropdown {
  constructor() {
    this.tasks = [];
    this.selectedTask = null;
    this.input = null;
    this.button = null;
    this.dropdownContainer = null;
    this.displayElement = null;

    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Get elements
    this.input = document.querySelector(".reminder__input");
    this.button = document.querySelector(".reminder__button");
    this.displayElement = document.getElementById("displayReminder");

    if (!this.input || !this.button || !this.displayElement) {
      console.error("Required elements not found for task dropdown");
      return;
    }

    // Create dropdown container
    this.createDropdownContainer();

    // Set up event listeners
    this.setupEventListeners();

    // Load saved tasks from storage (if using Chrome extension storage)
    this.loadSavedTasks();
  }

  createDropdownContainer() {
    this.dropdownContainer = document.createElement("div");
    this.dropdownContainer.className = "task-dropdown-container";
    this.dropdownContainer.style.display = "none";

    // Insert after the input group
    this.input.parentNode.insertBefore(
      this.dropdownContainer,
      this.input.parentNode.nextSibling
    );
  }

  setupEventListeners() {
    // Add task button click
    this.button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.addTask();
    });

    // Show dropdown when clicking on input
    this.input.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.tasks.length > 0) {
        this.showDropdown();
      }
    });

    // Handle Enter key in input
    this.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.addTask();
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !this.dropdownContainer.contains(e.target) &&
        !this.input.contains(e.target) &&
        !this.button.contains(e.target)
      ) {
        this.hideDropdown();
      }
    });
  }

  addTask() {
    const value = this.input.value.trim();

    if (value) {
      // Add task to the list if it's not already there
      if (!this.tasks.includes(value)) {
        this.tasks.push(value);
        this.saveTasks(); // Save to storage
      }

      this.selectedTask = value;
      this.updateDropdown();
      this.showDropdown();

      // Clear input
      this.input.value = "";
    }
  }

  updateDropdown() {
    this.dropdownContainer.innerHTML = "";

    if (this.tasks.length === 0) {
      this.dropdownContainer.style.display = "none";
      return;
    }

    // Add header
    const header = document.createElement("div");
    header.className = "dropdown-header";
    header.textContent = "Your Tasks:";
    this.dropdownContainer.appendChild(header);

    // Add each task
    this.tasks.forEach((task, index) => {
      const taskItem = this.createTaskItem(task, index);
      this.dropdownContainer.appendChild(taskItem);
    });

    // Update display
    this.updateSelectedTaskDisplay();
  }

  createTaskItem(task, index) {
    const taskItem = document.createElement("div");
    taskItem.className = "dropdown-item";

    if (task === this.selectedTask) {
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
      this.removeTask(index);
    };

    taskItem.appendChild(taskText);
    taskItem.appendChild(deleteBtn);

    taskItem.addEventListener("click", () => {
      this.selectTask(task);
    });

    return taskItem;
  }

  selectTask(task) {
    this.selectedTask = task;
    this.updateDropdown();
    this.updateSelectedTaskDisplay();
  }

  updateSelectedTaskDisplay() {
    if (this.selectedTask && this.displayElement) {
      this.displayElement.textContent = `Selected task: "${this.selectedTask}"`;
      this.displayElement.style.color = "#000000";
    }
  }

  removeTask(index) {
    const removedTask = this.tasks[index];
    this.tasks.splice(index, 1);
    this.saveTasks(); // Save changes

    // If we removed the selected task, select another one or clear
    if (this.selectedTask === removedTask) {
      this.selectedTask = this.tasks.length > 0 ? this.tasks[0] : null;
    }

    this.updateDropdown();
    this.updateSelectedTaskDisplay();

    if (this.tasks.length === 0) {
      this.hideDropdown();
      if (this.displayElement) {
        this.displayElement.textContent = "";
      }
    }
  }

  showDropdown() {
    if (this.tasks.length > 0) {
      this.dropdownContainer.style.display = "block";
    }
  }

  hideDropdown() {
    this.dropdownContainer.style.display = "none";
  }

  // Get the currently selected task
  getSelectedTask() {
    return this.selectedTask;
  }

  // Get all tasks
  getAllTasks() {
    return [...this.tasks];
  }

  // Clear all tasks
  clearAllTasks() {
    this.tasks = [];
    this.selectedTask = null;
    this.updateDropdown();
    this.hideDropdown();
    if (this.displayElement) {
      this.displayElement.textContent = "";
    }
    this.saveTasks();
  }

  // Save tasks to Chrome storage (if available)
  saveTasks() {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({
        userTasks: this.tasks,
        selectedTask: this.selectedTask,
      });
    } else {
      // Fallback to localStorage for testing
      localStorage.setItem("userTasks", JSON.stringify(this.tasks));
      localStorage.setItem("selectedTask", this.selectedTask || "");
    }
  }

  // Load tasks from Chrome storage (if available)
  loadSavedTasks() {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["userTasks", "selectedTask"], (data) => {
        if (data.userTasks) {
          this.tasks = data.userTasks;
          this.selectedTask = data.selectedTask || null;
          this.updateDropdown();
          this.updateSelectedTaskDisplay();
        }
      });
    } else {
      // Fallback to localStorage for testing
      const savedTasks = localStorage.getItem("userTasks");
      const savedSelectedTask = localStorage.getItem("selectedTask");

      if (savedTasks) {
        try {
          this.tasks = JSON.parse(savedTasks);
          this.selectedTask = savedSelectedTask || null;
          this.updateDropdown();
          this.updateSelectedTaskDisplay();
        } catch (e) {
          console.error("Error loading saved tasks:", e);
        }
      }
    }
  }
}

// Create global instance
let taskDropdown;

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    taskDropdown = new TaskDropdown();
  });
} else {
  taskDropdown = new TaskDropdown();
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = TaskDropdown;
}
