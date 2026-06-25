const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const config = require('./config');

const db = new sqlite3.Database(config.DB_PATH, async (err) => {
  if (err) {
    console.error('Error connecting:', err.message);
    process.exit(1);
  }
  
  const hash = await bcrypt.hash('123456', 10);
  
  db.run('UPDATE employees SET email = ?, password = ? WHERE id = ?', 
    ['employee@company.com', hash, 1], (err) => {
      if (err) {
        console.error('Error updating employee:', err.message);
      } else {
        console.log('Employee reset successful!');
        console.log('Email: employee@company.com');
        console.log('Password: 123456');
      }
      db.close();
    }
  );
});
