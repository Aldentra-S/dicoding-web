import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email],
    );
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ status: 'error', message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null],
    );

    const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil.',
      user: { id: result.insertId, name, email, phone: phone || null },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Email atau password salah.' });
    }

    const user = rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Email atau password salah.' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Login berhasil.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        photo_url: user.photo_url,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, photo_url, created_at FROM users WHERE id = ?',
      [req.user.id],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Pengguna tidak ditemukan.' });
    }

    return res.status(200).json({ status: 'success', user: rows[0] });
  } catch (error) {
    console.error('GetMe error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, photo_url } = req.body;

    const fields = [];
    const values = [];

    if (name) {
      fields.push('name = ?');
      values.push(name);
    }
    if (phone) {
      fields.push('phone = ?');
      values.push(phone);
    }
    if (photo_url) {
      fields.push('photo_url = ?');
      values.push(photo_url);
    }

    if (fields.length === 0) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Tidak ada data yang diubah.' });
    }

    values.push(userId);
    await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );

    const [updated] = await pool.query(
      'SELECT id, name, email, phone, photo_url FROM users WHERE id = ?',
      [userId],
    );

    return res.status(200).json({
      status: 'success',
      message: 'Profil berhasil diperbarui.',
      user: updated[0],
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { old_password, new_password } = req.body;

    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [
      userId,
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Pengguna tidak ditemukan.' });
    }

    const isValid = await bcrypt.compare(old_password, rows[0].password);
    if (!isValid) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Password lama tidak sesuai.' });
    }

    const hashed = await bcrypt.hash(new_password, 12);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [
      hashed,
      userId,
    ]);

    return res
      .status(200)
      .json({ status: 'success', message: 'Password berhasil diubah.' });
  } catch (error) {
    console.error('Change password error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

export { register, login, getMe, updateProfile, changePassword };
