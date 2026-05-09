import { pool } from '../config/database.js';

const getInsights = async (req, res) => {
  try {
    const [[stats]] = await pool.query(
      `SELECT 
        COUNT(*) as total_checks,
        ROUND(AVG(debt_to_income_ratio), 2) as avg_dti,
        ROUND(AVG(expense_to_income_ratio), 2) as avg_eir,
        ROUND(AVG(score), 1) as avg_score,
        SUM(CASE WHEN status = 'Sehat' THEN 1 ELSE 0 END) as total_sehat,
        SUM(CASE WHEN status = 'Rawan' THEN 1 ELSE 0 END) as total_rawan,
        SUM(CASE WHEN status = 'Kritis' THEN 1 ELSE 0 END) as total_kritis
       FROM financial_health_checks`,
    );

    const total = stats.total_checks || 1;
    const distribution = {
      sehat: {
        count: stats.total_sehat,
        percentage: Math.round((stats.total_sehat / total) * 100),
      },
      rawan: {
        count: stats.total_rawan,
        percentage: Math.round((stats.total_rawan / total) * 100),
      },
      kritis: {
        count: stats.total_kritis,
        percentage: Math.round((stats.total_kritis / total) * 100),
      },
    };

    const [monthlyTrend] = await pool.query(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Sehat' THEN 1 ELSE 0 END) as sehat,
        SUM(CASE WHEN status = 'Rawan' THEN 1 ELSE 0 END) as rawan,
        SUM(CASE WHEN status = 'Kritis' THEN 1 ELSE 0 END) as kritis
       FROM financial_health_checks
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`,
    );

    const [recentUsers] = await pool.query(
      `SELECT u.name, u.email, fhc.status, fhc.score, fhc.created_at
       FROM financial_health_checks fhc
       JOIN users u ON fhc.user_id = u.id
       ORDER BY fhc.created_at DESC
       LIMIT 10`,
    );

    const [activeUsers] = await pool.query(
      `SELECT u.name, u.email, COUNT(*) as total_checks, MAX(fhc.created_at) as last_check
       FROM financial_health_checks fhc
       JOIN users u ON fhc.user_id = u.id
       GROUP BY fhc.user_id, u.name, u.email
       ORDER BY total_checks DESC
       LIMIT 5`,
    );

    return res.status(200).json({
      status: 'success',
      data: {
        summary: {
          total_checks: stats.total_checks,
          avg_dti: stats.avg_dti,
          avg_eir: stats.avg_eir,
          avg_score: stats.avg_score,
        },
        status_distribution: distribution,
        monthly_trend: monthlyTrend,
        recent_users: recentUsers,
        active_users: activeUsers,
      },
    });
  } catch (error) {
    console.error('Insights error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

export { getInsights };
