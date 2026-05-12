require('dotenv').config()
const mysql = require('mysql2/promise')

async function run() {
  const db = await mysql.createConnection({
    uri: process.env.MYSQL_PUBLIC_URL,
    ssl: { rejectUnauthorized: false }
  })

  await db.query(`
    CREATE TABLE IF NOT EXISTS transfusions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hospital_id INT NOT NULL,
      blood_type VARCHAR(10) NOT NULL,
      units INT NOT NULL,
      notes VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    )
  `)

  console.log('Transfusions table created!')
  await db.end()
}

run()