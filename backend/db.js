const mysql = require('mysql2');

const db = mysql.createConnection({
  uri: process.env.MYSQL_PUBLIC_URL,
  ssl: { rejectUnauthorized: false }
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }
  console.log('Connected to Aiven MySQL database');
});

module.exports = db;