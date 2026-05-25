import { pool } from '../config/database.js';

const getAkumulasiBulanan = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const currentMonthStr = String(month + 1).padStart(2, '0');
    const nextMonthStr = String(month + 2 > 12 ? 1 : month + 2).padStart(
      2,
      '0',
    );
    const nextYear = month + 2 > 12 ? year + 1 : year;

    const startOfMonthStr = `${year}-${currentMonthStr}-01 00:00:00`;
    const startOfNextMonthStr = `${nextYear}-${nextMonthStr}-01 00:00:00`;

    const startDateStr = `${year}-${currentMonthStr}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDateStr = `${year}-${currentMonthStr}-${String(lastDay).padStart(2, '0')}`;

    const [rows] = await pool.query(
      `SELECT
         COUNT(*) AS total_checks,
         COALESCE(AVG(score), 0) AS rata_skor
       FROM daily_finance_logs
       WHERE user_id = ?
         AND created_at >= ?
         AND created_at < ?`,
      [userId, startOfMonthStr, startOfNextMonthStr],
    );

    const [logs] = await pool.query(
      `SELECT
         id,
         monthly_income,
         monthly_expenses,
         monthly_debt_payment,
         emergency_fund,
         score,
         status,
         created_at
       FROM daily_finance_logs
       WHERE user_id = ?
         AND created_at >= ?
         AND created_at < ?
       ORDER BY created_at ASC`,
      [userId, startOfMonthStr, startOfNextMonthStr],
    );

    const summary = rows[0];

    return res.status(200).json({
      status: 'success',
      data: {
        periode: {
          bulan: month + 1,
          tahun: year,
          dari: startDateStr,
          sampai: endDateStr,
        },
        akumulasi: {
          rata_skor: Math.round(Number(summary.rata_skor)),
          total_checks: Number(summary.total_checks),
        },
        logs: logs.map((l) => ({
          id: l.id,
          monthly_income: Number(l.monthly_income),
          monthly_expenses: Number(l.monthly_expenses),
          monthly_debt_payment: Number(l.monthly_debt_payment),
          emergency_fund: Number(l.emergency_fund),
          score: l.score,
          status: l.status,
          created_at: l.created_at,
        })),
      },
    });
  } catch (error) {
    console.error('Akumulasi bulanan error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

const saveDailyLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      monthly_income = 0,
      monthly_expenses = 0,
      monthly_debt_payment = 0,
      emergency_fund = 0,
    } = req.body;

    const income = Number(monthly_income);
    const expenses = Number(monthly_expenses);
    const debt = Number(monthly_debt_payment);
    const ef = Number(emergency_fund);

    const dti = income > 0 ? (debt / income) * 100 : 100;
    const eir = income > 0 ? (expenses / income) * 100 : 100;
    const efMonths = expenses > 0 ? ef / expenses : 0;

    let dtiScore = 0;
    if (dti < 20) dtiScore = 40;
    else if (dti < 30) dtiScore = 32;
    else if (dti < 40) dtiScore = 20;
    else if (dti < 50) dtiScore = 10;

    let eirScore = 0;
    if (eir < 50) eirScore = 35;
    else if (eir < 60) eirScore = 28;
    else if (eir < 70) eirScore = 21;
    else if (eir < 80) eirScore = 12;
    else if (eir < 90) eirScore = 5;

    let efScore = 0;
    if (efMonths >= 6) efScore = 25;
    else if (efMonths >= 3) efScore = 18;
    else if (efMonths >= 1) efScore = 10;

    const score = dtiScore + eirScore + efScore;

    let status;
    if (score >= 65) status = 'Sehat';
    else if (score >= 35) status = 'Rawan';
    else status = 'Kritis';

    const [insertResult] = await pool.query(
      `INSERT INTO daily_finance_logs
         (user_id, monthly_income, monthly_expenses, monthly_debt_payment, emergency_fund,
          debt_to_income_ratio, expense_to_income_ratio, emergency_fund_months, score, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        income,
        expenses,
        debt,
        ef,
        parseFloat(dti.toFixed(2)),
        parseFloat(eir.toFixed(2)),
        parseFloat(efMonths.toFixed(1)),
        score,
        status,
      ],
    );

    return res.status(201).json({
      status: 'success',
      message: 'Data harian berhasil disimpan.',
      data: {
        id: insertResult.insertId,
        score,
        status,
      },
    });
  } catch (error) {
    console.error('Save daily log error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Terjadi kesalahan server.' });
  }
};

export { getAkumulasiBulanan, saveDailyLog };
