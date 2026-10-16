import React, { useEffect, useState } from 'react';
import { apiAdmin } from '../lib/api.js';
import { useLoad } from '../lib/hooks.js';
import { BULAN_SINGKAT, rupiah } from '../lib/helpers.js';
import { DataTable, ErrorBox, Loading } from '../components/ui.jsx';

export default function Budget() {
  const { data: tahunList, reload: reloadTahun } = useLoad(() => apiAdmin('getBudgetTahunList'), []);
  const [tahun, setTahun] = useState('');
  const [rows, setRows] = useState(null);
  const [draft, setDraft] = useState({});
  const [error, setError] = useState('');
  const [status, setStatus] = useState({});

  useEffect(() => { if (tahunList && tahunList.length && !tahun) setTahun(tahunList[tahunList.length - 1]); }, [tahunList, tahun]);

  async function muat() {
    if (!tahun) return;
    setRows(null); setError('');
    try { setRows(await apiAdmin('getBudgetList', { tahun })); setDraft({}); }
    catch (e) { setError(e.message); }
  }
  useEffect(() => { muat(); /* eslint-disable-next-line */ }, [tahun]);

  const key = (r) => [r.bulan, r.kategori, r.jenisPembelian].join('|');

  async function simpan(r) {
    const k = key(r);
    const nilai = draft[k] ?? r.budgetRencana;
    setStatus((s) => ({ ...s, [k]: '...' }));
    try {
      const res = await apiAdmin('updateBudgetRencana', { bulan: r.bulan, tahun: r.tahun, kategori: r.kategori, jenisPembelian: r.jenisPembelian, nilai });
      if (!res.ok) throw new Error(res.message);
      setRows((all) => all.map((x) => (key(x) === k ? { ...x, budgetRencana: Number(nilai) || 0, selisih: (Number(nilai) || 0) - x.realisasi } : x)));
      setDraft((d) => { const c = { ...d }; delete c[k]; return c; });
      setStatus((s) => ({ ...s, [k]: '✅' }));
    } catch (e) { setStatus((s) => ({ ...s, [k]: '⚠️ ' + e.message })); }
  }

  async function tambahTahun() {
    const t = window.prompt('Masukkan tahun baru (mis. 2027):');
    if (!t) return;
    try {
      const r = await apiAdmin('tambahTahunBudget', { tahun: t });
      if (!r.ok) return window.alert(r.message);
      reloadTahun(); setTahun(String(t));
    } catch (e) { window.alert(e.message); }
  }

  const totalRencana = (rows || []).reduce((s, r) => s + r.budgetRencana, 0);
  const totalReal = (rows || []).reduce((s, r) => s + r.realisasi, 0);
  const selisih = totalRencana - totalReal;

  return (
    <>
      <h1 className="page-title">💰 Budget & Realisasi</h1>
      <p className="page-sub">Realisasi dihitung otomatis dari data Pembelian (Baru/Refill).</p>
      <div className="toolbar">
        <select value={tahun} onChange={(e) => setTahun(e.target.value)} style={{ maxWidth: 160 }}>
          {(tahunList || []).map((t) => <option key={t}>{t}</option>)}
        </select>
        <button className="btn btn-outline" onClick={tambahTahun}>➕ Tambah Tahun Baru</button>
      </div>
      {error && <ErrorBox error={error} onRetry={muat} />}
      {!rows && !error && <Loading />}
      {rows && (
        <>
          <div className="kpi-grid">
            <div className="kpi"><div className="num" style={{ fontSize: 18 }}>{rupiah(totalRencana)}</div><div className="lbl">Total Budget Rencana</div></div>
            <div className="kpi"><div className="num" style={{ fontSize: 18 }}>{rupiah(totalReal)}</div><div className="lbl">Total Realisasi</div></div>
            <div className="kpi"><div className={'num ' + (selisih < 0 ? 'negatif' : 'positif')} style={{ fontSize: 18 }}>{rupiah(selisih)}</div><div className="lbl">Selisih (Rencana - Realisasi)</div></div>
          </div>
          <DataTable rows={rows} cols={[
            { label: 'Bulan', render: (r) => (BULAN_SINGKAT[r.bulan] || r.bulan) + ' ' + r.tahun },
            { label: 'Kategori', key: 'kategori' }, { label: 'Jenis', key: 'jenisPembelian' },
            { label: 'Budget Rencana (Rp)', render: (r) => (
              <input type="number" style={{ width: 130, padding: 5 }} value={draft[key(r)] ?? r.budgetRencana}
                onChange={(e) => setDraft({ ...draft, [key(r)]: e.target.value })} />) },
            { label: 'Realisasi (Rp)', render: (r) => rupiah(r.realisasi) },
            { label: 'Selisih (Rp)', render: (r) => <span className={r.selisih < 0 ? 'negatif' : 'positif'}>{rupiah(r.selisih)}</span> },
            { label: 'Aksi', render: (r) => (<>
              <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => simpan(r)}>Simpan</button>
              <span style={{ fontSize: 11, marginLeft: 6 }}>{status[key(r)]}</span></>) },
          ]} />
        </>
      )}
    </>
  );
}
