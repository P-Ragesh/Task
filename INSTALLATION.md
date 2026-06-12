# Installation Guide — TaskPilot Enterprise

Follow these steps to install and run the full-stack system locally.

---

## Prerequisites

Ensure you have **Node.js** (v14 or higher) and **npm** installed:
* [Download Node.js](https://nodejs.org/)

---

## Installation Steps

1. **Extract/Navigate to Workspace**:
   Navigate into the project root directory where `package.json` is located.
   ```bash
   cd c:\Users\Selva\visual\Websites\Task
   ```

2. **Install Dependencies**:
   Run the following command to download and install the Express server, SQLite driver, and encryption packages:
   ```bash
   npm install
   ```

3. **Start the API Server**:
   Launch the Node.js backend using the npm start script:
   ```bash
   npm start
   ```

4. **Access the Console**:
   * The backend server launches on: `http://localhost:5000`
   * Open the frontend dashboard directly by opening `frontend/login.html` via **Live Server** (on port `5500`) or serving the frontend folder static files. Visiting `http://localhost:5000` will automatically serve the static frontend client files immediately.

---

## Default Administrator Credentials

On the first start, the SQLite database is automatically created and seeded with a default manager account:
* **Username**: `admin`
* **Password**: `admin123`
* **Portal**: Toggle "Admin Portal" on the login screen tab selectors.
