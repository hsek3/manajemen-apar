import React from 'react';
import { Link } from 'react-router-dom';
import { apiAdmin } from '../lib/api.js';
import { useLoad } from '../lib/hooks.js';
import { Kpi, Loading, ErrorBox } from '../components/ui.jsx';

const SHORTCUTS = [
  ['/dashboard', '📊', 'Dashboard', 'Ringkasan, status, dan budget APAR'],
  ['/laporan', '📄', 'Laporan Bulanan', 'Rekap pemeriksaan, print/download PDF & Excel, draf laporan K3'],
  ['/budget', '💰', 'Budget & Realisasi', 'Atur budget rencana vs realisasi'],
  ['/master-apar', '🏭', 'Master APAR', 'Lihat & edit data APAR area/gedung'],
  ['/master-forklift', '🚜', 'Master Forklift', 'Lihat & edit data APAR forklift'],
  ['/admin', '⚙️', 'Admin', 'Tambah APAR, pembelian, PIC, lokasi'],
  ['/qrcodes', '🔳', 'QR Codes', 'Cetak/download semua QR Code APAR'],
];

export default function Home() {
  const { data: d, loading, error, reload } = useLoad(() => apiAdmin('getDashboardData'), []);
  return (
    <>
      <h1 className="page-title">Selamat datang 👋</h1>
      <p className="page-sub">Ringkasan singkat kondisi APAR saat ini.</p>
      {loading && <Loading />}
      {error && <ErrorBox error={error} onRetry={reload} />}
      {d && (
        <div className="kpi-grid">
          <Kpi label="Total APAR" value={d.totalApar} />
          <Kpi label="APAR Aktif" value={d.aktif} tone="ok" />
          <Kpi label="Akan Expired" value={d.akanExpired} tone="warn" />
          <Kpi label="Expired" value={d.expired} tone="danger" />
          <Kpi label="Sudah Check Bulan Ini" value={d.sudahCheck} tone="ok" />
          <Kpi label="Belum Check" value={d.belumCheck} tone={d.belumCheck > 0 ? 'warn' : ''} />
        </div>
      )}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        {SHORTCUTS.map(([to, ic, t, sub]) => (
          <Link key={to} to={to} className="card" style={{ textDecoration: 'none', marginBottom: 0, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 24 }}>{ic}</span>
            <span><b style={{ color: '#1f4e78', display: 'block', fontSize: 14 }}>{t}</b><span style={{ fontSize: 12, color: '#6b7280' }}>{sub}</span></span>
          </Link>
        ))}
      </div>
      <div className="card" style={{ marginTop: 20, background: '#eff6ff', fontSize: 13 }}>
        ℹ️ Halaman <b>Check APAR Bulanan</b> tidak ada di menu ini karena dibuka lewat scan QR Code yang tertempel di tiap APAR/forklift.
      </div>
    </>
  );
}
