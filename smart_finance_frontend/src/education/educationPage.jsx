import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';

const ARTICLES = [
  {
    id: 1,
    cat: 'Manajemen Utang',
    mins: 5,
    icon: '🔓',
    bg: '#fef2f2',
    tc: '#b91c1c',
    title: 'Cara Keluar dari Jerat Pinjol Ilegal',
    desc: 'Pinjaman online ilegal sering menjerat generasi muda dengan bunga yang mencekik. Kenali ciri-citinya dan pelajari langkah keluar dari jeratannya.',
    content: [
      'Pinjaman online (pinjol) ilegal adalah ancaman finansial terbesar bagi generasi muda Indonesia. Dengan kemudahan akses dan proses yang cepat, banyak orang terjebak tanpa menyadari konsekuensi jangka panjangnya.',
      'Ciri-ciri pinjol ilegal: tidak terdaftar di OJK, bunga harian yang sangat tinggi (1-4% per hari), ancaman dan intimidasi saat penagihan, serta akses ke seluruh kontak di ponsel peminjam.',
      'Langkah keluar: (1) Hentikan meminjam dari aplikasi baru, (2) Konsolidasikan semua utang, (3) Hubungi OJK di 157 untuk bantuan, (4) Pertimbangkan restrukturisasi dengan bank resmi, (5) Konsultasikan dengan ahli keuangan.',
      'Ingat: tidak ada jalan pintas dari masalah keuangan. Disiplin dan rencana yang matang adalah kunci untuk bebas dari utang.',
    ],
    tips: [
      'Cek legalitas pinjol di website OJK sebelum meminjam',
      'Jangan pernah meminjam untuk membayar utang lain',
      'Simpan bukti semua transaksi sebagai perlindungan hukum',
    ],
  },
  {
    id: 2,
    cat: 'Budgeting',
    mins: 4,
    icon: '📊',
    bg: '#eff6ff',
    tc: '#1d4ed8',
    title: 'Metode 50/30/20 untuk Pemula',
    desc: 'Atur keuangan dengan cara paling mudah dan terbukti efektif: 50% kebutuhan, 30% keinginan, dan 20% tabungan dan investasi.',
    content: [
      'Metode 50/30/20 adalah strategi penganggaran populer yang dipopulerkan oleh Senator Elizabeth Warren. Sederhana namun sangat efektif untuk semua level penghasilan.',
      '50% Kebutuhan: Alokasikan setengah pendapatan bersih untuk biaya hidup esensial seperti sewa/KPR, makanan, transportasi, tagihan utilitas, dan asuransi kesehatan.',
      '30% Keinginan: Gunakan 30% untuk hal-hal yang membuat hidup lebih menyenangkan — makan di restoran, hiburan, langganan streaming, hobi, dan belanja non-esensial.',
      '20% Tabungan & Utang: Sisihkan 20% untuk dana darurat, investasi, dan pelunasan utang lebih cepat. Prioritaskan dana darurat 3-6 bulan pengeluaran terlebih dahulu.',
    ],
    tips: [
      'Hitung pendapatan bersih setelah pajak sebelum membagi',
      'Otomatiskan transfer ke rekening tabungan di hari gajian',
      'Review alokasi setiap 3 bulan',
    ],
  },
  {
    id: 3,
    cat: 'Investasi',
    mins: 6,
    icon: '📈',
    bg: '#f0fdf4',
    tc: '#166534',
    title: 'Mulai Investasi dengan Modal Rp 100.000',
    desc: 'Modal kecil bukan halangan untuk mulai berinvestasi. Pelajari instrumen investasi yang cocok untuk pemula dengan dana terbatas.',
    content: [
      'Banyak orang menunda investasi karena merasa belum punya cukup modal. Padahal, dengan Rp 100.000 saja Anda sudah bisa mulai membangun portofolio investasi yang solid.',
      'Reksa Dana Pasar Uang: Cocok untuk pemula, likuiditas tinggi, risiko rendah. Platform seperti Bibit, Bareksa, dan Ajaib memungkinkan investasi mulai Rp 10.000.',
      'Reksa Dana Indeks: Diversifikasi otomatis mengikuti indeks pasar seperti IDX30 atau LQ45. Return historis lebih konsisten dengan biaya lebih rendah dibanding reksa dana aktif.',
      'Prinsip DCA (Dollar Cost Averaging): Investasikan jumlah tetap secara rutin tanpa mempedulikan kondisi pasar. Strategi ini terbukti efektif mengurangi risiko timing pasar dalam jangka panjang.',
    ],
    tips: [
      'Diversifikasi ke minimal 3 instrumen berbeda',
      'Jangan investasikan dana darurat',
      'Pelajari profil risiko sebelum memilih instrumen',
    ],
  },
  {
    id: 4,
    cat: 'Dana Darurat',
    mins: 4,
    icon: '🛡️',
    bg: '#fffbeb',
    tc: '#854d0e',
    title: 'Pentingnya Dana Darurat untuk Gen Z',
    desc: 'Dana darurat adalah fondasi keuangan yang sering diabaikan. Ketahui berapa jumlah ideal dan strategi membangunnya dari nol.',
    content: [
      'Dana darurat adalah sejumlah uang yang disimpan khusus untuk menghadapi situasi tak terduga: kehilangan pekerjaan, biaya medis mendadak, perbaikan kendaraan, atau keperluan mendesak lainnya.',
      'Berapa jumlah ideal? Para ahli keuangan merekomendasikan 3-6 bulan pengeluaran untuk karyawan, dan 6-12 bulan untuk freelancer atau wirausaha yang memiliki penghasilan tidak tetap.',
      'Contoh: Jika pengeluaran bulanan Anda Rp 3.000.000, maka dana darurat minimal adalah Rp 9.000.000 - Rp 18.000.000.',
      'Strategi membangun dana darurat: Mulai dari Rp 500.000/bulan, pisahkan ke rekening berbeda, pilih instrumen likuid seperti tabungan atau reksa dana pasar uang, jangan gunakan untuk keperluan lain.',
    ],
    tips: [
      'Simpan di rekening terpisah yang tidak ada kartu ATM-nya',
      'Jangan gunakan untuk investasi — likuiditas adalah prioritas',
      'Isi kembali segera setelah menggunakannya',
    ],
  },
  {
    id: 5,
    cat: 'DTI Ratio',
    mins: 3,
    icon: '💡',
    bg: '#fdf4ff',
    tc: '#7e22ce',
    title: 'Memahami Debt-to-Income Ratio (DTI)',
    desc: 'DTI adalah indikator paling penting dalam menilai kesehatan keuangan. Pelajari cara menghitung, menginterpretasi, dan memperbaiki rasio DTI Anda.',
    content: [
      'Debt-to-Income Ratio (DTI) adalah persentase penghasilan bulanan yang digunakan untuk membayar cicilan utang. Metrik utama yang digunakan bank dan lembaga keuangan untuk menilai kelayakan kredit.',
      'Cara Menghitung: DTI = (Total Cicilan Bulanan ÷ Pendapatan Bruto Bulanan) × 100%. Contoh: cicilan Rp 1.500.000 dari pendapatan Rp 5.000.000 = DTI 30%.',
      'Interpretasi: < 30% = Sehat (ideal untuk mengajukan kredit baru), 30-50% = Rawan (perlu perhatian serius), > 50% = Kritis (prioritas restrukturisasi utang segera).',
      'Cara memperbaiki DTI: (1) Lunasi utang bunga tertinggi terlebih dahulu (Avalanche Method), (2) Konsolidasikan utang ke bunga lebih rendah, (3) Tingkatkan penghasilan melalui side hustle, (4) Hindari utang baru.',
    ],
    tips: [
      'Hitung DTI Anda setiap bulan untuk memantau perkembangan',
      'Target DTI < 20% untuk kondisi finansial optimal',
      'Konsultasikan dengan perencana keuangan jika DTI > 40%',
    ],
  },
  {
    id: 6,
    cat: 'Tabungan',
    mins: 5,
    icon: '🏦',
    bg: '#f0fdf4',
    tc: '#166534',
    title: 'Strategi Menabung di Era Inflasi',
    desc: 'Inflasi menggerus nilai uang yang tersimpan. Temukan instrumen dan strategi menabung yang mampu mengalahkan laju inflasi.',
    content: [
      'Inflasi adalah musuh tabungan. Ketika inflasi 5% per tahun sementara bunga tabungan hanya 1-2%, nilai riil uang Anda berkurang setiap tahun meskipun nominalnya bertambah.',
      'Instrumen yang bisa mengalahkan inflasi: (1) Deposito dengan bunga 4-6%, (2) Obligasi Negara Ritel (ORI) dengan kupon tetap, (3) Reksa dana campuran atau pendapatan tetap, (4) Properti untuk jangka panjang.',
      'Strategi Laddering Deposito: Bagi tabungan ke beberapa deposito dengan tenor berbeda (1, 3, 6, 12 bulan) untuk menjaga likuiditas sekaligus mendapat bunga lebih tinggi.',
      'Prioritas alokasi: Dana darurat → Pelunasan utang bunga tinggi → Investasi jangka panjang → Tujuan finansial spesifik (DP rumah, pendidikan, dll).',
    ],
    tips: [
      'Otomatisasi tabungan di hari gajian sebelum membelanjakan',
      'Pisahkan rekening tabungan dari rekening operasional',
      'Bandingkan bunga antar bank secara rutin',
    ],
  },
];

const CATS = [
  'Semua',
  'Manajemen Utang',
  'Budgeting',
  'Investasi',
  'Dana Darurat',
  'DTI Ratio',
  'Tabungan',
];

export default function Education() {
  const navigate = useNavigate();
  const [cat, setCat] = useState('Semua');
  const [search, setSearch] = useState('');
  const [article, setArticle] = useState(null);

  const filtered = ARTICLES.filter((a) => {
    const matchCat = cat === 'Semua' || a.cat === cat;
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const fontStyle = { fontFamily: "'Montserrat', sans-serif" };

  if (article)
    return (
      <Layout title="Edukasi Finansial" subtitle={article.cat}>
        <button
          className="btn btn-outline btn-sm"
          style={{ marginBottom: 18 }}
          onClick={() => setArticle(null)}
        >
          ← Kembali
        </button>
        <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
          <div className="left-col">
            <div className="card">
              <div
                style={{
                  background: `linear-gradient(135deg, ${article.bg}, #fff)`,
                  padding: '28px 28px 22px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  gap: 20,
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: 48, flexShrink: 0 }}>
                  {article.icon}
                </span>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <span
                    className="badge"
                    style={{
                      background: article.bg,
                      color: article.tc,
                      marginBottom: 8,
                      display: 'inline-block',
                      ...fontStyle,
                    }}
                  >
                    {article.cat}
                  </span>
                  <h1
                    style={{
                      ...fontStyle,
                      fontSize: 20,
                      fontWeight: 700,
                      color: 'var(--ink)',
                      lineHeight: 1.3,
                      marginBottom: 6,
                      letterSpacing: '-.3px',
                    }}
                  >
                    {article.title}
                  </h1>
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--muted)',
                      ...fontStyle,
                    }}
                  >
                    ⏱ {article.mins} menit baca
                  </span>
                </div>
              </div>
              <div className="card-body">
                {article.content.map((p, i) => (
                  <p
                    key={i}
                    style={{
                      ...fontStyle,
                      fontSize: 14,
                      color: 'var(--ink-2)',
                      lineHeight: 1.8,
                      marginBottom: 16,
                    }}
                  >
                    {p}
                  </p>
                ))}
                <div
                  style={{
                    background: 'var(--green-mist)',
                    borderLeft: '4px solid var(--green-3)',
                    borderRadius: 10,
                    padding: '16px 20px',
                    margin: '20px 0',
                  }}
                >
                  <div
                    style={{
                      ...fontStyle,
                      fontWeight: 700,
                      fontSize: 13,
                      color: 'var(--ink)',
                      marginBottom: 10,
                    }}
                  >
                    💡 Tips Praktis
                  </div>
                  {article.tips.map((t, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 10,
                        marginBottom: 8,
                        fontSize: 13,
                        color: 'var(--ink-2)',
                        lineHeight: 1.55,
                        ...fontStyle,
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'var(--green-3)',
                          flexShrink: 0,
                          marginTop: 6,
                        }}
                      />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    background: 'var(--ink)',
                    borderRadius: 12,
                    padding: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div
                      style={{
                        ...fontStyle,
                        fontWeight: 700,
                        fontSize: 14,
                        color: '#fff',
                        marginBottom: 4,
                      }}
                    >
                      Butuh panduan lebih personal?
                    </div>
                    <p
                      style={{
                        ...fontStyle,
                        fontSize: 12,
                        color: 'rgba(255,255,255,.6)',
                        lineHeight: 1.5,
                      }}
                    >
                      Konsultasikan kondisi keuanganmu dengan ahli berpengalaman
                    </p>
                  </div>
                  <button
                    className="btn"
                    style={{
                      background: '#fff',
                      color: 'var(--ink)',
                      flexShrink: 0,
                      ...fontStyle,
                    }}
                    onClick={() => navigate('/consultation')}
                  >
                    Konsultasi Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="right-col"
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div className="card">
              <div className="card-hd">
                <span className="card-title">Artikel Terkait</span>
              </div>
              {ARTICLES.filter((a) => a.id !== article.id)
                .slice(0, 4)
                .map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      gap: 11,
                      alignItems: 'center',
                      padding: '11px 18px',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'background .15s',
                    }}
                    onClick={() => setArticle(a)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'var(--green-mist)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = '')
                    }
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        background: a.bg,
                        borderRadius: 9,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      {a.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          ...fontStyle,
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--ink)',
                          lineHeight: 1.3,
                          marginBottom: 2,
                        }}
                      >
                        {a.title}
                      </div>
                      <div
                        style={{
                          ...fontStyle,
                          fontSize: 11,
                          color: 'var(--muted)',
                        }}
                      >
                        {a.cat} · {a.mins} menit
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg,var(--ink),var(--ink-2))',
                border: 'none',
              }}
            >
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🎯</div>
                <div
                  style={{
                    ...fontStyle,
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: 7,
                  }}
                >
                  Cek Kondisi Keuanganmu
                </div>
                <p
                  style={{
                    ...fontStyle,
                    fontSize: 12,
                    color: 'rgba(255,255,255,.55)',
                    marginBottom: 14,
                    lineHeight: 1.6,
                  }}
                >
                  Gunakan Financial Health Check gratis untuk mengetahui status
                  keuanganmu
                </p>
                <button
                  className="btn btn-full"
                  style={{
                    background: '#fff',
                    color: 'var(--ink)',
                    ...fontStyle,
                  }}
                  onClick={() => navigate('/financial-health')}
                >
                  Mulai Health Check
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );

  return (
    <Layout
      title="Edukasi Finansial"
      subtitle="Tingkatkan literasi keuanganmu dengan artikel pilihan"
    >
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: '200px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg
            style={{
              position: 'absolute',
              left: 12,
              color: 'var(--muted)',
              pointerEvents: 'none',
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="15"
            height="15"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Cari artikel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...fontStyle,
              width: '100%',
              padding: '9px 13px 9px 36px',
              border: '1.5px solid var(--border)',
              borderRadius: 9,
              fontSize: 13,
              outline: 'none',
              color: 'var(--ink)',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--green-3)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
        <span
          style={{
            ...fontStyle,
            fontSize: 12,
            color: 'var(--muted)',
            whiteSpace: 'nowrap',
          }}
        >
          {filtered.length} artikel
        </span>
      </div>

      <div
        style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 20 }}
      >
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            style={{
              ...fontStyle,
              padding: '6px 14px',
              borderRadius: 20,
              border: '1.5px solid',
              borderColor: cat === c ? 'var(--ink)' : 'var(--border)',
              background: cat === c ? 'var(--ink)' : '#fff',
              color: cat === c ? '#fff' : 'var(--muted)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all .15s',
              whiteSpace: 'nowrap',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="ei">📚</div>
          <h3>Tidak Ditemukan</h3>
          <p>Coba kata kunci atau kategori lain</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((a) => (
            <div
              key={a.id}
              className="card"
              style={{ cursor: 'pointer', transition: 'all .18s' }}
              onClick={() => setArticle(a)}
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
                  background: `linear-gradient(135deg, ${a.bg}, #fff)`,
                  padding: '22px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: 34 }}>{a.icon}</span>
                <span
                  className="badge"
                  style={{
                    background: 'rgba(255,255,255,.75)',
                    color: a.tc,
                    ...fontStyle,
                  }}
                >
                  {a.cat}
                </span>
              </div>
              <div style={{ padding: '16px 18px' }}>
                <h3
                  style={{
                    ...fontStyle,
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--ink)',
                    marginBottom: 7,
                    lineHeight: 1.35,
                    letterSpacing: '-.2px',
                  }}
                >
                  {a.title}
                </h3>
                <p
                  style={{
                    ...fontStyle,
                    fontSize: 12,
                    color: 'var(--ink-3)',
                    lineHeight: 1.6,
                    marginBottom: 14,
                  }}
                >
                  {a.desc}
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 12,
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <span
                    style={{
                      ...fontStyle,
                      fontSize: 11,
                      color: 'var(--muted)',
                    }}
                  >
                    ⏱ {a.mins} menit baca
                  </span>
                  <span
                    style={{
                      ...fontStyle,
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--ink-2)',
                    }}
                  >
                    Baca →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
