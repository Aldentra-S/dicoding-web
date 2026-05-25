import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import Layout from '../components/Layout.jsx';
import { useApp } from '../context/AppContext.jsx';

const rp = (v) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(v || 0);

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

const StatCard = ({ icon, label, value, color, bg }) => (
  <div
    style={{
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r16)',
      padding: '18px 20px',
      boxShadow: 'var(--sh)',
      display: 'flex',
      gap: 14,
      alignItems: 'flex-start',
    }}
  >
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 'var(--r8)',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: 20,
      }}
    >
      {icon}
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color,
          fontFamily: 'var(--fd)',
          lineHeight: 1.2,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </div>
    </div>
  </div>
);

export default function AkumulasiKeuangan() {
  const navigate = useNavigate();
  const { akumulasi, loadAkumulasi, addDailyLog, busy } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [formInput, setFormInput] = useState({
    income: '',
    expenses: '',
    debt: '',
    emergency: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    if (!akumulasi) {
      loadAkumulasi();
    }
  }, [akumulasi, loadAkumulasi]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAkumulasi();
    setRefreshing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitHarian = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg('');
    try {
      const result = await addDailyLog({
        monthly_income: Number(formInput.income) || 0,
        monthly_expenses: Number(formInput.expenses) || 0,
        monthly_debt_payment: Number(formInput.debt) || 0,
        emergency_fund: Number(formInput.emergency) || 0,
      });
      if (result && result.status === 'success') {
        setFormInput({ income: '', expenses: '', debt: '', emergency: '' });
        setSubmitMsg('Data harian berhasil disimpan!');
        await loadAkumulasi();
      } else {
        setSubmitMsg(result?.message || 'Gagal menyimpan data.');
      }
    } catch (err) {
      console.error(err);
      setSubmitMsg('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSubmitMsg(''), 3000);
    }
  };

  const dataAkumulasi = akumulasi?.data?.akumulasi || akumulasi?.akumulasi;
  const dataLogs = akumulasi?.data?.logs || akumulasi?.logs || [];
  const totalChecks = Number(dataAkumulasi?.total_checks || 0);

  const logsUrutTanggal = [...dataLogs].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at),
  );

  const tanggalPertama =
    logsUrutTanggal.length > 0 ? new Date(logsUrutTanggal[0].created_at) : null;

  const now = new Date();
  const namaBulan = BULAN_ID[now.getMonth()];
  const tahun = now.getFullYear();
  const jumlahHari = new Date(tahun, now.getMonth() + 1, 0).getDate();

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

  const formatDateVal = (d) => {
    if (!d) return '';
    return d.toISOString().slice(0, 10);
  };

  const formatDateLabel = (d) => {
    if (!d) return '';
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const [tglAwal, setTglAwal] = useState('');
  const [tglAkhir, setTglAkhir] = useState('');

  useEffect(() => {
    if (dateOptions.length > 0 && !tglAwal) {
      setTglAwal(formatDateVal(dateOptions[0]));
      const akhirIdx = Math.min(dateOptions.length - 1, 29);
      setTglAkhir(formatDateVal(dateOptions[akhirIdx]));
    }
  }, [dateOptions.length]);

  const tglAwalObj = tglAwal ? new Date(tglAwal + 'T00:00:00') : null;
  const tglAkhirObj = tglAkhir ? new Date(tglAkhir + 'T23:59:59') : null;

  const logsFiltered = dataLogs.filter((l) => {
    const d = new Date(l.created_at);
    if (tglAwalObj && d < tglAwalObj) return false;
    if (tglAkhirObj && d > tglAkhirObj) return false;
    return true;
  });

  const totalPendapatanFiltered = logsFiltered.reduce(
    (s, l) => s + Number(l.monthly_income || 0),
    0,
  );
  const totalPengeluaranFiltered = logsFiltered.reduce(
    (s, l) => s + Number(l.monthly_expenses || 0),
    0,
  );
  const totalCicilanFiltered = logsFiltered.reduce(
    (s, l) => s + Number(l.monthly_debt_payment || 0),
    0,
  );
  const totalDanaFiltered = logsFiltered.reduce(
    (s, l) => s + Number(l.emergency_fund || 0),
    0,
  );
  const sisaBersihFiltered =
    totalPendapatanFiltered - totalPengeluaranFiltered - totalCicilanFiltered;

  const labelPeriode =
    tglAwal && tglAkhir
      ? `${formatDateLabel(tglAwalObj)} – ${formatDateLabel(tglAkhirObj)}`
      : `${namaBulan} ${tahun}`;

  const handleCekKesehatan = () => {
    navigate('/financial-health');
  };

  const isLoading = busy.ak || refreshing;

  const totalPendapatanSemua = dataLogs.reduce(
    (s, l) => s + Number(l.monthly_income || 0),
    0,
  );
  const totalPengeluaranSemua = dataLogs.reduce(
    (s, l) => s + Number(l.monthly_expenses || 0),
    0,
  );
  const totalCicilanSemua = dataLogs.reduce(
    (s, l) => s + Number(l.monthly_debt_payment || 0),
    0,
  );
  const totalDanaSemua = dataLogs.reduce(
    (s, l) => s + Number(l.emergency_fund || 0),
    0,
  );
  const saldoSaatIni =
    totalPendapatanSemua - totalPengeluaranSemua - totalCicilanSemua;

  const chartData = (() => {
    const logsWithData = dataLogs.filter(
      (l) =>
        Number(l.monthly_income || 0) > 0 ||
        Number(l.monthly_expenses || 0) > 0 ||
        Number(l.monthly_debt_payment || 0) > 0,
    );
    if (logsWithData.length === 0) return [];

    const byDate = {};
    logsWithData.forEach((l) => {
      const d = new Date(l.created_at);
      const key = d.getDate();
      if (!byDate[key]) {
        byDate[key] = {
          tanggalAngka: key,
          Pendapatan: 0,
          Pengeluaran: 0,
          Cicilan: 0,
        };
      }
      byDate[key].Pendapatan += Number(l.monthly_income || 0);
      byDate[key].Pengeluaran += Number(l.monthly_expenses || 0);
      byDate[key].Cicilan += Number(l.monthly_debt_payment || 0);
    });

    return Object.values(byDate).sort(
      (a, b) => a.tanggalAngka - b.tanggalAngka,
    );
  })();

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: 'var(--ink)',
          border: 'none',
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: 12,
          color: '#fff',
          boxShadow: 'var(--sh-md)',
        }}
      >
        <div
          style={{ fontWeight: 700, marginBottom: 6, color: 'var(--green-lt)' }}
        >
          Tgl {label}
        </div>
        {payload.map((p) => (
          <div
            key={p.name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 4,
            }}
          >
            <span style={{ color: p.fill, fontWeight: 600 }}>{p.name}</span>
            <span>{rp(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout
      title="Akumulasi Keuangan"
      subtitle={`Rekap Harian Bulanan ${namaBulan} ${tahun}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            background:
              'linear-gradient(135deg, var(--ink) 0%, var(--ink-2) 100%)',
            borderRadius: 'var(--r16)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
            boxShadow: 'var(--sh-md)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.45)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 6,
              }}
            >
              Periode Aktif
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#fff',
                fontFamily: 'var(--fd)',
              }}
            >
              1 – {jumlahHari} {namaBulan} {tahun}
            </div>
            {dataAkumulasi && (
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.45)',
                  marginTop: 4,
                }}
              >
                {totalChecks} hari entri data tercatat
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn btn-outline btn-sm"
              style={{
                borderColor: 'rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.7)',
                background: 'rgba(255,255,255,0.07)',
              }}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spin" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="13"
                  height="13"
                >
                  <path d="M23 4v6h-6M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
              )}
              Refresh
            </button>
            <button
              className="btn btn-green btn-sm"
              onClick={handleCekKesehatan}
              disabled={dataLogs.length === 0 || isLoading}
              style={{ gap: 6 }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="13"
                height="13"
              >
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
              </svg>
              Cek Kesehatan Finansial
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-hd">
            <span className="card-title">Input Transaksi Harian Hari Ini</span>
          </div>
          <div className="card-body">
            {submitMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  marginBottom: 14,
                  fontSize: 13,
                  fontWeight: 600,
                  background: submitMsg.includes('berhasil')
                    ? '#dcfce7'
                    : '#fee2e2',
                  color: submitMsg.includes('berhasil') ? '#166534' : '#b91c1c',
                  border: `1px solid ${submitMsg.includes('berhasil') ? '#86efac' : '#fca5a5'}`,
                }}
              >
                {submitMsg}
              </div>
            )}
            <form
              onSubmit={handleSubmitHarian}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 6,
                    color: 'var(--ink)',
                  }}
                >
                  Pendapatan (Rp)
                </label>
                <input
                  type="number"
                  name="income"
                  value={formInput.income}
                  onChange={handleInputChange}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--r8)',
                    border: '1px solid var(--border)',
                    background: 'var(--white)',
                    color: 'var(--ink)',
                  }}
                  required
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 6,
                    color: 'var(--ink)',
                  }}
                >
                  Pengeluaran (Rp)
                </label>
                <input
                  type="number"
                  name="expenses"
                  value={formInput.expenses}
                  onChange={handleInputChange}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--r8)',
                    border: '1px solid var(--border)',
                    background: 'var(--white)',
                    color: 'var(--ink)',
                  }}
                  required
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 6,
                    color: 'var(--ink)',
                  }}
                >
                  Cicilan / Utang (Rp)
                </label>
                <input
                  type="number"
                  name="debt"
                  value={formInput.debt}
                  onChange={handleInputChange}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--r8)',
                    border: '1px solid var(--border)',
                    background: 'var(--white)',
                    color: 'var(--ink)',
                  }}
                  required
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 6,
                    color: 'var(--ink)',
                  }}
                >
                  Dana Darurat (Rp)
                </label>
                <input
                  type="number"
                  name="emergency"
                  value={formInput.emergency}
                  onChange={handleInputChange}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--r8)',
                    border: '1px solid var(--border)',
                    background: 'var(--white)',
                    color: 'var(--ink)',
                  }}
                  required
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-dark"
                  style={{ width: '100%', height: '42px' }}
                  disabled={submitting}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Data Harian'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 14,
            }}
            className="ak-stat-grid-top"
          >
            <StatCard
              icon="💰"
              label="Total Pendapatan"
              value={rp(totalPendapatanSemua)}
              color="var(--green-2)"
              bg="var(--green-bg)"
            />
            <StatCard
              icon="🛒"
              label="Total Pengeluaran"
              value={rp(totalPengeluaranSemua)}
              color="var(--amber)"
              bg="var(--gold-lt)"
            />
            <StatCard
              icon="🏦"
              label="Total Cicilan"
              value={rp(totalCicilanSemua)}
              color="var(--red)"
              bg="var(--red-lt)"
            />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 14,
            }}
            className="ak-stat-grid-bot"
          >
            <StatCard
              icon="🛡️"
              label="Dana Darurat"
              value={rp(totalDanaSemua)}
              color="var(--blue)"
              bg="var(--blue-lt)"
            />
            <StatCard
              icon="💵"
              label="Saldo Saat Ini"
              value={rp(saldoSaatIni)}
              color={saldoSaatIni >= 0 ? 'var(--green-2)' : 'var(--red)'}
              bg={saldoSaatIni >= 0 ? 'var(--green-bg)' : 'var(--red-lt)'}
            />
          </div>
        </div>

        {isLoading && dataLogs.length === 0 ? (
          <div className="card">
            <div
              style={{
                padding: 48,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span
                className="spin spin-dk"
                style={{ width: 28, height: 28, borderWidth: 3 }}
              />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                Memuat data akumulasi...
              </span>
            </div>
          </div>
        ) : dataLogs.length === 0 ? (
          <div className="card">
            <div className="empty" style={{ padding: '48px 24px' }}>
              <div className="ei">📊</div>
              <h3>Belum Ada Data Bulan Ini</h3>
              <p>
                Masukkan data harian kamu di form atas untuk mulai mencatat
                keuangan bulan ini.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="card">
              <div className="card-hd">
                <span className="card-title">Filter Periode Keuangan</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Maks. 1 bulan
                </span>
              </div>
              <div className="card-body">
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap',
                    alignItems: 'flex-end',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 6,
                        color: 'var(--ink)',
                      }}
                    >
                      Tanggal Awal
                    </label>
                    <select
                      value={tglAwal}
                      onChange={(e) => {
                        setTglAwal(e.target.value);
                        const newAwal = new Date(e.target.value + 'T00:00:00');
                        const newAkhir = tglAkhir
                          ? new Date(tglAkhir + 'T00:00:00')
                          : null;
                        if (!newAkhir || newAkhir < newAwal) {
                          setTglAkhir(e.target.value);
                        } else {
                          const maxAkhir = new Date(newAwal);
                          maxAkhir.setDate(maxAkhir.getDate() + 30);
                          if (newAkhir > maxAkhir) {
                            setTglAkhir(formatDateVal(maxAkhir));
                          }
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--r8)',
                        border: '1px solid var(--border)',
                        background: 'var(--white)',
                        color: 'var(--ink)',
                        fontSize: 13,
                      }}
                    >
                      {dateOptions.map((d) => (
                        <option key={formatDateVal(d)} value={formatDateVal(d)}>
                          {formatDateLabel(d)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 6,
                        color: 'var(--ink)',
                      }}
                    >
                      Tanggal Akhir
                    </label>
                    <select
                      value={tglAkhir}
                      onChange={(e) => setTglAkhir(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
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
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 320px',
                gap: 18,
                alignItems: 'start',
              }}
              className="ak-main-grid"
            >
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                {chartData.length > 0 && (
                  <div className="card">
                    <div className="card-hd">
                      <span className="card-title">
                        Grafik Perkembangan Harian (Tanggal 1 - {jumlahHari})
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                        Input Riil
                      </span>
                    </div>
                    <div className="card-body">
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart
                          data={chartData}
                          barGap={1}
                          barCategoryGap="15%"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--border)"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="tanggalAngka"
                            tick={{ fontSize: 9, fill: 'var(--muted)' }}
                            tickLine={true}
                            axisLine={false}
                            label={{
                              value: 'Tanggal',
                              position: 'insideBottom',
                              offset: -2,
                              fontSize: 10,
                              fill: 'var(--muted)',
                            }}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: 'var(--muted)' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) =>
                              v >= 1000000
                                ? `${(v / 1000000).toFixed(1)}jt`
                                : v >= 1000
                                  ? `${(v / 1000).toFixed(0)}rb`
                                  : v
                            }
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar
                            dataKey="Pendapatan"
                            fill="#2d7a52"
                            radius={[2, 2, 0, 0]}
                          />
                          <Bar
                            dataKey="Pengeluaran"
                            fill="#d97706"
                            radius={[2, 2, 0, 0]}
                          />
                          <Bar
                            dataKey="Cicilan"
                            fill="#b91c1c"
                            radius={[2, 2, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                      <div
                        style={{
                          display: 'flex',
                          gap: 16,
                          justifyContent: 'center',
                          marginTop: 12,
                        }}
                      >
                        {[
                          ['#2d7a52', 'Pendapatan'],
                          ['#d97706', 'Pengeluaran'],
                          ['#b91c1c', 'Cicilan'],
                        ].map(([c, l]) => (
                          <div
                            key={l}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 11,
                              color: 'var(--ink-2)',
                            }}
                          >
                            <div
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 3,
                                background: c,
                                flexShrink: 0,
                              }}
                            />
                            {l}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="card">
                  <div className="card-hd">
                    <span className="card-title">
                      Log Transaksi Berdasarkan Tanggal
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {totalChecks} entri
                    </span>
                  </div>
                  <div className="tbl-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Tanggal</th>
                          <th>Pendapatan</th>
                          <th>Pengeluaran</th>
                          <th>Cicilan</th>
                          <th>Dana Darurat</th>
                          <th>Skor</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logsUrutTanggal.map((l, index) => (
                          <tr key={l.id || l.created_at || index}>
                            <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                              {new Date(l.created_at).toLocaleDateString(
                                'id-ID',
                                {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )}
                            </td>
                            <td
                              style={{
                                color: 'var(--green-2)',
                                fontWeight: 600,
                                fontSize: 12,
                              }}
                            >
                              {rp(l.monthly_income)}
                            </td>
                            <td
                              style={{
                                color: 'var(--amber)',
                                fontWeight: 600,
                                fontSize: 12,
                              }}
                            >
                              {rp(l.monthly_expenses)}
                            </td>
                            <td
                              style={{
                                color: 'var(--red)',
                                fontWeight: 600,
                                fontSize: 12,
                              }}
                            >
                              {rp(l.monthly_debt_payment)}
                            </td>
                            <td
                              style={{
                                color: 'var(--blue)',
                                fontWeight: 600,
                                fontSize: 12,
                              }}
                            >
                              {rp(l.emergency_fund)}
                            </td>
                            <td>
                              <span
                                style={{
                                  fontFamily: 'var(--fd)',
                                  fontSize: 14,
                                  fontWeight: 700,
                                }}
                              >
                                {Math.round(l.score || 0)}
                              </span>
                              <span
                                style={{ color: 'var(--muted)', fontSize: 10 }}
                              >
                                /100
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${l.status === 'Sehat' ? 'b-green' : l.status === 'Rawan' ? 'b-amber' : 'b-red'}`}
                              >
                                {l.status || 'Tidak Diketahui'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <div
                  className="card"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--green-bg), #d1fae5)',
                  }}
                >
                  <div className="card-body" style={{ padding: '18px 20px' }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        marginBottom: 14,
                      }}
                    >
                      <div style={{ fontSize: 28 }}>🩺</div>
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: 'var(--ink)',
                            marginBottom: 4,
                          }}
                        >
                          Cek Kesehatan Finansial
                        </div>
                        <p
                          style={{
                            fontSize: 12,
                            color: 'var(--ink-3)',
                            lineHeight: 1.6,
                          }}
                        >
                          Data akumulasi periode {labelPeriode} akan otomatis
                          mengisi form Financial Health Check.
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn btn-dark btn-full"
                      onClick={handleCekKesehatan}
                      style={{ gap: 8 }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        width="14"
                        height="14"
                      >
                        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                      </svg>
                      Hitung Kondisi Keuangan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .ak-main-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .ak-stat-grid-top { grid-template-columns: 1fr !important; }
          .ak-stat-grid-bot { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  );
}
