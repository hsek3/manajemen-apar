import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { apiAdmin } from '../lib/api.js';
import { useLoad } from '../lib/hooks.js';
import { rupiah } from '../lib/helpers.js';
import { ErrorBox, Kpi, Loading } from '../components/ui.jsx';

const WARNA = ['#1f4e78', '#b45309', '#166534', '#b91c1c', '#7c3aed', '#0891b2'];

function Pie1({ title, data }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={85} label>
            {data.map((_, i) => <Cell key={i} fill={WARNA[i % WARNA.length]} />)}
          </Pie>
          <Tooltip /><Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard() {
  const { data: d, loading, error, reload } = useLoad(() => apiAdmin('getDashboardData'), []);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  return (
    <>
      <h1 className="page-title">📊 Dashboard APAR</h1>
      <p className="page-sub">{d.namaPerusahaan}</p>
      <div className="kpi-grid">
        <Kpi label="Total APAR" value={d.totalApar} />
        <Kpi label="APAR Powder" value={d.powder} />
        <Kpi label="APAR Foam" value={d.foam} />
        <Kpi label="APAR Aktif" value={d.aktif} tone="ok" />
        <Kpi label="APAR Terpakai" value={d.terpakai} tone="warn" />
        <Kpi label="APAR Expired" value={d.expired} tone="danger" />
        <Kpi label="Akan Expired" value={d.akanExpired} tone="warn" />
        <Kpi label="Sudah Check Bulan Ini" value={d.sudahCheck} tone="ok" />
        <Kpi label="Belum Check" value={d.belumCheck} tone="danger" />
        <Kpi label="Total Forklift" value={d.totalForklift} />
        <Kpi label="Total Gedung/Area" value={d.totalGedung} />
      </div>

      <div className="card">
        <h3>💰 Pengeluaran APAR</h3>
        <div className="row"><span>Pembelian Baru (bulan ini)</span><b>{rupiah(d.baruBulanIni)}</b></div>
        <div className="row"><span>Biaya Refill (bulan ini)</span><b>{rupiah(d.refillBulanIni)}</b></div>
        <div className="row"><span>🏭 Gedung/Area (bulan ini)</span><b>{rupiah(d.gedungBulanIni)}</b></div>
        <div className="row"><span>🚜 Forklift (bulan ini)</span><b>{rupiah(d.forkliftBulanIni)}</b></div>
        <div className="row"><span>Total Pengeluaran Bulan Ini</span><b>{rupiah(d.totalBulanIni)}</b></div>
        <div className="row"><span>Total Baru (tahun berjalan)</span><b>{rupiah(d.totalBaruTahun)}</b></div>
        <div className="row"><span>Total Refill (tahun berjalan)</span><b>{rupiah(d.totalRefillTahun)}</b></div>
        <div className="row"><span>Total Pengeluaran Tahun Berjalan</span><b>{rupiah(d.totalTahun)}</b></div>
      </div>

      <div className="charts">
        <Pie1 title="APAR Berdasarkan Jenis" data={d.perJenis} />
        <Pie1 title="Status APAR" data={d.perStatus} />
        <Pie1 title="APAR Berdasarkan Kategori" data={d.perKategori} />
        <div className="card">
          <h3>Top 10 Lokasi</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={d.perLokasi} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
              <Tooltip /><Bar dataKey="value" fill="#1f4e78" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <h3>Pengeluaran Baru vs Refill per Bulan ({d.tahunIni})</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={d.pengeluaranPerBulan}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="bulan" /><YAxis tickFormatter={(v) => (v / 1000000).toFixed(1) + ' jt'} />
            <Tooltip formatter={(v) => rupiah(v)} /><Legend />
            <Bar dataKey="Baru" stackId="a" fill="#1f4e78" /><Bar dataKey="Refill" stackId="a" fill="#b45309" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
