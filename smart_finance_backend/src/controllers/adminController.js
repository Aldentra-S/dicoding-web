import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';

const ADMIN_SECRET =
  process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'admin_secret_key';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@smartfinance.id';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Email atau password admin salah.' });
    }
    const token = jwt.sign({ role: 'admin', email }, ADMIN_SECRET, {
      expiresIn: '12h',
    });
    return res
      .status(200)
      .json({ status: 'success', message: 'Login admin berhasil.', token });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const [[{ total_users }]] = await pool.query(
      'SELECT COUNT(*) as total_users FROM users',
    );
    const [[{ total_bookings }]] = await pool.query(
      'SELECT COUNT(*) as total_bookings FROM bookings',
    );
    const [[{ total_consultants }]] = await pool.query(
      'SELECT COUNT(*) as total_consultants FROM consultants',
    );
    const [[{ total_health_checks }]] = await pool.query(
      'SELECT COUNT(*) as total_health_checks FROM financial_health_checks',
    );
    const [[{ revenue }]] = await pool.query(
      "SELECT COALESCE(SUM(total_fee),0) as revenue FROM bookings WHERE status = 'completed'",
    );
    const [[{ pending }]] = await pool.query(
      "SELECT COUNT(*) as pending FROM bookings WHERE status = 'booked'",
    );
    return res.status(200).json({
      status: 'success',
      data: {
        total_users,
        total_bookings,
        total_consultants,
        total_health_checks,
        revenue,
        pending,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.photo_url, u.created_at,
        COUNT(b.id) as total_bookings,
        COUNT(h.id) as total_health_checks
       FROM users u
       LEFT JOIN bookings b ON u.id = b.user_id
       LEFT JOIN financial_health_checks h ON u.id = h.user_id
       GROUP BY u.id ORDER BY u.created_at DESC`,
    );
    return res.status(200).json({ status: 'success', data: { users: rows } });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, photo_url, created_at FROM users WHERE id = ?',
      [req.params.id],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ status: 'error', message: 'User tidak ditemukan.' });
    return res.status(200).json({ status: 'success', data: { user: rows[0] } });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const fields = [];
    const values = [];
    if (name) {
      fields.push('name = ?');
      values.push(name);
    }
    if (email) {
      fields.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      fields.push('phone = ?');
      values.push(phone);
    }
    if (fields.length === 0)
      return res
        .status(400)
        .json({ status: 'error', message: 'Tidak ada data yang diubah.' });
    values.push(req.params.id);
    await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
    const [updated] = await pool.query(
      'SELECT id, name, email, phone, photo_url, created_at FROM users WHERE id = ?',
      [req.params.id],
    );
    return res
      .status(200)
      .json({
        status: 'success',
        message: 'User berhasil diperbarui.',
        data: { user: updated[0] },
      });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res
        .status(404)
        .json({ status: 'error', message: 'User tidak ditemukan.' });
    await pool.query('DELETE FROM bookings WHERE user_id = ?', [req.params.id]);
    await pool.query('DELETE FROM financial_health_checks WHERE user_id = ?', [
      req.params.id,
    ]);
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    return res
      .status(200)
      .json({ status: 'success', message: 'User berhasil dihapus.' });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const getAllBookingsAdmin = async (req, res) => {
  try {
    const { status, consultant_id, date_from, date_to } = req.query;
    let query = `SELECT b.*, u.name as user_name, u.email as user_email,
        c.name as consultant_name, c.specialization
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN consultants c ON b.consultant_id = c.id
      WHERE 1=1`;
    const params = [];
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    if (consultant_id) {
      query += ' AND b.consultant_id = ?';
      params.push(consultant_id);
    }
    if (date_from) {
      query += ' AND b.booking_date >= ?';
      params.push(date_from);
    }
    if (date_to) {
      query += ' AND b.booking_date <= ?';
      params.push(date_to);
    }
    query += ' ORDER BY b.created_at DESC';
    const [rows] = await pool.query(query, params);
    return res
      .status(200)
      .json({ status: 'success', data: { bookings: rows } });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['booked', 'completed', 'cancelled', 'pending'];
    if (!allowed.includes(status))
      return res
        .status(400)
        .json({ status: 'error', message: 'Status tidak valid.' });
    const [rows] = await pool.query('SELECT id FROM bookings WHERE id = ?', [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res
        .status(404)
        .json({ status: 'error', message: 'Booking tidak ditemukan.' });
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [
      status,
      req.params.id,
    ]);
    return res
      .status(200)
      .json({ status: 'success', message: 'Status booking diperbarui.' });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const sendZoomLink = async (req, res) => {
  try {
    const { zoom_link } = req.body;
    if (!zoom_link)
      return res
        .status(400)
        .json({ status: 'error', message: 'Link Zoom wajib diisi.' });
    const [rows] = await pool.query('SELECT id FROM bookings WHERE id = ?', [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res
        .status(404)
        .json({ status: 'error', message: 'Booking tidak ditemukan.' });
    await pool.query('UPDATE bookings SET notes = ? WHERE id = ?', [
      zoom_link,
      req.params.id,
    ]);
    return res
      .status(200)
      .json({ status: 'success', message: 'Link Zoom berhasil dikirim.' });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const getAllHealthChecks = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT h.*, u.name as user_name, u.email as user_email
       FROM financial_health_checks h
       JOIN users u ON h.user_id = u.id
       ORDER BY h.created_at DESC LIMIT 200`,
    );
    return res
      .status(200)
      .json({ status: 'success', data: { health_checks: rows } });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const getAllConsultantsAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM consultants ORDER BY created_at DESC',
    );
    return res
      .status(200)
      .json({ status: 'success', data: { consultants: rows } });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const createConsultant = async (req, res) => {
  try {
    const {
      name,
      specialization,
      bio,
      photo_url,
      experience_years,
      rate,
      rating = 5.0,
      is_available = true,
    } = req.body;
    const [result] = await pool.query(
      'INSERT INTO consultants (name, specialization, bio, photo_url, experience_years, rate, rating, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        specialization,
        bio || null,
        photo_url || null,
        experience_years,
        rate,
        rating,
        is_available,
      ],
    );
    const [rows] = await pool.query('SELECT * FROM consultants WHERE id = ?', [
      result.insertId,
    ]);
    return res
      .status(201)
      .json({
        status: 'success',
        message: 'Konsultan berhasil ditambahkan.',
        data: { consultant: rows[0] },
      });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const updateConsultant = async (req, res) => {
  try {
    const {
      name,
      specialization,
      bio,
      photo_url,
      experience_years,
      rate,
      rating,
      is_available,
    } = req.body;
    const fields = [];
    const values = [];
    const map = {
      name,
      specialization,
      bio,
      photo_url,
      experience_years,
      rate,
      rating,
      is_available,
    };
    for (const [k, v] of Object.entries(map)) {
      if (v !== undefined) {
        fields.push(`${k} = ?`);
        values.push(v);
      }
    }
    if (fields.length === 0)
      return res
        .status(400)
        .json({ status: 'error', message: 'Tidak ada data yang diubah.' });
    values.push(req.params.id);
    await pool.query(
      `UPDATE consultants SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
    const [rows] = await pool.query('SELECT * FROM consultants WHERE id = ?', [
      req.params.id,
    ]);
    return res
      .status(200)
      .json({
        status: 'success',
        message: 'Konsultan berhasil diperbarui.',
        data: { consultant: rows[0] },
      });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const deleteConsultant = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id FROM consultants WHERE id = ?', [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res
        .status(404)
        .json({ status: 'error', message: 'Konsultan tidak ditemukan.' });
    await pool.query('DELETE FROM consultants WHERE id = ?', [req.params.id]);
    return res
      .status(200)
      .json({ status: 'success', message: 'Konsultan berhasil dihapus.' });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

export {
  adminLogin,
  getAdminStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllBookingsAdmin,
  updateBookingStatus,
  sendZoomLink,
  getAllHealthChecks,
  getAllConsultantsAdmin,
  createConsultant,
  updateConsultant,
  deleteConsultant,
};
