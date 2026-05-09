import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function ConsultationList() {
  const navigate = useNavigate();
  const { consultants, bookings, busy, cancelBooking } = useApp();
  const [tab, setTab] = useState('list');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('rating');
  const [cancelling, setCancelling] = useState(null);

  const filtered = consultants
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.specialization.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === 'rating' ? b.rating - a.rating : a.rate - b.rate,
    );

  const stars = (r) =>
    Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={{
          color: i < Math.floor(r) ? '#d97706' : '#d1d5db',
          fontSize: 12,
        }}
      >
        ★
      </span>
    ));

  const bkBadge = (s) => {
    const m = {
      booked: ['b-blue', 'Terjadwal'],
      completed: ['b-green', 'Selesai'],
      cancelled: ['b-gray', 'Dibatalkan'],
      pending: ['b-blue', 'Pending'],
    };
    const [cls, lbl] = m[s] || ['b-gray', s];
    return <span className={`badge ${cls}`}>{lbl}</span>;
  };

  const doCancel = async (id) => {
    if (!confirm('Yakin ingin membatalkan booking ini?')) return;
    setCancelling(id);
    try {
      await cancelBooking(id);
    } finally {
      setCancelling(null);
    }
  };

  const activeBk = bookings.filter((b) => b.status === 'booked');

  return (
    <Layout
      title="Konsultasi Keuangan"
      subtitle="Temukan konsultan keuangan terbaik untuk kebutuhanmu"
    >
      <div className="tabs">
        <button
          className={`tab ${tab === 'list' ? 'on' : ''}`}
          onClick={() => setTab('list')}
        >
          Daftar Konsultan
        </button>
        <button
          className={`tab ${tab === 'my' ? 'on' : ''}`}
          onClick={() => setTab('my')}
        >
          Konsultasi Saya
          {activeBk.length > 0 && (
            <span
              style={{
                background: 'var(--green-lt)',
                color: 'var(--ink)',
                borderRadius: 10,
                padding: '1px 6px',
                fontSize: 10,
                marginLeft: 5,
                fontWeight: 800,
              }}
            >
              {activeBk.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'list' && (
        <>
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginBottom: 16,
              flexWrap: 'wrap',
            }}
          >
            <div className="search-box" style={{ flex: 1, minWidth: 180 }}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="14"
                height="14"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Cari konsultan atau spesialisasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: '9px 12px',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--r8)',
                fontSize: 12,
                background: '#fff',
                outline: 'none',
                fontFamily: "'Montserrat', sans-serif",
                color: 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              <option value="rating">Rating Tertinggi</option>
              <option value="rate">Tarif Terendah</option>
            </select>
          </div>

          {busy.init && consultants.length === 0 ? (
            <div className="loading">
              <div className="spin spin-dk" />
              <span>Memuat konsultan...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="ei">🔍</div>
              <h3>Tidak Ditemukan</h3>
              <p>Coba kata kunci lain</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: 14,
              }}
              className="cl-grid"
            >
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all .18s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = 'var(--sh-md)';
                    e.currentTarget.style.borderColor = 'var(--green-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <div
                    style={{
                      background:
                        'linear-gradient(135deg, var(--green-mist), var(--green-bg))',
                      padding: '20px 18px 16px',
                      display: 'flex',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background:
                          'linear-gradient(135deg, var(--green-lt), var(--green-3))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        fontWeight: 800,
                        color: 'var(--ink)',
                        overflow: 'hidden',
                        border: '3px solid #fff',
                        boxShadow: 'var(--sh)',
                      }}
                    >
                      {c.photo_url ? (
                        <img
                          src={c.photo_url}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        c.name.charAt(0)
                      )}
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: c.is_available ? '#22c55e' : '#ef4444',
                        border: '2px solid #fff',
                      }}
                    />
                  </div>
                  <div style={{ padding: '13px 15px', flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: 15,
                        fontWeight: 600,
                        color: 'var(--ink)',
                        marginBottom: 3,
                      }}
                    >
                      {c.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--muted)',
                        marginBottom: 7,
                      }}
                    >
                      {c.specialization}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        marginBottom: 7,
                      }}
                    >
                      {stars(c.rating)}
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--ink)',
                          marginLeft: 3,
                        }}
                      >
                        {c.rating}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                        ({c.total_reviews})
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 7,
                      }}
                    >
                      <span className="tag">{c.experience_years} tahun</span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--ink)',
                        }}
                      >
                        Rp {Number(c.rate).toLocaleString('id-ID')}
                      </span>
                    </div>
                    {c.bio && (
                      <p
                        style={{
                          fontSize: 11,
                          color: 'var(--ink-3)',
                          lineHeight: 1.5,
                        }}
                      >
                        {c.bio.slice(0, 80)}
                        {c.bio.length > 80 ? '...' : ''}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      padding: '11px 15px',
                      borderTop: '1px solid var(--border)',
                      background: 'var(--paper)',
                    }}
                  >
                    <button
                      className="btn btn-dark btn-full"
                      style={{ fontSize: 12 }}
                      onClick={() =>
                        navigate(`/consultation/booking/${c.id}`, {
                          state: { consultant: c },
                        })
                      }
                    >
                      Pilih Konsultan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'my' && (
        <div className="card">
          <div className="card-hd">
            <span className="card-title">Riwayat Konsultasi</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="tag">{bookings.length} total</span>
              <span className="badge b-green">
                {bookings.filter((b) => b.status === 'completed').length}{' '}
                selesai
              </span>
              <span className="badge b-blue">{activeBk.length} aktif</span>
            </div>
          </div>
          {bookings.length === 0 ? (
            <div className="empty">
              <div className="ei">📅</div>
              <h3>Belum Ada Booking</h3>
              <p>Mulai konsultasi dengan ahli keuangan terpercaya</p>
              <button
                className="btn btn-dark"
                style={{ marginTop: 14 }}
                onClick={() => setTab('list')}
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
                    <th>Aksi</th>
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
                      <td>{bkBadge(b.status)}</td>
                      <td>
                        {b.status === 'booked' && (
                          <button
                            className="btn btn-red btn-sm"
                            onClick={() => doCancel(b.id)}
                            disabled={cancelling === b.id}
                          >
                            {cancelling === b.id ? '...' : 'Batalkan'}
                          </button>
                        )}
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
