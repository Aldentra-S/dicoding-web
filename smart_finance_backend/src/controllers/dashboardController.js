import { pool } from '../config/database.js';

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [userProfile] = await pool.query(
      'SELECT name, email FROM users WHERE id = ?',
      [userId],
    );

    const [lastHealthCheck] = await pool.query(
      `SELECT id, status, score, created_at
       FROM financial_health_checks
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId],
    );

    const [activeBookings] = await pool.query(
      `SELECT b.id, b.booking_date, b.booking_time, b.consultation_method, b.status,
              c.name as consultant_name, c.photo_url, c.specialization
       FROM bookings b
       JOIN consultants c ON b.consultant_id = c.id
       WHERE b.user_id = ? AND b.status = 'booked' AND b.booking_date >= CURDATE()
       ORDER BY b.booking_date ASC, b.booking_time ASC
       LIMIT 3`,
      [userId],
    );

    const [[{ total_checks }]] = await pool.query(
      'SELECT COUNT(*) as total_checks FROM financial_health_checks WHERE user_id = ?',
      [userId],
    );

    const tips = generateDailyTip(lastHealthCheck[0]?.status);

    return res.status(200).json({
      status: 'success',
      user: userProfile[0] || { name: 'User' },
      data: {
        last_health_check: lastHealthCheck[0] || null,
        active_bookings: activeBookings,
        total_health_checks: total_checks,
        daily_tip: tips,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const generateDailyTip = (status) => {
  const tips = {
    Sehat: [
      'Pertahankan kondisi keuangan Anda. Pertimbangkan untuk mulai berinvestasi di reksa dana.',
      'Tingkatkan dana darurat hingga 6 bulan pengeluaran.',
    ],
    Rawan: [
      'Usahakan cicilan tidak lebih dari 30% dari penghasilan Anda.',
      'Kurangi pengeluaran tidak esensial sekarang.',
    ],
    Kritis: [
      'Segera konsultasikan keuangan Anda dengan ahli.',
      'Hindari menambah utang baru dalam kondisi ini.',
    ],
  };
  const statusTips = tips[status] || tips['Rawan'];
  return statusTips[Math.floor(Math.random() * statusTips.length)];
};

export { getDashboard };
