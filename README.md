# TaskPilot Enterprise — Employee Task Monitoring System

TaskPilot Enterprise is a professional, full-stack, secure task monitoring system. It provides managers with the metrics and audit controls to assign workloads and assess employee productivity, while giving employees a dedicated portal to view and update their task status.

---

## Technical Architecture

* **Frontend**: Vanilla HTML5, CSS3 Custom Properties (Light/Dark themes), JavaScript REST Client (Fetch API).
* **Backend**: Node.js, Express framework, SQLite3 database, JWT Session Authentication, bcryptjs password hashing.
* **Database**: SQL-driven schema featuring cascade deletes and audit logs.

---

## File Structure

```
task-pilot-fullstack/
├── package.json (Configured with backend dependencies)
├── README.md
├── INSTALLATION.md
├── API_DOCUMENTATION.md
├── DATABASE_SETUP.md
├── backend/
│   ├── server.js (Server listener)
│   ├── app.js (Express configurations)
│   ├── config.js (Port & JWT secrets config)
│   ├── database.js (SQLite instance)
│   ├── schema.sql (Tables setup)
│   ├── seed.sql (Seeds setup)
│   ├── config/
│   │   └── jwtConfig.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── taskController.js
│   │   ├── dashboardController.js
│   │   └── reportController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── reportRoutes.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Employee.js
│   │   ├── Task.js
│   │   └── TaskStatus.js
│   └── services/
│       ├── emailService.js
│       └── reportService.js
└── frontend/
    ├── index.html (Decides routing on load)
    ├── login.html (Portal form)
    ├── admin-dashboard.html (Stats, charts)
    ├── employee-dashboard.html (Assigned tasks list)
    ├── task-management.html (Admin Kanban board)
    ├── employee-management.html (Admin staff lists)
    ├── reports.html (Filters matrix table)
    ├── profile.html (Edit account details)
    ├── components/
    │   ├── navbar.html
    │   └── sidebar.html
    ├── css/
    │   ├── styles.css (Global tokens)
    │   ├── dashboard.css (KPIs, tables)
    │   ├── login.css (Portal style)
    │   ├── responsive.css (Mobile adjustments)
    │   └── animations.css (Transitions)
    └── js/
        ├── app.js (Component loader)
        ├── auth.js (Access control)
        ├── api.js (Fetch wrapper)
        ├── dashboard.js (Chart.js widgets)
        ├── task.js (Tasks actions)
        ├── employee.js (Employee profiles actions)
        ├── reports.js (CSV exports)
        └── validation.js (Forms check)
```

---

## Features

### Admin Role
* Secure JWT Logins.
* Employee CRUD Management (register profiles, delete accounts, view workloads).
* Task CRUD Allocation (assign titles, descriptions, due dates, priority, status).
* Live status audits and donut chart metrics.
* Reset employee passwords.
* Print & compile CSV report exports.

### Employee Role
* Secure JWT Logins.
* Restricted access (cannot view employee directory, reports, or task creations).
* View only assigned tasks list.
* Update task status (Pending, In Progress, Completed) with mandatory completion notes when completed.
* Edit profile email & contact phone.
