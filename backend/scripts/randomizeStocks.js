require('dotenv').config()
const mysql = require('mysql2/promise')

async function run() {
  const db = await mysql.createConnection({
    host: 'mysql-16d1c321-blood-bank2026.k.aivencloud.com',
    port: 18083,
    user: 'avnadmin',
    password: 'AVNS__T6tTjAsWDY7Ra3rKdV',
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false }
  })

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const [hospitals] = await db.query('SELECT id FROM hospitals')
  console.log(`Updating ${hospitals.length} hospitals...`)

  for (const h of hospitals) {
    for (const bt of bloodTypes) {
      const units = Math.floor(Math.random() * 20) + 5
      await db.query(
        'INSERT INTO blood_stock (hospital_id, blood_type, units_available) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE units_available = ?',
        [h.id, bt, units, units]
      )
    }
  }

  console.log('✅ Done! All hospitals have random blood stock (5-25 units).')
  await db.end()
}

run().catch(console.error)