require('dotenv').config()
const mysql = require('mysql2/promise')

const railwayUrl = 'mysql://root:CKuyVfbOZHDYvUkNtjHBbVIExPHUKAWi@shinkansen.proxy.rlwy.net:30831/railway'
const aivenUrl = process.env.MYSQL_PUBLIC_URL

async function migrate() {
  console.log('Connecting to both databases...')
  const railway = await mysql.createConnection(railwayUrl)
  const aiven = await mysql.createConnection({
    uri: aivenUrl,
    ssl: { rejectUnauthorized: false }
  })
  console.log('Connected!')

  // Get Aiven columns for each table
  const getAivenColumns = async (table) => {
    const [cols] = await aiven.query(`SHOW COLUMNS FROM ${table}`)
    return cols.map(c => c.Field)
  }

  const tables = ['admins', 'donors', 'hospitals', 'health_screenings', 'blood_inventory']

  for (const table of tables) {
    try {
      const [rows] = await railway.query(`SELECT * FROM ${table}`)
      if (rows.length === 0) { console.log(`${table}: empty, skipping`); continue }

      const aivenCols = await getAivenColumns(table)

      for (const row of rows) {
        // Only use columns that exist in Aiven
        const filteredKeys = Object.keys(row).filter(k => aivenCols.includes(k))
        const filteredValues = filteredKeys.map(k => row[k])
        const placeholders = filteredKeys.map(() => '?').join(',')
        const sql = `INSERT IGNORE INTO ${table} (${filteredKeys.join(',')}) VALUES (${placeholders})`
        await aiven.query(sql, filteredValues)
      }
      console.log(`✅ ${table}: ${rows.length} rows migrated`)
    } catch (e) {
      console.log(`❌ ${table} error:`, e.message)
    }
  }

  await railway.end()
  await aiven.end()
  console.log('✅ Migration complete!')
}

migrate()