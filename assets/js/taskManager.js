// ===== TASK MANAGER MODULE =====
const TaskManager = {
    TASKS_KEY: 'userTasks',
    currentUserId: null,

    // Initialize
    init() {
        console.log('TaskManager initializing...');
        const user = Auth.getCurrentUser();
        if (!user) {
            console.log('No user found');
            return;
        }
        
        this.currentUserId = user.id;
        
        // Setup task form
        this.setupTaskForm();
        
        // Setup filters
        const searchInput = document.getElementById('taskSearch');
        const priorityFilter = document.getElementById('priorityFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (searchInput) searchInput.addEventListener('input', () => this.refreshTasksUI());
        if (priorityFilter) priorityFilter.addEventListener('change', () => this.refreshTasksUI());
        if (statusFilter) statusFilter.addEventListener('change', () => this.refreshTasksUI());
        
        // Setup Add button
        this.setupAddButton();
        
        // Initial load
        this.refreshAllUI();
    },

    // Setup task form
    setupTaskForm() {
        console.log('Task form setup skipped - using global handler');
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            // Remove existing listeners
            const newForm = taskForm.cloneNode(true);
            taskForm.parentNode.replaceChild(newForm, taskForm);
            
            // Add new submit listener
            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTask(e);
            });
            
            console.log('Task form setup complete');
        }
    },

    // Setup Add button
    setupAddButton() {
        const addButton = document.querySelector('.tasks-header .btn-primary');
        if (addButton) {
            // Remove existing listeners
            const newButton = addButton.cloneNode(true);
            addButton.parentNode.replaceChild(newButton, addButton);
            
            // Add new listener
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Add button clicked');
                
                if (window.TaskUI && typeof window.TaskUI.showTaskModal === 'function') {
                    window.TaskUI.showTaskModal();
                } else {
                    // Fallback direct modal open
                    const modal = document.getElementById('taskModal');
                    const form = document.getElementById('taskForm');
                    
                    if (modal && form) {
                        modal.classList.remove('hidden');
                        document.getElementById('modalTitle').textContent = 'Add New Task';
                        form.reset();
                        document.getElementById('taskId').value = '';
                        
                        // Set default due date to today
                        const today = new Date();
                        const formattedDate = today.toISOString().split('T')[0];
                        document.getElementById('taskDueDate').value = formattedDate;
                        document.getElementById('taskPriority').value = 'medium';
                        
                        // Focus on title
                        setTimeout(() => {
                            document.getElementById('taskTitle').focus();
                        }, 100);
                    }
                }
            });
            
            console.log('Add button setup complete');
        }
    },

    // Get all tasks for current user
    getTasks() {
        const allTasks = JSON.parse(localStorage.getItem(this.TASKS_KEY)) || [];
        return allTasks.filter(task => task.userId === this.currentUserId);
    },

    // Save tasks to localStorage
    saveTasks(tasks) {
        try {
            const allTasks = JSON.parse(localStorage.getItem(this.TASKS_KEY)) || [];
            const otherTasks = allTasks.filter(task => task.userId !== this.currentUserId);
            const updatedTasks = [...otherTasks, ...tasks];
            localStorage.setItem(this.TASKS_KEY, JSON.stringify(updatedTasks));
            
            // REFRESH IMMEDIATELY
            this.refreshTasksUI();
            return true;
            // REFRESH DASHBOARD
        this.refreshDashboardOnChange();
        return true;
        } catch (error) {
            console.error('Error saving tasks:', error);
            return false;
        }
    },

    // Add new task
    addTask(taskData) {
        const tasks = this.getTasks();
        
        const newTask = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            userId: this.currentUserId,
            title: taskData.title,
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            dueDate: taskData.dueDate || null,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        tasks.push(newTask);
        const success = this.saveTasks(tasks);
        
        if (success) {
            console.log('Task added:', newTask);
        }
        
        return newTask;
    },

    // Update task
    updateTask(id, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(task => task.id === id);
        
        if (index === -1) {
            console.error('Task not found:', id);
            return null;
        }

        tasks[index] = {
            ...tasks[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        const success = this.saveTasks(tasks);
        
        if (success) {
            console.log('Task updated:', tasks[index]);
        }
        
        return tasks[index];
    },

    // Delete task
    deleteTask(id) {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(task => task.id !== id);
        const success = this.saveTasks(filteredTasks);
        
        if (success) {
            console.log('Task deleted:', id);
        }
        
        return success;
    },

    // Toggle task completion
    toggleComplete(id) {
        const task = this.getTasks().find(t => t.id === id);
        if (!task) return;
        
        return this.updateTask(id, { completed: !task.completed });
    },

    getStats() {
        const tasks = this.getTasks();
        const now = new Date();
        const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
        
        return {
            total: tasks.length,
            pending: tasks.filter(t => !t.completed).length,
            completed: tasks.filter(t => t.completed).length,
            urgent: tasks.filter(t => 
                !t.completed && 
                t.priority === 'high'
            ).length
        };
    },

    // Filter tasks based on search and filters
    filterTasks() {
        const tasks = this.getTasks();
        const searchInput = document.getElementById('taskSearch');
        const prioritySelect = document.getElementById('priorityFilter');
        const statusSelect = document.getElementById('statusFilter');
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const priorityFilter = prioritySelect ? prioritySelect.value : 'all';
        const statusFilter = statusSelect ? statusSelect.value : 'all';

        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm) ||
                                 task.description.toLowerCase().includes(searchTerm);
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            const matchesStatus = statusFilter === 'all' ||
                                (statusFilter === 'completed' && task.completed) ||
                                (statusFilter === 'pending' && !task.completed);
            return matchesSearch && matchesPriority && matchesStatus;
        });
    },

    // Clear filters
    clearFilters() {
        const searchInput = document.getElementById('taskSearch');
        const priorityFilter = document.getElementById('priorityFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (searchInput) searchInput.value = '';
        if (priorityFilter) priorityFilter.value = 'all';
        if (statusFilter) statusFilter.value = 'all';
        
        this.refreshTasksUI();
    },

    // Bulk update status
    bulkUpdateStatus(status) {
        const checkboxes = document.querySelectorAll('.task-checkbox:checked');
        checkboxes.forEach(cb => {
            const taskId = parseInt(cb.dataset.taskId);
            if (status === 'completed') {
                this.updateTask(taskId, { completed: true });
            } else {
                this.updateTask(taskId, { completed: false });
            }
        });
        TaskUI.hideBulkActions();
    },

    // Bulk delete
    bulkDelete() {
        if (!confirm('Delete selected tasks?')) return;
        
        const checkboxes = document.querySelectorAll('.task-checkbox:checked');
        checkboxes.forEach(cb => {
            const taskId = parseInt(cb.dataset.taskId);
            this.deleteTask(taskId);
        });
        TaskUI.hideBulkActions();
    },

    // REFRESH UI FUNCTIONS
    refreshTasksUI() {
        console.log('Refreshing tasks UI...');
        if (window.TaskUI && typeof TaskUI.renderTasks === 'function') {
            TaskUI.renderTasks();
        }
    },
    
    refreshDashboardUI() {
        if (window.Dashboard && typeof Dashboard.loadDashboardData === 'function') {
            Dashboard.loadDashboardData();
        }
    },
    
    refreshAllUI() {
        this.refreshTasksUI();
        this.refreshDashboardUI();
    },

    // Save task from form - FIXED VERSION
    saveTask(e) {
        e.preventDefault();
        console.log('Saving task...');
        
        const taskId = document.getElementById('taskId').value;
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;

        if (!title) {
            alert('Title is required');
            return false;
        }

        const taskData = { title, description, priority, dueDate };
        let success = false;

        if (taskId) {
            console.log('Updating task:', taskId);
            success = !!this.updateTask(parseInt(taskId), taskData);
        } else {
            console.log('Adding new task');
            success = !!this.addTask(taskData);
        }

        if (success) {
            // Close modal
            const modal = document.getElementById('taskModal');
            if (modal) {
                modal.classList.add('hidden');
            }
            
            // Reset form
            document.getElementById('taskForm').reset();
            
            // Show success message
            alert(taskId ? 'Task updated successfully!' : 'Task added successfully!');
            
            // Force refresh
            setTimeout(() => {
                this.refreshTasksUI();
            }, 100);
        } else {
            alert('Error saving task. Please try again.');
        }
        
        return false;
    },
    refreshDashboardOnChange() {
    // Refresh current page if it's dashboard
    if (window.location.pathname.includes('dashboard.html') || 
        document.getElementById('totalTasks')) {
        if (window.Dashboard && typeof Dashboard.loadDashboardData === 'function') {
            Dashboard.loadDashboardData();
        }
    }
    
    // Also update localStorage timestamp to trigger storage event
    localStorage.setItem('lastTaskUpdate', Date.now().toString());
} 
};


// ===== TASKS UI MODULE =====
const TaskUI = {
    // Initialize tasks page
    init() {
        console.log('TaskUI initializing...');
        Auth.requireAuth();
        this.renderTasks();
        this.setupEventListeners();
        this.setupEventDelegation();
        console.log('TaskUI initialized');
    },

    // Setup event listeners
    setupEventListeners() {
        // Select all checkbox
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.task-checkbox');
                checkboxes.forEach(cb => {
                    cb.checked = e.target.checked;
                    // Trigger change event on each checkbox
                    cb.dispatchEvent(new Event('change'));
                });
                this.updateBulkActions();
            });
        }

        // Modal close button
        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.hideTaskModal());
        }

        // Setup bulk action buttons
        this.setupBulkActionButtons();
    },

    // Setup bulk action buttons
    setupBulkActionButtons() {
        // Mark as Pending
        const pendingBtn = document.querySelector('.bulk-actions .btn-warning');
        if (pendingBtn) {
            pendingBtn.addEventListener('click', () => {
                TaskManager.bulkUpdateStatus('pending');
            });
        }

        // Mark as Completed
        const completedBtn = document.querySelector('.bulk-actions .btn-success');
        if (completedBtn) {
            completedBtn.addEventListener('click', () => {
                TaskManager.bulkUpdateStatus('completed');
            });
        }

        // Delete Selected
        const deleteBtn = document.querySelector('.bulk-actions .btn-danger');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                TaskManager.bulkDelete();
            });
        }
    },

    // Setup event delegation for dynamically created buttons
    setupEventDelegation() {
        document.addEventListener('click', (e) => {
            // Edit button
            if (e.target.closest('.btn-edit')) {
                const editBtn = e.target.closest('.btn-edit');
                const taskId = editBtn.getAttribute('data-task-id');
                if (taskId) this.editTask(parseInt(taskId));
            }
            
            // Delete button
            if (e.target.closest('.btn-delete')) {
                const deleteBtn = e.target.closest('.btn-delete');
                const taskId = deleteBtn.getAttribute('data-task-id');
                if (taskId) this.deleteTask(parseInt(taskId));
            }
        });

        // Event delegation for task checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                this.updateBulkActions();
            }
        });
    },

    // Render tasks table
    renderTasks() {
        console.log('Rendering tasks...');
        const tasks = TaskManager.filterTasks();
        const container = document.getElementById('tasksTableBody');
        
        if (!container) {
            console.error('Tasks table body not found!');
            return;
        }
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <tr class="empty-row">
                    <td colspan="6">
                        <div class="empty-state">
                            <i class="fas fa-tasks"></i>
                            <h3>No tasks found</h3>
                            <p>Try changing your filters or create a new task</p>
                        </div>
                    </td>
                </tr>
            `;
            
            // Hide bulk actions when no tasks
            this.hideBulkActions();
            return;
        }
        
        container.innerHTML = tasks.map(task => `
            <tr>
                <td>
                    <input type="checkbox" class="task-checkbox" data-task-id="${task.id}">
                </td>
                <td>
                    <div class="task-title-display">
                        <strong class="task-title">${this.escapeHtml(task.title)}</strong>
                        ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                    </div>
                </td>
                <td>
                    <span class="priority-badge priority-${task.priority}">
                        ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                </td>
                <td>
                    ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </td>
                <td>
                    <span class="status-badge status-${task.completed ? 'completed' : 'pending'}">
                        ${task.completed ? 'Completed' : 'Pending'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" data-task-id="${task.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" data-task-id="${task.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        console.log(`Rendered ${tasks.length} tasks`);
    },

    // Helper to escape HTML
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Show task modal for add/edit
    showTaskModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('taskForm');
        
        if (!modal || !form) {
            console.error('Modal elements not found!');
            return;
        }
        
        if (taskId) {
            // Edit mode
            const task = TaskManager.getTasks().find(t => t.id === taskId);
            if (!task) return;
            
            modalTitle.textContent = 'Edit Task';
            document.getElementById('taskId').value = task.id;
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskDueDate').value = task.dueDate ? task.dueDate.split('T')[0] : '';
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Task';
            form.reset();
            document.getElementById('taskId').value = '';
            
            // Set default due date to today
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            document.getElementById('taskDueDate').value = formattedDate;
            document.getElementById('taskPriority').value = 'medium';
        }
        
        modal.classList.remove('hidden');
        document.getElementById('taskTitle').focus();
    },

    // Hide task modal
    hideTaskModal() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    // Edit task
    editTask(taskId) {
        this.showTaskModal(taskId);
    },

    // Delete task with confirmation
    deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        TaskManager.deleteTask(taskId);
    },

    // Update bulk actions visibility
    updateBulkActions() {
        const checkboxes = document.querySelectorAll('.task-checkbox:checked');
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');
        
        console.log(`Checked checkboxes: ${checkboxes.length}`);
        
        if (checkboxes.length > 0) {
            if (bulkActions) {
                bulkActions.classList.remove('hidden');
            }
            if (selectedCount) {
                selectedCount.textContent = `${checkboxes.length} task${checkboxes.length > 1 ? 's' : ''} selected`;
            }
        } else {
            this.hideBulkActions();
        }
    },

    // Hide bulk actions
    hideBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        if (bulkActions) {
            bulkActions.classList.add('hidden');
        }
        
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.checked = false;
        }
    }
};
// ===== CLEAN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Clean initialization');
    
    // Wait a bit for everything to load
    setTimeout(function() {
        // Initialize TaskManager
        if (typeof TaskManager !== 'undefined') {
            TaskManager.init();
        }
        
        // Initialize TaskUI if on tasks page
        if (document.getElementById('tasksTableBody') && typeof TaskUI !== 'undefined') {
            TaskUI.init();
        }
        
        console.log('Clean initialization complete');
    }, 300);
});

// ===== SINGLE FORM HANDLER (NO DUPLICATES) =====
// This goes AFTER the DOMContentLoaded event
let formHandlerSet = false;

function setupFormHandler() {
    if (formHandlerSet) return;
    
    const taskForm = document.getElementById('taskForm');
    if (!taskForm) return;
    
    console.log('Setting up SINGLE form handler');
    
    // Remove ALL existing event listeners by cloning
    const newForm = taskForm.cloneNode(true);
    taskForm.parentNode.replaceChild(newForm, taskForm);
    
    // Add ONE submit handler
    newForm.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Stop other handlers
        console.log('Form submit - SINGLE handler');
        
        // Get form data
        const taskId = document.getElementById('taskId').value;
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;

        // Validate
        if (!title) {
            alert('Title is required');
            return false;
        }

        const taskData = { title, description, priority, dueDate };
        
        // Save using TaskManager
        if (window.TaskManager) {
            if (taskId) {
                TaskManager.updateTask(parseInt(taskId), taskData);
            } else {
                TaskManager.addTask(taskData);
            }
            
            // Close modal
            const modal = document.getElementById('taskModal');
            if (modal) {
                modal.classList.add('hidden');
            }
            
            // Reset form
            newForm.reset();
        }
        
        return false;
    });
    
    formHandlerSet = true;
    console.log('Form handler setup complete');
}

// Set up form handler when modal is shown
document.addEventListener('click', function(e) {
    // When Add button is clicked, set up form handler
    if (e.target.closest('.tasks-header .btn-primary')) {
        setTimeout(setupFormHandler, 100);
    }
    
    // When Edit button is clicked, set up form handler
    if (e.target.closest('.btn-edit')) {
        setTimeout(setupFormHandler, 100);
    }
});

// Make functions available globally
window.TaskManager = TaskManager;
window.TaskUI = TaskUI;
window.setupFormHandler = setupFormHandler;

console.log("TaskManager loaded - Clean version with single form handler");


// ===== FIX FOR NEW BUTTON IDs =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        // Bulk action buttons
        const bulkPendingBtn = document.getElementById('bulkPendingBtn');
        const bulkCompletedBtn = document.getElementById('bulkDeleteBtn');
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        
        if (bulkPendingBtn && window.TaskManager) {
            bulkPendingBtn.addEventListener('click', function() {
                TaskManager.bulkUpdateStatus('pending');
            });
        }
        
        if (bulkCompletedBtn && window.TaskManager) {
            bulkCompletedBtn.addEventListener('click', function() {
                TaskManager.bulkUpdateStatus('completed');
            });
        }
        
        if (bulkDeleteBtn && window.TaskManager) {
            bulkDeleteBtn.addEventListener('click', function() {
                TaskManager.bulkDelete();
            });
        }
    }, 1000);
});

