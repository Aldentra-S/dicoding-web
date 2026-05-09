import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Token tidak ditemukan. Silakan login terlebih dahulu.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [decoded.id],
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Pengguna tidak ditemukan.' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token sudah kadaluarsa. Silakan login kembali.',
      });
    }
    return res
      .status(401)
      .json({ status: 'error', message: 'Token tidak valid.' });
  }
};

export { authenticate };
