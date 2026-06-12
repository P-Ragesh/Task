# API Documentation — TaskPilot Enterprise REST API

All API requests should point to the base URL: `http://localhost:5000/api`

---

## 1. Authentication Routes

### Post Login
* **URL**: `/auth/login`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "admin123",
    "portal": "admin"
  }
  // OR for employee
  {
    "email": "employee@company.com",
    "password": "password123",
    "portal": "employee"
  }
  ```
* **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": { "id": 1, "name": "System Admin", "role": "admin", "username": "admin" }
  }
  ```

### Put Profile Settings
* **URL**: `/auth/profile`
* **Method**: `PUT`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "email": "updated@company.com",
    "phone": "555-1234",
    "password": "newpassword123"
  }
  ```
* **Success Response**: `200 OK`
  ```json
  { "success": true, "message": "Employee profile updated successfully." }
  ```

---

## 2. Employee Management (Admin Restricted)

### Get Directory
* **URL**: `/employees`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response**: `200 OK`

### Create Employee Account
* **URL**: `/employees`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "name": "Jane Smith",
    "email": "jane@company.com",
    "role": "QA Analyst",
    "department": "Engineering",
    "phone": "555-0011",
    "password": "password123"
  }
  ```
* **Success Response**: `210 Created`

### Reset Employee Password
* **URL**: `/employees/:id/reset-password`
* **Method**: `POST`
* **Request Body**:
  ```json
  { "password": "newpassword123" }
  ```
* **Success Response**: `200 OK`

---

## 3. Tasks Management

### Get Tasks List
* **URL**: `/tasks`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response**: Returns all tasks if Admin, or only assigned tasks if Employee.

### Assign New Task (Admin Restricted)
* **URL**: `/tasks`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "title": "Database Optimization",
    "description": "Configure indexes on audit logging table.",
    "priority": "High",
    "assignee_id": 2,
    "due_date": "2026-06-15"
  }
  ```
* **Success Response**: `201 Created`

### Update Task Status
* **URL**: `/tasks/:id/status`
* **Method**: `PATCH`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "status": "completed",
    "completion_note": "Added index on taskId column."
  }
  ```
* **Success Response**: `200 OK`
