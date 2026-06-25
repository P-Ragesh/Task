const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config');

const db = new sqlite3.Database(config.DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting:', err.message);
    process.exit(1);
  }
  console.log('Connected to database at:', config.DB_PATH);
});

console.log('\n--- Checking admins table ---');
db.all('SELECT * FROM admins', (err, rows) => {
  if (err) {
    console.error('Error querying admins:', err.message);
  } else {
    console.log('Admins found:', rows.length);
    rows.forEach(row => console.log('  -', row));
  }

  console.log('\n--- Checking employees table ---');
  db.all('SELECT * FROM employees', (err, rows) => {
    if (err) {
      console.error('Error querying employees:', err.message);
    } else {
      console.log('Employees found:', rows.length);
      rows.forEach(row => console.log('  -', row));
    }

    db.close();
  });
});
