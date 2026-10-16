import React, { useState } from 'react';
import { apiAdmin } from '../lib/api.js';
import { useLoad } from '../lib/hooks.js';
import { fmtDate, toInputDate } from '../lib/helpers.js';
import { DataTable, ErrorBox, Field, Loading, Modal, StatusBadge } from '../components/ui.jsx';

export default function MasterApar() {
  const { data, loading, error, reload } = useLoad(() => apiAdmin('getMasterAparList'), []);
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState(null);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const rows = (data || []).filter((a) => !q || [a.Kode_APAR, a.Area, a.Merek, a.Jenis, a.Status].join(' ').toLowerCase().includes(q.toLowerCase()));

  function buka(a) {
    setMsg(null);
    setEdit({
      kode: a.Kode_APAR, area: a.Area || '', merek: a.Merek || '', jenis: a.Jenis || 'Powder', kapasitas: a.Kapasitas_kg || '',
      tanggalExpired: toInputDate(a.Tanggal_Expired), kondisi: a.Kondisi || 'Ok', status: a.Status || 'Aktif',
      pic: a.PIC_Default || '', hargaPerUnit: a.Harga_Per_Unit || '', keterangan: a.Keterangan || '',
    });
  }
  const set = (k) => (e) => setEdit({ ...edit, [k]: e.target.value });

  async function simpan() {
    setSaving(true); setMsg(null);
    try {
      const r = await apiAdmin('updateAparArea', { kode: edit.kode, data: edit });
      if (r.ok) { setEdit(null); reload(); } else setMsg(r.message);
    } catch (e) { setMsg(e.message); }
    setSaving(false);
  }

  return (
    <>
      <h1 className="page-title">🏭 Master APAR (Gedung/Area)</h1>
      <p className="page-sub">{data ? data.length + ' unit terdaftar' : ''}</p>
      <div className="toolbar"><input placeholder="Cari kode, area, merek, jenis, atau status..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {loading && <Loading />}
      {error && <ErrorBox error={error} onRetry={reload} />}
      {data && <DataTable rows={rows} empty="Tidak ada data yang cocok." cols={[
        { label: 'Kode', render: (a) => <b>{a.Kode_APAR}</b> }, { label: 'Area', key: 'Area' }, { label: 'Merek', key: 'Merek' },
        { label: 'Jenis', key: 'Jenis' }, { label: 'Kapasitas', render: (a) => (a.Kapasitas_kg ? a.Kapasitas_kg + ' kg' : '-') },
        { label: 'Expired', render: (a) => fmtDate(a.Tanggal_Expired) }, { label: 'Kondisi', key: 'Kondisi' },
        { label: 'Status', render: (a) => <StatusBadge s={a.Status} /> }, { label: 'PIC', key: 'PIC_Default' },
        { label: 'Aksi', render: (a) => <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => buka(a)}>Edit</button> },
      ]} />}

      {edit && (
        <Modal title={'Edit APAR ' + edit.kode} onClose={() => setEdit(null)}>
          <Field label="Area / Lokasi *"><input value={edit.area} onChange={set('area')} /></Field>
          <Field label="Merek"><input value={edit.merek} onChange={set('merek')} /></Field>
          <Field label="Jenis"><select value={edit.jenis} onChange={set('jenis')}><option>Powder</option><option>Foam</option></select></Field>
          <Field label="Kapasitas (kg)"><input value={edit.kapasitas} onChange={set('kapasitas')} /></Field>
          <Field label="Tanggal Expired"><input type="date" value={edit.tanggalExpired} onChange={set('tanggalExpired')} /></Field>
          <Field label="Kondisi"><select value={edit.kondisi} onChange={set('kondisi')}><option>Ok</option><option>Tdk</option></select></Field>
          <Field label="Status"><select value={edit.status} onChange={set('status')}>{['Aktif', 'Terpakai', 'Rusak', 'Expired', 'Belum Terpasang'].map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="PIC Default"><input value={edit.pic} onChange={set('pic')} /></Field>
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
