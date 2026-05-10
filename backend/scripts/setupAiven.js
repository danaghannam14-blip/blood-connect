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

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT NOT NULL,
  hospital_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status ENUM('scheduled','completed','cancelled','missed') DEFAULT 'scheduled',
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES donors(id),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  UNIQUE KEY no_overlap (hospital_id, appointment_date, appointment_time)
);
`

conn.connect(err => {
  if (err) { console.error('Connection failed:', err.message); process.exit(1) }
  console.log('Connected to Aiven!')

  const statements = tables.split(';').map(s => s.trim()).filter(s => s.length > 0)

  let i = 0
  const runNext = () => {
    if (i >= statements.length) {
      console.log('✅ All tables created!')
      conn.end()
      process.exit(0)
    }
    conn.query(statements[i] + ';', (err) => {
      if (err) console.log(`Error on statement ${i}:`, err.message)
      else console.log(`✅ Statement ${i + 1} done`)
      i++
      runNext()
    })
  }
  runNext()
})