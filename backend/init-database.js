require('dotenv').config();
const mysql = require('mysql2');

console.log('🔧 BloodConnect Database Initialization\n');

// Validate environment variables
if (!process.env.AIVEN_PASSWORD) {
  console.error('❌ Error: AIVEN_PASSWORD not found in .env file');
  console.error('Create .env with: AIVEN_PASSWORD=your_password');
  process.exit(1);
}

const connection = mysql.createConnection({
  host: process.env.AIVEN_HOST || 'mysql-16d1c321-blood-bank2026.k.aivencloud.com',
  port: process.env.AIVEN_PORT || 18083,
  user: process.env.AIVEN_USER || 'avnadmin',
  password: process.env.AIVEN_PASSWORD,
  database: process.env.AIVEN_DB || 'defaultdb',
  ssl: { rejectUnauthorized: false }
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to Aiven MySQL\n');
  initializeDatabase();
});

function initializeDatabase() {
  // All your tables in ONE place
  const tables = [
    // Admins table
    `CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Donors table
    `CREATE TABLE IF NOT EXISTS donors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      blood_type VARCHAR(10),
      date_of_birth DATE,
      gender VARCHAR(10),
      address VARCHAR(255),
      governorate VARCHAR(50) DEFAULT 'Beirut',
      is_eligible BOOLEAN DEFAULT FALSE,
      last_donation_date DATE DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Hospitals table
    `CREATE TABLE IF NOT EXISTS hospitals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      address VARCHAR(255),
      governorate VARCHAR(50) DEFAULT 'Beirut',
      city VARCHAR(50) DEFAULT 'Beirut',
      latitude DECIMAL(10,7),
      longitude DECIMAL(10,7),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Blood requests table
    `CREATE TABLE IF NOT EXISTS blood_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hospital_id INT NOT NULL,
      blood_type VARCHAR(10) NOT NULL,
      quantity_needed INT NOT NULL,
      status ENUM('pending','fulfilled','cancelled') DEFAULT 'pending',
      urgency ENUM('low','medium','urgent','critical') DEFAULT 'urgent',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
    )`,

    

    // Health screenings table
    `CREATE TABLE IF NOT EXISTS health_screenings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      donor_id INT NOT NULL,
      feeling_healthy VARCHAR(10),
      chronic_illness VARCHAR(10),
      recent_surgery VARCHAR(10),
      medications VARCHAR(10),
      recent_travel VARCHAR(10),
      is_eligible BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
    )`,

    // Donation history table
    `CREATE TABLE IF NOT EXISTS donation_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      donor_id INT NOT NULL,
      hospital_id INT NOT NULL,
      blood_type VARCHAR(10) NOT NULL,
      quantity_donated INT DEFAULT 450,
      donated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
    )`,

    // Notifications table
    `CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      donor_id INT NOT NULL,
      hospital_id INT,
      blood_type VARCHAR(10),
      request_type ENUM('regular','emergency') DEFAULT 'regular',
      donated BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
    )`,

    // Password resets table
    `CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      token VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      used BOOLEAN DEFAULT FALSE
    )`,

    // Analytics events table
    `CREATE TABLE IF NOT EXISTS analytics_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_type VARCHAR(50) NOT NULL,
      user_id INT,
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_event_type (event_type),
      INDEX idx_created_at (created_at)
    )`,

    // ⭐ EMERGENCY tables
    `CREATE TABLE IF NOT EXISTS emergency_blood_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      blood_type VARCHAR(3) NOT NULL,
      governorate VARCHAR(50) NOT NULL,
      patient_email VARCHAR(255) NOT NULL,
      patient_name VARCHAR(255),
      patient_phone VARCHAR(20),
      urgency_level ENUM('critical','urgent','moderate') DEFAULT 'urgent',
      status ENUM('pending','fulfilled','cancelled','expired') DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_blood_type (blood_type),
      INDEX idx_governorate (governorate),
      INDEX idx_created_at (created_at)
    )`,

    // Emergency donations table
    `CREATE TABLE IF NOT EXISTS emergency_donations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NOT NULL,
      donor_id INT NOT NULL,
      blood_type VARCHAR(10) NOT NULL,
      governorate VARCHAR(50) NOT NULL,
      status ENUM('pending','awaiting_confirmation','confirmed','rejected','completed') DEFAULT 'pending',
      donor_donation_location ENUM('hospital','center') DEFAULT NULL,
      hospital_id INT,
      scheduled_date DATETIME,
      confirmed_by VARCHAR(255),
      confirmed_at TIMESTAMP NULL,
      email_sent_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES emergency_blood_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
      INDEX idx_request (request_id),
      INDEX idx_donor (donor_id),
      INDEX idx_status (status)
    )`
  ];

  let completed = 0;
  let failed = 0;

  console.log(`📋 Creating ${tables.length} tables...\n`);

  // Execute each table creation
  tables.forEach((sql, index) => {
    connection.query(sql, (err) => {
      if (err) {
        console.error(`❌ Table ${index + 1}: ${err.message}`);
        failed++;
      } else {
        const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/i)[1];
        console.log(`✅ Table ${index + 1}/${tables.length}: ${tableName}`);
        completed++;
      }

      // When all done
      if (completed + failed === tables.length) {
        console.log(`\n${'='.repeat(50)}`);
        if (failed === 0) {
          console.log('✅ Database initialized successfully! 🎉');
          insertDefaultData();
        } else {
          console.log(`⚠️  Completed: ${completed}/${tables.length} (${failed} with issues)`);
          insertDefaultData();
        }
      }
    });
  });
}

function insertDefaultData() {
  console.log('\n📍 Inserting default data...\n');

  const defaultData = [
    {
      sql: `INSERT INTO hospitals (name, email, password, address, governorate, city, phone) 
            SELECT 'BCC Hamra Center', 'blood.connect.donate@gmail.com', 'temp_password', 
                   'Hamra, Beirut', 'Beirut', 'Beirut', '+961-1-234-5678'
            WHERE NOT EXISTS (SELECT id FROM hospitals WHERE email = 'blood.connect.donate@gmail.com')`,
      label: 'BCC Hamra Center'
    },
    {
      sql: `INSERT INTO blood_inventory (blood_type, status, units_available) 
            VALUES ('O+', 'available', 0), ('O-', 'available', 0), ('A+', 'available', 0), 
                   ('A-', 'available', 0), ('B+', 'available', 0), ('B-', 'available', 0), 
                   ('AB+', 'available', 0), ('AB-', 'available', 0)
            ON DUPLICATE KEY UPDATE units_available = units_available`,
      label: 'Blood types in inventory'
    }
  ];

  let inserted = 0;

  defaultData.forEach((item) => {
    connection.query(item.sql, (err) => {
      if (err && !err.message.includes('Duplicate entry')) {
        console.log(`⚠️  ${item.label}: ${err.message}`);
      } else {
        console.log(`✅ ${item.label}`);
      }

      inserted++;
      if (inserted === defaultData.length) {
        showSummary();
      }
    });
  });
}

function showSummary() {
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 Database Summary:\n');

  const summaryQueries = [
    { query: 'SELECT COUNT(*) as count FROM donors', label: 'Total Donors' },
    { query: 'SELECT COUNT(*) as count FROM hospitals', label: 'Hospitals' },
    { query: 'SELECT COUNT(*) as count FROM emergency_blood_requests', label: 'Emergency Requests' },
    { query: 'SELECT COUNT(*) as count FROM donation_history', label: 'Donations Made' }
  ];

  let queriesCompleted = 0;

  summaryQueries.forEach((item) => {
    connection.query(item.query, (err, results) => {
      if (!err && results[0]) {
        console.log(`   ${item.label}: ${results[0].count}`);
      }

      queriesCompleted++;
      if (queriesCompleted === summaryQueries.length) {
        console.log(`\n${'='.repeat(50)}`);
        console.log('✅ Setup complete! You can now use your database.\n');
        console.log('📝 Next steps:');
        console.log('   1. Start your backend server (npm start)');
        console.log('   2. Test emergency features in your app');
        console.log('   3. Monitor emergency_donations table for responses\n');
        connection.end();
        process.exit(0);
      }
    });
  });
}