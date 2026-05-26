const db = require('./db');
const bcrypt = require('bcryptjs');

db.query(
  'SELECT id, name FROM hospitals',
  (err, hospitals) => {
    if (err) {
      console.error(err.message);
      process.exit(1);
    }

    hospitals.forEach(h => {
      const pass = h.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);

      const hashed = bcrypt.hashSync(pass, 10);

      db.query(
        'UPDATE hospitals SET password=? WHERE id=?',
        [hashed, h.id],
        (err2) => {
          if (err2) console.log(err2.message);
          else console.log(`✅ ${h.name}`);
        }
      );
    });
  }
);