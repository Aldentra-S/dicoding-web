import { pool } from '../config/database.js';

const createBooking = async (req, res) => {
  try {
    const {
      consultant_id,
      booking_date,
      booking_time,
      duration_minutes = 60,
      consultation_method = 'chat',
      topic,
      health_check_id = null,
      notes,
    } = req.body;
    const userId = req.user.id;

    const [consultants] = await pool.query(
      'SELECT id, name, rate, is_available FROM consultants WHERE id = ?',
      [consultant_id],
    );
    if (consultants.length === 0) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Konsultan tidak ditemukan.' });
    }

    const consultant = consultants[0];
    if (!consultant.is_available) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Konsultan sedang tidak tersedia.' });
    }

    const [conflicts] = await pool.query(
      `SELECT id FROM bookings WHERE consultant_id = ? AND booking_date = ? AND booking_time = ? AND status NOT IN ('cancelled')`,
      [consultant_id, booking_date, booking_time],
    );
    if (conflicts.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'Jadwal sudah dipesan. Pilih waktu lain.',
      });
    }

    const totalFee = Math.round((consultant.rate / 60) * duration_minutes);

    const [result] = await pool.query(
      `INSERT INTO bookings (user_id, consultant_id, health_check_id, booking_date, booking_time, duration_minutes, consultation_method, topic, status, total_fee, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'booked', ?, ?)`,
      [
        userId,
        consultant_id,
        health_check_id,
        booking_date,
        booking_time,
        duration_minutes,
        consultation_method,
        topic || null,
        totalFee,
        notes || null,
      ],
    );

    const [booking] = await pool.query(
      `SELECT b.*, c.name as consultant_name, c.specialization, c.photo_url
       FROM bookings b JOIN consultants c ON b.consultant_id = c.id WHERE b.id = ?`,
      [result.insertId],
    );

    return res.status(201).json({
      status: 'success',
      message: 'Booking berhasil dibuat.',
      data: { booking: booking[0] },
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = `SELECT b.*, c.name as consultant_name, c.specialization, c.photo_url, c.rate
                 FROM bookings b JOIN consultants c ON b.consultant_id = c.id WHERE b.user_id = ?`;
    const params = [userId];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    query += ' ORDER BY b.booking_date DESC, b.booking_time DESC';

    const [rows] = await pool.query(query, params);
    return res.status(200).json({
      status: 'success',
      data: { total: rows.length, bookings: rows },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const getBookingById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT b.*, c.name as consultant_name, c.specialization, c.photo_url, c.bio
       FROM bookings b JOIN consultants c ON b.consultant_id = c.id WHERE b.id = ? AND b.user_id = ?`,
      [id, userId],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Booking tidak ditemukan.' });
    }

    return res
      .status(200)
      .json({ status: 'success', data: { booking: rows[0] } });
  } catch (error) {
    console.error('Get booking error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT id, status FROM bookings WHERE id = ? AND user_id = ?',
      [id, userId],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ status: 'error', message: 'Booking tidak ditemukan.' });
    if (rows[0].status === 'cancelled')
      return res
        .status(400)
        .json({ status: 'error', message: 'Booking sudah dibatalkan.' });
    if (rows[0].status === 'completed')
      return res.status(400).json({
        status: 'error',
        message: 'Booking yang sudah selesai tidak dapat dibatalkan.',
      });

    await pool.query('UPDATE bookings SET status = "cancelled" WHERE id = ?', [
      id,
    ]);
    return res
      .status(200)
      .json({ status: 'success', message: 'Booking berhasil dibatalkan.' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date)
      return res
        .status(400)
        .json({ status: 'error', message: 'Parameter date wajib diisi.' });

    const [consultants] = await pool.query(
      'SELECT id, is_available FROM consultants WHERE id = ?',
      [id],
    );
    if (consultants.length === 0)
      return res
        .status(404)
        .json({ status: 'error', message: 'Konsultan tidak ditemukan.' });

    if (!consultants[0].is_available) {
      return res.status(200).json({
        status: 'success',
        data: { slots: [], message: 'Konsultan tidak tersedia.' },
      });
    }

    const allSlots = [
      '09:00',
      '10:00',
      '11:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
    ];

    const [bookedSlots] = await pool.query(
      `SELECT TIME_FORMAT(booking_time, '%H:%i') as booking_time FROM bookings
       WHERE consultant_id = ? AND booking_date = ? AND status NOT IN ('cancelled')`,
      [id, date],
    );

    const bookedTimes = bookedSlots.map((b) => b.booking_time);
    const slots = allSlots.map((slot) => ({
      time: slot,
      is_available: !bookedTimes.includes(slot),
    }));

    return res.status(200).json({
      status: 'success',
      data: { consultant_id: parseInt(id), date, slots },
    });
  } catch (error) {
    console.error('Get slots error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

export {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAvailableSlots,
};
