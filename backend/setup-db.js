require('dotenv').config();
const mysql = require('mysql2');

console.log('🔍 Using password from .env file...');

const connection = mysql.createConnection({
  host: 'mysql-16d1c321-blood-bank2026.k.aivencloud.com',
  port: 18083,
  user: 'avnadmin',
  password: process.env.AIVEN_PASSWORD,
  database: 'defaultdb',
  ssl: { rejectUnauthorized: false }
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection Error:', err.message);
    console.error('\n⚠️  Make sure:');
    console.error('1. AIVEN_PASSWORD is set in .env file');
    console.error('2. Password is correct');
    console.error('3. Database is accessible');
    process.exit(1);
  }
  console.log('✅ Connected to Aiven!');
});

const sql = `
CREATE TABLE IF NOT EXISTS emergency_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  donor_id INT NOT NULL,
  status ENUM('pending', 'awaiting_confirmation', 'confirmed', 'rejected') DEFAULT 'pending',
  donor_donation_location ENUM('hospital', 'center') DEFAULT NULL,
  hospital_id INT DEFAULT NULL,
  confirmed_by VARCHAR(255) DEFAULT NULL,
  confirmed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES emergency_blood_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
  INDEX idx_request (request_id),
  INDEX idx_donor (donor_id),
  INDEX idx_status (status),
  INDEX idx_location (donor_donation_location)
)
`;

connection.query(sql, function (error, results) {
  if (error) {
    console.error('❌ Error Creating Table:', error.message);
    connection.end();
    process.exit(1);
  } else {
    console.log('✅ Table created successfully!');
    
    // Fixed verification - use backticks instead of quotes
    const verifySql = `SHOW TABLES LIKE emergency_notifications`;
    
    connection.query(verifySql, function (err, results) {
      if (err) {
        console.error('❌ Error verifying:', err.message);
        connection.end();
        process.exit(1);
      }
      console.log('\n✅ Tables Created:');
      if (results.length > 0) {
        results.forEach(row => {
          console.log('  -', Object.values(row)[0]);
        });
      }
      
      // Also check emergency_blood_requests
      connection.query(`SHOW TABLES LIKE emergency_blood_requests`, function (err2, results2) {
        if (!err2 && results2.length > 0) {
          results2.forEach(row => {
            console.log('  -', Object.values(row)[0]);
          });
        }
        console.log('\n✅ Database setup complete! 🎉');
        connection.end();
      });
    });
  }
});