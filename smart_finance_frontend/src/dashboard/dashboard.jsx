import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Layout from '../components/Layout.jsx';
import { useApp } from '../context/AppContext.jsx';

const rp = (v) => (v != null ? `Rp ${Number(v).toLocaleString('id-ID')}` : '-');
const pct = (v) => (v != null ? `${v}%` : '—');
const bln = (v) => (v != null ? `${v} bln` : '—');

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, lastHC, healthHistory, bookings, dashboard, busy } = useApp();

  const sc =
    lastHC?.status === 'Sehat'
      ? '#166534'
      : lastHC?.status === 'Rawan'
        ? '#854d0e'
        : '#b91c1c';
  const scBg =
    lastHC?.status === 'Sehat'
      ? '#dcfce7'
      : lastHC?.status === 'Rawan'
        ? '#fef3c7'
        : '#fee2e2';

  const chartData = [...healthHistory]
    .reverse()
    .slice(-10)
    .map((h) => ({
      tgl: new Date(h.created_at).toLocaleDateString('id-ID', {
        month: 'short',
        day: 'numeric',
      }),
      dti: parseFloat(h.debt_to_income_ratio) || 0,
    }));

  const activeBk = bookings.filter((b) => b.status === 'booked');

  const stats = [
    {
      lbl: 'Skor Finansial',
      val: lastHC ? `${lastHC.score}/100` : '—',
      sub: lastHC?.status || 'Belum ada',
      subBg: scBg,
      subC: sc,
      iconBg: '#e8f5ee',
      iconC: '#2d7a52',
      d: 'M22 12h-4l-3 9L9 3l-3 9H2',
    },
    {
      lbl: 'DTI Ratio',
      val: lastHC ? pct(lastHC.debt_to_income_ratio) : '—',
      sub: 'Debt-to-Income',
      subBg: '#fef3c7',
      subC: '#854d0e',
      iconBg: '#fef9ec',
      iconC: '#b88a20',
      d: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
    },
    {
      lbl: 'Pengeluaran/Pemasukan',
      val: lastHC ? pct(lastHC.expense_to_income_ratio) : '—',
      sub: 'EIR Ratio',
      subBg: '#dbeafe',
      subC: '#1d4ed8',
      iconBg: '#eff6ff',
      iconC: '#1d4ed8',
      d: 'M22 12h-4l-3 9L9 3l-3 9H2',
    },
    {
      lbl: 'Dana Darurat',
      val: lastHC ? bln(lastHC.emergency_fund_months) : '—',
      sub: 'Emergency Fund',
      subBg: '#fee2e2',
      subC: '#b91c1c',
      iconBg: '#fef2f2',
      iconC: '#b91c1c',
      d: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z',
    },
  ];

  const menus = [
    {
      icon: '💹',
      title: 'Financial Health',
      desc: 'Cek kondisi keuanganmu',
      path: '/financial-health',
      bg: '#edf7f1',
    },
    {
      icon: '👨‍💼',
      title: 'Konsultasi',
      desc: 'Temui konsultan',
      path: '/consultation',
      bg: '#eff6ff',
    },
    {
      icon: '📚',
      title: 'Edukasi',
      desc: 'Literasi keuangan',
      path: '/education',
      bg: '#fffbeb',
    },
    {
      icon: '👤',
      title: 'Profil',
      desc: 'Kelola akun',
      path: '/profile',
      bg: '#fdf4ff',
    },
  ];

  return (
    <Layout
      title={`Halo, ${user?.name || 'Pengguna'} 👋`}
      subtitle="Selamat datang kembali di Smart Finance"
    >
      {busy.init && !lastHC ? (
        <div className="loading">
          <div className="spin spin-dk" />
          <span>Memuat data...</span>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            {stats.map((s) => (
              <div
                key={s.lbl}
                className="sc"
                onClick={() => navigate('/financial-health')}
              >
                <div className="sc-icon" style={{ background: s.iconBg }}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={s.iconC}
                    strokeWidth="2"
                  >
                    <path d={s.d} />
                  </svg>
                </div>
                <div className="sc-lbl">{s.lbl}</div>
                <div className="sc-val">{s.val}</div>
                <span
                  className="sc-sub"
                  style={{ background: s.subBg, color: s.subC }}
                >
                  {s.sub}
                </span>
              </div>
            ))}
          </div>

          <div className="grid-2">
            <div className="col">
              <div className="card">
                <div className="card-hd">
                  <span className="card-title">Tren DTI Ratio</span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate('/financial-health')}
                  >
                    {chartData.length === 0 ? 'Mulai Cek' : 'Cek Sekarang'}
                  </button>
                </div>
                <div className="card-body">
                  {chartData.length === 0 ? (
                    <div className="empty">
                      <div className="ei">📊</div>
                      <h3>Belum Ada Data Tren</h3>
                      <p>
                        Lakukan Financial Health Check untuk melihat tren DTI
                      </p>
                      <button
                        className="btn btn-green"
                        style={{ marginTop: 14 }}
                        onClick={() => navigate('/financial-health')}
                      >
                        Mulai Health Check
                      </button>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart
                        data={chartData}
                        margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="dtig" x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="5%"
                              stopColor="#2d7a52"
                              stopOpacity={0.15}
                            />
                            <stop
                              offset="95%"
                              stopColor="#2d7a52"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="tgl"
                          tick={{ fontSize: 11, fill: '#6b9a78' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#6b9a78' }}
                          axisLine={false}
                          tickLine={false}
                          domain={[0, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 9,
                            border: '1px solid #cde5d6',
                            fontSize: 12,
                          }}
                          formatter={(v) => [`${v}%`, 'DTI']}
                        />
                        <Area
                          type="monotone"
                          dataKey="dti"
                          stroke="#2d7a52"
                          strokeWidth={2.5}
                          fill="url(#dtig)"
                          dot={{ fill: '#2d7a52', strokeWidth: 0, r: 4 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-hd">
                  <span className="card-title">
                    Ringkasan Keuangan Terakhir
                  </span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate('/financial-health')}
                  >
                    Detail
                  </button>
                </div>
                <div className="card-body">
                  {lastHC ? (
                    <>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '9px 13px',
                          background: scBg,
                          borderRadius: 8,
                          marginBottom: 13,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ fontSize: 17 }}>
                          {lastHC.status === 'Sehat'
                            ? '✅'
                            : lastHC.status === 'Rawan'
                              ? '⚠️'
                              : '🔴'}
                        </span>
                        <span
                          style={{ fontWeight: 700, color: sc, fontSize: 13 }}
                        >
                          Status: {lastHC.status}
                        </span>
                        <span
                          style={{
                            marginLeft: 'auto',
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: 16,
                            fontWeight: 700,
                            color: 'var(--ink)',
                          }}
                        >
                          Skor {lastHC.score}/100
                        </span>
                      </div>
                      {[
                        [
                          'Pendapatan Bulanan',
                          rp(lastHC.monthly_income),
                          '#dcfce7',
                          '#166534',
                        ],
                        [
                          'Pengeluaran Bulanan',
                          rp(lastHC.monthly_expenses),
                          '#fef3c7',
                          '#854d0e',
                        ],
                        [
                          'Cicilan / Hutang',
                          rp(lastHC.monthly_debt_payment),
                          '#fee2e2',
                          '#b91c1c',
                        ],
                      ].map(([k, v, bg, c]) => (
                        <div key={k} className="summary-row">
                          <span
                            style={{ color: 'var(--ink-2)', fontWeight: 500 }}
                          >
                            {k}
                          </span>
                          <span
                            style={{
                              fontWeight: 700,
                              color: c,
                              background: bg,
                              padding: '3px 9px',
                              borderRadius: 5,
                              fontSize: 12,
                            }}
                          >
                            {v}
                          </span>
                        </div>
                      ))}
                      <p
                        style={{
                          fontSize: 11,
                          color: 'var(--muted)',
                          marginTop: 9,
                        }}
                      >
                        Terakhir:{' '}
                        {new Date(lastHC.created_at).toLocaleDateString(
                          'id-ID',
                          { day: '2-digit', month: 'long', year: 'numeric' },
                        )}
                      </p>
                    </>
                  ) : (
                    <div className="empty" style={{ padding: '24px 12px' }}>
                      <div className="ei">📊</div>
                      <h3>Belum Ada Data</h3>
                      <p>Lakukan Financial Health Check</p>
                      <button
                        className="btn btn-green"
                        style={{ marginTop: 12 }}
                        onClick={() => navigate('/financial-health')}
                      >
                        Mulai Sekarang
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col right-col">
              {dashboard?.daily_tip && (
                <div className="card">
                  <div className="card-hd">
                    <span className="card-title">💡 Tips Hari Ini</span>
                  </div>
                  <div className="card-body">
                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--ink-2)',
                        lineHeight: 1.7,
                        fontStyle: 'italic',
                      }}
                    >
                      "{dashboard.daily_tip}"
                    </p>
                    <button
                      className="btn btn-outline btn-full"
                      style={{ marginTop: 12, fontSize: 12 }}
                      onClick={() => navigate('/education')}
                    >
                      Baca Selengkapnya
                    </button>
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
                className="menu-grid"
              >
                {menus.map((m) => (
                  <div
                    key={m.path}
                    style={{
                      background: m.bg,
                      borderRadius: 13,
                      padding: '15px 13px',
                      cursor: 'pointer',
                      border: '1px solid transparent',
                      transition: 'all .18s',
                    }}
                    onClick={() => navigate(m.path)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--sh-md)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '';
                      e.currentTarget.style.transform = '';
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 7 }}>
                      {m.icon}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 12,
                        color: 'var(--ink)',
                        marginBottom: 3,
                        lineHeight: 1.3,
                      }}
                    >
                      {m.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        lineHeight: 1.4,
                      }}
                    >
                      {m.desc}
                    </div>
                  </div>
                ))}
              </div>

              {activeBk.length > 0 && (
                <div className="card">
                  <div className="card-hd">
                    <span className="card-title">Jadwal Aktif</span>
                    <span className="badge b-blue">{activeBk.length}</span>
                  </div>
                  <div>
                    {activeBk.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        style={{
                          display: 'flex',
                          gap: 10,
                          alignItems: 'center',
                          padding: '10px 18px',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            background: 'var(--green-mist)',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 15,
                            flexShrink: 0,
                          }}
                        >
                          📅
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 12,
                              color: 'var(--ink)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {b.consultant_name}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                            {b.booking_date} · {b.booking_time}
                          </div>
                        </div>
                        <span className="badge b-blue" style={{ fontSize: 10 }}>
                          Aktif
                        </span>
                      </div>
                    ))}
                    <div style={{ padding: '9px 18px' }}>
                      <button
                        className="btn btn-outline btn-full btn-sm"
                        onClick={() => navigate('/consultation')}
                      >
                        Lihat Semua
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="card">
                <div className="card-hd">
                  <span className="card-title">Statistik</span>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3,1fr)',
                    padding: '12px 14px 14px',
                    gap: 8,
                  }}
                  className="stat-3"
                >
                  {[
                    ['💊', 'Cek', healthHistory.length],
                    ['📅', 'Booking', bookings.length],
                    [
                      '✅',
                      'Selesai',
                      bookings.filter((b) => b.status === 'completed').length,
                    ],
                  ].map(([ic, lb, v]) => (
                    <div
                      key={lb}
                      style={{
                        textAlign: 'center',
                        padding: '11px 8px',
                        background: 'var(--green-mist)',
                        borderRadius: 9,
                      }}
                    >
                      <div style={{ fontSize: 18, marginBottom: 5 }}>{ic}</div>
                      <div
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: 20,
                          fontWeight: 700,
                          color: 'var(--ink)',
                          lineHeight: 1,
                        }}
                      >
                        {v}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: 'var(--muted)',
                          marginTop: 3,
                        }}
                      >
                        {lb}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
