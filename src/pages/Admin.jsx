import React, { useState } from 'react';
import { apiAdmin } from '../lib/api.js';
import { useLoad } from '../lib/hooks.js';
import { rupiah } from '../lib/helpers.js';
import { Field } from '../components/ui.jsx';

/** Form generik: fields = [[nama, label, {type, options, wide}]] */
function FormPanel({ judul, fields, awal, aksi, buat, sukses, onDone }) {
  const [v, setV] = useState(awal);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });

  async function kirim() {
    setBusy(true); setMsg(null);
    try {
      const r = await apiAdmin(aksi, { data: buat ? buat(v) : v });
      setMsg({ ok: true, text: sukses(r) });
      setV(awal);
      onDone && onDone();
    } catch (e) { setMsg({ ok: false, text: e.message }); }
    setBusy(false);
  }

  return (
    <div className="card">
      <h3>{judul}</h3>
      <div className="form-grid">
        {fields.map(([k, label, o = {}]) => (
          <div key={k} style={o.wide ? { gridColumn: '1/-1' } : null}>
            <Field label={label}>
              {o.options
                ? <select value={v[k]} onChange={set(k)}>{o.options.map((x) => <option key={x}>{x}</option>)}</select>
                : <input type={o.type || 'text'} value={v[k]} onChange={set(k)} placeholder={o.ph || ''} />}
            </Field>
          </div>
        ))}
      </div>
      <div className="btn-row"><button className="btn btn-primary" disabled={busy} onClick={kirim}>{busy ? 'Menyimpan...' : 'SIMPAN'}</button></div>
      {msg && <div className={'msg ' + (msg.ok ? 'msg-ok' : 'msg-err')}>{msg.ok ? '✅ ' : '⚠️ '}{msg.text}</div>}
    </div>
  );
}

const TABS = [['area', 'APAR Area/Gedung'], ['forklift', 'APAR Forklift'], ['pembelian', 'Pembelian'], ['pic', 'PIC'], ['lokasi', 'Lokasi']];

export default function Admin() {
  const [tab, setTab] = useState('area');
  const { data: s, reload } = useLoad(() => apiAdmin('getAdminSummary'), []);
  return (
    <>
      <h1 className="page-title">⚙️ Admin - Tambah Data</h1>
      {s && (
        <div className="kpi-grid">
          <div className="kpi"><div className="num">{s.totalArea}</div><div className="lbl">APAR Area/Gedung</div></div>
          <div className="kpi"><div className="num">{s.totalForklift}</div><div className="lbl">APAR Forklift</div></div>
          <div className="kpi"><div className="num">{s.totalPic}</div><div className="lbl">PIC Terdaftar</div></div>
          <div className="kpi"><div className="num">{s.totalLokasi}</div><div className="lbl">Lokasi Terdaftar</div></div>
        </div>
      )}
      <div className="tabs">{TABS.map(([k, l]) => <button key={k} className={'tab ' + (tab === k ? 'active' : '')} onClick={() => setTab(k)}>{l}</button>)}</div>

      {tab === 'area' && (
        <FormPanel key="area" judul="Tambah APAR Area/Gedung Baru" aksi="addAparArea" onDone={reload}
          awal={{ area: '', merek: '', jenis: 'Powder', kapasitas: '', tanggalPasang: '', tanggalExpired: '', kondisi: 'Ok', status: 'Aktif', pic: '', hargaPerUnit: '', keterangan: '' }}
          sukses={(r) => 'Berhasil ditambahkan dengan kode ' + r.kode}
          fields={[['area', 'Area / Lokasi *', { ph: 'mis. Gudang B' }], ['merek', 'Merek'], ['jenis', 'Jenis *', { options: ['Powder', 'Foam'] }],
            ['kapasitas', 'Kapasitas (kg) *'], ['tanggalPasang', 'Tanggal Pasang', { type: 'date' }], ['tanggalExpired', 'Tanggal Expired', { type: 'date' }],
            ['kondisi', 'Kondisi', { options: ['Ok', 'Tdk'] }], ['status', 'Status', { options: ['Aktif', 'Belum Terpasang'] }],
            ['pic', 'PIC Default'], ['hargaPerUnit', 'Harga per Unit (Rp)', { type: 'number' }], ['keterangan', 'Keterangan', { wide: true }]]} />
      )}
      {tab === 'forklift' && (
        <FormPanel key="forklift" judul="Tambah APAR Forklift Baru" aksi="addAparForklift" onDone={reload}
          awal={{ unitForklift: '', areaOperasi: '', jenis: 'Powder', kapasitas: '', tanggalOrder: '', expiredLama: '', expiredBaru: '', tanggalKedatangan: '', pic: '', hargaPerUnit: '', keterangan: '' }}
          sukses={(r) => 'Berhasil ditambahkan dengan kode ' + r.kode}
          fields={[['unitForklift', 'Unit Forklift *', { ph: 'mis. Komatsu NG-11' }], ['areaOperasi', 'Area Operasi'], ['jenis', 'Jenis *', { options: ['Powder', 'Foam'] }],
            ['kapasitas', 'Kapasitas (kg) *'], ['tanggalOrder', 'Tanggal Order', { type: 'date' }], ['expiredLama', 'Expired Lama', { type: 'date' }],
            ['expiredBaru', 'Expired Baru', { type: 'date' }], ['tanggalKedatangan', 'Tanggal Kedatangan', { type: 'date' }],
            ['pic', 'PIC Default (operator)'], ['hargaPerUnit', 'Harga per Unit (Rp)', { type: 'number' }], ['keterangan', 'Keterangan', { wide: true }]]} />
      )}
      {tab === 'pembelian' && (
        <FormPanel key="pembelian" judul="Input Pembelian (Baru / Refill)" aksi="addPembelian"
          awal={{ tanggal: '', kodeApar: '', lokasiUnit: '', kategori: 'Gedung/Area', jenis: 'Powder', kapasitas: '', jenisPembelian: 'Baru', qty: '1', hargaUnit: '', supplier: '', keterangan: '' }}
          sukses={(r) => 'Pembelian tersimpan. Total: ' + rupiah(r.total)}
          fields={[['tanggal', 'Tanggal *', { type: 'date' }], ['kodeApar', 'Kode APAR *', { ph: 'mis. APAR-015' }], ['lokasiUnit', 'Lokasi/Unit'],
            ['kategori', 'Kategori *', { options: ['Gedung/Area', 'Forklift'] }], ['jenis', 'Jenis *', { options: ['Powder', 'Foam'] }], ['kapasitas', 'Kapasitas (kg)'],
            ['jenisPembelian', 'Jenis Pembelian *', { options: ['Baru', 'Refill'] }], ['qty', 'Qty *', { type: 'number' }], ['hargaUnit', 'Harga/Unit (Rp) *', { type: 'number' }],
            ['supplier', 'Supplier'], ['keterangan', 'Keterangan', { wide: true }]]} />
      )}
      {tab === 'pic' && (
        <FormPanel key="pic" judul="Tambah PIC / Petugas" aksi="addPicBaru" onDone={reload}
          awal={{ nama: '', departemen: '', kontak: '', role: 'Checker Area', pin: '' }}
          sukses={() => 'PIC berhasil ditambahkan.'}
          fields={[['nama', 'Nama *'], ['departemen', 'Departemen'], ['kontak', 'Kontak'], ['role', 'Role', { options: ['Checker Area', 'Checker Forklift', 'Admin/Approval'] }],
            ['pin', 'PIN (4 digit) *', { ph: 'mis. 4821' }]]} />
      )}
      {tab === 'lokasi' && (
        <FormPanel key="lokasi" judul="Tambah Lokasi" aksi="addLokasiBaru" onDone={reload}
          awal={{ nama: '', kategori: 'Gedung/Area', areaDepartemen: '' }}
          sukses={() => 'Lokasi berhasil ditambahkan.'}
          fields={[['nama', 'Nama Lokasi *'], ['kategori', 'Kategori', { options: ['Gedung/Area', 'Forklift'] }], ['areaDepartemen', 'Area/Departemen']]} />
      )}
    </>
  );
}
