import React, { useState, useEffect } from 'react';
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

const PIE_C = ['#b91c1c', '#d97706', '#2d7a52'];

const BULAN_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const rp = (v) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(v || 0);

export default function FinancialHealth() {
  const navigate = useNavigate();
  const { healthHistory, doHealthCheck, busy, akumulasi } = useApp();
  const [tab, setTab] = useState('form');
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [hasChecked, setHasChecked] = useState(false);

  const dataLogs = akumulasi?.data?.logs || akumulasi?.logs || [];

  const now = new Date();

  const formatDateVal = (d) => {
    if (!d) return '';
    // Gunakan waktu lokal, bukan UTC, supaya tanggal tidak geser
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  const formatDateLabel = (d) => {
    if (!d) return '';
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Bangun date options dari log yang ada, mulai dari hari pertama log sampai hari ini
  const logsUrutTanggal = [...dataLogs].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at),
  );
  const tanggalPertama =
    logsUrutTanggal.length > 0 ? new Date(logsUrutTanggal[0].created_at) : null;

  const buildDateOptions = () => {
    if (!tanggalPertama) return [];
    const options = [];
    const start = new Date(tanggalPertama);
    start.setHours(0, 0, 0, 0);
    const maxEnd = new Date(start);
    maxEnd.setDate(maxEnd.getDate() + 30);
    const end = maxEnd > now ? now : maxEnd;
    let cur = new Date(start);
    while (cur <= end) {
      options.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return options;
  };

  const dateOptions = buildDateOptions();

  // Default tanggal: hari pertama log s/d hari ini (bukan dari useEffect yang bisa race)
  const defaultTglAwal =
    dateOptions.length > 0 ? formatDateVal(dateOptions[0]) : '';
  const defaultTglAkhir =
    dateOptions.length > 0
      ? formatDateVal(dateOptions[Math.min(dateOptions.length - 1, 29)])
      : '';

  const [tglAwal, setTglAwal] = useState('');
  const [tglAkhir, setTglAkhir] = useState('');

  // Set tanggal default sekali saat dateOptions tersedia
  useEffect(() => {
    if (dateOptions.length > 0 && !tglAwal) {
      setTglAwal(defaultTglAwal);
      setTglAkhir(defaultTglAkhir);
    }
  }, [dateOptions.length]);

  const activeTglAwal = tglAwal || defaultTglAwal;
  const activeTglAkhir = tglAkhir || defaultTglAkhir;

  const tglAwalObj = activeTglAwal
    ? new Date(activeTglAwal + 'T00:00:00')
    : null;
  const tglAkhirObj = activeTglAkhir
    ? new Date(activeTglAkhir + 'T23:59:59')
    : null;

  const logsFiltered = dataLogs.filter((l) => {
    const d = new Date(l.created_at);
    if (tglAwalObj && d < tglAwalObj) return false;
    if (tglAkhirObj && d > tglAkhirObj) return false;
    return true;
  });

  const totalPendapatan = logsFiltered.reduce(
    (s, l) => s + Number(l.monthly_income || 0),
    0,
  );
  const totalPengeluaran = logsFiltered.reduce(
    (s, l) => s + Number(l.monthly_expenses || 0),
    0,
  );
  const totalCicilan = logsFiltered.reduce(
    (s, l) => s + Number(l.monthly_debt_payment || 0),
    0,
  );
  const totalDana = logsFiltered.reduce(
    (s, l) => s + Number(l.emergency_fund || 0),
    0,
  );

  const sisaBersih = totalPendapatan - totalPengeluaran - totalCicilan;

  const labelPeriode =
    activeTglAwal && activeTglAkhir
      ? `${formatDateLabel(tglAwalObj)} – ${formatDateLabel(tglAkhirObj)}`
      : `${BULAN_ID[now.getMonth()]} ${now.getFullYear()}`;

  // Form langsung sinkron dengan total dari filter — tidak perlu useEffect terpisah
  const form = {
    monthly_income: totalPendapatan,
    monthly_expenses: totalPengeluaran,
    monthly_debt_payment: totalCicilan,
    emergency_fund: totalDana,
  };

  // State untuk override manual oleh user
  const [formOverride, setFormOverride] = useState(null);
  const activeForm = formOverride || form;

  const setFormField = (key, value) => {
    setFormOverride((prev) => ({
      ...(prev || form),
      [key]: value === '' ? '' : Number(value),
    }));
  };

  // Reset override kalau periode berubah
  const handleChangeTglAwal = (val) => {
    setTglAwal(val);
    setFormOverride(null);
    setHasChecked(false);
  };
  const handleChangeTglAkhir = (val) => {
    setTglAkhir(val);
    setFormOverride(null);
    setHasChecked(false);
  };

  const submit = async () => {
    setErr('');
    try {
      const payload = {
        monthly_income: Number(activeForm.monthly_income) || 0,
        monthly_expenses: Number(activeForm.monthly_expenses) || 0,
        monthly_debt_payment: Number(activeForm.monthly_debt_payment) || 0,
        emergency_fund: Number(activeForm.emergency_fund) || 0,
      };

      const d = await doHealthCheck(payload);
      if (d.status === 'success') {
        setResult(d.data.result);
        setTab('result');
        setHasChecked(true);
      } else setErr(d.message || 'Gagal menghitung.');
    } catch {
      setErr('Gagal terhubung ke server.');
    }
  };

  const handleHitungUlang = () => {
    setFormOverride(null);
    setHasChecked(false);
    setTab('form');
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
            <div className="card-hd">
              <span className="card-title">Data Keuangan Anda</span>
            </div>
            <div className="card-body">
              {err && <div className="alert alert-err">{err}</div>}

              {dataLogs.length > 0 && (
                <div
                  style={{
                    marginBottom: 18,
                    padding: '14px 16px',
                    background: 'var(--green-bg)',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--ink)',
                      marginBottom: 12,
                    }}
                  >
                    Ringkasan dari Akumulasi Keuangan
                  </div>

                  {dateOptions.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--muted)',
                          marginBottom: 8,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Pilih Periode Penghitungan
                      </div>
                      <div
                        style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
                      >
                        <div style={{ flex: 1, minWidth: 140 }}>
                          <label
                            style={{
                              display: 'block',
                              fontSize: 11,
                              fontWeight: 600,
                              color: 'var(--muted)',
                              marginBottom: 5,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Tanggal Awal
                          </label>
                          <select
                            value={tglAwal}
                            onChange={(e) =>
                              handleChangeTglAwal(e.target.value)
                            }
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              borderRadius: 'var(--r8)',
                              border: '1px solid var(--border)',
                              background: 'var(--white)',
                              color: 'var(--ink)',
                              fontSize: 13,
                            }}
                          >
                            {dateOptions.map((d) => (
                              <option
                                key={formatDateVal(d)}
                                value={formatDateVal(d)}
                              >
                                {formatDateLabel(d)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={{ flex: 1, minWidth: 140 }}>
                          <label
                            style={{
                              display: 'block',
                              fontSize: 11,
                              fontWeight: 600,
                              color: 'var(--muted)',
                              marginBottom: 5,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Tanggal Akhir
                          </label>
                          <select
                            value={tglAkhir}
                            onChange={(e) =>
                              handleChangeTglAkhir(e.target.value)
                            }
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              borderRadius: 'var(--r8)',
                              border: '1px solid var(--border)',
                              background: 'var(--white)',
                              color: 'var(--ink)',
                              fontSize: 13,
                            }}
                          >
                            {dateOptions
                              .filter((d) => {
                                if (!tglAwal) return true;
                                const awal = new Date(tglAwal + 'T00:00:00');
                                const maxAkhir = new Date(awal);
                                maxAkhir.setDate(maxAkhir.getDate() + 30);
                                return d >= awal && d <= maxAkhir;
                              })
                              .map((d) => (
                                <option
                                  key={formatDateVal(d)}
                                  value={formatDateVal(d)}
                                >
                                  {formatDateLabel(d)}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      padding: '6px 10px',
                      background: 'rgba(45,122,82,0.1)',
                      borderRadius: 6,
                      fontSize: 11,
                      color: 'var(--green-2)',
                      fontWeight: 600,
                      display: 'inline-block',
                    }}
                  >
                    📅 {labelPeriode} · {logsFiltered.length} hari data
                  </div>
                </div>
              )}

              <div
                className="fh-form-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0 14px',
                }}
              >
                {[
                  ['Pendapatan', 'monthly_income', 'Nominal Pendapatan'],
                  ['Pengeluaran', 'monthly_expenses', 'Nominal Pengeluaran'],
                  [
                    'Cicilan / Hutang',
                    'monthly_debt_payment',
                    'Nominal Cicilan',
                  ],
                  [
                    'Dana Darurat Dimiliki',
                    'emergency_fund',
                    'Total akumulasi dana darurat',
                  ],
                ].map(([lbl, key, placeholder]) => (
                  <div className="fg" key={key}>
                    <label>
                      {lbl}
                      {tglAwal && tglAkhir && (
                        <span
                          style={{
                            fontSize: 10,
                            color: 'var(--muted)',
                            fontWeight: 400,
                            marginLeft: 4,
                          }}
                        >
                          ({formatDateLabel(tglAwalObj)} –{' '}
                          {formatDateLabel(tglAkhirObj)})
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={activeForm[key]}
                      onChange={(e) => setFormField(key, e.target.value)}
                      placeholder={placeholder}
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
                {dateOptions.length > 0
                  ? `Data diambil dari akumulasi harian periode ${labelPeriode}.`
                  : 'Masukkan estimasi data dalam hitungan 1 bulan penuh untuk diagnosis yang presisi.'}
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
                  Darurat) berdasarkan standarisasi finansial untuk hasil
                  diagnosis yang presisi.
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

                <div
                  style={{
                    marginTop: 16,
                    padding: '12px 14px',
                    background: 'var(--green-bg)',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--green-2)',
                      marginBottom: 8,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    📅 {labelPeriode}
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 6,
                    }}
                  >
                    {[
                      [
                        'Pendapatan',
                        rp(Number(disp.monthly_income) || totalPendapatan),
                        'var(--green-2)',
                      ],
                      [
                        'Pengeluaran',
                        rp(Number(disp.monthly_expenses) || totalPengeluaran),
                        'var(--amber)',
                      ],
                      [
                        'Cicilan/Hutang',
                        rp(Number(disp.monthly_debt_payment) || totalCicilan),
                        'var(--red)',
                      ],
                      [
                        'Dana Darurat',
                        rp(Number(disp.emergency_fund) || totalDana),
                        'var(--blue)',
                      ],
                    ].map(([label, val, color]) => (
                      <div
                        key={label}
                        style={{
                          background: 'var(--white)',
                          borderRadius: 6,
                          padding: '8px 10px',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: 'var(--muted)',
                            marginBottom: 2,
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color,
                            fontFamily: 'var(--fd)',
                          }}
                        >
                          {val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
              onClick={handleHitungUlang}
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
