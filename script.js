// =============================================
// SCRIPT.JS — To-Do List App
// Handles: adding, completing, deleting tasks,
//          localStorage, filtering, due dates
// =============================================


// ── 1. State ──────────────────────────────────
// We keep all tasks in a JS array called `tasks`.
// Each task is an object like:
// { id, text, completed, dueDate }

let tasks = [];          // our main array of task objects
let currentFilter = 'all'; // which filter is active: 'all' | 'active' | 'completed'


// ── 2. Load from localStorage on page open ────
// localStorage is a mini database in the browser.
// It stores data as strings, so we use JSON.parse to convert it back to an array.

function loadTasks() {
  const saved = localStorage.getItem('myTasks'); // get stored string
  if (saved) {
    tasks = JSON.parse(saved); // convert JSON string → JS array
  }
  render(); // display whatever we loaded
}


// ── 3. Save to localStorage ──────────────────
// Called every time tasks change.
// JSON.stringify converts our array → string for storage.

function saveTasks() {
  localStorage.setItem('myTasks', JSON.stringify(tasks));
}


// ── 4. Add a Task ─────────────────────────────
// Reads the input field, creates a task object, adds it to the array.

function addTask() {
  const input    = document.getElementById('taskInput');
  const dateInput = document.getElementById('dueDateInput');

  const text    = input.value.trim();      // remove extra spaces
  const dueDate = dateInput.value;         // "2025-12-31" or ""

  // Don't add empty tasks
  if (!text) {
    input.focus();
    input.placeholder = 'Please type a task first!';
    setTimeout(() => { input.placeholder = 'What needs to be done?'; }, 2000);
    return;
  }

  // Build the task object
  const newTask = {
    id:        Date.now(),    // unique ID using timestamp
    text:      text,
    completed: false,
    dueDate:   dueDate        // empty string if not set
  };

  tasks.push(newTask);       // add to our array
  saveTasks();               // save to localStorage
  render();                  // update the screen

  // Clear inputs after adding
  input.value    = '';
  dateInput.value = '';
  input.focus();
}

// Allow pressing Enter in the input field to add a task
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('taskInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });
  loadTasks(); // load saved tasks when page opens
});


// ── 5. Toggle Complete ────────────────────────
// Finds the task by id and flips its `completed` value.

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id); // find the right task
  if (task) {
    task.completed = !task.completed;         // flip true ↔ false
    saveTasks();
    render();
  }
}


// ── 6. Delete a Task ─────────────────────────
// Filters out the task with the matching id.

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id); // keep all EXCEPT this one
  saveTasks();
  render();
}


// ── 7. Clear All Completed ───────────────────
// Removes every task that is marked done.

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
}


// ── 8. Set Filter ─────────────────────────────
// Updates the active filter and re-renders the list.

function setFilter(filter) {
  currentFilter = filter;

  // Update which button looks "active"
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  // Find the button that matches the filter and mark it active
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.textContent.toLowerCase().trim() === filter ||
        (filter === 'all' && btn.textContent.trim() === 'All') ||
        (filter === 'active' && btn.textContent.trim() === 'Active') ||
        (filter === 'completed' && btn.textContent.trim() === 'Completed')) {
      btn.classList.add('active');
    }
  });

  render();
}


// ── 9. Format Due Date for Display ───────────
// Converts "2025-12-31" → "Dec 31, 2025"

function formatDate(dateStr) {
  if (!dateStr) return '';
  // Add T00:00:00 to avoid timezone shift issues
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}


// ── 10. Check if a date is overdue ───────────
// Returns true if the due date is before today.

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);           // reset to start of today
  const due = new Date(dateStr + 'T00:00:00');
  return due < today;
}


// ── 11. Render (Draw) the Task List ──────────
// This is the MAIN function that updates the page.
// It clears the list and re-draws every task from scratch.

function render() {
  const listEl    = document.getElementById('taskList');
  const emptyEl   = document.getElementById('emptyState');
  const summaryEl = document.getElementById('taskSummary');

  // Apply the current filter to decide which tasks to show
  let visibleTasks = tasks;
  if (currentFilter === 'active') {
    visibleTasks = tasks.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    visibleTasks = tasks.filter(t => t.completed);
  }

  // Clear the list so we can re-draw it
  listEl.innerHTML = '';

  // Show/hide empty state message
  if (visibleTasks.length === 0) {
    emptyEl.style.display = 'block';
  } else {
    emptyEl.style.display = 'none';
  }

  // Update the summary text  e.g. "3 tasks · 1 completed"
  const totalCount    = tasks.length;
  const doneCount     = tasks.filter(t => t.completed).length;
  const activeCount   = totalCount - doneCount;
  summaryEl.textContent = totalCount === 0
    ? ''
    : `${activeCount} remaining · ${doneCount} completed`;

  // Build and insert HTML for each visible task
  visibleTasks.forEach(task => {
    // Create a list item element
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');

    // Build the due date section (if any)
    let dueDateHTML = '';
    if (task.dueDate) {
      const overdue = !task.completed && isOverdue(task.dueDate);
      dueDateHTML = `
        <div class="task-due ${overdue ? 'overdue' : ''}">
          📅 ${formatDate(task.dueDate)}${overdue ? ' — Overdue!' : ''}
        </div>`;
    }

    // Set the inner HTML for this task item
    // We use template literals (backtick strings) to embed variables
    li.innerHTML = `
      <input
        type="checkbox"
        class="task-checkbox"
        ${task.completed ? 'checked' : ''}
        onchange="toggleComplete(${task.id})"
        title="Mark as complete"
      />
      <div class="task-content">
        <div class="task-text">${escapeHTML(task.text)}</div>
        ${dueDateHTML}
      </div>
      <button class="delete-btn" onclick="deleteTask(${task.id})" title="Delete task">✕</button>
    `;

    listEl.appendChild(li); // add this item to the list on the page
  });
}


// ── 12. Escape HTML ───────────────────────────
// Safety function: prevents user input from being run as HTML/JS.
// e.g. if someone types <script>alert('hi')</script> — we neutralize it.

function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
