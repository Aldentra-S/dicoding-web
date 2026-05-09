import { pool } from '../config/database.js';
import { calculateFinancialHealth } from '../helpers/financialCalculator.js';

const createHealthCheck = async (req, res) => {
  try {
    const {
      monthly_income,
      monthly_expenses,
      monthly_debt_payment,
      total_debt = 0,
      emergency_fund = 0,
    } = req.body;
    const userId = req.user.id;

    const result = calculateFinancialHealth({
      monthly_income,
      monthly_expenses,
      monthly_debt_payment,
      emergency_fund,
    });

    const [insertResult] = await pool.query(
      `INSERT INTO financial_health_checks 
        (user_id, monthly_income, monthly_expenses, monthly_debt_payment, total_debt, emergency_fund,
         debt_to_income_ratio, expense_to_income_ratio, emergency_fund_months, status, score, recommendation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        monthly_income,
        monthly_expenses,
        monthly_debt_payment,
        total_debt,
        emergency_fund,
        result.debt_to_income_ratio,
        result.expense_to_income_ratio,
        result.emergency_fund_months,
        result.status,
        result.score,
        result.recommendation,
      ],
    );

    return res.status(201).json({
      status: 'success',
      message: 'Financial Health Check berhasil disimpan.',
      data: {
        id: insertResult.insertId,
        input: {
          monthly_income: Number(monthly_income),
          monthly_expenses: Number(monthly_expenses),
          monthly_debt_payment: Number(monthly_debt_payment),
          total_debt: Number(total_debt),
          emergency_fund: Number(emergency_fund),
        },
        result: {
          score: result.score,
          status: result.status,
          debt_to_income_ratio: result.debt_to_income_ratio,
          expense_to_income_ratio: result.expense_to_income_ratio,
          emergency_fund_months: result.emergency_fund_months,
          recommendation: result.recommendation,
          detail_scores: result.detail_scores,
        },
        suggest_consultation:
          result.status === 'Kritis' || result.status === 'Rawan',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const getHealthCheckHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT id, monthly_income, monthly_expenses, monthly_debt_payment,
              debt_to_income_ratio, expense_to_income_ratio, emergency_fund_months,
              status, score, created_at
       FROM financial_health_checks
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset],
    );

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM financial_health_checks WHERE user_id = ?',
      [userId],
    );

    return res.status(200).json({
      status: 'success',
      data: {
        history: rows,
        pagination: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get history error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const getHealthCheckById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM financial_health_checks WHERE id = ? AND user_id = ?',
      [id, userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Data health check tidak ditemukan.',
      });
    }

    return res
      .status(200)
      .json({ status: 'success', data: { health_check: rows[0] } });
  } catch (error) {
    console.error('Get health check error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const simulateHealthCheck = async (req, res) => {
  try {
    const {
      monthly_income,
      monthly_expenses,
      monthly_debt_payment,
      emergency_fund = 0,
    } = req.body;

    const result = calculateFinancialHealth({
      monthly_income,
      monthly_expenses,
      monthly_debt_payment,
      emergency_fund,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Simulasi Financial Health Check berhasil.',
      data: {
        result: {
          score: result.score,
          status: result.status,
          debt_to_income_ratio: result.debt_to_income_ratio,
          expense_to_income_ratio: result.expense_to_income_ratio,
          emergency_fund_months: result.emergency_fund_months,
          recommendation: result.recommendation,
        },
        suggest_consultation:
          result.status === 'Kritis' || result.status === 'Rawan',
        note: 'Hasil ini tidak disimpan. Login untuk menyimpan riwayat health check Anda.',
      },
    });
  } catch (error) {
    console.error('Simulate health check error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

export {
  createHealthCheck,
  getHealthCheckHistory,
  getHealthCheckById,
  simulateHealthCheck,
};
