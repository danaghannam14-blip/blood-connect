require('dotenv').config()
const mysql = require('mysql2')

const pool = mysql.createPool({
  host: 'mysql-16d1c321-blood-bank2026.k.aivencloud.com',
  port: 18083,
  user: 'avnadmin',
  password: process.env.AIVEN_PASSWORD,
  database: 'defaultdb',
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

const db = pool.promise()

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message)
})

pool.on('connection', () => {
  console.log('✅ Database connected')
})

module.exports = pool