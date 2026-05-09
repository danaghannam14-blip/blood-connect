const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2');

const url = new URL(process.env.MYSQL_PUBLIC_URL);
const db = mysql.createConnection({
  host: url.hostname,
  port: parseInt(url.port),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1)
});

db.connect((err) => {
  if (err) { console.error('DB connection failed:', err.message); process.exit(1); }
  console.log('Connected to DB');
  updateAddresses();
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const updateAddresses = async () => {
  db.query('SELECT id, name, latitude, longitude FROM hospitals WHERE address = ? OR address IS NULL', ['Lebanon'], async (err, hospitals) => {
    if (err) { console.error(err.message); process.exit(1); }
    console.log(`Found ${hospitals.length} hospitals to update`);

    for (const hospital of hospitals) {
      if (!hospital.latitude || !hospital.longitude) continue;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${hospital.latitude}&lon=${hospital.longitude}&format=json`,
          { headers: { 'User-Agent': 'BloodConnect/1.0' } }
        );
        const data = await res.json();

        if (data && data.address) {
          const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county || ''
          const state = data.address.state || ''
          const address = [city, state].filter(Boolean).join(', ') || 'Lebanon'

          await new Promise((resolve) => {
            db.query('UPDATE hospitals SET address = ? WHERE id = ?', [address, hospital.id], (err) => {
              if (err) console.log(`Failed to update ${hospital.name}: ${err.message}`);
              else console.log(`✅ Updated ${hospital.name}: ${address}`);
              resolve();
            });
          });
        }

        await sleep(1000); // Wait 1 second between requests to avoid rate limiting
      } catch (e) {
        console.log(`Error for ${hospital.name}: ${e.message}`);
      }
    }

    console.log('✅ Done updating addresses!');
    db.end();
    process.exit(0);
  });
};