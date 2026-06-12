const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const config = require('./config');

// Initialize database connection
const db = new sqlite3.Database(config.DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite Database:', err.message);
  } else {
    console.log('Connected to SQLite Database at:', config.DB_PATH);
    db.run('PRAGMA foreign_keys = ON', (pragmaErr) => {
      if (pragmaErr) {
        console.error('Failed to enable foreign key support:', pragmaErr.message);
      } else {
        console.log('SQLite Foreign key support enabled.');
      }
    });
    initializeSchema();
  }
});

function initializeSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  db.exec(schemaSql, (err) => {
    if (err) {
      console.error('Error executing database schema.sql:', err.message);
    } else {
      console.log('Database tables verified/created successfully.');
      seedDefaultAdmin();
      seedDefaultEmployee();
    }
  });
}

function seedDefaultAdmin() {
  db.get('SELECT COUNT(*) as count FROM admins', (err, row) => {
    if (err) {
      console.error('Error counting admins:', err.message);
      return;
    }

    if (row.count === 0) {
      const defaultUsername = 'admin';
      const defaultPassword = 'admin123';
      
      bcrypt.hash(defaultPassword, 10, (hashErr, hash) => {
        if (hashErr) {
          console.error('Failed to hash default admin password:', hashErr.message);
          return;
        }

        db.run(
          'INSERT INTO admins (username, password) VALUES (?, ?)',
          [defaultUsername, hash],
          (insertErr) => {
            if (insertErr) {
              console.error('Failed to seed default admin:', insertErr.message);
            } else {
              console.log('--------------------------------------------------');
              console.log('Default Admin Account Seeded Successfully!');
              console.log(`Username: ${defaultUsername}`);
              console.log(`Password: ${defaultPassword}`);
              console.log('--------------------------------------------------');
            }
          }
        );
      });
    }
  });
}

function seedDefaultEmployee() {
  db.get('SELECT COUNT(*) as count FROM employees', (err, row) => {
    if (err) {
      console.error('Error counting employees:', err.message);
      return;
    }

    if (row.count === 0) {
      const defaultName = 'Sample Employee';
      const defaultEmail = 'employee@company.com';
      const defaultRole = 'Software Engineer';
      const defaultDept = 'Engineering';
      const defaultPhone = '+1 (555) 0199';
      const defaultPassword = '123456';

      bcrypt.hash(defaultPassword, 10, (hashErr, hash) => {
        if (hashErr) {
          console.error('Failed to hash default employee password:', hashErr.message);
          return;
        }

        db.run(
          'INSERT INTO employees (name, email, role, department, phone, password) VALUES (?, ?, ?, ?, ?, ?)',
          [defaultName, defaultEmail, defaultRole, defaultDept, defaultPhone, hash],
          (insertErr) => {
            if (insertErr) {
              console.error('Failed to seed default employee:', insertErr.message);
            } else {
              console.log('--------------------------------------------------');
              console.log('Default Employee Account Seeded Successfully!');
              console.log(`Email: ${defaultEmail}`);
              console.log(`Password: ${defaultPassword}`);
              console.log('--------------------------------------------------');
            }
          }
        );
      });
    }
  });
}

// Database helper promises for models
const dbQuery = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = {
  db,
  query: dbQuery
};
