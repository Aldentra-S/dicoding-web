import { pool, testConnection } from './database.js';

const createTables = async () => {
  await testConnection();
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      photo_url VARCHAR(255),
      role VARCHAR(20) DEFAULT 'member',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS consultants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      specialization VARCHAR(100) NOT NULL,
      bio TEXT,
      photo_url VARCHAR(255),
      rate INT NOT NULL,
      experience_years INT DEFAULT 0,
      rating DECIMAL(2,1) DEFAULT 0.0,
      is_available BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS financial_health_checks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      monthly_income BIGINT NOT NULL,
      monthly_expenses BIGINT NOT NULL,
      monthly_debt_payment BIGINT NOT NULL DEFAULT 0,
      total_debt BIGINT NOT NULL DEFAULT 0,
      emergency_fund BIGINT NOT NULL DEFAULT 0,
      debt_to_income_ratio DECIMAL(5,2),
      expense_to_income_ratio DECIMAL(5,2),
      emergency_fund_months DECIMAL(5,1),
      status ENUM('Sehat', 'Rawan', 'Kritis') NOT NULL,
      score INT NOT NULL,
      recommendation TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS daily_finance_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      monthly_income BIGINT NOT NULL DEFAULT 0,
      monthly_expenses BIGINT NOT NULL DEFAULT 0,
      monthly_debt_payment BIGINT NOT NULL DEFAULT 0,
      emergency_fund BIGINT NOT NULL DEFAULT 0,
      debt_to_income_ratio DECIMAL(5,2) DEFAULT 0,
      expense_to_income_ratio DECIMAL(5,2) DEFAULT 0,
      emergency_fund_months DECIMAL(5,1) DEFAULT 0,
      score INT NOT NULL DEFAULT 0,
      status ENUM('Sehat', 'Rawan', 'Kritis') NOT NULL DEFAULT 'Kritis',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      consultant_id INT NOT NULL,
      health_check_id INT DEFAULT NULL,
      booking_date DATE NOT NULL,
      booking_time TIME,
      duration_minutes INT DEFAULT 60,
      consultation_method VARCHAR(50) DEFAULT 'chat',
      topic VARCHAR(500),
      session_type VARCHAR(50),
      notes TEXT,
      total_fee INT DEFAULT 0,
      status ENUM('pending', 'booked', 'completed', 'cancelled', 'rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE
    )`,
  ];

  const alterQueries = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'member'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS health_check_id INT DEFAULT NULL`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 60`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS topic VARCHAR(500)`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS session_type VARCHAR(50)`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_fee INT DEFAULT 0`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    `ALTER TABLE bookings MODIFY COLUMN status ENUM('pending', 'booked', 'completed', 'cancelled', 'rejected') DEFAULT 'pending'`,
    `ALTER TABLE bookings MODIFY COLUMN consultation_method VARCHAR(50) DEFAULT 'chat'`,
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
    }
    console.log('Tables created/verified!');

    for (const query of alterQueries) {
      try {
        await pool.query(query);
      } catch (err) {
        if (!err.message.includes('Duplicate column')) {
          console.warn('Alter warning:', err.message);
        }
      }
    }

    console.log('Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
};
createTables();
