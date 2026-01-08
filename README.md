# Task Management Command Center

A military-grade, role-based task management system designed for secure and efficient team coordination. This application features a robust permission system, comprehensive audit trails, and a dynamic, sensitive-data-aware user interface.

## 🌟 New Enterprise Features

### 🛡️ Role-Based Access Control (RBAC)
The system verifies user permissions for every action, ensuring strict data security.
- **Admin ("Commander")**: 
  - Full system control.
  - Can manage Users (Create, Promote, Delete).
  - Can view the Master Audit Log.
  - Can create, assign, and delete any task.
- **Manager ("Lieutenant")**:
  - Team coordination focus.
  - Can create and assign tasks to Members.
  - Can view the Audit Log.
  - Cannot modify User accounts.
- **Member ("Field Agent")**: 
  - Execution focus.
  - View only assigned tasks.
  - Can update status and add comments.
  - Restricted access to global data.

### 📝 Audit Logging
A centralized immutable log system tracks critical actions for accountability.
- **Tracked Events**: Logins, Task Creations, Assignments, Status Updates, User Account Changes.
- **Details**: Captures WHO did WHAT, WHEN, and to WHICH target.
- **Visual Feed**: "Live Activity Feed" on the dashboard for real-time monitoring.

### ⚡ Interactive Workflows
- **Task Assignment**: Managers can delegate tasks to specific agents.
- **Comments**: Built-in communication channel per task.
- **Real-time Status**: Dynamic dashboard updating based on task states.

---

## 📂 Project Structure

```bash
task-management-system/
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── api/           # Centralized API calls (users.js, activity.js, tasks.js)
│   │   ├── components/    # Reusable UI (Sidebar, ProtectedRoute, Toast)
│   │   ├── pages/         # Dashboard, UserManagement, ActivityLog, Tasks
│   │   └── styles/        # Glassmorphism CSS theme
│   └── ...
│
└── server/                 # Express + Node.js Backend
    ├── controllers/       # Business logic (RBAC enforcement here)
    ├── middleware/        # authMiddleware.js, roleMiddleware.js
    ├── models/            # MongoDB Schemas (User, Task, ActivityLog)
    ├── routes/            # REST API Routes
    └── ...
```

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Vanilla CSS (Glassmorphism), Axios, React Router v6.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Security**: JWT (JSON Web Tokens), Bcrypt.js (Password Hashing), Role-based Middleware.
- **Email**: SendGrid (for password resets).

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Atlas or Local)

### 1. clone the repository
```bash
git clone <repository-url>
cd task-management-system-test
```

### 2. Backend Configuration
Navigate to the server and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in `server/` with the following:
```env
PORT=5000
MONGO_URI=mongodb+srv://<your-db-string>
JWT_SECRET=<your-secure-secret>
CLIENT_URL=http://localhost:5173

# Email Service (Optional for Password Reset)
SENDGRID_API_KEY=SG.xxxx...
SENDGRID_SENDER_EMAIL=your-verified-sender@example.com
```

Start the backend:
```bash
npm start
# Server runs on http://localhost:5000
```

### 3. Frontend Configuration
Open a new terminal, navigate to the client, and install dependencies:
```bash
cd ../client
npm install
```

Create a `.env` file in `client/` (optional, defaults to localhost):
```env
VITE_API_URL=http://localhost:5000/api
```

Start the interface:
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔐 Usage Guide

### Default Access
Since public signup is disabled for security, you must create your first Admin via the seeding script or database.

**To Create a Manual Admin:**
Run the included helper script in the server directory:
```bash
node server/createAdminUser.js
# Creates user 'admin' with password 'admin123'
```

### Dashboard Navigation
- **Command Center**: Overview of stats and live activity feed.
- **Missions (Tasks)**: Kanban/List view of tasks.
- **Personnel (Admin Only)**: User management interface.
- **Audit Log (Admin/Manager)**: System-wide event history.

---

## 📦 Deployment

### Backend (Render/Heroku/Railway)
1. Push code to GitHub.
2. Connect repo to hosting provider.
3. Set Environment Variables (`MONGO_URI`, `JWT_SECRET`, etc.) in the dashboard.
4. Deploy `server` directory (or root with build script).

### Frontend (Vercel/Netlify)
1. Connect repo to Vercel.
2. Set Root Directory to `client`.
3. Set Environment Variable: `VITE_API_URL` to your deployed backend URL.
4. Deploy.

---

## 📜 License
MIT License. Built for the Advanced Agentic Coding Project.
