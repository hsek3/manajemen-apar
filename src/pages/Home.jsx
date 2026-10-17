import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons.jsx';
import { apiAdmin } from '../lib/api.js';
import { useLoad } from '../lib/hooks.js';
import { ErrorBox, Kpi, Loading } from '../components/ui.jsx';

const SHORTCUTS = [
  ['/dashboard', 'chart', 'Dashboard', 'Ringkasan, status, dan pengeluaran APAR'],
  ['/laporan', 'file', 'Laporan Bulanan', 'Rekap pemeriksaan, print/PDF/Excel, draf laporan K3'],
  ['/budget', 'wallet', 'Budget & Realisasi', 'Atur budget rencana vs realisasi'],
  ['/master-apar', 'building', 'Master APAR', 'Lihat & edit data APAR area/gedung'],
  ['/master-forklift', 'truck', 'Master Forklift', 'Lihat & edit data APAR forklift'],
  ['/qrcodes', 'qr', 'QR Codes', 'Cetak/download QR Code semua APAR'],
  ['/admin', 'settings', 'Admin', 'Tambah APAR, pembelian, PIC, lokasi'],
];

export default function Home() {
  const { data: d, loading, error, reload } = useLoad(() => apiAdmin('getDashboardData'), []);
  const tanggal = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <>
      <div className="hero">
        <div>
          <h1 className="page-title">Selamat datang</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>{d?.namaPerusahaan ? d.namaPerusahaan + ' · ' : ''}{tanggal}</p>
        </div>
      </div>

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

      <h2 className="section-title">Menu</h2>
      <div className="tile-grid">
        {SHORTCUTS.map(([to, ic, t, sub]) => (
          <Link key={to} to={to} className="tile">
            <span className="tile-ic"><Icon name={ic} size={20} /></span>
            <span><b>{t}</b><small>{sub}</small></span>
          </Link>
        ))}
      </div>

      <div className="note">
        Halaman <b>Check APAR Bulanan</b> tidak ada di menu ini karena dibuka lewat scan QR Code yang tertempel di tiap APAR/forklift.
      </div>
    </>
  );
}
