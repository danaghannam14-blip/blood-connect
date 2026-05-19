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

  console.log('Resetting appointments data...')

  const queries = [
    'DELETE FROM blood_requests',
    'DELETE FROM appointments',
    'DELETE FROM donation_history',
    'DELETE FROM notifications',
    'UPDATE donors SET last_donation_date = NULL'
  ]

  for (const q of queries) {
    try {
      await db.query(q)
      console.log(`✅ ${q.split(' ')[0]}`)
    } catch (err) {
      console.error(`❌ Error:`, err.message)
    }
  }

  console.log('\n✅ Done! Blood stock preserved.')
  await db.end()
}

run().catch(console.error)