import React, { useState, useEffect, useRef } from 'react';
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

const PAYMENT_METHODS = [
  {
    id: 'transfer_bank',
    icon: '🏦',
    label: 'Transfer Bank',
    desc: 'BCA, Mandiri, BNI, BRI',
  },
  { id: 'qris', icon: '📱', label: 'QRIS', desc: 'Bayar via aplikasi apapun' },
  { id: 'gopay', icon: '💚', label: 'GoPay', desc: 'Dompet digital GoPay' },
  { id: 'ovo', icon: '💜', label: 'OVO', desc: 'Dompet digital OVO' },
  { id: 'dana', icon: '💙', label: 'DANA', desc: 'Dompet digital DANA' },
];

export default function BookingConsultation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const consultant = location.state?.consultant;
  const { doBooking, getSlots, busy, API, bookings, refreshAll } = useApp();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [method, setMethod] = useState('video_meeting');
  const [topic, setTopic] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [err, setErr] = useState('');

  const [step, setStep] = useState('booking');
  const [bookingData, setBookingData] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [chatMsg, setChatMsg] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [zoomLink, setZoomLink] = useState('');
  const chatBottomRef = useRef(null);

  const pollRef = useRef(null);

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

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    const tok = localStorage.getItem('token');
    if (!tok) return;

    const apiBase = API;
    const consultantIdInt = parseInt(id);

    const runPoll = (bookingId, bookingMethod) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`${apiBase}/bookings/${bookingId}`, {
            headers: {
              Authorization: `Bearer ${tok}`,
              'Content-Type': 'application/json',
            },
          });
          const d = await r.json();
          if (d.status !== 'success') return;
          const bk = d.data?.booking;
          if (!bk) return;

          if (bk.status === 'rejected' || bk.status === 'cancelled') {
            clearInterval(pollRef.current);
            setRejectReason(
              bk.notes && !bk.notes.startsWith('http')
                ? bk.notes
                : 'Booking kamu ditolak oleh admin. Silakan coba booking lagi.',
            );
            setPaymentSubmitted(false);
            setRejected(true);
          } else if (bk.status === 'booked' || bk.status === 'completed') {
            clearInterval(pollRef.current);
            const isVideo = bookingMethod === 'video_meeting';
            if (isVideo && bk.notes && bk.notes.startsWith('http')) {
              setZoomLink(bk.notes);
            }
            setStep('chat');
          }
        } catch {}
      }, 3000);
    };

    fetch(`${apiBase}/bookings`, {
      headers: {
        Authorization: `Bearer ${tok}`,
        'Content-Type': 'application/json',
      },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status !== 'success') return;
        const allBookings = d.data?.bookings || [];
        const bk = allBookings.find(
          (b) => b.consultant_id === consultantIdInt && b.session_type,
        );
        if (!bk) return;

        if (bk.status === 'rejected' || bk.status === 'cancelled') {
          setBookingData({ booking: bk });
          setStep('payment');
          setPaymentSubmitted(false);
          setRejectReason(
            bk.notes && !bk.notes.startsWith('http')
              ? bk.notes
              : 'Booking kamu ditolak oleh admin. Silakan coba booking lagi.',
          );
          setRejected(true);
        } else if (bk.status === 'pending') {
          setBookingData({ booking: bk });
          setStep('payment');
          setPaymentSubmitted(true);
          setRejected(false);
          runPoll(bk.id, bk.consultation_method);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (step !== 'payment' || !paymentSubmitted || rejected) return;
    const bookingId = bookingData?.booking?.id ?? bookingData?.id;
    if (!bookingId) return;

    const bk = bookings.find((b) => b.id === bookingId);
    if (!bk) return;

    if (bk.status === 'rejected' || bk.status === 'cancelled') {
      if (pollRef.current) clearInterval(pollRef.current);
      setRejectReason(
        bk.notes && !bk.notes.startsWith('http')
          ? bk.notes
          : 'Booking kamu ditolak oleh admin. Silakan coba booking lagi.',
      );
      setPaymentSubmitted(false);
      setRejected(true);
    } else if (bk.status === 'booked' || bk.status === 'completed') {
      if (pollRef.current) clearInterval(pollRef.current);
      const isVideo = method === 'video_meeting';
      if (isVideo && bk.notes && bk.notes.startsWith('http')) {
        setZoomLink(bk.notes);
        initChatSession(bk.notes, method);
        setStep('chat');
      } else if (!isVideo) {
        initChatSession(null, method);
        setStep('chat');
      }
    }
  }, [bookings, step, paymentSubmitted, rejected]);

  const startPollingConfirmation = (bookingId, bookingMethod) => {
    const tok = localStorage.getItem('token');
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`${API}/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${tok}`,
            'Content-Type': 'application/json',
          },
        });
        const d = await r.json();
        if (d.status === 'success') {
          const bk = d.data?.booking;
          if (!bk) return;

          if (bk.status === 'rejected' || bk.status === 'cancelled') {
            clearInterval(pollRef.current);
            setRejectReason(
              bk.notes && !bk.notes.startsWith('http')
                ? bk.notes
                : 'Booking kamu ditolak oleh admin. Silakan coba booking lagi.',
            );
            setPaymentSubmitted(false);
            setRejected(true);
            return;
          }

          if (bk.status === 'booked' || bk.status === 'completed') {
            const isVideo = bookingMethod === 'video_meeting';
            if (isVideo && bk.notes && bk.notes.startsWith('http')) {
              clearInterval(pollRef.current);
              setZoomLink(bk.notes);
              initChatSession(bk.notes, bookingMethod);
              setStep('chat');
            } else if (!isVideo) {
              clearInterval(pollRef.current);
              initChatSession(null, bookingMethod);
              setStep('chat');
            }
          }
        }
      } catch {}
    }, 3000);
  };

  const initChatSession = (zLink, bookingMethod) => {
    const msgs = [
      {
        from: 'system',
        text: `Booking dikonfirmasi oleh admin! Konsultasi dengan ${consultant?.name} telah terjadwal.`,
        time: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ];
    if (bookingMethod === 'video_meeting' && zLink) {
      msgs.push({
        from: 'consultant',
        name: consultant?.name || 'Konsultan',
        text: `Halo! Saya ${consultant?.name}. Terima kasih sudah memesan sesi konsultasi. Berikut link Zoom Meeting untuk sesi kita:\n\n🔗 ${zLink}\n\nSilakan bergabung pada waktu yang sudah dijadwalkan ya: ${date} pukul ${time} WIB. Jika ada pertanyaan sebelum sesi, silakan tanya di sini.`,
        time: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        zoomLink: zLink,
      });
    } else {
      msgs.push({
        from: 'consultant',
        name: consultant?.name || 'Konsultan',
        text: `Halo! Saya ${consultant?.name}. Terima kasih sudah memesan sesi konsultasi via chat. Sesi kita dijadwalkan pada ${date} pukul ${time} WIB. Silakan mulai bertanya kapan saja, saya siap membantu! 😊`,
        time: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    }
    setChatMessages(msgs);
  };

  const submitBooking = async () => {
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
      if (d.status === 'success') {
        setBookingData(d.data);
        setStep('payment');
      } else setErr(d.message || 'Gagal booking.');
    } catch {
      setErr('Gagal terhubung ke server.');
    }
  };

  const submitPayment = async () => {
    if (!selectedPayment) return;
    setPaymentSubmitted(true);
    setRejected(false);
    const bookingId = bookingData?.booking?.id ?? bookingData?.id;
    if (bookingId) {
      try {
        const tok = localStorage.getItem('token');
        await fetch(`${API}/bookings/${bookingId}/payment`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tok}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ payment_method: selectedPayment }),
        });
      } catch {}
      startPollingConfirmation(bookingId, method);
    }
  };

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        from: 'user',
        text: chatMsg,
        time: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
    setChatMsg('');
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          from: 'consultant',
          name: consultant?.name || 'Konsultan',
          text: 'Baik, terima kasih atas pertanyaannya! Kita bisa bahas lebih dalam saat sesi nanti ya. 😊',
          time: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    }, 1200);
  };

  if (step === 'chat') {
    const zoomMsg =
      method === 'video_meeting' ? chatMessages.find((m) => m.zoomLink) : null;
    return (
      <Layout
        title="Chat Konsultasi"
        subtitle={consultant ? `Sesi dengan ${consultant.name}` : ''}
      >
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div
            style={{
              background: 'var(--green-mist)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '10px 16px',
              marginBottom: 14,
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              fontSize: 12,
              alignItems: 'center',
            }}
          >
            <span>📅 {date}</span>
            <span>🕐 {time} WIB</span>
            <span>
              {method === 'video_meeting' ? '📹 Video Meeting' : '💬 Chat'}
            </span>
            <span>⏱ 60 menit</span>
            {zoomMsg && (
              <a
                href={zoomMsg.zoomLink}
                target="_blank"
                rel="noreferrer"
                style={{
                  marginLeft: 'auto',
                  background: 'var(--ink)',
                  color: '#fff',
                  borderRadius: 7,
                  padding: '5px 13px',
                  fontSize: 11,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                🔗 Buka Zoom
              </a>
            )}
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="card-hd" style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                    color: 'var(--ink)',
                  }}
                >
                  {consultant?.name?.charAt(0) || 'K'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>
                    {consultant?.name || 'Konsultan'}
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
                    Online
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                height: 360,
                overflowY: 'auto',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                background: 'var(--paper)',
              }}
            >
              {chatMessages.map((m, i) => {
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
                          border: isUser ? 'none' : '1px solid var(--border)',
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
                    </div>
                  </div>
                );
              })}
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
                placeholder="Ketik pesan..."
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

          <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
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
      </Layout>
    );
  }

  if (step === 'payment' && rejected) {
    return (
      <Layout
        title="Booking Ditolak"
        subtitle={consultant ? `Sesi dengan ${consultant.name}` : ''}
      >
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <div className="card" style={{ border: '2px solid #fca5a5' }}>
            <div
              className="card-body"
              style={{ textAlign: 'center', padding: '40px 24px' }}
            >
              <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  marginBottom: 8,
                  color: '#b91c1c',
                }}
              >
                Booking Ditolak
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--muted)',
                  marginBottom: 24,
                  lineHeight: 1.6,
                }}
              >
                {rejectReason}
              </p>
              <div
                style={{
                  background: '#fff5f5',
                  border: '1px solid #fca5a5',
                  borderRadius: 10,
                  padding: '12px 16px',
                  fontSize: 12,
                  color: '#7f1d1d',
                  textAlign: 'left',
                  marginBottom: 24,
                }}
              >
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span>👤</span>
                  <span>
                    Konsultan: <strong>{consultant?.name}</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span>📅</span>
                  <span>
                    Jadwal:{' '}
                    <strong>
                      {date} pukul {time} WIB
                    </strong>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span>💳</span>
                  <span>
                    Metode Bayar:{' '}
                    <strong>
                      {PAYMENT_METHODS.find((p) => p.id === selectedPayment)
                        ?.label || '-'}
                    </strong>
                  </span>
                </div>
              </div>
              <button
                className="btn btn-dark btn-full"
                onClick={() => {
                  setRejected(false);
                  setRejectReason('');
                  setPaymentSubmitted(false);
                  setSelectedPayment('');
                  setStep('booking');
                }}
              >
                Coba Booking Lagi
              </button>
              <button
                className="btn btn-outline btn-full"
                style={{ marginTop: 8 }}
                onClick={() => navigate('/consultation')}
              >
                Kembali ke Daftar Konsultan
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (step === 'payment') {
    return (
      <Layout
        title="Pilih Pembayaran"
        subtitle="Selesaikan pembayaran untuk konfirmasi sesi konsultasi"
      >
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <div className="card">
            <div className="card-hd">
              <span className="card-title">Detail Sesi</span>
            </div>
            <div className="card-body">
              {[
                ['Konsultan', consultant?.name || '—'],
                ['Tanggal', date],
                ['Waktu', `${time} WIB`],
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
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border)',
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: 'var(--muted)' }}>{k}</span>
                  <strong style={{ color: 'var(--ink)' }}>{v}</strong>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--green-mist)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  marginTop: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--ink-2)',
                  }}
                >
                  Total Biaya
                </span>
                <span
                  style={{
                    fontFamily: "'Montserrat',sans-serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                >
                  Rp {Number(consultant?.rate || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {!paymentSubmitted ? (
            <>
              <div className="card">
                <div className="card-hd">
                  <span className="card-title">Pilih Metode Pembayaran</span>
                </div>
                <div
                  className="card-body"
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <label
                      key={pm.id}
                      onClick={() => setSelectedPayment(pm.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 13,
                        padding: '13px 15px',
                        border: `2px solid ${selectedPayment === pm.id ? 'var(--green-2)' : 'var(--border)'}`,
                        borderRadius: 10,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        background:
                          selectedPayment === pm.id
                            ? 'var(--green-mist)'
                            : '#fff',
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 9,
                          background: 'var(--paper)',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18,
                          flexShrink: 0,
                        }}
                      >
                        {pm.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>
                          {pm.label}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                          {pm.desc}
                        </div>
                      </div>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: `2px solid ${selectedPayment === pm.id ? 'var(--green-2)' : 'var(--border)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {selectedPayment === pm.id && (
                          <div
                            style={{
                              width: 9,
                              height: 9,
                              borderRadius: '50%',
                              background: 'var(--green-2)',
                            }}
                          />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-dark btn-full"
                onClick={submitPayment}
                disabled={!selectedPayment}
                style={{ marginTop: 4 }}
              >
                Konfirmasi Pembayaran
              </button>
              <button
                className="btn btn-outline btn-full"
                style={{ marginTop: 8 }}
                onClick={() => setStep('booking')}
              >
                Kembali
              </button>
            </>
          ) : (
            <div className="card" style={{ marginTop: 16 }}>
              <div
                className="card-body"
                style={{ textAlign: 'center', padding: '32px 20px' }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    marginBottom: 8,
                    color: 'var(--ink)',
                  }}
                >
                  Menunggu Konfirmasi
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--muted)',
                    marginBottom: 20,
                    lineHeight: 1.6,
                  }}
                >
                  Pembayaran kamu sedang diverifikasi oleh admin.
                  <br />
                  Halaman ini akan otomatis berpindah ke sesi konsultasi setelah
                  admin mengkonfirmasi.
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 6,
                    marginBottom: 20,
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: 'var(--green-2)',
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        opacity: 0.7,
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    background: 'var(--green-mist)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    fontSize: 12,
                    color: 'var(--ink-2)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span>✅</span>
                    <span>
                      Metode:{' '}
                      <strong>
                        {
                          PAYMENT_METHODS.find((p) => p.id === selectedPayment)
                            ?.label
                        }
                      </strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span>📅</span>
                    <span>
                      Jadwal:{' '}
                      <strong>
                        {date} pukul {time} WIB
                      </strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span>👤</span>
                    <span>
                      Konsultan: <strong>{consultant?.name}</strong>
                    </span>
                  </div>
                </div>
                <style>{`@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }`}</style>
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

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
                      fontFamily: "'Montserrat',sans-serif",
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
                    fontFamily: "'Montserrat',sans-serif",
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
              onClick={submitBooking}
              disabled={busy.bk || !date || !time}
            >
              {busy.bk ? (
                <>
                  <span className="spin" />
                  &ensp;Memproses...
                </>
              ) : (
                'Konfirmasi & Lanjut Bayar'
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
                {method === 'video_meeting'
                  ? 'Setelah konfirmasi, kamu akan memilih metode pembayaran. Admin akan memverifikasi dan mengirimkan link Zoom.'
                  : 'Setelah konfirmasi, kamu akan memilih metode pembayaran lalu admin akan memverifikasi dan membuka sesi chat.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
