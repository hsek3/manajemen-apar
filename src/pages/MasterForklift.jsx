import React, { useState } from 'react';
import { apiAdmin } from '../lib/api.js';
import { useLoad } from '../lib/hooks.js';
import { fmtDate, toInputDate } from '../lib/helpers.js';
import { DataTable, ErrorBox, Field, Loading, Modal, StatusBadge } from '../components/ui.jsx';

export default function MasterForklift() {
  const { data, loading, error, reload } = useLoad(() => apiAdmin('getMasterForkliftList'), []);
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState(null);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const aktif = (f) => f.Tanggal_Expired_Aktif || f.Expired_Baru || f.Expired_Lama;
  const rows = (data || []).filter((f) => !q || [f.Kode_APAR, f.Unit_Forklift, f.Jenis, f.Status].join(' ').toLowerCase().includes(q.toLowerCase()));

  function buka(f) {
    setMsg(null);
    setEdit({
      kode: f.Kode_APAR, unitForklift: f.Unit_Forklift || '', areaOperasi: f.Area_Operasi || '', jenis: f.Jenis || 'Powder',
      kapasitas: f.Kapasitas_kg || '', expiredBaru: toInputDate(aktif(f)), kondisi: f.Kondisi || 'Ok', status: f.Status || 'Aktif',
      pic: f.PIC_Default || '', hargaPerUnit: f.Harga_Per_Unit || '', keterangan: f.Keterangan || '',
    });
  }
  const set = (k) => (e) => setEdit({ ...edit, [k]: e.target.value });

  async function simpan() {
    setSaving(true); setMsg(null);
    try {
      const r = await apiAdmin('updateAparForklift', { kode: edit.kode, data: edit });
      if (r.ok) { setEdit(null); reload(); } else setMsg(r.message);
    } catch (e) { setMsg(e.message); }
    setSaving(false);
  }

  return (
    <>
      <h1 className="page-title">🚜 Master APAR Forklift</h1>
      <p className="page-sub">{data ? data.length + ' unit terdaftar' : ''}</p>
      <div className="toolbar"><input placeholder="Cari kode, unit, jenis, atau status..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {loading && <Loading />}
      {error && <ErrorBox error={error} onRetry={reload} />}
      {data && <DataTable rows={rows} empty="Tidak ada data yang cocok." cols={[
        { label: 'Kode', render: (f) => <b>{f.Kode_APAR}</b> }, { label: 'Unit Forklift', key: 'Unit_Forklift' }, { label: 'Area Operasi', key: 'Area_Operasi' },
        { label: 'Jenis', key: 'Jenis' }, { label: 'Kapasitas', render: (f) => (f.Kapasitas_kg ? f.Kapasitas_kg + ' kg' : '-') },
        { label: 'Expired', render: (f) => fmtDate(aktif(f)) }, { label: 'Kondisi', key: 'Kondisi' },
        { label: 'Status', render: (f) => <StatusBadge s={f.Status} /> }, { label: 'PIC', key: 'PIC_Default' },
        { label: 'Aksi', render: (f) => <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => buka(f)}>Edit</button> },
      ]} />}

      {edit && (
        <Modal title={'Edit APAR Forklift ' + edit.kode} onClose={() => setEdit(null)}>
          <Field label="Unit Forklift *"><input value={edit.unitForklift} onChange={set('unitForklift')} /></Field>
          <Field label="Area Operasi"><input value={edit.areaOperasi} onChange={set('areaOperasi')} /></Field>
          <Field label="Jenis"><select value={edit.jenis} onChange={set('jenis')}><option>Powder</option><option>Foam</option></select></Field>
          <Field label="Kapasitas (kg)"><input value={edit.kapasitas} onChange={set('kapasitas')} /></Field>
          <Field label="Expired (terbaru)"><input type="date" value={edit.expiredBaru} onChange={set('expiredBaru')} /></Field>
          <Field label="Kondisi"><select value={edit.kondisi} onChange={set('kondisi')}><option>Ok</option><option>Tdk</option></select></Field>
          <Field label="Status"><select value={edit.status} onChange={set('status')}>{['Aktif', 'Terpakai', 'Rusak', 'Expired'].map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="PIC Default (operator)"><input value={edit.pic} onChange={set('pic')} /></Field>
          <Field label="Harga per Unit (Rp)"><input type="number" value={edit.hargaPerUnit} onChange={set('hargaPerUnit')} /></Field>
          <Field label="Keterangan"><input value={edit.keterangan} onChange={set('keterangan')} /></Field>
          {msg && <div className="msg msg-err">{msg}</div>}
          <div className="btn-row">
            <button className="btn btn-outline" onClick={() => setEdit(null)}>Batal</button>
            <button className="btn btn-primary" disabled={saving} onClick={simpan}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </Modal>
      )}
    </>
  );
}
