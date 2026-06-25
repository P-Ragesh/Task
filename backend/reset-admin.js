const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const config = require('./config');

const db = new sqlite3.Database(config.DB_PATH, async (err) => {
  if (err) {
    console.error('Error connecting:', err.message);
    process.exit(1);
  }
  
  const hash = await bcrypt.hash('admin123', 10);
  
  db.run('UPDATE admins SET username = ?, password = ? WHERE id = ?', 
    ['admin', hash, 1], (err) => {
      if (err) {
        console.error('Error updating admin:', err.message);
      } else {
        console.log('Admin reset successful!');
        console.log('Username: admin');
        console.log('Password: admin123');
      }
      db.close();
    }
  );
});
