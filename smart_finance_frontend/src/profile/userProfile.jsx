import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Layout from '../components/Layout.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function Profile() {
  const navigate = useNavigate();
  const {
    user,
    healthHistory,
    bookings,
    busy,
    updateProfile,
    changePass,
    logout,
  } = useApp();
  const [tab, setTab] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const [ef, setEf] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [pf, setPf] = useState({
    old_password: '',
    new_password: '',
    confirm: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ t: '', s: '' });

  const saveProfile = async () => {
    setSaving(true);
    setMsg({ t: '', s: '' });
    try {
      const d = await updateProfile({
        name: ef.name,
        phone: ef.phone || undefined,
      });
      if (d.status === 'success') {
        setEditMode(false);
        setMsg({ t: 'ok', s: 'Profil berhasil diperbarui.' });
      } else setMsg({ t: 'err', s: d.message || 'Gagal menyimpan.' });
    } catch {
      setMsg({ t: 'err', s: 'Gagal terhubung ke server.' });
    } finally {
      setSaving(false);
    }
  };

  const savePass = async () => {
    if (pf.new_password !== pf.confirm) {
      setMsg({ t: 'err', s: 'Password baru tidak cocok.' });
      return;
    }
    if (pf.new_password.length < 6) {
      setMsg({ t: 'err', s: 'Password minimal 6 karakter.' });
      return;
    }
    setSaving(true);
    setMsg({ t: '', s: '' });
    try {
      const d = await changePass({
        old_password: pf.old_password,
        new_password: pf.new_password,
      });
      if (d.status === 'success') {
        setPf({ old_password: '', new_password: '', confirm: '' });
        setMsg({ t: 'ok', s: 'Password berhasil diubah.' });
      } else setMsg({ t: 'err', s: d.message || 'Gagal mengubah password.' });
    } catch {
      setMsg({ t: 'err', s: 'Gagal terhubung.' });
    } finally {
      setSaving(false);
    }
  };

  const doLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SF';
  const lastHC = healthHistory[0];
  const sc =
    lastHC?.status === 'Sehat'
      ? '#2d7a52'
      : lastHC?.status === 'Rawan'
        ? '#d97706'
        : '#b91c1c';
  const scBg =
    lastHC?.status === 'Sehat'
      ? '#dcfce7'
      : lastHC?.status === 'Rawan'
        ? '#fef3c7'
        : '#fee2e2';
  const scC =
    lastHC?.status === 'Sehat'
      ? '#166534'
      : lastHC?.status === 'Rawan'
        ? '#854d0e'
        : '#b91c1c';

  const totalBk = bookings.length;
  const doneBk = bookings.filter((b) => b.status === 'completed').length;
  const activeBk = bookings.filter((b) => b.status === 'booked').length;

  const chartData = [...healthHistory]
    .reverse()
    .slice(-8)
    .map((h) => ({
      tgl: new Date(h.created_at).toLocaleDateString('id-ID', {
        month: 'short',
        day: 'numeric',
      }),
      dti: parseFloat(h.debt_to_income_ratio) || 0,
      score: h.score || 0,
      status: h.status,
    }));

  const bColor = (s) =>
    s === 'Sehat' ? '#2d7a52' : s === 'Rawan' ? '#d97706' : '#b91c1c';

  return (
    <Layout
      title="Profil Saya"
      subtitle="Kelola akun dan pantau perkembangan keuanganmu"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: 18,
          marginBottom: 18,
          alignItems: 'start',
        }}
        className="prof-top"
      >
        <div
          className="card"
          style={{
            background: 'linear-gradient(145deg, var(--ink), var(--ink-2))',
          }}
        >
          <div
            className="card-body"
            style={{ textAlign: 'center', padding: '26px 18px' }}
          >
            <div
              style={{
                width: 66,
                height: 66,
                borderRadius: '50%',
                background:
                  'linear-gradient(135deg, var(--green-lt), var(--green-3))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 800,
                color: 'var(--ink)',
                margin: '0 auto 12px',
                border: '3px solid rgba(255,255,255,.15)',
              }}
            >
              {initials}
            </div>
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 17,
                fontWeight: 600,
                color: '#fff',
                marginBottom: 4,
              }}
            >
              {user?.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,.45)',
                marginBottom: 14,
              }}
            >
              {user?.email}
            </div>
            {user?.phone && (
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,.35)',
                  marginBottom: 10,
                }}
              >
                📱 {user.phone}
              </div>
            )}
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.25)' }}>
              Bergabung{' '}
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('id-ID', {
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
          }}
          className="prof-stats"
        >
          {[
            ['💊', 'Health Check', healthHistory.length],
            ['📅', 'Total Booking', totalBk],
            ['✅', 'Sesi Selesai', doneBk],
            ['🎯', 'Skor Terakhir', lastHC ? `${lastHC.score}/100` : '—'],
          ].map(([ic, lb, v]) => (
            <div
              key={lb}
              className="card"
              style={{ textAlign: 'center', padding: '16px 10px' }}
            >
              <div style={{ fontSize: 22, marginBottom: 7 }}>{ic}</div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--ink)',
                  lineHeight: 1,
                  marginBottom: 5,
                }}
              >
                {v}
              </div>
              <div
                style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.3 }}
              >
                {lb}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="tabs">
        {[
          ['info', 'Informasi Pribadi'],
          ['stats', `Statistik (${healthHistory.length})`],
          ['bk', `Konsultasi (${totalBk})`],
          ['sec', 'Keamanan'],
        ].map(([v, l]) => (
          <button
            key={v}
            className={`tab ${tab === v ? 'on' : ''}`}
            onClick={() => {
              setTab(v);
              setMsg({ t: '', s: '' });
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="grid-1-1" style={{ alignItems: 'start' }}>
          <div className="card">
            <div className="card-hd">
              <span className="card-title">Informasi Pribadi</span>
              {!editMode && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setEditMode(true);
                    setEf({ name: user?.name || '', phone: user?.phone || '' });
                  }}
                >
                  Edit
                </button>
              )}
            </div>
            <div className="card-body">
              {msg.s && (
                <div
                  className={`alert ${msg.t === 'ok' ? 'alert-ok' : 'alert-err'}`}
                >
                  {msg.s}
                </div>
              )}
              {editMode ? (
                <>
                  <div className="fg">
                    <label>Nama Lengkap</label>
                    <input
                      type="text"
                      value={ef.name}
                      onChange={(e) => setEf({ ...ef, name: e.target.value })}
                    />
                  </div>
                  <div className="fg">
                    <label>Nomor Telepon</label>
                    <input
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={ef.phone}
                      onChange={(e) => setEf({ ...ef, phone: e.target.value })}
                    />
                  </div>
                  <div className="fg">
                    <label>Email</label>
                    <input type="email" value={user?.email} disabled />
                    <p
                      style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        marginTop: 4,
                      }}
                    >
                      Email tidak dapat diubah
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 9 }}>
                    <button
                      className="btn btn-outline"
                      style={{ flex: 1 }}
                      onClick={() => setEditMode(false)}
                    >
                      Batal
                    </button>
                    <button
                      className="btn btn-dark"
                      style={{ flex: 1 }}
                      onClick={saveProfile}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spin" />
                          &ensp;Menyimpan...
                        </>
                      ) : (
                        'Simpan'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div>
                  {[
                    ['Nama Lengkap', user?.name],
                    ['Email', user?.email],
                    ['Telepon', user?.phone || '—'],
                    ['Status', 'Member Aktif'],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: '1px solid var(--border)',
                        fontSize: 13,
                        flexWrap: 'wrap',
                        gap: 6,
                      }}
                    >
                      <span style={{ color: 'var(--muted)', fontWeight: 500 }}>
                        {k}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-hd">
              <span className="card-title">Status Keuangan Terkini</span>
            </div>
            <div className="card-body">
              {busy.init && !lastHC ? (
                <div className="loading">
                  <div className="spin spin-dk" />
                </div>
              ) : lastHC ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 11,
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <span
                      className="badge"
                      style={{
                        background: scBg,
                        color: scC,
                        fontSize: 12,
                        padding: '4px 12px',
                      }}
                    >
                      {lastHC.status === 'Sehat'
                        ? '✅'
                        : lastHC.status === 'Rawan'
                          ? '⚠️'
                          : '🔴'}{' '}
                      {lastHC.status}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: 26,
                        fontWeight: 700,
                        color: 'var(--ink)',
                      }}
                    >
                      {lastHC.score}
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                        /100
                      </span>
                    </span>
                  </div>
                  <div className="bar-wrap" style={{ marginBottom: 14 }}>
                    <div
                      className="bar"
                      style={{ width: `${lastHC.score}%`, background: sc }}
                    />
                  </div>
                  {[
                    ['DTI Ratio', `${lastHC.debt_to_income_ratio}%`],
                    ['EIR Ratio', `${lastHC.expense_to_income_ratio}%`],
                    ['Dana Darurat', `${lastHC.emergency_fund_months} bulan`],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '9px 0',
                        borderBottom: '1px solid var(--border)',
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: 'var(--muted)', fontWeight: 500 }}>
                        {k}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--ink)' }}>
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
                    {new Date(lastHC.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <button
                    className="btn btn-outline btn-full"
                    style={{ marginTop: 11, fontSize: 12 }}
                    onClick={() => navigate('/financial-health')}
                  >
                    Lihat Detail &amp; Riwayat
                  </button>
                </>
              ) : (
                <div className="empty" style={{ padding: '22px 10px' }}>
                  <div className="ei">💊</div>
                  <h3>Belum Ada Data</h3>
                  <p>Lakukan Financial Health Check</p>
                  <button
                    className="btn btn-dark"
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
      )}

      {tab === 'stats' && (
        <div className="col">
          {busy.init && healthHistory.length === 0 ? (
            <div className="loading">
              <div className="spin spin-dk" />
            </div>
          ) : healthHistory.length === 0 ? (
            <div className="empty">
              <div className="ei">📊</div>
              <h3>Belum Ada Data Statistik</h3>
              <p>
                Lakukan Financial Health Check untuk melihat tren keuanganmu
              </p>
              <button
                className="btn btn-dark"
                style={{ marginTop: 14 }}
                onClick={() => navigate('/financial-health')}
              >
                Mulai Health Check
              </button>
            </div>
          ) : (
            <>
              <div className="card">
                <div className="card-hd">
                  <span className="card-title">
                    Tren DTI Ratio — {chartData.length} Pemeriksaan Terakhir
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    Data real-time
                  </span>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={chartData}
                      margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
                      barSize={26}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="tgl"
                        tick={{ fontSize: 11, fill: 'var(--muted)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'var(--muted)' }}
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 9,
                          border: '1px solid var(--border)',
                          fontSize: 12,
                        }}
                        formatter={(v) => [`${v}%`, 'DTI Ratio']}
                        labelStyle={{ color: 'var(--ink)', fontWeight: 600 }}
                      />
                      <Bar dataKey="dti" radius={[5, 5, 0, 0]}>
                        {chartData.map((e, i) => (
                          <Cell key={i} fill={bColor(e.status)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      display: 'flex',
                      gap: 14,
                      justifyContent: 'center',
                      marginTop: 8,
                    }}
                  >
                    {[
                      ['#2d7a52', 'Sehat'],
                      ['#d97706', 'Rawan'],
                      ['#b91c1c', 'Kritis'],
                    ].map(([c, l]) => (
                      <div
                        key={l}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 11,
                          color: 'var(--muted)',
                        }}
                      >
                        <div
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: 3,
                            background: c,
                          }}
                        />
                        {l}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-hd">
                  <span className="card-title">Tren Skor Finansial</span>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={190}>
                    <BarChart
                      data={chartData}
                      margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
                      barSize={22}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="tgl"
                        tick={{ fontSize: 11, fill: 'var(--muted)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'var(--muted)' }}
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 9,
                          border: '1px solid var(--border)',
                          fontSize: 12,
                        }}
                        formatter={(v) => [`${v}/100`, 'Skor']}
                        labelStyle={{ color: 'var(--ink)', fontWeight: 600 }}
                      />
                      <Bar dataKey="score" radius={[5, 5, 0, 0]}>
                        {chartData.map((e, i) => (
                          <Cell key={i} fill={bColor(e.status)} opacity={0.7} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div className="card-hd">
                  <span className="card-title">Semua Riwayat Pemeriksaan</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {healthHistory.length} total
                  </span>
                </div>
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
                            {new Date(h.created_at).toLocaleDateString(
                              'id-ID',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )}
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
                            <span
                              style={{ color: 'var(--muted)', fontSize: 11 }}
                            >
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
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'bk' && (
        <div className="card">
          <div className="card-hd">
            <span className="card-title">Riwayat Konsultasi</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="tag">{totalBk} total</span>
              <span className="badge b-green">{doneBk} selesai</span>
              <span className="badge b-blue">{activeBk} aktif</span>
            </div>
          </div>
          {bookings.length === 0 ? (
            <div className="empty">
              <div className="ei">📅</div>
              <h3>Belum Ada Riwayat</h3>
              <p>Mulai konsultasi dengan ahli keuangan</p>
              <button
                className="btn btn-dark"
                style={{ marginTop: 14 }}
                onClick={() => navigate('/consultation')}
              >
                Cari Konsultan
              </button>
            </div>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Konsultan</th>
                    <th>Tanggal</th>
                    <th>Waktu</th>
                    <th>Metode</th>
                    <th>Biaya</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {b.consultant_name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                          {b.specialization}
                        </div>
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {new Date(b.booking_date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>{b.booking_time}</td>
                      <td>
                        <span className="tag">
                          {b.consultation_method === 'video_meeting'
                            ? '📹 Video'
                            : '💬 Chat'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {b.total_fee
                          ? `Rp ${Number(b.total_fee).toLocaleString('id-ID')}`
                          : '-'}
                      </td>
                      <td>
                        <span
                          className={`badge ${b.status === 'booked' ? 'b-blue' : b.status === 'completed' ? 'b-green' : 'b-gray'}`}
                        >
                          {b.status === 'booked'
                            ? 'Terjadwal'
                            : b.status === 'completed'
                              ? 'Selesai'
                              : 'Dibatalkan'}
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

      {tab === 'sec' && (
        <div className="grid-1-1" style={{ alignItems: 'start' }}>
          <div className="card">
            <div className="card-hd">
              <span className="card-title">Ubah Password</span>
            </div>
            <div className="card-body">
              {msg.s && (
                <div
                  className={`alert ${msg.t === 'ok' ? 'alert-ok' : 'alert-err'}`}
                >
                  {msg.s}
                </div>
              )}
              <div className="fg">
                <label>Password Lama</label>
                <input
                  type="password"
                  placeholder="Password saat ini"
                  value={pf.old_password}
                  onChange={(e) =>
                    setPf({ ...pf, old_password: e.target.value })
                  }
                />
              </div>
              <div className="fg">
                <label>Password Baru</label>
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={pf.new_password}
                  onChange={(e) =>
                    setPf({ ...pf, new_password: e.target.value })
                  }
                />
              </div>
              <div className="fg">
                <label>Konfirmasi Password Baru</label>
                <input
                  type="password"
                  placeholder="Ulangi password baru"
                  value={pf.confirm}
                  onChange={(e) => setPf({ ...pf, confirm: e.target.value })}
                />
              </div>
              <button
                className="btn btn-dark btn-full"
                onClick={savePass}
                disabled={
                  saving || !pf.old_password || !pf.new_password || !pf.confirm
                }
              >
                {saving ? (
                  <>
                    <span className="spin" />
                    &ensp;Menyimpan...
                  </>
                ) : (
                  'Ubah Password'
                )}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-hd">
              <span className="card-title">Sesi &amp; Keamanan</span>
            </div>
            <div className="card-body">
              {[
                ['✅', 'Email Terverifikasi', user?.email || '—'],
                ['🔒', 'Sesi Aktif', new Date().toLocaleDateString('id-ID')],
              ].map(([ic, lb, dc]) => (
                <div
                  key={lb}
                  style={{
                    display: 'flex',
                    gap: 11,
                    alignItems: 'flex-start',
                    marginBottom: 13,
                    paddingBottom: 13,
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div style={{ fontSize: 18 }}>{ic}</div>
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: 'var(--ink)',
                        marginBottom: 2,
                      }}
                    >
                      {lb}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {dc}
                    </div>
                  </div>
                </div>
              ))}
              <button className="btn btn-red btn-full" onClick={doLogout}>
                Keluar dari Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
