const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const https = require('https');

const url = new URL(process.env.MYSQL_PUBLIC_URL);
const db = mysql.createConnection({
  host: url.hostname,
  port: parseInt(url.port),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1)
});

const httpsGet = (url) => new Promise((resolve, reject) => {
  https.get(url, { headers: { 'User-Agent': 'BloodConnect/1.0' } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve(data));
  }).on('error', reject);
});

db.connect((err) => {
  if (err) { console.error('DB connection failed:', err.message); process.exit(1); }
  console.log('Connected to DB');
  importHospitals();
});

const importHospitals = async () => {
  try {
    console.log('Fetching hospitals from OpenStreetMap...');
    
    const query = `[out:json][timeout:60];area["name"="لبنان"]["boundary"="administrative"]->.searchArea;(node["amenity"="hospital"](area.searchArea);way["amenity"="hospital"](area.searchArea););out center;`;
    
    const encodedQuery = encodeURIComponent(query);
    const apiUrl = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;
    
    const rawData = await httpsGet(apiUrl);
    const data = JSON.parse(rawData);
    
    console.log(`Found ${data.elements.length} hospitals`);

    for (const element of data.elements) {
      const name = element.tags?.['name:en'] || element.tags?.name || null;
      if (!name) continue;
      const lat = element.lat || element.center?.lat;
      const lon = element.lon || element.center?.lon;
      if (!lat || !lon) continue;

      const emailPrefix = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
      const email = `${emailPrefix}@hospital.com`;
      const hashedPassword = bcrypt.hashSync(emailPrefix, 10);
      const address = [
        element.tags?.['addr:street'],
        element.tags?.['addr:city'],
        element.tags?.['addr:region']
      ].filter(Boolean).join(', ') || 'Lebanon';

      await new Promise((resolve) => {
        db.query(
          'INSERT IGNORE INTO hospitals (name, email, password, address, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
          [name, email, hashedPassword, address, lat, lon],
          (err) => {
            if (err) console.log(`Skipped ${name}: ${err.message}`);
            else console.log(`✅ Added: ${name}`);
            resolve();
          }
        );
      });
    }

    console.log('✅ Done!');
    db.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};