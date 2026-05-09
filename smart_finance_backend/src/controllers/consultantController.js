import { pool } from '../config/database.js';

const getAllConsultants = async (req, res) => {
  try {
    const {
      specialization,

      min_rate,

      max_rate,

      sort_by = 'rating',

      order = 'DESC',
    } = req.query;

    let query = 'SELECT * FROM consultants WHERE is_available = TRUE';

    const params = [];

    if (specialization) {
      query += ' AND specialization LIKE ?';

      params.push(`%${specialization}%`);
    }

    if (min_rate) {
      query += ' AND rate >= ?';

      params.push(Number(min_rate));
    }

    if (max_rate) {
      query += ' AND rate <= ?';

      params.push(Number(max_rate));
    }

    const allowedSortColumns = [
      'rating',

      'rate',

      'experience_years',

      'total_reviews',
    ];

    const sortColumn = allowedSortColumns.includes(sort_by)
      ? sort_by
      : 'rating';

    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    const [rows] = await pool.query(query, params);

    return res.status(200).json({
      status: 'success',

      data: { total: rows.length, consultants: rows },
    });
  } catch (error) {
    console.error('Get consultants error:', error);

    return res

      .status(500)

      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const getConsultantById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query('SELECT * FROM consultants WHERE id = ?', [
      id,
    ]);

    if (rows.length === 0) {
      return res

        .status(404)

        .json({ status: 'error', message: 'Konsultan tidak ditemukan.' });
    }

    return res

      .status(200)

      .json({ status: 'success', data: { consultant: rows[0] } });
  } catch (error) {
    console.error('Get consultant error:', error);

    return res

      .status(500)

      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

export { getAllConsultants, getConsultantById };
