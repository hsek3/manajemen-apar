import React, { useEffect, useState } from 'react';
import { apiAdmin, api } from '../lib/api.js';
import { useLoad } from '../lib/hooks.js';
import { BULAN_LABEL, bulanSekarang, fmtDate, fmtDateTime, tahunSekarang } from '../lib/helpers.js';
import { exportLaporanExcel, exportLaporanK3Pdf, exportLaporanPdf } from '../lib/exporters.js';
import { DataTable, ErrorBox, Loading } from '../components/ui.jsx';

export default function Laporan() {
  const [f, setF] = useState({ bulan: bulanSekarang(), tahun: String(tahunSekarang()), kategori: 'Semua', jenis: 'Semua', lokasi: 'Semua' });
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { data: opsi } = useLoad(() => apiAdmin('getFilterOptions'), []);
  const { data: info } = useLoad(() => api('getPublicInfo'), []);

  async function tampilkan() {
    setLoading(true); setError('');
    try { setD(await apiAdmin('getLaporanBulanan', { filters: f })); }
    catch (e) { setError(e.message); }
    setLoading(false);
  }
  useEffect(() => { tampilkan(); /* eslint-disable-next-line */ }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const nama = info?.namaPerusahaan || '';
  const th = tahunSekarang();

  return (
    <>
      <h1 className="page-title no-print">📄 Laporan Bulanan Pemeriksaan APAR</h1>
      <p className="page-sub no-print">Khusus hasil pengecekan APAR. Perhitungan biaya ada di menu Budget & Realisasi.</p>

      <div className="card no-print">
        <div className="form-grid">
          <div><label>Bulan</label><select value={f.bulan} onChange={set('bulan')}>{Object.entries(BULAN_LABEL).map(([k, v]) => <option key={k} value={k}>{k} - {v}</option>)}</select></div>
          <div><label>Tahun</label><select value={f.tahun} onChange={set('tahun')}>{[th - 1, th, th + 1].map((y) => <option key={y}>{y}</option>)}</select></div>
          <div><label>Kategori</label><select value={f.kategori} onChange={set('kategori')}><option>Semua</option><option>Gedung/Area</option><option>Forklift</option></select></div>
          <div><label>Jenis APAR</label><select value={f.jenis} onChange={set('jenis')}><option>Semua</option><option>Powder</option><option>Foam</option></select></div>
          <div><label>Lokasi</label><select value={f.lokasi} onChange={set('lokasi')}><option>Semua</option>{(opsi?.lokasi || []).map((l) => <option key={l}>{l}</option>)}</select></div>
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={tampilkan} disabled={loading}>TAMPILKAN LAPORAN</button>
          <button className="btn btn-outline" disabled={!d} onClick={() => window.print()}>🖨 PRINT</button>
          <button className="btn btn-outline" disabled={!d} onClick={() => exportLaporanExcel(d, nama)}>📥 DOWNLOAD EXCEL</button>
          <button className="btn btn-outline" disabled={!d} onClick={() => exportLaporanPdf(d, nama)}>📄 DOWNLOAD PDF</button>
          <button className="btn btn-primary" disabled={!d} onClick={() => exportLaporanK3Pdf(d, nama)}>📋 DRAF LAPORAN K3 (PDF)</button>
        </div>
      </div>

      {loading && <Loading />}
      {error && <ErrorBox error={error} onRetry={tampilkan} />}
      {d && !loading && (
        <>
          <div className="card">
            <h3>Rekap Ringkas - {BULAN_LABEL[d.bulan]} {d.tahun}</h3>
            <div className="row"><span>Total APAR</span><b>{d.totalApar}</b></div>
            <div className="row"><span>Sudah Diperiksa</span><b>{d.sudahDicek.length}</b></div>
            <div className="row"><span>Belum Diperiksa</span><b>{d.belumDicek.length}</b></div>
            <div className="row"><span>Expired</span><b>{d.expiredList.length}</b></div>
            <div className="row"><span>Akan Expired</span><b>{d.akanExpiredList.length}</b></div>
            <div className="row"><span>Terpakai</span><b>{d.terpakaiList.length}</b></div>
            <div className="row"><span>Perlu Perbaikan</span><b>{d.perluPerbaikan.length}</b></div>
          </div>
          <div className="card"><h3>Hasil Checklist Bulan Ini</h3>
            <DataTable rows={d.hasilChecklist} cols={[
              { label: 'Kode APAR', key: 'kode' }, { label: 'Lokasi/Unit', key: 'lokasi' }, { label: 'PIC', key: 'pic' },
              { label: 'Hasil', key: 'hasil' }, { label: 'Tanggal', render: (r) => fmtDateTime(r.tanggal) },
              { label: 'Foto', render: (r) => (r.foto && r.foto.startsWith('http') ? <a href={r.foto} target="_blank" rel="noreferrer">Lihat</a> : '-') },
            ]} /></div>
          <div className="card"><h3>⚠️ Belum Diperiksa</h3>
            <DataTable rows={d.belumDicek} cols={[{ label: 'Kode APAR', key: 'kode' }, { label: 'Lokasi/Unit', key: 'lokasi' }, { label: 'Kategori', key: 'kategori' }]} /></div>
          <div className="card"><h3>🔴 Expired</h3>
            <DataTable rows={d.expiredList} cols={[{ label: 'Kode APAR', key: 'kode' }, { label: 'Lokasi/Unit', key: 'lokasi' }, { label: 'Kategori', key: 'kategori' }]} /></div>
          <div className="card"><h3>🟡 Akan Expired</h3>
            <DataTable rows={d.akanExpiredList} cols={[{ label: 'Kode APAR', key: 'kode' }, { label: 'Lokasi/Unit', key: 'lokasi' }, { label: 'Expired', render: (r) => fmtDate(r.expired) }]} /></div>
          <div className="card"><h3>🛠 Perlu Perbaikan</h3>
            <DataTable rows={d.perluPerbaikan} cols={[{ label: 'Kode APAR', key: 'kode' }, { label: 'Lokasi/Unit', key: 'lokasi' }, { label: 'PIC', key: 'pic' }, { label: 'Catatan', key: 'catatan' }]} /></div>
        </>
      )}
    </>
  );
}
