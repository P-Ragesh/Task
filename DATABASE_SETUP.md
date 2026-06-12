# Database Configuration Guide — TaskPilot Enterprise

TaskPilot Enterprise uses a self-contained, query-driven **SQLite** relational database file (`database.db`).

---

## Zero-Configuration Setup

No external database installation is required (e.g. Postgres, MySQL, MongoDB). 
When you start the API server with `npm start`, the application:
1. Creates the database file `backend/database.db` automatically if it doesn't exist.
2. Reads and executes `backend/schema.sql` to construct the tables.
3. Automatically hashes the default manager password and inserts the first Administrator account into the `admins` table.

---

## Database Tables

### 1. `admins`
Stores system managers.
* `id`: Integer (Primary Key, Autoincrement)
* `username`: Text (Unique)
* `password`: Text (Bcrypt Hashed)

### 2. `employees`
Stores registered staff profiles.
* `id`: Integer (Primary Key, Autoincrement)
* `name`: Text
* `email`: Text (Unique)
* `role`: Text
* `department`: Text
* `phone`: Text
* `password`: Text (Bcrypt Hashed)

### 3. `tasks`
Stores task allocations.
* `id`: Integer (Primary Key, Autoincrement)
* `title`: Text
* `description`: Text
* `priority`: Text (Low, Medium, High)
* `status`: Text (todo, inprogress, completed)
* `assignee_id`: Integer (Foreign Key to `employees.id`, Cascades on Delete)
* `due_date`: Text
* `completion_note`: Text

### 4. `task_status_history`
Stores the transition logs.
* `id`: Integer (Primary Key, Autoincrement)
* `task_id`: Integer (Foreign Key to `tasks.id`, Cascades on Delete)
* `from_status`: Text
* `to_status`: Text
* `note`: Text
* `actor_name`: Text
* `timestamp`: DateTime
