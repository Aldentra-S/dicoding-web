import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API =
  (import.meta.env.VITE_API_URL ||
    'https://dicoding-web-production.up.railway.app/api/admin') + '/admin';

function apiFetch(path, tok, opts = {}) {
  return fetch(API + path, {
    ...opts,
    headers: {
      Authorization: `Bearer ${tok}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  }).then((r) => r.json());
}

const rp = (v) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`;

const NAV = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'users', icon: '👥', label: 'Pengguna' },
  { id: 'bookings', icon: '📅', label: 'Booking' },
  { id: 'consultants', icon: '🧑‍💼', label: 'Konsultan' },
  { id: 'health', icon: '💚', label: 'Health Checks' },
  { id: 'settings', icon: '⚙️', label: 'Pengaturan' },
];

const BK_STATUS = ['booked', 'completed', 'cancelled', 'pending'];
const BK_COLORS = {
  booked: ['#dbeafe', '#1d4ed8', 'Terjadwal'],
  completed: ['#dcfce7', '#166534', 'Selesai'],
  cancelled: ['#f3f4f6', '#374151', 'Dibatalkan'],
  pending: ['#fef3c7', '#854d0e', 'Pending'],
};

const isExpired = (b) => {
  if (b.status !== 'booked') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDate = new Date(b.booking_date);
  bookingDate.setHours(0, 0, 0, 0);
  return bookingDate < today;
};

const resolveStatus = (b) => (isExpired(b) ? 'completed' : b.status);

const StatusBadge = ({ b }) => {
  const s = resolveStatus(b);
  const [bg, col, lbl] = BK_COLORS[s] || ['#f3f4f6', '#374151', s];
  return (
    <span
      style={{
        background: bg,
        color: col,
        fontSize: 10,
        fontWeight: 700,
        borderRadius: 6,
        padding: '3px 8px',
      }}
    >
      {lbl}
    </span>
  );
};

const Modal = ({ title, onClose, children, width = 480 }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      padding: 16,
    }}
  >
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '26px 24px',
        width,
        maxWidth: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,.3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 20,
            cursor: 'pointer',
            color: 'var(--muted)',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
      {children}
    </div>
  </div>
);

const FG = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label
      style={{
        display: 'block',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--ink-2)',
        marginBottom: 5,
      }}
    >
      {label}
    </label>
    {children}
  </div>
);

const Input = ({
  value,
  onChange,
  type = 'text',
  placeholder = '',
  disabled = false,
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    style={{
      width: '100%',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '9px 12px',
      fontSize: 13,
      outline: 'none',
      fontFamily: 'inherit',
      background: disabled ? 'var(--paper)' : '#fff',
    }}
  />
);

const BtnRow = ({ children }) => (
  <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>{children}</div>
);

const Btn = ({
  children,
  onClick,
  variant = 'dark',
  disabled = false,
  style: s = {},
}) => {
  const styles = {
    dark: { background: 'var(--ink)', color: '#fff' },
    outline: {
      background: 'transparent',
      border: '1px solid var(--border)',
      color: 'var(--ink)',
    },
    red: {
      background: '#fee2e2',
      color: '#b91c1c',
      border: '1px solid #fca5a5',
    },
    green: { background: 'var(--green-2)', color: '#fff' },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        borderRadius: 9,
        padding: '10px',
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        opacity: disabled ? 0.5 : 1,
        ...styles[variant],
        ...s,
      }}
    >
      {children}
    </button>
  );
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const [tok, setTok] = useState(
    () => localStorage.getItem('admin_token') || '',
  );
  const [authed, setAuthed] = useState(
    () => !!localStorage.getItem('admin_token'),
  );
  const [loginForm, setLoginForm] = useState({
    email: 'admin@smartfinance.id',
    password: '',
  });
  const [loginErr, setLoginErr] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [page, setPage] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);

  const [bkFilter, setBkFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [csSearch, setCsSearch] = useState('');

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const doLogin = async () => {
    setLoginLoading(true);
    setLoginErr('');
    try {
      const d = await fetch(API + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      }).then((r) => r.json());
      if (d.status === 'success') {
        localStorage.setItem('admin_token', d.token);
        setTok(d.token);
        setAuthed(true);
      } else {
        setLoginErr(d.message || 'Login gagal.');
      }
    } catch {
      setLoginErr('Tidak dapat terhubung ke server.');
    }
    setLoginLoading(false);
  };

  const doLogout = () => {
    localStorage.removeItem('admin_token');
    setAuthed(false);
    setTok('');
  };

  const fetchStats = useCallback(async () => {
    try {
      const d = await apiFetch('/stats', tok);
      if (d.status === 'success') setStats(d.data);
    } catch {}
  }, [tok]);

  const fetchUsers = useCallback(async () => {
    try {
      const d = await apiFetch('/users', tok);
      if (d.status === 'success') setUsers(d.data.users || []);
    } catch {}
  }, [tok]);

  const fetchBookings = useCallback(async () => {
    try {
      const d = await apiFetch('/bookings', tok);
      if (d.status === 'success') setBookings(d.data.bookings || []);
    } catch {}
  }, [tok]);

  const fetchConsultants = useCallback(async () => {
    try {
      const d = await apiFetch('/consultants', tok);
      if (d.status === 'success') setConsultants(d.data.consultants || []);
    } catch {}
  }, [tok]);

  const fetchHealth = useCallback(async () => {
    try {
      const d = await apiFetch('/health-checks', tok);
      if (d.status === 'success') setHealthChecks(d.data.health_checks || []);
    } catch {}
  }, [tok]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([
      fetchStats(),
      fetchUsers(),
      fetchBookings(),
      fetchConsultants(),
      fetchHealth(),
    ]);
    setLoading(false);
  }, [fetchStats, fetchUsers, fetchBookings, fetchConsultants, fetchHealth]);

  useEffect(() => {
    if (authed) fetchAll();
  }, [authed, fetchAll]);

  const openModal = (type, data = {}) => {
    setModal(type);
    setForm({ ...data });
  };
  const closeModal = () => {
    setModal(null);
    setForm({});
  };

  const handleSaveUser = async () => {
    setSaving(true);
    try {
      const d = await apiFetch(`/users/${form.id}`, tok, {
        method: 'PATCH',
        body: { name: form.name, email: form.email, phone: form.phone },
      });
      if (d.status === 'success') {
        showToast('User berhasil diperbarui.');
        await fetchUsers();
        closeModal();
      } else showToast(d.message, 'err');
    } catch {
      showToast('Gagal menyimpan.', 'err');
    }
    setSaving(false);
  };

  const handleDeleteUser = async (id) => {
    setSaving(true);
    try {
      const d = await apiFetch(`/users/${id}`, tok, { method: 'DELETE' });
      if (d.status === 'success') {
        showToast('User berhasil dihapus.');
        await fetchUsers();
        setDelConfirm(null);
      } else showToast(d.message, 'err');
    } catch {
      showToast('Gagal menghapus.', 'err');
    }
    setSaving(false);
  };

  const handleUpdateBkStatus = async (id, status) => {
    try {
      const d = await apiFetch(`/bookings/${id}/status`, tok, {
        method: 'PATCH',
        body: { status },
      });
      if (d.status === 'success') {
        showToast('Status booking diperbarui.');
        await fetchBookings();
        closeModal();
      } else showToast(d.message, 'err');
    } catch {
      showToast('Gagal update status.', 'err');
    }
  };

  const handleSendZoom = async () => {
    if (!form.zoom_link) return;
    setSaving(true);
    try {
      const d = await apiFetch(`/bookings/${form.id}/zoom`, tok, {
        method: 'POST',
        body: { zoom_link: form.zoom_link },
      });
      if (d.status === 'success') {
        showToast('Link Zoom berhasil dikirim!');
        await fetchBookings();
        closeModal();
      } else showToast(d.message, 'err');
    } catch {
      showToast('Gagal mengirim.', 'err');
    }
    setSaving(false);
  };

  const handleSaveConsultant = async () => {
    setSaving(true);
    try {
      const isEdit = !!form.id;
      const body = {
        name: form.name,
        specialization: form.specialization,
        bio: form.bio,
        photo_url: form.photo_url,
        experience_years: Number(form.experience_years || 0),
        rate: Number(form.rate || 0),
        rating: Number(form.rating || 5.0),
        is_available: form.is_available !== false,
      };
      const d = isEdit
        ? await apiFetch(`/consultants/${form.id}`, tok, {
            method: 'PATCH',
            body,
          })
        : await apiFetch('/consultants', tok, { method: 'POST', body });
      if (d.status === 'success') {
        showToast(isEdit ? 'Konsultan diperbarui.' : 'Konsultan ditambahkan.');
        await fetchConsultants();
        closeModal();
      } else showToast(d.message, 'err');
    } catch {
      showToast('Gagal menyimpan.', 'err');
    }
    setSaving(false);
  };

  const handleDeleteConsultant = async (id) => {
    setSaving(true);
    try {
      const d = await apiFetch(`/consultants/${id}`, tok, { method: 'DELETE' });
      if (d.status === 'success') {
        showToast('Konsultan dihapus.');
        await fetchConsultants();
        setDelConfirm(null);
      } else showToast(d.message, 'err');
    } catch {
      showToast('Gagal menghapus.', 'err');
    }
    setSaving(false);
  };

  const sf = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const filteredUsers = users.filter(
    (u) =>
      !userSearch ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()),
  );
  const filteredCs = consultants.filter(
    (c) =>
      !csSearch ||
      c.name?.toLowerCase().includes(csSearch.toLowerCase()) ||
      c.specialization?.toLowerCase().includes(csSearch.toLowerCase()),
  );

  const visibleBookings = bkFilter
    ? bookings.filter((b) => resolveStatus(b) === bkFilter)
    : bookings;
  const completedBookings = bookings.filter(
    (b) => resolveStatus(b) === 'completed',
  );
  const computedRevenue = completedBookings.reduce(
    (sum, b) => sum + Number(b.total_fee || 0),
    0,
  );
  const paidCompletedCount = completedBookings.filter(
    (b) => Number(b.total_fee || 0) > 0,
  ).length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const activeBookingCount = bookings.filter(
    (b) => resolveStatus(b) === 'booked',
  ).length;

  if (!authed)
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Montserrat',sans-serif",
          padding: 16,
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: '36px 32px',
            width: 380,
            maxWidth: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,.3)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                width: 52,
                height: 52,
                background:
                  'linear-gradient(135deg,var(--green-lt),var(--green-3))',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                margin: '0 auto 12px',
              }}
            >
              🛡️
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>
              Admin Panel
            </h1>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              Smart Finance Management System
            </p>
          </div>
          {loginErr && (
            <div
              style={{
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: 8,
                padding: '9px 12px',
                marginBottom: 14,
                fontSize: 12,
                color: '#b91c1c',
              }}
            >
              {loginErr}
            </div>
          )}
          <FG label="Email Admin">
            <Input
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm((p) => ({ ...p, email: e.target.value }))
              }
              type="email"
              placeholder="admin@smartfinance.id"
            />
          </FG>
          <FG label="Password">
            <Input
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((p) => ({ ...p, password: e.target.value }))
              }
              type="password"
              placeholder="••••••••"
            />
          </FG>
          <button
            onKeyDown={(e) => e.key === 'Enter' && doLogin()}
            onClick={doLogin}
            disabled={loginLoading}
            style={{
              width: '100%',
              background: 'var(--ink)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            {loginLoading ? 'Memproses...' : 'Masuk sebagai Admin'}
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '10px',
              fontSize: 12,
              color: 'var(--muted)',
              cursor: 'pointer',
              marginTop: 8,
            }}
          >
            ← Kembali ke Aplikasi
          </button>
          <p
            style={{
              fontSize: 10,
              color: 'var(--muted)',
              textAlign: 'center',
              marginTop: 14,
            }}
          >
            Default: admin@smartfinance.id / Admin123!
          </p>
        </div>
      </div>
    );

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: "'Montserrat',sans-serif",
        background: 'var(--paper)',
      }}
    >
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: toast.type === 'err' ? '#fee2e2' : '#dcfce7',
            color: toast.type === 'err' ? '#b91c1c' : '#166534',
            border: `1px solid ${toast.type === 'err' ? '#fca5a5' : '#86efac'}`,
            borderRadius: 10,
            padding: '12px 18px',
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(0,0,0,.15)',
            maxWidth: 320,
          }}
        >
          {toast.msg}
        </div>
      )}

      <aside
        style={{
          width: 220,
          background: 'var(--ink)',
          position: 'fixed',
          inset: '0 auto 0 0',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 300,
        }}
      >
        <div
          style={{
            padding: '20px 16px 15px',
            borderBottom: '1px solid rgba(255,255,255,.07)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              marginBottom: 2,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                background:
                  'linear-gradient(135deg,var(--green-lt),var(--green-3))',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              🛡️
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
              Admin Panel
            </span>
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,.28)',
              paddingLeft: 39,
            }}
          >
            Smart Finance
          </div>
        </div>
        <nav
          style={{
            flex: 1,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,.22)',
              padding: '7px 10px 3px',
            }}
          >
            Menu
          </div>
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '9px 10px',
                borderRadius: 8,
                border: 'none',
                background:
                  page === item.id ? 'rgba(127,191,150,.14)' : 'transparent',
                color:
                  page === item.id
                    ? 'var(--green-lt)'
                    : 'rgba(255,255,255,.55)',
                borderLeft:
                  page === item.id
                    ? '3px solid var(--green-lt)'
                    : '3px solid transparent',
                paddingLeft: page === item.id ? 7 : 10,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: page === item.id ? 700 : 500,
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div
          style={{
            padding: '10px',
            borderTop: '1px solid rgba(255,255,255,.07)',
          }}
        >
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 10px',
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              color: 'rgba(255,255,255,.4)',
              cursor: 'pointer',
              fontSize: 12,
              width: '100%',
              marginBottom: 4,
            }}
          >
            ← Lihat Aplikasi
          </button>
          <button
            onClick={doLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 10px',
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: 12,
              width: '100%',
            }}
          >
            🚪 Keluar
          </button>
        </div>
      </aside>

      <div style={{ marginLeft: 220, flex: 1, padding: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 22,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              {NAV.find((n) => n.id === page)?.label}
            </h1>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={fetchAll}
            style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 9,
              padding: '8px 14px',
              fontSize: 12,
              cursor: 'pointer',
              color: 'var(--ink)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {loading ? '...' : '🔄 Refresh'}
          </button>
        </div>

        {page === 'dashboard' && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))',
                gap: 14,
                marginBottom: 20,
              }}
            >
              {[
                [
                  '👥',
                  'Total Pengguna',
                  stats.total_users ?? '—',
                  'Terdaftar',
                  'var(--ink)',
                ],
                [
                  '📅',
                  'Total Booking',
                  stats.total_bookings ?? '—',
                  `${activeBookingCount} aktif`,
                  'var(--ink)',
                ],
                [
                  '🧑‍💼',
                  'Konsultan',
                  stats.total_consultants ?? '—',
                  'Aktif',
                  'var(--ink)',
                ],
                [
                  '💚',
                  'Health Checks',
                  stats.total_health_checks ?? '—',
                  'Dilakukan',
                  'var(--ink)',
                ],
                [
                  '💰',
                  'Revenue',
                  rp(computedRevenue),
                  `${paidCompletedCount} sesi selesai`,
                  'var(--green-2)',
                ],
                [
                  '⏳',
                  'Booking Pending',
                  stats.pending ?? pendingCount,
                  'Perlu konfirmasi',
                  '#d97706',
                ],
              ].map(([ic, lbl, val, sub, col]) => (
                <div
                  key={lbl}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '16px 18px',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'var(--green-mist)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {ic}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--muted)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 2,
                      }}
                    >
                      {lbl}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Montserrat',sans-serif",
                        fontSize: 20,
                        fontWeight: 700,
                        color: col,
                        lineHeight: 1,
                      }}
                    >
                      {val}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        marginTop: 1,
                      }}
                    >
                      {sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
              }}
            >
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '18px 20px',
                }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
                  Booking Terbaru
                </h3>
                {bookings.slice(0, 6).map((b, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border)',
                      fontSize: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {b.user_name || `User #${b.user_id}`}
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: 11 }}>
                        {b.booking_date} {b.booking_time} — {b.consultant_name}
                      </div>
                    </div>
                    <StatusBadge b={b} />
                  </div>
                ))}
                {bookings.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                    Belum ada booking.
                  </p>
                )}
              </div>
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '18px 20px',
                }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
                  Distribusi Status Booking
                </h3>
                {BK_STATUS.map((s) => {
                  const count = bookings.filter(
                    (b) => resolveStatus(b) === s,
                  ).length;
                  const pct = bookings.length
                    ? Math.round((count / bookings.length) * 100)
                    : 0;
                  const [, col] = BK_COLORS[s] || ['#f3f4f6', '#374151'];
                  return (
                    <div key={s} style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}
                        >
                          {s}
                        </span>
                        <span style={{ color: 'var(--muted)' }}>
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: 'var(--border)',
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: col,
                            borderRadius: 3,
                            transition: 'width 0.6s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {page === 'users' && (
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                Pengguna ({filteredUsers.length})
              </span>
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Cari nama / email..."
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '7px 12px',
                  fontSize: 12,
                  outline: 'none',
                  width: 220,
                }}
              />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 12,
                }}
              >
                <thead style={{ background: 'var(--paper)' }}>
                  <tr>
                    {[
                      'ID',
                      'Nama',
                      'Email',
                      'Telepon',
                      'Booking',
                      'Health Checks',
                      'Bergabung',
                      'Aksi',
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '10px 14px',
                          textAlign: 'left',
                          fontWeight: 700,
                          color: 'var(--muted)',
                          fontSize: 10,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      <td
                        style={{ padding: '10px 14px', color: 'var(--muted)' }}
                      >
                        #{u.id}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                        {u.name}
                      </td>
                      <td
                        style={{ padding: '10px 14px', color: 'var(--muted)' }}
                      >
                        {u.email}
                      </td>
                      <td
                        style={{ padding: '10px 14px', color: 'var(--muted)' }}
                      >
                        {u.phone || '—'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          style={{
                            background: 'var(--blue-lt)',
                            color: 'var(--blue)',
                            borderRadius: 6,
                            padding: '2px 7px',
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        >
                          {u.total_bookings}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          style={{
                            background: 'var(--green-mist)',
                            color: 'var(--green-2)',
                            borderRadius: 6,
                            padding: '2px 7px',
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        >
                          {u.total_health_checks}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '10px 14px',
                          color: 'var(--muted)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString('id-ID')
                          : '—'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => openModal('editUser', { ...u })}
                            style={{
                              background: 'var(--ink)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '4px 10px',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setDelConfirm({
                                type: 'user',
                                id: u.id,
                                name: u.name,
                              })
                            }
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: '1px solid #fca5a5',
                              borderRadius: 6,
                              padding: '4px 10px',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div
                  style={{
                    padding: 32,
                    textAlign: 'center',
                    color: 'var(--muted)',
                    fontSize: 13,
                  }}
                >
                  Tidak ada pengguna ditemukan.
                </div>
              )}
            </div>
          </div>
        )}

        {page === 'bookings' && (
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                Semua Booking ({visibleBookings.length})
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <select
                  value={bkFilter}
                  onChange={(e) => setBkFilter(e.target.value)}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '7px 12px',
                    fontSize: 12,
                    outline: 'none',
                  }}
                >
                  <option value="">Semua Status</option>
                  {BK_STATUS.map((s) => (
                    <option
                      key={s}
                      value={s}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {BK_COLORS[s]?.[2] || s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 12,
                }}
              >
                <thead style={{ background: 'var(--paper)' }}>
                  <tr>
                    {[
                      'ID',
                      'Pengguna',
                      'Konsultan',
                      'Tanggal',
                      'Waktu',
                      'Metode',
                      'Total Fee',
                      'Status',
                      'Aksi',
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '10px 14px',
                          textAlign: 'left',
                          fontWeight: 700,
                          color: 'var(--muted)',
                          fontSize: 10,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleBookings.map((b) => {
                    const expired = isExpired(b);
                    return (
                      <tr
                        key={b.id}
                        style={{ borderTop: '1px solid var(--border)' }}
                      >
                        <td
                          style={{
                            padding: '10px 14px',
                            color: 'var(--muted)',
                          }}
                        >
                          #{b.id}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 600 }}>
                            {b.user_name || `User #${b.user_id}`}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                            {b.user_email}
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 600 }}>
                            {b.consultant_name}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                            {b.specialization}
                          </div>
                        </td>
                        <td
                          style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}
                        >
                          {b.booking_date}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {b.booking_time}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {b.consultation_method === 'video_meeting'
                            ? '📹 Video'
                            : '💬 Chat'}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700 }}>
                          {rp(b.total_fee)}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <StatusBadge b={b} />
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div
                            style={{
                              display: 'flex',
                              gap: 5,
                              flexWrap: 'wrap',
                            }}
                          >
                            {!expired && (
                              <button
                                onClick={() =>
                                  openModal('editBooking', { ...b })
                                }
                                style={{
                                  background: 'var(--ink)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '4px 10px',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Edit
                              </button>
                            )}
                            {b.consultation_method === 'video_meeting' &&
                              !expired && (
                                <button
                                  onClick={() =>
                                    openModal('sendZoom', {
                                      id: b.id,
                                      zoom_link: `https://zoom.us/j/${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
                                      bk: b,
                                    })
                                  }
                                  style={{
                                    background: '#dbeafe',
                                    color: '#1d4ed8',
                                    border: '1px solid #93c5fd',
                                    borderRadius: 6,
                                    padding: '4px 10px',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  🔗 Zoom
                                </button>
                              )}
                            {expired && (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: 'var(--muted)',
                                  fontStyle: 'italic',
                                }}
                              >
                                Selesai
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {visibleBookings.length === 0 && (
                <div
                  style={{
                    padding: 32,
                    textAlign: 'center',
                    color: 'var(--muted)',
                    fontSize: 13,
                  }}
                >
                  Tidak ada booking.
                </div>
              )}
            </div>
          </div>
        )}

        {page === 'consultants' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <input
                value={csSearch}
                onChange={(e) => setCsSearch(e.target.value)}
                placeholder="Cari konsultan / spesialisasi..."
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '8px 13px',
                  fontSize: 12,
                  outline: 'none',
                  width: 240,
                }}
              />
              <button
                onClick={() =>
                  openModal('addConsultant', {
                    name: '',
                    specialization: '',
                    bio: '',
                    photo_url: '',
                    experience_years: 1,
                    rate: 200000,
                    rating: 5.0,
                    is_available: true,
                  })
                }
                style={{
                  background: 'var(--ink)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 9,
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                + Tambah Konsultan
              </button>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
                gap: 14,
              }}
            >
              {filteredCs.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: '50%',
                        background:
                          'linear-gradient(135deg,var(--green-lt),var(--green-3))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        fontWeight: 800,
                        overflow: 'hidden',
                        flexShrink: 0,
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
                        c.name?.charAt(0) || 'K'
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {c.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {c.specialization}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        background: c.is_available ? '#dcfce7' : '#fee2e2',
                        color: c.is_available ? '#166534' : '#b91c1c',
                        borderRadius: 6,
                        padding: '2px 7px',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {c.is_available ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      flexWrap: 'wrap',
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        background: '#fef3c7',
                        color: '#854d0e',
                        fontSize: 11,
                        borderRadius: 6,
                        padding: '2px 7px',
                        fontWeight: 600,
                      }}
                    >
                      ⭐ {c.rating}
                    </span>
                    <span
                      style={{
                        background: 'var(--green-mist)',
                        color: 'var(--green-2)',
                        fontSize: 11,
                        borderRadius: 6,
                        padding: '2px 7px',
                        fontWeight: 600,
                      }}
                    >
                      {c.experience_years} thn
                    </span>
                    <span
                      style={{
                        background: 'var(--paper)',
                        border: '1px solid var(--border)',
                        fontSize: 11,
                        borderRadius: 6,
                        padding: '2px 7px',
                        fontWeight: 600,
                      }}
                    >
                      {rp(c.rate)}/sesi
                    </span>
                  </div>
                  {c.bio && (
                    <p
                      style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        marginBottom: 10,
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {c.bio}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => openModal('editConsultant', { ...c })}
                      style={{
                        flex: 1,
                        background: 'var(--ink)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 7,
                        padding: '7px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setDelConfirm({
                          type: 'consultant',
                          id: c.id,
                          name: c.name,
                        })
                      }
                      style={{
                        flex: 1,
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fca5a5',
                        borderRadius: 7,
                        padding: '7px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
              {filteredCs.length === 0 && (
                <div
                  style={{
                    padding: 32,
                    textAlign: 'center',
                    color: 'var(--muted)',
                    fontSize: 13,
                    gridColumn: '1/-1',
                  }}
                >
                  Tidak ada konsultan.
                </div>
              )}
            </div>
          </div>
        )}

        {page === 'health' && (
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                Riwayat Health Check ({healthChecks.length})
              </span>
              <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                {['Sehat', 'Rawan', 'Kritis'].map((s) => {
                  const count = healthChecks.filter(
                    (h) => h.status === s,
                  ).length;
                  const cls =
                    s === 'Sehat'
                      ? ['#dcfce7', '#166534']
                      : s === 'Rawan'
                        ? ['#fef3c7', '#854d0e']
                        : ['#fee2e2', '#b91c1c'];
                  return (
                    <span
                      key={s}
                      style={{
                        background: cls[0],
                        color: cls[1],
                        borderRadius: 7,
                        padding: '3px 10px',
                        fontWeight: 700,
                        fontSize: 11,
                      }}
                    >
                      {s}: {count}
                    </span>
                  );
                })}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 12,
                }}
              >
                <thead style={{ background: 'var(--paper)' }}>
                  <tr>
                    {[
                      'Pengguna',
                      'Pendapatan/bln',
                      'Pengeluaran/bln',
                      'Cicilan/bln',
                      'Dana Darurat',
                      'DTI',
                      'EIR',
                      'Skor',
                      'Status',
                      'Tanggal',
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '10px 12px',
                          textAlign: 'left',
                          fontWeight: 700,
                          color: 'var(--muted)',
                          fontSize: 10,
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {healthChecks.map((h) => (
                    <tr
                      key={h.id}
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      <td style={{ padding: '9px 12px' }}>
                        <div style={{ fontWeight: 600 }}>{h.user_name}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                          {h.user_email}
                        </div>
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        {rp(h.monthly_income)}
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        {rp(h.monthly_expenses)}
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        {rp(h.monthly_debt_payment)}
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        {rp(h.emergency_fund)}
                      </td>
                      <td style={{ padding: '9px 12px', fontWeight: 700 }}>
                        {h.debt_to_income_ratio}%
                      </td>
                      <td style={{ padding: '9px 12px', fontWeight: 700 }}>
                        {h.expense_to_income_ratio}%
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        <span
                          style={{
                            fontFamily: "'Montserrat',sans-serif",
                            fontSize: 15,
                            fontWeight: 700,
                          }}
                        >
                          {h.score}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                          /100
                        </span>
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        <span
                          style={{
                            background:
                              h.status === 'Sehat'
                                ? '#dcfce7'
                                : h.status === 'Rawan'
                                  ? '#fef3c7'
                                  : '#fee2e2',
                            color:
                              h.status === 'Sehat'
                                ? '#166534'
                                : h.status === 'Rawan'
                                  ? '#854d0e'
                                  : '#b91c1c',
                            borderRadius: 6,
                            padding: '2px 8px',
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          {h.status}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '9px 12px',
                          color: 'var(--muted)',
                          whiteSpace: 'nowrap',
                          fontSize: 11,
                        }}
                      >
                        {new Date(h.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {healthChecks.length === 0 && (
                <div
                  style={{
                    padding: 32,
                    textAlign: 'center',
                    color: 'var(--muted)',
                    fontSize: 13,
                  }}
                >
                  Belum ada data health check.
                </div>
              )}
            </div>
          </div>
        )}

        {page === 'settings' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <div
              style={{
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14 }}>
                  Informasi Admin
                </span>
              </div>
              <div style={{ padding: 18 }}>
                {[
                  ['Email Admin', 'admin@smartfinance.id'],
                  [
                    'API Base URL',
                    import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
                  ],
                  ['Versi', 'v1.0.0'],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '11px 0',
                      borderBottom: '1px solid var(--border)',
                      fontSize: 13,
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ color: 'var(--muted)', flexShrink: 0 }}>
                      {k}
                    </span>
                    <code
                      style={{
                        color: 'var(--ink)',
                        fontSize: 12,
                        background: 'var(--paper)',
                        padding: '2px 7px',
                        borderRadius: 5,
                        wordBreak: 'break-all',
                      }}
                    >
                      {v}
                    </code>
                  </div>
                ))}
                <div style={{ marginTop: 18 }}>
                  <button
                    onClick={doLogout}
                    style={{
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: '1px solid #fca5a5',
                      borderRadius: 9,
                      padding: '10px 20px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    🚪 Keluar dari Admin
                  </button>
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14 }}>
                  Endpoint API Admin
                </span>
              </div>
              <div style={{ padding: '4px 18px 14px' }}>
                {[
                  ['GET /admin/stats', 'Statistik dashboard'],
                  ['GET /admin/users', 'Daftar semua user'],
                  ['PATCH /admin/users/:id', 'Edit user'],
                  ['DELETE /admin/users/:id', 'Hapus user'],
                  ['GET /admin/bookings', 'Semua booking'],
                  ['PATCH /admin/bookings/:id/status', 'Update status booking'],
                  ['POST /admin/bookings/:id/zoom', 'Kirim link Zoom'],
                  ['GET /admin/health-checks', 'Semua health check'],
                  ['GET /admin/consultants', 'Semua konsultan'],
                  ['POST /admin/consultants', 'Tambah konsultan'],
                  ['PATCH /admin/consultants/:id', 'Edit konsultan'],
                  ['DELETE /admin/consultants/:id', 'Hapus konsultan'],
                ].map(([ep, desc]) => (
                  <div
                    key={ep}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border)',
                      fontSize: 11,
                      gap: 10,
                    }}
                  >
                    <code
                      style={{
                        color: 'var(--green-2)',
                        fontFamily: 'monospace',
                        flexShrink: 0,
                        fontSize: 11,
                      }}
                    >
                      {ep}
                    </code>
                    <span style={{ color: 'var(--muted)', textAlign: 'right' }}>
                      {desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {modal === 'editUser' && (
        <Modal title={`Edit User: ${form.name}`} onClose={closeModal}>
          <FG label="Nama">
            <Input value={form.name || ''} onChange={sf('name')} />
          </FG>
          <FG label="Email">
            <Input
              value={form.email || ''}
              onChange={sf('email')}
              type="email"
            />
          </FG>
          <FG label="Telepon">
            <Input value={form.phone || ''} onChange={sf('phone')} />
          </FG>
          <FG label="Total Booking">
            <Input
              value={form.total_bookings ?? ''}
              onChange={() => {}}
              disabled
            />
          </FG>
          <BtnRow>
            <Btn onClick={handleSaveUser} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Btn>
            <Btn variant="outline" onClick={closeModal}>
              Batal
            </Btn>
          </BtnRow>
        </Modal>
      )}

      {modal === 'editBooking' && (
        <Modal title={`Edit Booking #${form.id}`} onClose={closeModal}>
          <FG label="Pengguna">
            <Input value={form.user_name || ''} disabled />
          </FG>
          <FG label="Konsultan">
            <Input value={form.consultant_name || ''} disabled />
          </FG>
          <FG label="Tanggal & Waktu">
            <Input
              value={`${form.booking_date || ''} ${form.booking_time || ''}`}
              disabled
            />
          </FG>
          <FG label="Topik">
            <textarea
              value={form.topic || ''}
              readOnly
              style={{
                width: '100%',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '9px 12px',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
                minHeight: 80,
                resize: 'vertical',
                background: 'var(--paper)',
              }}
            />
          </FG>
          <FG label="Ubah Status">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {BK_STATUS.map((s) => {
                const [bg, col, lbl] = BK_COLORS[s];
                return (
                  <button
                    key={s}
                    onClick={() => handleUpdateBkStatus(form.id, s)}
                    style={{
                      background: form.status === s ? col : bg,
                      color: form.status === s ? '#fff' : col,
                      border: `1px solid ${col}`,
                      borderRadius: 7,
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {lbl}
                  </button>
                );
              })}
            </div>
          </FG>
          <BtnRow>
            <Btn variant="outline" onClick={closeModal}>
              Tutup
            </Btn>
          </BtnRow>
        </Modal>
      )}

      {modal === 'sendZoom' && (
        <Modal title="Kirim Link Zoom Meeting" onClose={closeModal}>
          <div
            style={{
              background: 'var(--green-mist)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 14,
              fontSize: 12,
              color: 'var(--ink-3)',
            }}
          >
            📅 Booking #{form.id} — {form.bk?.user_name} dengan{' '}
            {form.bk?.consultant_name}
            <br />
            {form.bk?.booking_date} pukul {form.bk?.booking_time} WIB
          </div>
          <FG label="Link Zoom Meeting">
            <Input
              value={form.zoom_link || ''}
              onChange={sf('zoom_link')}
              placeholder="https://zoom.us/j/..."
            />
          </FG>
          <BtnRow>
            <Btn onClick={handleSendZoom} disabled={saving || !form.zoom_link}>
              {saving ? 'Mengirim...' : '🔗 Kirim ke User'}
            </Btn>
            <Btn variant="outline" onClick={closeModal}>
              Batal
            </Btn>
          </BtnRow>
        </Modal>
      )}

      {(modal === 'addConsultant' || modal === 'editConsultant') && (
        <Modal
          title={
            modal === 'addConsultant'
              ? 'Tambah Konsultan Baru'
              : `Edit: ${form.name}`
          }
          onClose={closeModal}
          width={540}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0 14px',
            }}
          >
            <FG label="Nama Lengkap">
              <Input
                value={form.name || ''}
                onChange={sf('name')}
                placeholder="Dr. Budi Santoso"
              />
            </FG>
            <FG label="Spesialisasi">
              <Input
                value={form.specialization || ''}
                onChange={sf('specialization')}
                placeholder="Perencanaan Keuangan"
              />
            </FG>
            <FG label="Pengalaman (tahun)">
              <Input
                value={form.experience_years || ''}
                onChange={sf('experience_years')}
                type="number"
              />
            </FG>
            <FG label="Rate per Sesi (Rp)">
              <Input
                value={form.rate || ''}
                onChange={sf('rate')}
                type="number"
              />
            </FG>
            <FG label="Rating (1-5)">
              <Input
                value={form.rating || ''}
                onChange={sf('rating')}
                type="number"
              />
            </FG>
            <FG label="Status">
              <select
                value={form.is_available ? 'true' : 'false'}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    is_available: e.target.value === 'true',
                  }))
                }
                style={{
                  width: '100%',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              >
                <option value="true">Aktif / Tersedia</option>
                <option value="false">Nonaktif</option>
              </select>
            </FG>
          </div>
          <FG label="URL Foto (opsional)">
            <Input
              value={form.photo_url || ''}
              onChange={sf('photo_url')}
              placeholder="https://..."
            />
          </FG>
          <FG label="Bio / Deskripsi">
            <textarea
              value={form.bio || ''}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Pengalaman dan keahlian konsultan..."
              style={{
                width: '100%',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '9px 12px',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
                minHeight: 90,
                resize: 'vertical',
              }}
            />
          </FG>
          <BtnRow>
            <Btn onClick={handleSaveConsultant} disabled={saving}>
              {saving
                ? 'Menyimpan...'
                : modal === 'addConsultant'
                  ? 'Tambahkan'
                  : 'Simpan Perubahan'}
            </Btn>
            <Btn variant="outline" onClick={closeModal}>
              Batal
            </Btn>
          </BtnRow>
        </Modal>
      )}

      {delConfirm && (
        <Modal
          title="Konfirmasi Hapus"
          onClose={() => setDelConfirm(null)}
          width={380}
        >
          <p
            style={{
              fontSize: 14,
              color: 'var(--ink-2)',
              marginBottom: 18,
              lineHeight: 1.6,
            }}
          >
            Apakah kamu yakin ingin menghapus <strong>{delConfirm.name}</strong>
            ?
            {delConfirm.type === 'user' &&
              ' Semua data booking dan health check milik user ini juga akan dihapus.'}
            {delConfirm.type === 'consultant' &&
              ' Tindakan ini tidak bisa dibatalkan.'}
          </p>
          <BtnRow>
            <Btn
              variant="red"
              onClick={() =>
                delConfirm.type === 'user'
                  ? handleDeleteUser(delConfirm.id)
                  : handleDeleteConsultant(delConfirm.id)
              }
              disabled={saving}
            >
              {saving ? 'Menghapus...' : 'Ya, Hapus'}
            </Btn>
            <Btn variant="outline" onClick={() => setDelConfirm(null)}>
              Batal
            </Btn>
          </BtnRow>
        </Modal>
      )}
    </div>
  );
}
