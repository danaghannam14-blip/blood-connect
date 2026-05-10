const mysql = require('mysql2');

const url = new URL(process.env.MYSQL_PUBLIC_URL);

const db = mysql.createConnection({
  host: url.hostname,
  port: parseInt(url.port),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
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