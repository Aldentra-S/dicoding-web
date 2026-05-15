import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Layout from '../components/Layout.jsx';
import { useApp } from '../context/AppContext.jsx';

const rp = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;
const PIE_C = ['#b91c1c', '#d97706', '#2d7a52'];

export default function FinancialHealth() {
  const navigate = useNavigate();
  const { healthHistory, doHealthCheck, busy } = useApp();
  const [tab, setTab] = useState('form');
  const [period, setPeriod] = useState('monthly');
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({
    monthly_income: '',
    monthly_expenses: '',
    monthly_debt_payment: '',
    emergency_fund: '',
  });

  const handlePeriodChange = (targetPeriod) => {
    if (period === targetPeriod) return;

    setForm((prev) => {
      let income =
        prev.monthly_income === '' ? '' : Number(prev.monthly_income);
      let expenses =
        prev.monthly_expenses === '' ? '' : Number(prev.monthly_expenses);
      let debt =
        prev.monthly_debt_payment === ''
          ? ''
          : Number(prev.monthly_debt_payment);
      const emergency = prev.emergency_fund;

      if (income !== '' || expenses !== '' || debt !== '') {
        let monthlyIncome = 0;
        let monthlyExpenses = 0;
        let monthlyDebt = 0;

        if (period === 'daily') {
          monthlyIncome = income * 30;
          monthlyExpenses = expenses * 30;
          monthlyDebt = debt * 30;
        } else if (period === 'weekly') {
          monthlyIncome = income * 4;
          monthlyExpenses = expenses * 4;
          monthlyDebt = debt * 4;
        } else {
          monthlyIncome = income;
          monthlyExpenses = expenses;
          monthlyDebt = debt;
        }

        if (targetPeriod === 'daily') {
          income = monthlyIncome / 30;
          expenses = monthlyExpenses / 30;
          debt = monthlyDebt / 30;
        } else if (targetPeriod === 'weekly') {
          income = monthlyIncome / 4;
          expenses = monthlyExpenses / 4;
          debt = monthlyDebt / 4;
        } else {
          income = monthlyIncome;
          expenses = monthlyExpenses;
          debt = monthlyDebt;
        }
      }

      return {
        monthly_income: income === '' ? '' : Math.round(income),
        monthly_expenses: expenses === '' ? '' : Math.round(expenses),
        monthly_debt_payment: debt === '' ? '' : Math.round(debt),
        emergency_fund: emergency,
      };
    });

    setPeriod(targetPeriod);
  };

  const submit = async () => {
    setErr('');
    try {
      let income = Number(form.monthly_income) || 0;
      let expenses = Number(form.monthly_expenses) || 0;
      let debt = Number(form.monthly_debt_payment) || 0;

      if (period === 'daily') {
        income = income * 30;
        expenses = expenses * 30;
        debt = debt * 30;
      } else if (period === 'weekly') {
        income = income * 4;
        expenses = expenses * 4;
        debt = debt * 4;
      }

      const payload = {
        monthly_income: income,
        monthly_expenses: expenses,
        monthly_debt_payment: debt,
        emergency_fund: Number(form.emergency_fund) || 0,
      };

      const d = await doHealthCheck(payload);
      if (d.status === 'success') {
        setResult(d.data.result);
        setTab('result');
      } else setErr(d.message || 'Gagal menghitung.');
    } catch {
      setErr('Gagal terhubung ke server.');
    }
  };

  const disp = result || (healthHistory.length > 0 ? healthHistory[0] : null);
  const sc =
    disp?.status === 'Sehat'
      ? '#2d7a52'
      : disp?.status === 'Rawan'
        ? '#d97706'
        : '#b91c1c';
  const scBg =
    disp?.status === 'Sehat'
      ? '#dcfce7'
      : disp?.status === 'Rawan'
        ? '#fef3c7'
        : '#fee2e2';
  const scC =
    disp?.status === 'Sehat'
      ? '#166534'
      : disp?.status === 'Rawan'
        ? '#854d0e'
        : '#b91c1c';

  const pie = disp
    ? [
        {
          name: 'Cicilan/Utang',
          value: Math.max(0, parseFloat(disp.debt_to_income_ratio) || 0),
        },
        {
          name: 'Pengeluaran Lain',
          value: Math.max(
            0,
            (parseFloat(disp.expense_to_income_ratio) || 0) -
              (parseFloat(disp.debt_to_income_ratio) || 0),
          ),
        },
        {
          name: 'Tersisa',
          value: Math.max(
            0,
            100 - (parseFloat(disp.expense_to_income_ratio) || 0),
          ),
        },
      ]
    : [];

  const rekom = (disp?.recommendation || '').split('\n\n').filter(Boolean);

  const getLabel = (lbl) => {
    if (lbl === 'Dana Darurat Dimiliki') return lbl;
    if (period === 'daily') return `${lbl} Harian`;
    if (period === 'weekly') return `${lbl} Mingguan`;
    return `${lbl} Bulanan`;
  };

  return (
    <Layout
      title="Financial Health Check"
      subtitle="Diagnosa kondisi keuanganmu secara real-time"
    >
      <div className="tabs">
        {[
          ['form', 'Cek Keuangan'],
          ['result', `Hasil Analisis`],
          ['history', `Riwayat (${healthHistory.length})`],
        ].map(([v, l]) => (
          <button
            key={v}
            className={`tab ${tab === v ? 'on' : ''}`}
            onClick={() => setTab(v)}
            disabled={v === 'result' && !disp}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'form' && (
        <div className="grid-1-1" style={{ alignItems: 'start' }}>
          <div className="card">
            <div
              className="card-hd"
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <span className="card-title">Data Keuangan Anda</span>
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  background: '#f3f4f6',
                  padding: '4px',
                  borderRadius: '8px',
                }}
              >
                {[
                  ['daily', 'Harian'],
                  ['weekly', 'Mingguan'],
                  ['monthly', 'Bulanan'],
                ].map(([p, label]) => (
                  <button
                    key={p}
                    onClick={() => handlePeriodChange(p)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      background: period === p ? '#ffffff' : 'transparent',
                      color: period === p ? 'var(--ink, #111827)' : '#6b7280',
                      boxShadow:
                        period === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="card-body">
              {err && <div className="alert alert-err">{err}</div>}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0 14px',
                }}
                className="fh-form-grid"
              >
                {[
                  ['Pendapatan', 'monthly_income'],
                  ['Pengeluaran', 'monthly_expenses'],
                  ['Cicilan / Hutang', 'monthly_debt_payment'],
                  ['Dana Darurat Dimiliki', 'emergency_fund'],
                ].map(([lbl, key]) => (
                  <div className="fg" key={key}>
                    <label>{getLabel(lbl)}</label>
                    <input
                      type="number"
                      value={form[key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [key]:
                            e.target.value === '' ? '' : Number(e.target.value),
                        })
                      }
                      placeholder={
                        key === 'emergency_fund'
                          ? 'Total akumulasi dana darurat'
                          : `Nominal ${lbl}`
                      }
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid var(--border, #d1d5db)',
                        borderRadius: '6px',
                        marginTop: '4px',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                ))}
              </div>
              <button
                className="btn btn-dark btn-full"
                onClick={submit}
                disabled={busy.hc}
                style={{ marginTop: '16px' }}
              >
                {busy.hc ? (
                  <>
                    <span className="spin" />
                    &ensp;Menghitung...
                  </>
                ) : (
                  'Hitung Kondisi Keuangan'
                )}
              </button>
              <p
                style={{
                  fontSize: 11,
                  color: 'var(--muted)',
                  textAlign: 'center',
                  marginTop: 9,
                }}
              >
                Hasil otomatis dikonversi ke data bulanan untuk sinkronisasi
                Dashboard &amp; Profil
              </p>
            </div>
          </div>

          <div className="col">
            <div
              style={{
                background: 'linear-gradient(135deg,#e8f5ee,#d1fae5)',
                border: '1px solid var(--border)',
                borderRadius: 13,
                padding: '15px 16px',
                display: 'flex',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 24, flexShrink: 0 }}>💡</div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: 'var(--ink)',
                    marginBottom: 4,
                  }}
                >
                  Apa itu Financial Health Check?
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--ink-3)',
                    lineHeight: 1.6,
                  }}
                >
                  Sistem menganalisis 3 indikator utama (DTI, EIR, dan Dana
                  Darurat) berdasarkan standarisasi finansial bulanan untuk
                  hasil diagnosis yang presisi.
                </p>
              </div>
            </div>
            {[
              [
                'DTI (Debt-to-Income)',
                '< 30%',
                '30–50%',
                '> 50%',
                'Rasio cicilan terhadap pemasukan',
              ],
              [
                'EIR (Expense-to-Income)',
                '< 70%',
                '70–90%',
                '> 90%',
                'Rasio pengeluaran terhadap pemasukan',
              ],
              [
                'Dana Darurat',
                '≥ 3 bln',
                '1–3 bln',
                '< 1 bln',
                'Ketahanan finansial tanpa penghasilan',
              ],
            ].map(([nm, s, r, k, dc]) => (
              <div key={nm} className="card" style={{ padding: 0 }}>
                <div className="card-hd" style={{ padding: '11px 15px' }}>
                  <div>
                    <div className="card-title" style={{ fontSize: 13 }}>
                      {nm}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        marginTop: 1,
                      }}
                    >
                      {dc}
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: 'flex', gap: 8, padding: '10px 15px 13px' }}
                >
                  {[
                    ['Sehat', s, 'b-green'],
                    ['Rawan', r, 'b-amber'],
                    ['Kritis', k, 'b-red'],
                  ].map(([lb, val, cls]) => (
                    <div key={lb} style={{ flex: 1, textAlign: 'center' }}>
                      <span
                        className={`badge ${cls}`}
                        style={{ display: 'block', marginBottom: 3 }}
                      >
                        {lb}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--ink-2)',
                        }}
                      >
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'result' && disp && (
        <div className="grid-1-1" style={{ alignItems: 'start' }}>
          <div className="col">
            <div className="card">
              <div className="card-hd">
                <span className="card-title">Status Keuangan Anda</span>
                <span
                  className="badge"
                  style={{ background: scBg, color: scC, padding: '4px 11px' }}
                >
                  {disp.status}
                </span>
              </div>
              <div className="card-body">
                <div className="ring-wrap">
                  <div className="ring">
                    <svg width="110" height="110" viewBox="0 0 110 110">
                      <circle
                        cx="55"
                        cy="55"
                        r="44"
                        fill="none"
                        stroke="#f0f0f0"
                        strokeWidth="10"
                      />
                      <circle
                        cx="55"
                        cy="55"
                        r="44"
                        fill="none"
                        stroke={sc}
                        strokeWidth="10"
                        strokeDasharray={`${((disp.score || 0) / 100) * 276.46} 276.46`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="ring-txt">
                      <span className="ring-num" style={{ color: sc }}>
                        {disp.score}
                      </span>
                      <span className="ring-lbl">dari 100</span>
                    </div>
                  </div>
                </div>
                {[
                  [
                    'DTI Ratio',
                    parseFloat(disp.debt_to_income_ratio) || 0,
                    '%',
                    50,
                  ],
                  [
                    'EIR Ratio',
                    parseFloat(disp.expense_to_income_ratio) || 0,
                    '%',
                    90,
                  ],
                  [
                    'Dana Darurat',
                    parseFloat(disp.emergency_fund_months) || 0,
                    ' bln',
                    6,
                  ],
                ].map(([l, v, u, mx]) => (
                  <div key={l} className="prog-row">
                    <div className="prog-lbl">
                      <span>{l}</span>
                      <strong>
                        {v}
                        {u}
                      </strong>
                    </div>
                    <div className="bar-wrap">
                      <div
                        className="bar"
                        style={{
                          width: `${Math.min((v / mx) * 100, 100)}%`,
                          background: sc,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-hd">
                <span className="card-title">Rekomendasi</span>
              </div>
              <div className="card-body">
                {rekom.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 9,
                      marginBottom: 12,
                      paddingBottom: 12,
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: sc,
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    />
                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--ink-2)',
                        lineHeight: 1.6,
                      }}
                    >
                      {r.replace(/^[^\w\s]+\s*/, '')}
                    </p>
                  </div>
                ))}
                <button
                  className="btn btn-green btn-full"
                  style={{ marginTop: 6 }}
                  onClick={() => navigate('/consultation')}
                >
                  Konsultasi dengan Ahli
                </button>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card">
              <div className="card-hd">
                <span className="card-title">Distribusi Keuangan</span>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pie}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      dataKey="value"
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {pie.map((_, i) => (
                        <Cell key={i} fill={PIE_C[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [`${Number(v).toFixed(1)}%`]}
                      contentStyle={{
                        borderRadius: 9,
                        border: '1px solid var(--border)',
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={9}
                      formatter={(v) => (
                        <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                          {v}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <button
              className="btn btn-outline btn-full"
              onClick={() => setTab('form')}
            >
              Hitung Ulang
            </button>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="card">
          <div className="card-hd">
            <span className="card-title">Riwayat Health Check</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              {healthHistory.length} data
            </span>
          </div>
          {healthHistory.length === 0 ? (
            <div className="empty">
              <div className="ei">📋</div>
              <h3>Belum Ada Riwayat</h3>
              <p>Lakukan Financial Health Check pertamamu</p>
            </div>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>DTI</th>
                    <th>EIR</th>
                    <th>Dana Darurat</th>
                    <th>Skor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {healthHistory.map((h) => (
                    <tr key={h.id}>
                      <td style={{ fontSize: 12 }}>
                        {new Date(h.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td>
                        <strong>{h.debt_to_income_ratio}%</strong>
                      </td>
                      <td>
                        <strong>{h.expense_to_income_ratio}%</strong>
                      </td>
                      <td>
                        <strong>{h.emergency_fund_months} bln</strong>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: 15,
                            fontWeight: 700,
                          }}
                        >
                          {h.score}
                        </span>
                        <span style={{ color: 'var(--muted)', fontSize: 11 }}>
                          /100
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${h.status === 'Sehat' ? 'b-green' : h.status === 'Rawan' ? 'b-amber' : 'b-red'}`}
                        >
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
