// ===== DASHBOARD MODULE =====
const Dashboard = {
    init() {
        console.log('Dashboard initializing...');
        
        // Check authentication
        const user = Auth.requireAuth();
        if (!user) {
            console.log('No authenticated user');
            return;
        }

        // Display user info
        this.displayUserInfo(user);
        
        // Load dashboard data
        this.loadDashboardData();
        
        // Set today's date
        this.setTodayDate();
        
        console.log('Dashboard initialized successfully');
    },

    // Display user information
    displayUserInfo(user) {
        const usernameElements = document.querySelectorAll('#usernameDisplay, #userGreeting');
        usernameElements.forEach(el => {
            if (el) el.textContent = user.username || 'Student';
        });
    },

    // Load dashboard statistics and tasks
    loadDashboardData() {
        console.log('Loading dashboard data...');
        
        // Check if TaskManager is available
        if (typeof TaskManager === 'undefined') {
            console.error('TaskManager not found. Loading default stats.');
            this.setDefaultStats();
            return;
        }

        try {
            // Initialize TaskManager if needed
            if (typeof TaskManager.init === 'function') {
                TaskManager.init();
            }
            
            const stats = TaskManager.getStats();
            console.log('Stats loaded:', stats);
            
            // Update stats cards
            this.updateStatElement('totalTasks', stats.total || 0);
            this.updateStatElement('pendingTasks', stats.pending || 0);
            this.updateStatElement('completedTasks', stats.completed || 0);
            this.updateStatElement('urgentTasks', stats.urgent || 0);
            
            // Calculate completion rate
            const completionRate = stats.total > 0 
                ? Math.round((stats.completed / stats.total) * 100)
                : 0;
            
            this.updateStatElement('completionRate', `${completionRate}% complete`);
            
            // Load recent tasks
            this.loadRecentTasks();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.setDefaultStats();
        }
    },

    // Helper to update stats elements
    updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    },

    // Load 5 most recent tasks
    loadRecentTasks() {
        console.log('Loading recent tasks...');
        
        if (typeof TaskManager === 'undefined') {
            console.error('TaskManager not found');
            return;
        }

        try {
            const tasks = TaskManager.getTasks();
            console.log(`Found ${tasks.length} tasks`);
            
            const recentTasks = tasks
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);
            
            const container = document.getElementById('recentTasksList');
            
            if (!container) {
                console.error('Recent tasks container not found');
                return;
            }
            
            if (recentTasks.length === 0) {
                container.innerHTML = `
                    <p class="empty-state">
                        No tasks yet. <a href="tasks.html?action=add">Create your first task!</a>
                    </p>
                `;
                return;
            }
            
            container.innerHTML = recentTasks.map(task => `
                <div class="task-item ${task.completed ? 'completed' : ''}">
                    <div class="task-info">
                        <h4>${this.escapeHtml(task.title)}</h4>
                        <div class="task-meta">
                            <span><i class="fas fa-flag"></i> ${this.escapeHtml(task.priority)}</span>
                            ${task.dueDate ? `<span><i class="fas fa-calendar"></i> ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                            <span><i class="fas fa-clock"></i> ${task.completed ? 'Completed' : 'Pending'}</span>
                        </div>
                    </div>
                    <div>
                        <span class="status-badge status-${task.completed ? 'completed' : 'pending'}">
                            ${task.completed ? 'Completed' : 'Pending'}
                        </span>
                    </div>
                </div>
            `).join('');
            
            console.log(`Displayed ${recentTasks.length} recent tasks`);
            
        } catch (error) {
            console.error('Error loading recent tasks:', error);
            const container = document.getElementById('recentTasksList');
            if (container) {
                container.innerHTML = `
                    <p class="empty-state">
                        Error loading tasks. Please refresh the page.
                    </p>
                `;
            }
        }
    },

    // Set default stats when TaskManager is not available
    setDefaultStats() {
        this.updateStatElement('totalTasks', 0);
        this.updateStatElement('pendingTasks', 0);
        this.updateStatElement('completedTasks', 0);
        this.updateStatElement('urgentTasks', 0);
        this.updateStatElement('completionRate', '0% complete');
        
        const container = document.getElementById('recentTasksList');
        if (container) {
            container.innerHTML = `
                <p class="empty-state">
                    Task manager not loaded. Please refresh the page.
                </p>
            `;
        }
    },

    // Set today's date
    setTodayDate() {
        const todayElement = document.getElementById('todayDate');
        if (todayElement) {
            const today = new Date();
            todayElement.textContent = today.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    },

    // Helper to escape HTML (prevent XSS)
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard DOM loaded');
    
    // Add a small delay to ensure all scripts are loaded
    setTimeout(() => {
        try {
            // Check if Auth is available
            if (typeof Auth === 'undefined') {
                console.error('Auth module not loaded');
                window.location.href = 'login.html';
                return;
            }
            
            // Check if user is logged in
            const user = Auth.getCurrentUser();
            if (!user) {
                console.log('No user logged in, redirecting to login');
                window.location.href = 'login.html';
                return;
            }
            
            console.log('User logged in:', user.username);
            Dashboard.init();
            
        } catch (error) {
            console.error('Error initializing dashboard:', error);
        }
    }, 100);
});