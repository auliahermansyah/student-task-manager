// ===== AUTH MODULE =====
const Auth = {
    // Current user key for localStorage
    CURRENT_USER_KEY: 'currentUser',
    USERS_KEY: 'users',

    // Initialize
    init() {
        this.setupEventListeners();
        this.checkRememberedUser();
    },

    // Setup event listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register link toggle
        const registerLink = document.getElementById('registerLink');
        const backToLogin = document.getElementById('backToLogin');
        const registerForm = document.getElementById('registerForm');
        
        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('loginForm').style.display = 'none';
                registerForm.style.display = 'block';
            });
        }

        if (backToLogin) {
            backToLogin.addEventListener('click', () => {
                registerForm.style.display = 'none';
                document.getElementById('loginForm').style.display = 'block';
            });
        }

        // Register form
        const registerFormInner = document.getElementById('registerFormInner');
        if (registerFormInner) {
            registerFormInner.addEventListener('submit', (e) => this.handleRegister(e));
        }
    },

    // Handle login
    handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const remember = document.getElementById('remember').checked;

        // Demo validation (in real app, check against stored users)
        if (username === 'user' && password === 'pass123') {
            const user = {
                id: 1,
                username: username,
                email: 'demo@student.com',
                joined: new Date().toISOString()
            };

            // Save to localStorage
            localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
            
            if (remember) {
                localStorage.setItem('rememberedUser', username);
            }

            // Redirect to dashboard
            alert('Login successful! Redirecting...');
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid credentials. Try: user / pass123');
        }
    },

    // Handle registration
    handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value.trim();

        if (!username || !email || !password) {
            alert('Please fill all fields');
            return;
        }

        // Get existing users
        let users = JSON.parse(localStorage.getItem(this.USERS_KEY)) || [];
        
        // Check if user exists
        if (users.find(u => u.username === username)) {
            alert('Username already exists');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            username,
            email,
            password, // In real app, hash this!
            joined: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        
        // Auto login
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));
        
        alert('Account created successfully!');
        window.location.href = 'dashboard.html';
    },

    // Check remembered user
    checkRememberedUser() {
        const remembered = localStorage.getItem('rememberedUser');
        if (remembered && document.getElementById('username')) {
            document.getElementById('username').value = remembered;
            document.getElementById('remember').checked = true;
        }
    },

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem(this.CURRENT_USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    // Logout
    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
        window.location.href = 'index.html';
    },

    // Check if user is logged in
    requireAuth() {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = 'index.html';
            return false;
        }
        return user;
    }
};

// Initialize auth when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});