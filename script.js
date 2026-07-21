/**
 * SMART TASK MANAGER - Part 1 Engine
 * Features: Dark/Light Mode Switcher, Live Clock & Dynamic Greetings
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    startLiveClock();
});

/* ==========================================
   1. THEME ENGINE
   ========================================== */
const themeToggleBtn = document.getElementById('themeToggleBtn');

function initTheme() {
    // Check saved theme in LocalStorage or system preference
    const savedTheme = localStorage.getItem('stm_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const theme = savedTheme ? savedTheme : (systemPrefersDark ? 'dark' : 'light');
    applyTheme(theme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('stm_theme', theme);
    
    // Toggle Icon
    const icon = themeToggleBtn.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fa-solid fa-moon';
    } else {
        icon.className = 'fa-solid fa-sun';
    }
}

/* ==========================================
   2. LIVE DATE, TIME & GREETING
   ========================================== */
function startLiveClock() {
    updateClock();
    setInterval(updateClock, 1000); // Refresh every second
}

function updateClock() {
    const now = new Date();
    
    // Greeting based on hour
    const hour = now.getHours();
    const greetingText = document.getElementById('greetingText');
    
    if (hour < 12) {
        greetingText.textContent = 'Good Morning 👋';
    } else if (hour < 18) {
        greetingText.textContent = 'Good Afternoon 👋';
    } else {
        greetingText.textContent = 'Good Evening 👋';
    }

    // Format Date & Time: "Tuesday, 21 July 2026 - 08:14:24 PM"
    const optionsDate = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateFormatted = now.toLocaleDateString('en-US', optionsDate);
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const liveDateTime = document.getElementById('liveDateTime');
    liveDateTime.textContent = `${dateFormatted} • ${timeFormatted}`;
}
/**
 * SMART TASK MANAGER - Part 2 Engine
 * Features: State Management, LocalStorage Persistence, CRUD Operations, Dynamic Rendering
 */

// State Store
let tasks = [];
let editingTaskId = null; // Stores ID when editing a task

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskTitleInput = document.getElementById('taskTitle');
const taskCategoryInput = document.getElementById('taskCategory');
const taskPriorityInput = document.getElementById('taskPriority');
const taskDueDateInput = document.getElementById('taskDueDate');
const taskDueTimeInput = document.getElementById('taskDueTime');
const taskReminderInput = document.getElementById('taskReminder');
const taskListContainer = document.getElementById('taskList');
const submitBtn = taskForm.querySelector('button[type="submit"]');

// Statistics DOM Elements
const statTotal = document.getElementById('statTotal');
const statCompleted = document.getElementById('statCompleted');
const statPending = document.getElementById('statPending');
const statOverdue = document.getElementById('statOverdue');
const progressPercent = document.getElementById('progressPercent');
const progressBarFill = document.getElementById('progressBarFill');

document.addEventListener('DOMContentLoaded', () => {
    // Retain Theme & Clock from Part 1
    initTheme();
    startLiveClock();

    // Part 2: Load tasks & bind listeners
    loadTasksFromStorage();
    initFormListener();
});

/* ==========================================
   1. LOCALSTORAGE & STATE HANDLERS
   ========================================== */
function loadTasksFromStorage() {
    const savedTasks = localStorage.getItem('stm_tasks');
    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);
        } catch (e) {
            console.error('Failed to parse tasks from localStorage', e);
            tasks = [];
        }
    }
    renderTasks();
    updateStatistics();
}

function saveTasksToStorage() {
    localStorage.setItem('stm_tasks', JSON.stringify(tasks));
    updateStatistics();
}

/* ==========================================
   2. FORM & CRUD EVENT LISTENERS
   ========================================== */
function initFormListener() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    taskDueDateInput.value = today;
    taskDueTimeInput.value = "20:00";

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = taskTitleInput.value.trim();
        if (!title) return;

        if (editingTaskId) {
            // Update existing task
            updateExistingTask(editingTaskId);
        } else {
            // Create new task
            createNewTask();
        }

        // Reset form
        taskForm.reset();
        taskDueDateInput.value = today;
        taskDueTimeInput.value = "20:00";
        editingTaskId = null;
        submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Add Task`;

        saveTasksToStorage();
        renderTasks();
    });
}

function createNewTask() {
    const newTask = {
        id: 'task_' + Date.now(),
        title: taskTitleInput.value.trim(),
        category: taskCategoryInput.value,
        priority: taskPriorityInput.value, // High, Medium, Low
        dueDate: taskDueDateInput.value,
        dueTime: taskDueTimeInput.value,
        reminder: taskReminderInput.value,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask); // New tasks appear at the top
}

function updateExistingTask(id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
        tasks[index].title = taskTitleInput.value.trim();
        tasks[index].category = taskCategoryInput.value;
        tasks[index].priority = taskPriorityInput.value;
        tasks[index].dueDate = taskDueDateInput.value;
        tasks[index].dueTime = taskDueTimeInput.value;
        tasks[index].reminder = taskReminderInput.value;
    }
}

/* ==========================================
   3. TASK ACTIONS (TOGGLE, EDIT, DELETE)
   ========================================== */
window.toggleTaskComplete = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        saveTasksToStorage();
        renderTasks();
    }
};

window.editTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Fill form with task values
    taskTitleInput.value = task.title;
    taskCategoryInput.value = task.category;
    taskPriorityInput.value = task.priority;
    taskDueDateInput.value = task.dueDate;
    taskDueTimeInput.value = task.dueTime;
    taskReminderInput.value = task.reminder;

    editingTaskId = id;
    submitBtn.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Update Task`;
    taskTitleInput.focus();
};

window.deleteTask = function(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        if (editingTaskId === id) {
            editingTaskId = null;
            submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Add Task`;
            taskForm.reset();
        }
        saveTasksToStorage();
        renderTasks();
    }
};

/* ==========================================
   4. RENDER ENGINE & UI INJECTION
   ========================================== */
function renderTasks() {
    taskListContainer.innerHTML = '';

    if (tasks.length === 0) {
        taskListContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-clipboard-check"></i>
                <p>No tasks yet! Add your first task using the form on the left.</p>
            </div>
        `;
        return;
    }

    filteredTasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card glass-card ${task.completed ? 'completed' : ''}`;
        card.setAttribute('data-id', task.id);

        // ATTACH DRAG & DROP HANDLERS (PART 5)
        initDragAndDropEvents(card, task.id);

        const priorityBadge = getPriorityBadge(task.priority);
        const categoryBadge = getCategoryIcon(task.category);
        const taskMetaHTML = getTaskMetaHTML(task); // From Part 4

        card.innerHTML = `
            <div class="drag-handle" title="Drag to reorder">
                <i class="fa-solid fa-grip-vertical"></i>
            </div>
            <div class="task-content-wrapper">
                <div class="task-header">
                    <div class="task-title-group">
                        <button class="checkbox-btn ${task.completed ? 'checked' : ''}" onclick="toggleTaskComplete('${task.id}')">
                            <i class="fa-solid ${task.completed ? 'fa-check' : ''}"></i>
                        </button>
                        <span class="task-title">${escapeHTML(task.title)}</span>
                    </div>
                    <div class="task-badges">
                        <span class="badge badge-priority ${task.priority.toLowerCase()}">${priorityBadge} ${task.priority}</span>
                        <span class="badge badge-category">${categoryBadge} ${task.category}</span>
                    </div>
                </div>

                ${taskMetaHTML}

                <div class="task-actions">
                    <button class="action-btn edit-btn" onclick="editTask('${task.id}')" title="Edit Task">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteTask('${task.id}')" title="Delete Task">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;

        taskListContainer.appendChild(card);
    });
}

/* ==========================================
   5. HELPER UTILITIES & STATS ENGINE
   ========================================== */
function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.filter(t => !t.completed).length;
    const overdue = tasks.filter(t => !t.completed && checkIsOverdue(t)).length;

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    statTotal.textContent = total;
    statCompleted.textContent = completed;
    statPending.textContent = pending;
    statOverdue.textContent = overdue;

    progressPercent.textContent = `${percentage}%`;
    progressBarFill.style.width = `${percentage}%`;
}

function checkIsOverdue(task) {
    if (!task.dueDate) return false;
    const dueDateTime = new Date(`${task.dueDate}T${task.dueTime || '23:59'}`);
    return dueDateTime < new Date();
}

function getPriorityBadge(priority) {
    switch (priority) {
        case 'High': return '🔴';
        case 'Medium': return '🟡';
        case 'Low': return '🟢';
        default: return '⚪';
    }
}

function getCategoryIcon(category) {
    switch (category) {
        case 'Study': return '📚';
        case 'Work': return '💼';
        case 'Personal': return '👤';
        case 'Shopping': return '🛒';
        case 'Health': return '❤️';
        default: return '📌';
    }
}

function formatDateDisplay(dateStr, timeStr) {
    if (!dateStr) return 'No Date';
    const dateObj = new Date(`${dateStr}T${timeStr || '00:00'}`);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const dateFormatted = dateObj.toLocaleDateString('en-US', options);
    const timeFormatted = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${dateFormatted} at ${timeFormatted}`;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

/**
 * SMART TASK MANAGER - Part 3 Engine
 * Features: Multi-level Filtering (Search Input + Active Filter Tabs)
 */

// Filter State Variables
let currentFilter = 'all'; // 'all' | 'pending' | 'completed' | 'today' | 'overdue'
let searchQuery = '';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const filterTabsContainer = document.getElementById('filterTabs');

document.addEventListener('DOMContentLoaded', () => {
    // Retain previous initializations
    initTheme();
    startLiveClock();
    loadTasksFromStorage();
    initFormListener();

    // Part 3: Filter & Search Listeners
    initFilterAndSearchListeners();
});

/* ==========================================
   1. FILTER & SEARCH EVENT LISTENERS
   ========================================== */
function initFilterAndSearchListeners() {
    // Search Bar Input Listener (Real-time debounce free search)
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderTasks();
    });

    // Tab Filter Buttons Click Listener
    filterTabsContainer.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.tab-btn');
        if (!tabBtn) return;

        // Update active class state on tabs
        filterTabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        tabBtn.classList.add('active');

        currentFilter = tabBtn.getAttribute('data-filter');
        renderTasks();
    });
}

/* ==========================================
   2. UPDATED RENDER ENGINE WITH FILTERING LOGIC
   ========================================== */
function getFilteredTasks() {
    if (currentFilter === 'custom_date' && selectedCalendarDateStr) {
        matchesFilter = (task.dueDate === selectedCalendarDateStr);
    }
    const todayStr = new Date().toISOString().split('T')[0];

    return tasks.filter(task => {
        // 1. Apply Status/Date Filter Tabs
        let matchesFilter = true;

        switch (currentFilter) {
            case 'pending':
                matchesFilter = !task.completed;
                break;

            case 'completed':
                matchesFilter = task.completed;
                break;

            case 'today':
                matchesFilter = (task.dueDate === todayStr);
                break;

            case 'overdue':
                matchesFilter = (!task.completed && checkIsOverdue(task));
                break;

            case 'all':
            default:
                matchesFilter = true;
                break;
        }

        // 2. Apply Real-time Search Query Filter
        let matchesSearch = true;
        if (searchQuery !== '') {
            const titleMatch = task.title.toLowerCase().includes(searchQuery);
            const categoryMatch = task.category.toLowerCase().includes(searchQuery);
            const priorityMatch = task.priority.toLowerCase().includes(searchQuery);
            
            matchesSearch = titleMatch || categoryMatch || priorityMatch;
        }

        return matchesFilter && matchesSearch;
    });
}

// Replace/Update the renderTasks function from Part 2:
function renderTasks() {
    taskListContainer.innerHTML = '';
    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        let emptyMessage = 'No tasks found!';
        if (searchQuery !== '') {
            emptyMessage = `No tasks matching "${escapeHTML(searchQuery)}"`;
        } else if (currentFilter !== 'all') {
            emptyMessage = `No ${currentFilter} tasks found.`;
        }

        taskListContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-filter-circle-xmark"></i>
                <p>${emptyMessage}</p>
            </div>
        `;
        return;
    }

    filteredTasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card glass-card ${task.completed ? 'completed' : ''}`;
        card.setAttribute('data-id', task.id);

        const priorityBadge = getPriorityBadge(task.priority);
        const categoryBadge = getCategoryIcon(task.category);
        const formattedDate = formatDateDisplay(task.dueDate, task.dueTime);
        const isOverdue = checkIsOverdue(task);

        card.innerHTML = `
            <div class="task-header">
                <div class="task-title-group">
                    <button class="checkbox-btn ${task.completed ? 'checked' : ''}" onclick="toggleTaskComplete('${task.id}')">
                        <i class="fa-solid ${task.completed ? 'fa-check' : ''}"></i>
                    </button>
                    <span class="task-title">${escapeHTML(task.title)}</span>
                </div>
                <div class="task-badges">
                    <span class="badge badge-priority ${task.priority.toLowerCase()}">${priorityBadge} ${task.priority}</span>
                    <span class="badge badge-category">${categoryBadge} ${task.category}</span>
                </div>
            </div>

            <div class="task-meta">
                <div class="meta-item ${isOverdue && !task.completed ? 'text-danger' : ''}">
                    <i class="fa-solid fa-calendar-day"></i>
                    <span>${formattedDate}</span>
                    ${isOverdue && !task.completed ? '<span class="overdue-tag">OVERDUE</span>' : ''}
                </div>
                ${task.reminder !== 'none' ? `
                    <div class="meta-item">
                        <i class="fa-solid fa-bell"></i>
                        <span>${task.reminder}m before</span>
                    </div>
                ` : ''}
            </div>

            <div class="task-actions">
                <button class="action-btn edit-btn" onclick="editTask('${task.id}')" title="Edit Task">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button class="action-btn delete-btn" onclick="deleteTask('${task.id}')" title="Delete Task">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </div>
        `;

        taskListContainer.appendChild(card);
    });
}

/**
 * SMART TASK MANAGER - Part 4 Engine
 * Features: Live Remaining-Time Countdowns, Background Reminder Checker, Browser Notifications API
 */

// Track triggered notification IDs to prevent duplicates
let triggeredReminders = new Set();

document.addEventListener('DOMContentLoaded', () => {
    // Retain previous initializations
    initTheme();
    startLiveClock();
    loadTasksFromStorage();
    initFormListener();
    initFilterAndSearchListeners();

    // Part 4: Request Notification Permission & Start Interval Engines
    requestNotificationPermission();
    startReminderEngine();
    startCountdownTimerEngine();
});

/* ==========================================
   1. BROWSER NOTIFICATIONS ENGINE
   ========================================== */
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showDesktopNotification('Notifications Enabled! 🔔', {
                    body: 'Smart Task Manager will notify you before your scheduled tasks.',
                    icon: 'https://cdn-icons-png.flaticon.com/512/2693/2693507.png'
                });
            }
        });
    }
}

function showDesktopNotification(title, options) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, options);
    }
}

/* ==========================================
   2. REMINDER BACKGROUND CHECKER
   ========================================== */
function startReminderEngine() {
    // Check for pending reminders every 10 seconds
    setInterval(checkUpcomingReminders, 10000);
    checkUpcomingReminders(); // Initial check on load
}

function checkUpcomingReminders() {
    const now = new Date();

    tasks.forEach(task => {
        // Skip completed tasks or tasks without reminders
        if (task.completed || task.reminder === 'none' || !task.dueDate || !task.dueTime) {
            return;
        }

        const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
        const reminderMinutes = parseInt(task.reminder, 10);
        
        // Calculate reminder trigger timestamp
        const reminderTime = new Date(dueDateTime.getTime() - reminderMinutes * 60000);

        // Unique key for this reminder instance
        const reminderKey = `${task.id}_${task.reminder}`;

        // Trigger if current time is within 30 seconds of reminder time and not triggered yet
        const timeDiff = now.getTime() - reminderTime.getTime();

        if (timeDiff >= 0 && timeDiff < 30000 && !triggeredReminders.has(reminderKey)) {
            triggeredReminders.add(reminderKey);

            // Play notification alert
            showDesktopNotification(`🔔 Task Reminder: ${task.title}`, {
                body: `Due in ${reminderMinutes} minutes (${task.dueTime})!\nCategory: ${task.category}`,
                tag: task.id
            });
        }
    });
}

/* ==========================================
   3. LIVE COUNTDOWN TIMER ENGINE
   ========================================== */
function startCountdownTimerEngine() {
    // Re-render task countdown tags every 30 seconds
    setInterval(() => {
        updateStatistics();
        renderTasks();
    }, 30000);
}

function calculateRemainingTime(dateStr, timeStr) {
    if (!dateStr) return { text: 'No due date', status: 'normal' };

    const dueDateTime = new Date(`${dateStr}T${timeStr || '23:59'}`);
    const now = new Date();
    const diffMs = dueDateTime - now;

    if (diffMs < 0) {
        return { text: 'Overdue', status: 'overdue' };
    }

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const days = Math.floor(hours / 24);

    if (days > 0) {
        const remainingHours = hours % 24;
        return { text: `⏰ ${days}d ${remainingHours}h left`, status: 'upcoming' };
    } else if (hours > 0) {
        return { text: `⏰ ${hours}h ${minutes}m left`, status: 'urgent' };
    } else {
        return { text: `🚨 ${minutes}m left!`, status: 'critical' };
    }
}

/* ==========================================
   4. UPDATED TASK CARD INJECTION (WITH COUNTDOWN)
   ========================================== */
// Update the task metadata section inside renderTasks() function:
// Replace the old task-meta rendering block in renderTasks() with:

/* 
   Inside renderTasks() loop:
   const countdown = calculateRemainingTime(task.dueDate, task.dueTime);
*/

function getTaskMetaHTML(task) {
    const formattedDate = formatDateDisplay(task.dueDate, task.dueTime);
    const countdown = calculateRemainingTime(task.dueDate, task.dueTime);
    const isOverdue = checkIsOverdue(task);

    let countdownClass = '';
    if (countdown.status === 'critical') countdownClass = 'countdown-critical';
    if (countdown.status === 'urgent') countdownClass = 'countdown-urgent';

    return `
        <div class="task-meta">
            <div class="meta-item ${isOverdue && !task.completed ? 'text-danger' : ''}">
                <i class="fa-solid fa-calendar-day"></i>
                <span>${formattedDate}</span>
            </div>

            ${!task.completed ? `
                <div class="meta-item countdown-badge ${countdownClass} ${countdown.status === 'overdue' ? 'text-danger' : ''}">
                    <span>${countdown.text}</span>
                </div>
            ` : ''}

            ${task.reminder !== 'none' ? `
                <div class="meta-item">
                    <i class="fa-solid fa-bell"></i>
                    <span>${task.reminder}m before</span>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * SMART TASK MANAGER - Part 5 Engine
 * Features: Native HTML5 Drag & Drop API, Reordering Logic, Array Index Swapping, State Persistence
 */

// Global variable to hold reference of currently dragged task item
let draggedTaskId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Retain previous initializations
    initTheme();
    startLiveClock();
    loadTasksFromStorage();
    initFormListener();
    initFilterAndSearchListeners();
    requestNotificationPermission();
    startReminderEngine();
    startCountdownTimerEngine();
});

/* ==========================================
   1. DRAG & DROP EVENT HANDLERS
   ========================================== */
function initDragAndDropEvents(card, taskId) {
    card.setAttribute('draggable', 'true');

    card.addEventListener('dragstart', (e) => {
        draggedTaskId = taskId;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', taskId);
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        document.querySelectorAll('.task-card').forEach(c => c.classList.remove('drag-over'));
        draggedTaskId = null;
    });

    card.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
        if (card.getAttribute('data-id') !== draggedTaskId) {
            card.classList.add('drag-over');
        }
    });

    card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
    });

    card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');

        const targetTaskId = card.getAttribute('data-id');
        if (draggedTaskId && targetTaskId && draggedTaskId !== targetTaskId) {
            reorderTasksInState(draggedTaskId, targetTaskId);
        }
    });
}

/* ==========================================
   2. REORDER STATE & LOCALSTORAGE SWAP
   ========================================== */
function reorderTasksInState(sourceId, targetId) {
    const sourceIndex = tasks.findIndex(t => t.id === sourceId);
    const targetIndex = tasks.findIndex(t => t.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    // Remove item from source index and insert at target index
    const [draggedTask] = tasks.splice(sourceIndex, 1);
    tasks.splice(targetIndex, 0, draggedTask);

    // Save reordered array state & refresh view
    saveTasksToStorage();
    renderTasks();
}

/**
 * SMART TASK MANAGER - Part 6 Engine
 * Features: Mini Calendar View, Date Highlighting, Progress Analytics Engine
 */

// Calendar State
let calendarDate = new Date(); // Tracks currently viewed month/year in mini calendar
let selectedCalendarDateStr = null; // Filter date when user clicks a day

document.addEventListener('DOMContentLoaded', () => {
    // Retain previous initializations
    initTheme();
    startLiveClock();
    loadTasksFromStorage();
    initFormListener();
    initFilterAndSearchListeners();
    requestNotificationPermission();
    startReminderEngine();
    startCountdownTimerEngine();

    // Part 6 Initializations
    initCalendar();
});

/* ==========================================
   1. MINI CALENDAR ENGINE
   ========================================== */
function initCalendar() {
    const prevBtn = document.getElementById('prevMonthBtn');
    const nextBtn = document.getElementById('nextMonthBtn');

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            calendarDate.setMonth(calendarDate.getMonth() - 1);
            renderCalendar();
        });

        nextBtn.addEventListener('click', () => {
            calendarDate.setMonth(calendarDate.getMonth() + 1);
            renderCalendar();
        });
    }

    renderCalendar();
}

function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const calendarMonthYear = document.getElementById('calendarMonthYear');
    if (!calendarGrid || !calendarMonthYear) return;

    calendarGrid.innerHTML = '';

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    // Set month and year title
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    calendarMonthYear.textContent = `${monthNames[month]} ${year}`;

    // First day of current month & total days
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Collect dates that have tasks scheduled
    const taskDates = new Set(tasks.map(t => t.dueDate));

    // Pad empty cells before 1st of month
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'cal-day empty';
        calendarGrid.appendChild(emptyCell);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Build actual calendar day cells
    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'cal-day';

        // Format day string as YYYY-MM-DD
        const monthFormatted = String(month + 1).padStart(2, '0');
        const dayFormatted = String(day).padStart(2, '0');
        const dateStr = `${year}-${monthFormatted}-${dayFormatted}`;

        dayCell.textContent = day;

        // Highlight today
        if (dateStr === todayStr) {
            dayCell.classList.add('today');
        }

        // Highlight date if it contains task(s)
        if (taskDates.has(dateStr)) {
            dayCell.classList.add('has-tasks');
            
            // Count pending/overdue tasks on this date for visual cue
            const dateTasks = tasks.filter(t => t.dueDate === dateStr);
            const hasOverdue = dateTasks.some(t => !t.completed && checkIsOverdue(t));
            if (hasOverdue) {
                dayCell.classList.add('has-overdue');
            }
        }

        // Active state if date filter applied
        if (selectedCalendarDateStr === dateStr) {
            dayCell.classList.add('selected');
        }

        // Click cell to filter tasks for that date
        dayCell.addEventListener('click', () => {
            if (selectedCalendarDateStr === dateStr) {
                // Toggle off selection if clicked again
                selectedCalendarDateStr = null;
                currentFilter = 'all';
            } else {
                selectedCalendarDateStr = dateStr;
                currentFilter = 'custom_date';
            }
            renderCalendar();
            renderTasks();
        });

        calendarGrid.appendChild(dayCell);
    }
}

const originalSaveTasksToStorage = saveTasksToStorage;
saveTasksToStorage = function() {
    originalSaveTasksToStorage();
    renderCalendar();
};

/**
 * SMART TASK MANAGER - Part 7 Engine
 * Features: Export Tasks to CSV, Dynamic Print Engine, Canvas Confetti FX Trigger
 */

// Track previous completion percentage to detect 100% completion event
let prevCompletionPercent = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Retain previous initializations
    initTheme();
    startLiveClock();
    loadTasksFromStorage();
    initFormListener();
    initFilterAndSearchListeners();
    requestNotificationPermission();
    startReminderEngine();
    startCountdownTimerEngine();
    initCalendar();

    // Part 7 Initializations
    initExportAndPrint();
});

/* ==========================================
   1. EXPORT & PRINT HANDLERS
   ========================================== */
function initExportAndPrint() {
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const printTasksBtn = document.getElementById('printTasksBtn');

    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportTasksToCSV);
    }

    if (printTasksBtn) {
        printTasksBtn.addEventListener('click', () => {
            window.print();
        });
    }
}

/* CSV Exporter Logic */
function exportTasksToCSV() {
    if (tasks.length === 0) {
        alert('No tasks available to export!');
        return;
    }

    // Define CSV Headers
    const headers = ['ID', 'Task Title', 'Category', 'Priority', 'Due Date', 'Due Time', 'Reminder (mins)', 'Status', 'Completed At'];
    
    // Map Task Records to CSV Rows
    const csvRows = [headers.join(',')];

    tasks.forEach(task => {
        const row = [
            `"${task.id}"`,
            `"${task.title.replace(/"/g, '""')}"`, // Escape internal double quotes
            `"${task.category}"`,
            `"${task.priority}"`,
            `"${task.dueDate}"`,
            `"${task.dueTime}"`,
            `"${task.reminder}"`,
            `"${task.completed ? 'Completed' : 'Pending'}"`,
            `"${task.completedAt ? task.completedAt : 'N/A'}"`
        ];
        csvRows.push(row.join(','));
    });

    // Create Downloadable Blob File
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `Task_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
}

/* ==========================================
   2. CONFETTI FX TRIGGER ENGINE
   ========================================== */
function triggerCelebrationConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#ec4899', '#10b981', '#f59e0b']
        });
    }
}

// Hook into updateStatistics() function
// Modify the end of updateStatistics() to check if percentage hit 100%:
const originalUpdateStatistics = updateStatistics;
updateStatistics = function() {
    originalUpdateStatistics();

    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Fire Confetti when all tasks are completed ( transition from <100% to 100% )
    if (percentage === 100 && prevCompletionPercent < 100 && total > 0) {
        triggerCelebrationConfetti();
    }

    prevCompletionPercent = percentage;
};

/**
 * Features: Voice Recognition, Pomodoro Engine, Quick Notes, Keyboard Shortcuts & Service Worker
 */

document.addEventListener('DOMContentLoaded', () => {
    // Previous Engine Inits
    initTheme();
    startLiveClock();
    loadTasksFromStorage();
    initFormListener();
    initFilterAndSearchListeners();
    requestNotificationPermission();
    startReminderEngine();
    startCountdownTimerEngine();
    initCalendar();
    initExportAndPrint();

    // Part 8 Initializations
    initVoiceRecognition();
    initPomodoroTimer();
    initQuickNotes();
    initKeyboardShortcuts();
    registerServiceWorker();
});

/* ==========================================
   1. VOICE TASK ADD (WEB SPEECH API)
   ========================================== */
function initVoiceRecognition() {
    const voiceBtn = document.getElementById('voiceBtn');
    if (!voiceBtn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        voiceBtn.style.display = 'none'; // Hide if browser lacks support
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    voiceBtn.addEventListener('click', () => {
        voiceBtn.classList.add('listening');
        recognition.start();
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        taskTitleInput.value = transcript;
        voiceBtn.classList.remove('listening');
    };

    recognition.onerror = () => {
        voiceBtn.classList.remove('listening');
    };

    recognition.onend = () => {
        voiceBtn.classList.remove('listening');
    };
}

/* ==========================================
   2. POMODORO TIMER ENGINE (25m / 5m)
   ========================================== */
let pomoInterval = null;
let pomoSeconds = 25 * 60;
let isPomoRunning = false;
let isBreak = false;

function initPomodoroTimer() {
    const pomoDisplay = document.getElementById('pomodoroDisplay');
    const pomoStatus = document.getElementById('pomodoroStatus');
    const pomoStartBtn = document.getElementById('pomoStartBtn');
    const pomoResetBtn = document.getElementById('pomoResetBtn');

    if (!pomoDisplay) return;

    pomoStartBtn.addEventListener('click', () => {
        if (isPomoRunning) {
            // Pause Timer
            clearInterval(pomoInterval);
            isPomoRunning = false;
            pomoStartBtn.innerHTML = `<i class="fa-solid fa-play"></i> Resume`;
        } else {
            // Start Timer
            isPomoRunning = true;
            pomoStartBtn.innerHTML = `<i class="fa-solid fa-pause"></i> Pause`;
            pomoInterval = setInterval(() => {
                pomoSeconds--;
                updatePomoDisplay(pomoDisplay);

                if (pomoSeconds <= 0) {
                    clearInterval(pomoInterval);
                    isPomoRunning = false;
                    
                    if (!isBreak) {
                        isBreak = true;
                        pomoSeconds = 5 * 60; // 5 minute break
                        pomoStatus.textContent = "Break Time ☕";
                        showDesktopNotification("Pomodoro Complete! 🎯", { body: "Take a 5-minute break!" });
                    } else {
                        isBreak = false;
                        pomoSeconds = 25 * 60; // Back to focus
                        pomoStatus.textContent = "Focus Time 🎯";
                        showDesktopNotification("Break Ended! ⚡", { body: "Time to focus again." });
                    }
                    pomoStartBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start`;
                }
            }, 1000);
        }
    });

    pomoResetBtn.addEventListener('click', () => {
        clearInterval(pomoInterval);
        isPomoRunning = false;
        isBreak = false;
        pomoSeconds = 25 * 60;
        pomoStatus.textContent = "Focus Time 🎯";
        pomoStartBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start`;
        updatePomoDisplay(pomoDisplay);
    });
}

function updatePomoDisplay(displayElement) {
    const m = Math.floor(pomoSeconds / 60).toString().padStart(2, '0');
    const s = (pomoSeconds % 60).toString().padStart(2, '0');
    displayElement.textContent = `${m}:${s}`;
}

/* ==========================================
   3. STICKY QUICK NOTES PERSISTENCE
   ========================================== */
function initQuickNotes() {
    const quickNotes = document.getElementById('quickNotes');
    if (!quickNotes) return;

    // Load saved notes
    quickNotes.value = localStorage.getItem('stm_quick_notes') || '';

    // Save on typing
    quickNotes.addEventListener('input', (e) => {
        localStorage.setItem('stm_quick_notes', e.target.value);
    });
}

/* ==========================================
   4. KEYBOARD SHORTCUTS ENGINE
   ========================================== */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl + N -> Focus New Task Name Input
        if (e.ctrlKey && e.key.toLowerCase() === 'n') {
            e.preventDefault();
            taskTitleInput.focus();
        }

        // Ctrl + F -> Focus Search Box
        if (e.ctrlKey && e.key.toLowerCase() === 'f') {
            e.preventDefault();
            searchInput.focus();
        }

        // Escape -> Clear active search or form editing
        if (e.key === 'Escape') {
            if (document.activeElement === searchInput) {
                searchInput.value = '';
                searchQuery = '';
                renderTasks();
                searchInput.blur();
            }
        }
    });
}

/* ==========================================
   5. PWA SERVICE WORKER REGISTRATION
   ========================================== */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(err => {
                console.log('Service Worker registration skipped or failed.', err);
            });
        });
    }
}