require('dotenv').config()
const mysql = require('mysql2')

const conn = mysql.createConnection({
  host: 'mysql-16d1c321-blood-bank2026.k.aivencloud.com',
  port: 18083,
  user: 'avnadmin',
  password: 'AVNS__T6tTjAsWDY7Ra3rKdV',
  database: 'defaultdb',
  ssl: { rejectUnauthorized: false }
})

const tables = `
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  phone VARCHAR(50),
  blood_type VARCHAR(10),
  date_of_birth DATE,
  gender VARCHAR(10),
  address VARCHAR(255),
  governorate VARCHAR(50) DEFAULT 'Beirut',
  is_eligible BOOLEAN DEFAULT FALSE,
  last_donation_date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospitals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  address VARCHAR(255),
  governorate VARCHAR(50),
  city VARCHAR(50),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blood_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT,
  blood_type VARCHAR(10),
  quantity_needed INT,
  status ENUM('pending','fulfilled') DEFAULT 'pending',
  urgency ENUM('low','medium','urgent','critical') DEFAULT 'urgent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

CREATE TABLE IF NOT EXISTS blood_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blood_type VARCHAR(10) NOT NULL,
  status ENUM('critical','low','available') DEFAULT 'available',
  units_available INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_blood_type (blood_type)
);

CREATE TABLE IF NOT EXISTS health_screenings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT,
  feeling_healthy VARCHAR(10),
  chronic_illness VARCHAR(10),
  recent_surgery VARCHAR(10),
  medications VARCHAR(10),
  recent_travel VARCHAR(10),
  is_eligible BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES donors(id)
);

CREATE TABLE IF NOT EXISTS donation_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT,
  hospital_id INT,
  blood_type VARCHAR(10),
  donated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES donors(id),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT,
  hospital_id INT,
  blood_type VARCHAR(10),
  donated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES donors(id),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS emergency_blood_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blood_type VARCHAR(3) NOT NULL,
  governorate VARCHAR(50) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  status ENUM('pending', 'fulfilled', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_blood_type (blood_type),
  INDEX idx_governorate (governorate)
);

CREATE TABLE IF NOT EXISTS emergency_donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT NOT NULL,
  blood_type VARCHAR(10),
  patient_email VARCHAR(255),
  governorate VARCHAR(50),
  status ENUM('pending', 'awaiting_confirmation', 'confirmed') DEFAULT 'pending',
  donor_donation_location ENUM('center', 'hospital'),
  hospital_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
  INDEX idx_donor (donor_id),
  INDEX idx_status (status)
);
`

conn.connect(err => {
  if (err) { 
    console.error('❌ Connection failed:', err.message)
    process.exit(1)
  }
  console.log('✅ Connected to Aiven!')

  const statements = tables.split(';').map(s => s.trim()).filter(s => s.length > 0)

  let i = 0
  const runNext = () => {
    if (i >= statements.length) {
      console.log('✅ All tables created successfully!')
      
      const alterStatements = [
        `ALTER TABLE hospitals ADD COLUMN city VARCHAR(50) DEFAULT 'Beirut'`,
        `ALTER TABLE hospitals ADD COLUMN phone VARCHAR(20) DEFAULT ''`,
        // ✅ FIX: Modified governorate to have DEFAULT 'Beirut' for new records
        `ALTER TABLE donors MODIFY governorate VARCHAR(50) DEFAULT 'Beirut'`
      ]
      
      let j = 0
      const runAlter = () => {
        if (j >= alterStatements.length) {
          console.log('✅ All ALTER statements completed')
          
          // ✅ FIX: Add data integrity check
          // Check for NULL governorates and update them
          const checkNullSQL = `
            SELECT COUNT(*) as null_count
            FROM donors 
            WHERE governorate IS NULL
          `
          
          conn.query(checkNullSQL, (err, results) => {
            if (!err && results && results[0]) {
              const nullCount = results[0].null_count
              
              if (nullCount > 0) {
                console.log(`⚠️  Found ${nullCount} donors with NULL governorate. Fixing...`)
                
                conn.query(
                  `UPDATE donors SET governorate = 'Beirut' WHERE governorate IS NULL`,
                  (updateErr) => {
                    if (updateErr) {
                      console.error('❌ Error fixing NULL governorates:', updateErr.message)
                    } else {
                      console.log(`✅ Fixed ${nullCount} records with default governorate 'Beirut'`)
                    }
                    insertHamraCenter()
                  }
                )
              } else {
                console.log('✅ No NULL governorates found')
                insertHamraCenter()
              }
            } else {
              insertHamraCenter()
            }
          })
          return
        }
        
        conn.query(alterStatements[j], (err) => {
          if (err && (err.message.includes('Duplicate column') || err.message.includes('Unknown column'))) {
            console.log(`✅ Column already exists (${alterStatements[j].substring(0, 40)}...)`)
          } else if (err) {
            console.log(`❌ Error on ALTER ${j + 1}:`, err.message)
          } else {
            console.log(`✅ ALTER statement ${j + 1} completed`)
          }
          j++
          runAlter()
        })
      }
      
      const insertHamraCenter = () => {
        const hamraSQL = `
          INSERT INTO hospitals (name, address, governorate, city, email) 
          SELECT 'BCC Hamra Center', 'Hamra, Beirut', 'Beirut', 'Beirut', 'blood.connect.donate@gmail.com' 
          WHERE NOT EXISTS (SELECT id FROM hospitals WHERE name = 'BCC Hamra Center')
        `
        
        conn.query(hamraSQL, (err) => {
          if (err) {
            console.log('ℹ️  Hamra Center already exists or error:', err.message)
          } else {
            console.log('✅ BCC Hamra Center inserted successfully!')
          }
          
          // Final summary
          const summarySQL = `
            SELECT 
              (SELECT COUNT(*) FROM donors) as total_donors,
              (SELECT COUNT(*) FROM donors WHERE is_eligible = 1) as eligible_donors,
              (SELECT COUNT(*) FROM hospitals) as total_hospitals,
              (SELECT COUNT(*) FROM emergency_donations) as total_emergencies
          `
          
          conn.query(summarySQL, (err, results) => {
            if (!err && results && results[0]) {
              console.log('\n📊 Database Summary:')
              console.log(`   Total Donors: ${results[0].total_donors}`)
              console.log(`   Eligible Donors: ${results[0].eligible_donors}`)
              console.log(`   Total Hospitals: ${results[0].total_hospitals}`)
              console.log(`   Emergency Donations: ${results[0].total_emergencies}`)
            }
            
            conn.end()
            process.exit(0)
          })
        })
      }
      
      runAlter()
      return
    }
    conn.query(statements[i] + ';', (err) => {
      if (err) console.log(`❌ Error on table ${i + 1}:`, err.message)
      else console.log(`✅ Table ${i + 1} created`)
      i++
      runNext()
    })
  }
  runNext()
})