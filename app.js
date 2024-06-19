// Task management
const newTaskInput = document.getElementById('newTaskInput');
const dueDateInput = document.getElementById('dueDateInput');
const priorityInput = document.getElementById('priorityInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskListUl = document.getElementById('taskListUl');
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const sortSelect = document.getElementById('sortSelect');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let initialX, currentX;

// Task object structure
function Task(text, dueDate, priority, completed) {
    this.text = text;
    this.dueDate = dueDate;
    this.priority = priority;
    this.completed = completed || false;
}

// Render tasks
function renderTasks(tasksToRender = tasks) {
    taskListUl.innerHTML = '';
    const filteredTasks = filterTasks(tasksToRender, filterSelect.value);
    const sortedTasks = sortTasks(filteredTasks, sortSelect.value);
    
    sortedTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.classList.add('task-item');
        li.dataset.index = index;
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompletion(index));
        li.appendChild(checkbox);
        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        li.appendChild(taskText);
        const dueDate = document.createElement('span');
        dueDate.classList.add('due-date');
        dueDate.textContent = task.dueDate ? ` - Due: ${task.dueDate}` : '';
        li.appendChild(dueDate);
        const priority = document.createElement('span');
        priority.classList.add('priority');
        priority.textContent = task.priority ? ` - Priority: ${task.priority}` : '';
        li.appendChild(priority);
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editTask(index));
        li.appendChild(editBtn);
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(index));
        li.appendChild(deleteBtn);
        taskListUl.appendChild(li);
        li.addEventListener('click', handleTaskClick);
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');
        li.appendChild(progressBar);

        // Update progress bar width based on task completion
        if (task.completed) {
            progressBar.style.width = '100%';
            checkbox.checked = true;
        } else {
            progressBar.style.width = '0%';
            checkbox.checked = false;
        }

        taskListUl.appendChild(li);
        li.addEventListener('click', handleTaskClick);

        // Add swipe event listeners
        li.addEventListener('touchstart', handleTouchStart);
        li.addEventListener('touchmove', handleTouchMove);
        li.addEventListener('touchend', handleTouchEnd);
    });
}

// Add new task
addTaskBtn.addEventListener('click', () => {
    const newTaskText = newTaskInput.value.trim();
    const newDueDate = dueDateInput.value;
    const newPriority = priorityInput.value;
    if (newTaskText) {
        const newTask = new Task(newTaskText, newDueDate, newPriority);
        tasks.push(newTask);
        saveTasksToLocalStorage();
        newTaskInput.value = '';
        dueDateInput.value = '';
        priorityInput.value = 'low';
        renderTasks();
    }
});

// Delete task
function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasksToLocalStorage();
    renderTasks();
}

// Toggle task completion
function toggleTaskCompletion(index) {
  const taskItem = taskListUl.children[index];
  const progressBar = taskItem.querySelector('.progress-bar');
  const checkbox = taskItem.querySelector('input[type="checkbox"]');

  if (checkbox.checked) {
      tasks[index].completed = true;
      progressBar.style.width = '100%';
  } else {
      tasks[index].completed = false;
      progressBar.style.width = '0%';
  }

  saveTasksToLocalStorage();
}

function editTask(index) {
  const li = taskListUl.children[index];
  const task = tasks[index];
  const taskTextSpan = li.querySelector('span');
  const taskText = taskTextSpan.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = taskText;
  li.replaceChild(input, taskTextSpan);
  input.focus();
  input.select();

  // Ensure the progress bar does not progress while editing
  const progressBar = li.querySelector('.progress-bar');
  progressBar.style.width = '0%'; // Set progress to 0%

  input.addEventListener('blur', () => {
      task.text = input.value.trim();
      saveTasksToLocalStorage();
      renderTasks();
  });

  input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
          input.blur();
      }
  });
}

// Filter tasks
function filterTasks(tasks, filter) {
    switch (filter) {
        case 'completed':
            return tasks.filter(task => task.completed);
        case 'incomplete':
            return tasks.filter(task => !task.completed);
        case 'overdue':
            return tasks.filter(task => task.dueDate && new Date(task.dueDate) < new Date());
        default:
            return tasks;
    }
}

// Sort tasks
function sortTasks(tasks, sortBy) {
    switch (sortBy) {
        case 'dueDateAsc':
            return tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        case 'dueDateDesc':
            return tasks.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        case 'priorityAsc':
            return tasks.sort((a, b) => a.priority.localeCompare(b.priority));
        case 'priorityDesc':
            return tasks.sort((a, b) => b.priority.localeCompare(a.priority));
        default:
            return tasks;
    }
}

// Search tasks
searchInput.addEventListener('input', () => {
    const searchQuery = searchInput.value.trim().toLowerCase();
    const filteredTasks = tasks.filter(task =>
        task.text.toLowerCase().includes(searchQuery)
    );
    renderTasks(filteredTasks);
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const searchQuery = searchInput.value.trim().toLowerCase();
        const filteredTasks = tasks.filter(task =>
            task.text.toLowerCase().includes(searchQuery)
        );
        renderTasks(filteredTasks);
    }
});

// Filter tasks
filterSelect.addEventListener('change', () => {
    renderTasks();
});

// Sort tasks
sortSelect.addEventListener('change', () => {
    renderTasks();
});

// Save tasks to localStorage
function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Keyboard shortcuts
newTaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addTaskBtn.click();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'Backspace':
                const selectedTaskIndex = Array.from(taskListUl.children).findIndex(child => child.classList.contains('selected'));
                if (selectedTaskIndex !== -1) {
                    deleteTask(selectedTaskIndex);
                }
                break;
        }
    }
});

// Swipe event handlers
function handleTouchStart(e) {
    initialX = e.touches[0].clientX;
}

function handleTouchMove(e) {
    currentX = e.touches[0].clientX;
    const diffX = currentX - initialX;
    const li = e.currentTarget;
    if (diffX > 0) {
        li.style.backgroundColor = 'rgba(0, 255, 0, ' + diffX / 200 + ')';
    } else {
        li.style.backgroundColor = 'rgba(255, 0, 0, ' + (-diffX) / 200 + ')';
    }
}

function handleTouchEnd(e) {
   const li = e.currentTarget;
   li.style.backgroundColor = '';
}

// Initial render
renderTasks();

// Theme toggling and settings (unchanged from the original)
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
themeToggle.addEventListener('click', () => {
   body.classList.toggle('dark-theme');
});

// Settings
const settingsLink = document.getElementById('settingsLink');
const settingsSection = document.getElementById('settings');
const themeSelect = document.getElementById('themeSelect');
settingsLink.addEventListener('click', () => {
   settingsSection.classList.toggle('hidden');
});
themeSelect.addEventListener('change', () => {
   const selectedTheme = themeSelect.value;
   body.classList.remove('dark-theme');
   if (selectedTheme === 'dark') {
       body.classList.add('dark-theme');
   }
});
function handleTaskClick(e) {
  const li = e.currentTarget;
  const checkbox = li.querySelector('input[type="checkbox"]');
  const progressBar = li.querySelector('.progress-bar');
  const index = li.dataset.index;

  if (!tasks[index].completed) {
      // Progress the bar by 20% on each click, up to 100%
      let currentWidth = parseInt(progressBar.style.width) || 0;
      currentWidth += 20;
      if (currentWidth >= 100) {
          currentWidth = 100;
          tasks[index].completed = true;
          checkbox.checked = true;
      }
      progressBar.style.width = currentWidth + '%';
  } else {
      // If the task is already completed, reset the progress bar
      tasks[index].completed = false;
      checkbox.checked = false;
      progressBar.style.width = '0%';
  }

  saveTasksToLocalStorage();
}