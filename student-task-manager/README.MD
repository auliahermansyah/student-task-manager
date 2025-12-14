# Task Manager System - Documentation

# 📋 Overview
This is a Student Task Management System built with vanilla JavaScript, HTML, and CSS. The system allows students to manage their academic tasks, assignments, and projects through an intuitive web interface.

# 🏗️ System Architecture
Core Components
1. Authentication Module (auth.js) - User login system
2. Task Management Module (taskManager.js) - Central task operations
3. Dashboard Module (dashboard.js) - Overview and statistics
4. Tasks Interface Module (TaskUI in taskManager.js) - Task list management
5. HTML Views (dashboard.html, tasks.html) - User interfaces

# 📁 File Structure
student-task-manager/
├── js/
│   ├── auth.js          # Authentication system
│   ├── taskManager.js   # Core task operations
│   └── dashboard.js     # Dashboard functionality
├── css/
│   └── style.css        # Styling of the Web Application
|
├── dashboard.html   # Dashboard view
├── tasks.html       # Tasks management view
└── index.html       # Login page 

# 🔐 Authentication System
- user login, because this is a demo web app, its has only 1 credential users (user / pass123)
- User data stored in localStorage under currentUser key

# 📊 Dashboard Module
Functionality
- Real-time statistics display
- Task completion tracking
- Recent tasks overview 
- Urgent tasks identification (high priority + pending)
- Date display with formatted current date

Statistics Tracked
- Total Tasks
- Pending Tasks
- Completed Tasks
- Urgent Tasks (high priority + pending)
- Completion Rate Percentage

# 📝 Task Management System
Core Features
- CRUD Operations: Create, Read, Update, Delete tasks
- Task Filtering: Search by title/description, filter by priority/status
- Bulk Actions: Multiple task selection and operations
- Priority Levels: Low, Medium, High
- Due Dates: Optional date tracking
- Status Tracking: Pending/Completed

# 🚀 Setup Instructions
1. copy this from github
2. put this on your xampp/mamp/local server htdocs folder
3. and run it locally (this simple web based application haven't intergrated using any database)

# 🏆 Key Features Summary
✅ Complete Authentication System with registration/login
✅ Full CRUD Operations for task management
✅ Real-time Dashboard with statistics
✅ Advanced Filtering & Search capabilities
✅ Bulk Task Operations for efficient management
✅ No External Dependencies beyond Font Awesome
✅ Client-side Only, no server required
✅ Data Persistence via localStorage
✅ Cross-page Synchronization

# 📄 License & Credits
This is a student project built for educational purposes. Feel free to modify and extend for personal or academic use.

# Credits
- Font Awesome for icons
- Modern JavaScript ES6+ features
- LocalStorage API for data persistence

# 🔗 Related Resources
For further development:
- MDN Web Docs - localStorage
- Font Awesome Icons
- JavaScript Modules Guide

Last Updated: Tuesday, 9 December 2025, 14.04
System Version: 1.0.0
*Browser Compatibility: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+*