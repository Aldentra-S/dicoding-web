import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function ConsultationList() {
  const navigate = useNavigate();
  const { consultants, bookings, busy, cancelBooking, zoomLinks, user } =
    useApp();
  const [tab, setTab] = useState('list');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('rating');
  const [cancelling, setCancelling] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMsg, setChatMsg] = useState('');
  const [chatSessions, setChatSessions] = useState({});
  const chatBottomRef = useRef(null);

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

  const isExpired = (booking) => {
    if (booking.status !== 'booked') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(booking.booking_date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate < today;
  };

  const resolveStatus = (booking) => {
    if (booking.status === 'rejected') return 'rejected';
    if (isExpired(booking)) return 'completed';
    return booking.status;
  };

  const bkBadge = (s) => {
    const m = {
      booked: ['b-blue', 'Terjadwal'],
      completed: ['b-green', 'Selesai'],
      cancelled: ['b-gray', 'Dibatalkan'],
      pending: ['b-blue', 'Pending'],
      rejected: ['b-red', 'Ditolak'],
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

  const activeBk = bookings.filter(
    (b) => b.status === 'booked' && !isExpired(b),
  );

  const confirmedBookings = bookings.filter(
    (b) => b.status === 'completed' || (b.status === 'booked' && !isExpired(b)),
  );

  const openChat = (booking) => {
    const bkId = booking.id;
    if (!chatSessions[bkId]) {
      const isVideo = booking.consultation_method === 'video_meeting';
      const zLink = isVideo ? zoomLinks[bkId] || booking.notes : null;
      const initMsgs = [
        {
          from: 'system',
          text: `Sesi konsultasi dengan ${booking.consultant_name} - ${booking.booking_date} pukul ${booking.booking_time} WIB`,
          time: '',
        },
        {
          from: 'consultant',
          name: booking.consultant_name,
          text:
            isVideo && zLink
              ? `Halo ${user?.name || ''}! Saya ${booking.consultant_name}. Berikut link Zoom untuk sesi kita:\n\n🔗 ${zLink}\n\nSilakan bergabung pada waktu yang sudah dijadwalkan ya! Jika ada pertanyaan, silakan tanya di sini.`
              : `Halo ${user?.name || ''}! Saya ${booking.consultant_name}. Sesi konsultasi kita dijadwalkan pada ${booking.booking_date} pukul ${booking.booking_time} WIB. Silakan mulai bertanya kapan saja! 😊`,
          time: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          zoomLink: zLink,
        },
      ];
      setChatSessions((prev) => ({ ...prev, [bkId]: initMsgs }));
    }
    setActiveChat(booking);
    setTab('chat');
  };

  useEffect(() => {
    if (tab === 'chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tab, chatSessions, activeChat]);

  const sendChat = () => {
    if (!chatMsg.trim() || !activeChat) return;
    const bkId = activeChat.id;
    const now = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setChatSessions((prev) => ({
      ...prev,
      [bkId]: [
        ...(prev[bkId] || []),
        { from: 'user', text: chatMsg, time: now },
      ],
    }));
    const msg = chatMsg;
    setChatMsg('');
    setTimeout(() => {
      setChatSessions((prev) => ({
        ...prev,
        [bkId]: [
          ...(prev[bkId] || []),
          {
            from: 'consultant',
            name: activeChat.consultant_name,
            text: 'Baik, terima kasih atas pertanyaannya! Kita bisa bahas lebih dalam saat sesi nanti ya. 😊',
            time: new Date().toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ],
      }));
      if (chatBottomRef.current)
        chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 1200);
  };

  const chatList = chatSessions[activeChat?.id] || [];
  const activeZoom =
    activeChat?.consultation_method === 'video_meeting'
      ? zoomLinks[activeChat?.id] ||
        activeChat?.notes ||
        chatList.find((m) => m.zoomLink)?.zoomLink
      : null;

  const chatBookings = confirmedBookings.filter(
    (b) => b.status === 'completed' || b.status === 'booked',
  );

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
        <button
          className={`tab ${tab === 'chat' ? 'on' : ''}`}
          onClick={() => {
            if (chatBookings.length > 0 && !activeChat)
              setActiveChat(chatBookings[0]);
            setTab('chat');
          }}
        >
          💬 Chat / Video
          {chatBookings.length > 0 && (
            <span
              style={{
                background: '#dbeafe',
                color: '#1d4ed8',
                borderRadius: 10,
                padding: '1px 6px',
                fontSize: 10,
                marginLeft: 5,
                fontWeight: 800,
              }}
            >
              {chatBookings.length}
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
                {
                  bookings.filter((b) => resolveStatus(b) === 'completed')
                    .length
                }{' '}
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
                    <th>Chat / Zoom</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const zoom =
                      b.consultation_method === 'video_meeting'
                        ? zoomLinks[b.id] || b.notes
                        : null;
                    const canChat =
                      b.status === 'completed' || b.status === 'booked';
                    return (
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
                          {new Date(b.booking_date).toLocaleDateString(
                            'id-ID',
                            { day: '2-digit', month: 'short', year: 'numeric' },
                          )}
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
                        <td>{bkBadge(resolveStatus(b))}</td>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              gap: 5,
                              flexWrap: 'wrap',
                            }}
                          >
                            {canChat && (
                              <button
                                onClick={() => openChat(b)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  background: 'var(--ink)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 7,
                                  padding: '4px 10px',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                💬 Chat
                              </button>
                            )}
                            {zoom && canChat && (
                              <a
                                href={zoom}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  background: 'var(--green-mist)',
                                  border: '1px solid var(--green-2)',
                                  color: 'var(--ink)',
                                  borderRadius: 7,
                                  padding: '4px 10px',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                🔗 Zoom
                              </a>
                            )}
                            {!canChat && b.status !== 'rejected' && (
                              <span
                                style={{ fontSize: 11, color: 'var(--muted)' }}
                              >
                                —
                              </span>
                            )}
                            {b.status === 'rejected' && (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: '#b91c1c',
                                  background: '#fee2e2',
                                  border: '1px solid #fca5a5',
                                  borderRadius: 6,
                                  padding: '3px 8px',
                                  display: 'inline-block',
                                  maxWidth: 180,
                                }}
                                title={b.notes || 'Ditolak oleh admin'}
                              >
                                ❌{' '}
                                {b.notes && !b.notes.startsWith('http')
                                  ? b.notes
                                  : 'Ditolak oleh admin'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {b.status === 'booked' && !isExpired(b) && (
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'chat' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            gap: 16,
            alignItems: 'start',
            minHeight: 500,
          }}
        >
          <div className="card" style={{ padding: 0 }}>
            <div
              style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--border)',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              Sesi Konsultasi
            </div>
            {chatBookings.length === 0 ? (
              <div
                style={{
                  padding: 20,
                  textAlign: 'center',
                  color: 'var(--muted)',
                  fontSize: 12,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                <p>Belum ada sesi yang dapat dibuka untuk chat.</p>
                <button
                  className="btn btn-dark btn-full"
                  style={{ marginTop: 12, fontSize: 11 }}
                  onClick={() => setTab('list')}
                >
                  Cari Konsultan
                </button>
              </div>
            ) : (
              chatBookings.map((b) => {
                const isActive = activeChat?.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setActiveChat(b)}
                    style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: isActive
                        ? 'var(--green-mist)'
                        : 'transparent',
                      borderLeft: isActive
                        ? '3px solid var(--green-2)'
                        : '3px solid transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background:
                            'linear-gradient(135deg,var(--green-lt),var(--green-3))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {b.consultant_name?.charAt(0) || 'K'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 12,
                            color: 'var(--ink)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {b.consultant_name}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                          {b.booking_date} {b.booking_time}
                        </div>
                        <div style={{ fontSize: 10, marginTop: 2 }}>
                          <span
                            style={{
                              background:
                                b.consultation_method === 'video_meeting'
                                  ? '#dbeafe'
                                  : 'var(--green-mist)',
                              color:
                                b.consultation_method === 'video_meeting'
                                  ? '#1d4ed8'
                                  : 'var(--ink)',
                              borderRadius: 4,
                              padding: '1px 5px',
                              fontWeight: 600,
                            }}
                          >
                            {b.consultation_method === 'video_meeting'
                              ? '📹 Video'
                              : '💬 Chat'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {activeChat ? (
            <div className="card" style={{ padding: 0 }}>
              <div className="card-hd" style={{ padding: '12px 16px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background:
                        'linear-gradient(135deg,var(--green-lt),var(--green-3))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    {activeChat.consultant_name?.charAt(0) || 'K'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      {activeChat.consultant_name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#2d7a52',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: '#2d7a52',
                          display: 'inline-block',
                        }}
                      />
                      Online · {activeChat.booking_date}{' '}
                      {activeChat.booking_time} WIB
                    </div>
                  </div>
                  {activeZoom && <span style={{ display: 'none' }} />}
                </div>
              </div>

              <div
                style={{
                  height: 400,
                  overflowY: 'auto',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  background: 'var(--paper)',
                }}
              >
                {(chatSessions[activeChat.id] || []).length === 0 ? (
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--muted)',
                      gap: 8,
                    }}
                  >
                    <div style={{ fontSize: 36 }}>
                      {activeChat.consultation_method === 'video_meeting'
                        ? '📹'
                        : '💬'}
                    </div>
                    <p style={{ fontSize: 13 }}>
                      Mulai percakapan dengan {activeChat.consultant_name}
                    </p>
                    {activeChat.consultation_method === 'video_meeting' ? (
                      <a
                        href={activeZoom || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-dark"
                        style={{ fontSize: 12, textDecoration: 'none' }}
                        onClick={() => openChat(activeChat)}
                      >
                        🔗 Buka Zoom
                      </a>
                    ) : (
                      <button
                        className="btn btn-dark"
                        style={{ fontSize: 12 }}
                        onClick={() => openChat(activeChat)}
                      >
                        Buka Sesi Chat
                      </button>
                    )}
                  </div>
                ) : (
                  (chatSessions[activeChat.id] || []).map((m, i) => {
                    if (m.from === 'system')
                      return (
                        <div
                          key={i}
                          style={{
                            textAlign: 'center',
                            fontSize: 11,
                            color: 'var(--muted)',
                            padding: '4px 0',
                          }}
                        >
                          {m.text}
                        </div>
                      );
                    const isUser = m.from === 'user';
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          flexDirection: isUser ? 'row-reverse' : 'row',
                          gap: 8,
                          alignItems: 'flex-end',
                        }}
                      >
                        {!isUser && (
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background:
                                'linear-gradient(135deg,var(--green-lt),var(--green-3))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 11,
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {m.name?.charAt(0) || 'K'}
                          </div>
                        )}
                        <div style={{ maxWidth: '72%' }}>
                          <div
                            style={{
                              background: isUser ? 'var(--ink)' : '#fff',
                              color: isUser ? '#fff' : 'var(--ink)',
                              border: isUser
                                ? 'none'
                                : '1px solid var(--border)',
                              borderRadius: isUser
                                ? '14px 14px 4px 14px'
                                : '14px 14px 14px 4px',
                              padding: '9px 13px',
                              fontSize: 13,
                              lineHeight: 1.55,
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {m.text}
                            {m.zoomLink && (
                              <a
                                href={m.zoomLink}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'block',
                                  marginTop: 8,
                                  background: '#2d7a52',
                                  color: '#fff',
                                  borderRadius: 7,
                                  padding: '6px 12px',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  textAlign: 'center',
                                }}
                              >
                                🔗 Join Zoom Meeting
                              </a>
                            )}
                          </div>
                          {m.time && (
                            <div
                              style={{
                                fontSize: 10,
                                color: 'var(--muted)',
                                marginTop: 3,
                                textAlign: isUser ? 'right' : 'left',
                              }}
                            >
                              {m.time}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              <div
                style={{
                  padding: '10px 12px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  gap: 8,
                }}
              >
                <input
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && !e.shiftKey && sendChat()
                  }
                  placeholder={`Pesan ke ${activeChat.consultant_name}...`}
                  style={{
                    flex: 1,
                    border: '1px solid var(--border)',
                    borderRadius: 9,
                    padding: '9px 13px',
                    fontSize: 13,
                    outline: 'none',
                    fontFamily: 'inherit',
                    background: 'var(--paper)',
                  }}
                />
                <button
                  className="btn btn-dark"
                  onClick={sendChat}
                  style={{ padding: '9px 16px' }}
                >
                  Kirim
                </button>
              </div>
            </div>
          ) : (
            <div
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 400,
              }}
            >
              <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                <p style={{ fontSize: 14 }}>
                  Pilih sesi di sebelah kiri untuk mulai chat
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
