import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import hideIcon from '../assets/hide.png';
import viewIcon from '../assets/view.png';
import './style.css';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [lf, setLf] = useState({ email: '', password: '' });
  const [rf, setRf] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();
  const { login, register } = useApp();

  const doLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const d = await login(lf.email, lf.password);
      if (d.status === 'success') navigate('/dashboard');
      else setErr(d.message || 'Email atau password salah.');
    } catch {
      setErr(
        'Tidak dapat terhubung ke server. Pastikan Back-End sudah berjalan di port 3000.',
      );
    } finally {
      setLoading(false);
    }
  };

  const doRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const d = await register(rf);
      if (d.status === 'success') {
        setMode('login');
        setErr('');
        alert('Registrasi berhasil! Silakan login.');
      } else setErr(d.message || 'Gagal mendaftar.');
    } catch {
      setErr('Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-left-in">
          <div className="auth-brand">
            <div className="auth-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                width="24"
                height="24"
              >
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
              </svg>
            </div>
            <span className="auth-brand-name">Smart Finance</span>
          </div>
          <h1 className="auth-heading">
            Finansial Sehat,
            <br />
            <em>Masa Depan Cerah</em>
          </h1>
          <p className="auth-desc">
            Platform konsultasi keuangan digital untuk generasi muda Indonesia.
            Cek kondisi finansialmu dan terhubung dengan konsultan terpercaya.
          </p>
          <div className="auth-feat-list">
            {[
              [
                '💊',
                'Financial Health Check',
                'Diagnosa kondisi keuangan secara real-time',
              ],
              [
                '👨‍💼',
                'Konsultan Berpengalaman',
                'Didampingi pakar keuangan bersertifikat',
              ],
              ['📊', 'Insight & Analisis', 'Data dan rekomendasi berbasis AI'],
            ].map(([ic, lb, dc]) => (
              <div key={lb} className="auth-feat">
                <div className="auth-feat-ic">{ic}</div>
                <div>
                  <div className="auth-feat-lb">{lb}</div>
                  <div className="auth-feat-dc">{dc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'on' : ''}`}
              onClick={() => {
                setMode('login');
                setErr('');
              }}
            >
              Masuk
            </button>
            <button
              className={`auth-tab ${mode === 'register' ? 'on' : ''}`}
              onClick={() => {
                setMode('register');
                setErr('');
              }}
            >
              Daftar
            </button>
          </div>
          <div className="auth-card-hd">
            <h2>
              {mode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
            </h2>
            <p>
              {mode === 'login'
                ? 'Masuk ke akun Smart Finance Anda'
                : 'Bergabung dan mulai perjalanan finansialmu'}
            </p>
          </div>

          {err && (
            <div className="auth-err">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="15"
                height="15"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {err}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={doLogin} className="auth-form">
              <div className="auth-field">
                <label>Alamat Email</label>
                <div className="af-wrap">
                  <svg
                    className="af-ic"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    width="15"
                    height="15"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={lf.email}
                    onChange={(e) => setLf({ ...lf, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="auth-field">
                <label>Password</label>
                <div className="af-wrap">
                  <svg
                    className="af-ic"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    width="15"
                    height="15"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Password"
                    value={lf.password}
                    onChange={(e) => setLf({ ...lf, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="af-eye"
                    onClick={() => setShowPw(!showPw)}
                  >
                    <img src={showPw ? viewIcon : hideIcon} alt="toggle" />
                  </button>
                </div>
              </div>
              <p className="auth-forgot">Lupa password?</p>
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spin" />
                    &ensp;Masuk...
                  </>
                ) : (
                  'Masuk ke Akun'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={doRegister} className="auth-form">
              <div className="auth-field">
                <label>Nama Lengkap</label>
                <div className="af-wrap">
                  <svg
                    className="af-ic"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    width="15"
                    height="15"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Nama Lengkap"
                    value={rf.name}
                    onChange={(e) => setRf({ ...rf, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="auth-field">
                <label>Alamat Email</label>
                <div className="af-wrap">
                  <svg
                    className="af-ic"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    width="15"
                    height="15"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={rf.email}
                    onChange={(e) => setRf({ ...rf, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="auth-field">
                <label>Password</label>
                <div className="af-wrap">
                  <svg
                    className="af-ic"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    width="15"
                    height="15"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={rf.password}
                    onChange={(e) => setRf({ ...rf, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="af-eye"
                    onClick={() => setShowPw(!showPw)}
                  >
                    <img src={showPw ? viewIcon : hideIcon} alt="toggle" />
                  </button>
                </div>
              </div>
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spin" />
                    &ensp;Mendaftar...
                  </>
                ) : (
                  'Buat Akun'
                )}
              </button>
            </form>
          )}

          <p className="auth-switch">
            {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <span
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErr('');
              }}
            >
              {mode === 'login' ? 'Daftar sekarang' : 'Masuk'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
