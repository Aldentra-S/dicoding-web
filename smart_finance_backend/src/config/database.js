import mysql2 from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql2.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully to smart-finance-2');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    if (process.env.NODE_ENV !== 'production') process.exit(1);
  }
};

export { pool, testConnection };
