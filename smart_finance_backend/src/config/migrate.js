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
      debt_to_income_ratio DECIMAL(5,2),
      status ENUM('Sehat', 'Rawan', 'Kritis') NOT NULL,
      score INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      consultant_id INT NOT NULL,
      booking_date DATE NOT NULL,
      status ENUM('pending', 'booked', 'completed', 'cancelled') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE
    )`,
  ];
  try {
    for (const query of queries) {
      await pool.query(query);
    }
    console.log('Migration to smart-finance-2 completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
};
createTables();
