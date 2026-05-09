import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const NAV = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'Financial Health',
    path: '/financial-health',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
      </svg>
    ),
  },
  {
    label: 'Konsultasi',
    path: '/consultation',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: 'Edukasi',
    path: '/education',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
  },
  {
    label: 'Profil',
    path: '/profile',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function Layout({ title, subtitle, children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout, lastHC, bookings } = useApp();

  const go = (path) => {
    navigate(path);
    setOpen(false);
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
  const activeBk = bookings.filter((b) => b.status === 'booked').length;
  const scColor =
    lastHC?.status === 'Sehat'
      ? '#7fbf96'
      : lastHC?.status === 'Rawan'
        ? '#f59e0b'
        : '#ef4444';

  return (
    <div className="layout">
      <div
        className={`overlay ${open ? 'show' : ''}`}
        onClick={() => setOpen(false)}
      />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-row">
            <div className="brand-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
              </svg>
            </div>
            <span className="brand-name">Smart Finance</span>
          </div>
          <div className="brand-sub">Konsultasi Keuangan Digital</div>
        </div>

        {lastHC && (
          <div className="sb-status" onClick={() => go('/financial-health')}>
            <div className="sb-status-lbl">Status Keuangan</div>
            <div className="sb-status-row">
              <span className="sb-status-name" style={{ color: scColor }}>
                {lastHC.status === 'Sehat'
                  ? '✅'
                  : lastHC.status === 'Rawan'
                    ? '⚠️'
                    : '🔴'}{' '}
                {lastHC.status}
              </span>
              <span className="sb-status-score">{lastHC.score}/100</span>
            </div>
            <div className="sb-bar">
              <div
                className="sb-fill"
                style={{ width: `${lastHC.score}%`, background: scColor }}
              />
            </div>
          </div>
        )}

        <nav className="sb-nav">
          <div className="sb-section">Menu Utama</div>
          {NAV.map((item) => (
            <button
              key={item.path}
              className={`sb-item ${pathname === item.path || pathname.startsWith(item.path + '/') ? 'active' : ''}`}
              onClick={() => go(item.path)}
            >
              {item.icon}
              {item.label}
              {item.path === '/consultation' && activeBk > 0 && (
                <span className="sb-badge">{activeBk}</span>
              )}
            </button>
          ))}
          <div className="sb-section" style={{ marginTop: 8 }}>
            Akun
          </div>
          <button className="sb-item danger" onClick={doLogout}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Keluar
          </button>
        </nav>

        <div className="sb-user">
          <div className="sb-user-inner">
            <div className="sb-avatar">{initials}</div>
            <div>
              <div className="sb-uname">{user?.name || 'Pengguna'}</div>
              <div className="sb-urole">Member</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button
            className="tb-menu"
            onClick={() => setOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              width="20"
              height="20"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="tb-title">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="tb-right">
            <span className="tb-date">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <div
              className="tb-av"
              onClick={() => go('/profile')}
              title="Profil"
            >
              {initials}
            </div>
          </div>
        </header>
        <main className="page">{children}</main>
      </div>
    </div>
  );
}
