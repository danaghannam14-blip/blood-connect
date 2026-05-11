require('dotenv').config()
const mysql = require('mysql2/promise')

async function run() {
  const db = await mysql.createConnection({
    uri: process.env.MYSQL_PUBLIC_URL,
    ssl: { rejectUnauthorized: false }
  })

  await db.query(`
    CREATE TABLE IF NOT EXISTS blood_stock (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hospital_id INT NOT NULL,
      blood_type VARCHAR(10) NOT NULL,
      units_available INT DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
      UNIQUE KEY unique_hospital_blood (hospital_id, blood_type)
    )
  `)
  console.log('Table created!')

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const [hospitals] = await db.query('SELECT id FROM hospitals')
  let count = 0
  for (const h of hospitals) {
    for (const bt of bloodTypes) {
      await db.query(
        'INSERT IGNORE INTO blood_stock (hospital_id, blood_type, units_available) VALUES (?, ?, 0)',
        [h.id, bt]
      )
      count++
    }
  }
  console.log('Done! Inserted', count, 'rows')
  await db.end()
}

run()