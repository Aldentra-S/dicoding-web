import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { useApp } from '../context/AppContext.jsx';

const MN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export default function BookingConsultation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const consultant = location.state?.consultant;
  const { doBooking, getSlots, busy } = useApp();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [method, setMethod] = useState('video_meeting');
  const [topic, setTopic] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState(false);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  useEffect(() => {
    if (!date) return;
    setSlotsLoading(true);
    setTime('');
    getSlots(id, date)
      .then((d) => {
        if (d.status === 'success') setSlots(d.data.slots || []);
      })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [date]);

  const submit = async () => {
    if (!date || !time) {
      setErr('Pilih tanggal dan waktu terlebih dahulu.');
      return;
    }
    setErr('');
    try {
      const d = await doBooking({
        consultant_id: parseInt(id),
        booking_date: date,
        booking_time: time,
        consultation_method: method,
        duration_minutes: 60,
        topic: topic || undefined,
      });
      if (d.status === 'success') setSuccess(true);
      else setErr(d.message || 'Gagal booking.');
    } catch {
      setErr('Gagal terhubung ke server.');
    }
  };

  if (success)
    return (
      <Layout title="Booking Berhasil">
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <div className="card">
            <div
              className="card-body"
              style={{ textAlign: 'center', padding: '36px 28px' }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  background:
                    'linear-gradient(135deg,var(--green-lt),var(--green-3))',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  color: '#fff',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 24px rgba(45,122,82,.25)',
                }}
              >
                ✓
              </div>
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 24,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  marginBottom: 7,
                }}
              >
                Booking Berhasil!
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--muted)',
                  marginBottom: 24,
                }}
              >
                Dijadwalkan dengan{' '}
                <strong style={{ color: 'var(--ink)' }}>
                  {consultant?.name}
                </strong>
              </p>
              <div
                style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 18,
                  textAlign: 'left',
                }}
              >
                {[
                  ['📅 Tanggal', date],
                  ['🕐 Waktu', `${time} WIB`],
                  [
                    method === 'video_meeting' ? '📹 Metode' : '💬 Metode',
                    method === 'video_meeting' ? 'Video Meeting' : 'Chat',
                  ],
                  ['⏱ Durasi', '60 menit'],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border)',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: 'var(--muted)' }}>{k}</span>
                    <strong style={{ color: 'var(--ink)' }}>{v}</strong>
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: 'var(--gold-lt)',
                  border: '1px solid #fde68a',
                  borderRadius: 9,
                  padding: '12px 15px',
                  textAlign: 'left',
                  marginBottom: 22,
                  fontSize: 13,
                  color: '#854d0e',
                }}
              >
                <strong style={{ display: 'block', marginBottom: 3 }}>
                  ⏳ Menunggu Konfirmasi
                </strong>
                Konsultan akan segera menghubungi Anda. Dashboard dan jadwal
                sudah diperbarui otomatis.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => navigate('/consultation')}
                >
                  Lihat Jadwal
                </button>
                <button
                  className="btn btn-dark"
                  style={{ flex: 1 }}
                  onClick={() => navigate('/dashboard')}
                >
                  Ke Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );

  return (
    <Layout
      title="Booking Konsultasi"
      subtitle={consultant ? `Booking dengan ${consultant.name}` : ''}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: 18,
          alignItems: 'start',
        }}
        className="bk-layout"
      >
        <div className="col">
          {consultant && (
            <div className="card">
              <div
                className="card-body"
                style={{
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: '50%',
                    background:
                      'linear-gradient(135deg,var(--green-lt),var(--green-3))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 800,
                    color: 'var(--ink)',
                    overflow: 'hidden',
                    border: '3px solid var(--green-bg)',
                    flexShrink: 0,
                  }}
                >
                  {consultant.photo_url ? (
                    <img
                      src={consultant.photo_url}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    consultant.name.charAt(0)
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 17,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      marginBottom: 2,
                    }}
                  >
                    {consultant.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--muted)',
                      marginBottom: 5,
                    }}
                  >
                    {consultant.specialization}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontSize: 12, color: '#d97706' }}>
                      {'★'.repeat(Math.round(consultant.rating))}{' '}
                      {consultant.rating}
                    </span>
                    <span className="tag">
                      {consultant.experience_years} thn
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--ink)',
                      }}
                    >
                      Rp {Number(consultant.rate).toLocaleString('id-ID')}/sesi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-hd">
              <span className="card-title">Pilih Tanggal</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {dates.map((d, i) => {
                  const str = d.toISOString().split('T')[0];
                  return (
                    <button
                      key={i}
                      className={`date-btn ${date === str ? 'on' : ''}`}
                      onClick={() => setDate(str)}
                    >
                      <span className="dn">{d.getDate()}</span>
                      <span className="dm">{MN[d.getMonth()]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {date && (
            <div className="card">
              <div className="card-hd">
                <span className="card-title">Pilih Waktu</span>
              </div>
              <div className="card-body">
                {slotsLoading ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="shimmer"
                        style={{ width: 72, height: 35 }}
                      />
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                    Tidak ada slot tersedia untuk tanggal ini.
                  </p>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {slots.map((s, i) => (
                      <button
                        key={i}
                        disabled={!s.is_available}
                        className={`slot-btn ${time === s.time ? 'on' : ''}`}
                        onClick={() => setTime(s.time)}
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-hd">
              <span className="card-title">Metode Konsultasi</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  ['chat', '💬', 'Chat'],
                  ['video_meeting', '📹', 'Video Meeting'],
                ].map(([v, ic, lb]) => (
                  <label
                    key={v}
                    className={`mopt ${method === v ? 'on' : ''}`}
                    onClick={() => setMethod(v)}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={v}
                      checked={method === v}
                      onChange={() => setMethod(v)}
                    />
                    <span className="mi">{ic}</span>
                    <span className="ml">{lb}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-hd">
              <span className="card-title">Topik Konsultasi</span>
            </div>
            <div className="card-body">
              <div className="fg" style={{ marginBottom: 0 }}>
                <textarea
                  placeholder="Topik yang ingin didiskusikan... (opsional)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="card bk-summary"
          style={{ position: 'sticky', top: 72 }}
        >
          <div className="card-hd">
            <span className="card-title">Ringkasan Booking</span>
          </div>
          <div className="card-body">
            {err && <div className="alert alert-err">{err}</div>}
            <div style={{ marginBottom: 14 }}>
              {[
                ['Konsultan', consultant?.name || '—'],
                ['Tanggal', date || '—'],
                ['Waktu', time || '—'],
                [
                  'Metode',
                  method === 'video_meeting' ? 'Video Meeting' : 'Chat',
                ],
                ['Durasi', '60 menit'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '9px 0',
                    borderBottom: '1px solid var(--border)',
                    fontSize: 12,
                    gap: 8,
                  }}
                >
                  <span style={{ color: 'var(--muted)', flexShrink: 0 }}>
                    {k}
                  </span>
                  <strong style={{ color: 'var(--ink)', textAlign: 'right' }}>
                    {v}
                  </strong>
                </div>
              ))}
            </div>
            {consultant && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--green-mist)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--ink-2)',
                  }}
                >
                  Total Biaya
                </span>
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                >
                  Rp {Number(consultant.rate).toLocaleString('id-ID')}
                </span>
              </div>
            )}
            <button
              className="btn btn-dark btn-full"
              onClick={submit}
              disabled={busy.bk || !date || !time}
            >
              {busy.bk ? (
                <>
                  <span className="spin" />
                  &ensp;Memproses...
                </>
              ) : (
                'Konfirmasi Booking'
              )}
            </button>
            <button
              className="btn btn-outline btn-full"
              style={{ marginTop: 8 }}
              onClick={() => navigate('/consultation')}
            >
              Batal
            </button>
            <div
              style={{
                display: 'flex',
                gap: 6,
                alignItems: 'flex-start',
                background: 'var(--green-mist)',
                borderRadius: 8,
                padding: '10px 12px',
                marginTop: 12,
                fontSize: 11,
                color: 'var(--muted)',
              }}
            >
              <span>🔒</span>
              <span>
                Data booking otomatis diperbarui di Dashboard dan Profil.
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
