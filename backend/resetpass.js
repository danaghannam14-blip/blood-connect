require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// ✅ Use your existing MYSQL_PUBLIC_URL (NO env changes needed)
const url = new URL(process.env.MYSQL_PUBLIC_URL);

const db = mysql.createConnection({
  host: url.hostname,
  port: url.port,
  user: url.username,
  password: url.password,
  database: url.pathname.replace('/', ''),
  ssl: { rejectUnauthorized: false }
});

db.connect((err) => {
  if (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }

  console.log('✅ DB connected');

  db.query('SELECT id, name FROM hospitals', (err, hospitals) => {
    if (err) {
      console.error(err.message);
      process.exit(1);
    }

    if (!hospitals.length) {
      console.log('⚠️ No hospitals found');
      process.exit(0);
    }

    hospitals.forEach(h => {
      const pass = h.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);

      const hashed = bcrypt.hashSync(pass, 10);

      db.query(
        'UPDATE hospitals SET password = ? WHERE id = ?',
        [hashed, h.id],
        (err2) => {
          if (err2) {
            console.log(`❌ ${h.name}: ${err2.message}`);
          } else {
            console.log(`✅ ${h.name} -> ${pass}`);
          }
        }
      );
    });

    console.log('🎉 Password reset running...');
  });
});