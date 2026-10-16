import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { fmtDate, sanitizeKode } from '../lib/helpers.js';
import { StatusBadge } from '../components/ui.jsx';

/** Perkecil foto (maks 1280px, JPEG 70%) supaya upload cepat di sinyal pabrik. */
function compressImage(file, maxDim = 1280, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({ dataUrl, base64: dataUrl.split(',')[1], mime: 'image/jpeg' });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function Checklist() {
  const params = useParams();
  const kode = sanitizeKode(params.kode || '');

  const [apar, setApar] = useState(null);         // null = memuat, {found:false} = tidak ada
  const [loadErr, setLoadErr] = useState('');
  const [picList, setPicList] = useState([]);
  const [items, setItems] = useState([]);

  const [nama, setNama] = useState('');
  const [pin, setPin] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [loggedPic, setLoggedPic] = useState('');
  const [busyLogin, setBusyLogin] = useState(false);

  const [nilai, setNilai] = useState({});
  const [hasil, setHasil] = useState('Baik');
  const [catatan, setCatatan] = useState('');
  const [foto, setFoto] = useState(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!kode) return;
    Promise.all([api('getAparByKode', { kode }), api('getPicList'), api('getChecklistItems')])
      .then(([a, p, it]) => {
        setApar(a); setPicList(p); setItems(it);
        const init = {}; it.forEach((i) => { init[i.key] = 'Baik'; }); setNilai(init);
      })
      .catch((e) => setLoadErr(e.message));
  }, [kode]);

  async function login(e) {
    e.preventDefault();
    setLoginErr('');
    if (!nama) return setLoginErr('Pilih nama Anda terlebih dahulu.');
    if (!pin) return setLoginErr('PIN wajib diisi.');
    setBusyLogin(true);
    try {
      const r = await api('verifyPicLogin', { nama, pin });
      if (r.ok) setLoggedPic(nama); else setLoginErr(r.message);
    } catch (err) { setLoginErr(err.message); }
    setBusyLogin(false);
  }

  async function pilihFoto(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try { setFoto(await compressImage(f)); } catch { setResult({ ok: false, message: 'Foto tidak bisa dibaca, coba foto lain.' }); }
  }

  async function submit() {
    setSending(true); setResult(null);
    try {
      const form = {
        kode: apar.kode, picPemeriksa: loggedPic, pin, hasil, catatan, ...nilai,
        fotoBase64: foto ? foto.base64 : '', fotoMime: foto ? foto.mime : '',
      };
      const r = await api('submitChecklist', { form });
      setResult(r);
    } catch (err) { setResult({ ok: false, message: err.message }); }
    setSending(false);
  }

  const header = (sub) => (
    <div className="cl-header"><h1>🧯 Check APAR Bulanan</h1><p>{sub}</p></div>
  );

  if (!kode) return <div>{header('Silakan scan QR Code di unit APAR.')}</div>;
  if (loadErr) return <div>{header('Kode: ' + kode)}<div className="cl-wrap"><div className="msg msg-err" style={{ margin: 14 }}>⚠️ {loadErr}</div></div></div>;
  if (!apar) return <div>{header('Memuat data APAR...')}</div>;
  if (!apar.found) {
    return <div>{header('Kode: ' + kode)}<div className="cl-wrap"><div className="msg msg-err" style={{ margin: 14 }}>
      Kode APAR tidak ditemukan di Master Data. Pastikan QR Code masih valid, atau hubungi Admin.</div></div></div>;
  }

  if (result && result.ok) {
    return <div>{header(apar.lokasiUnit + ' (' + apar.tipe + ')')}<div className="cl-wrap"><div className="msg msg-ok" style={{ margin: 14 }}>✅ {result.message}</div></div></div>;
  }

  return (
    <div>
      {header(apar.lokasiUnit + ' (' + apar.tipe + ')')}
      <div className="cl-wrap">
        <div className="card">
          <div className="info-row"><span>Kode APAR</span><b>{apar.kode}</b></div>
          <div className="info-row"><span>Lokasi / Unit</span><b>{apar.lokasiUnit}</b></div>
          <div className="info-row"><span>Jenis</span><b>{apar.jenis}</b></div>
          <div className="info-row"><span>Kapasitas</span><b>{apar.kapasitas} kg</b></div>
          <div className="info-row"><span>Status Saat Ini</span><StatusBadge s={apar.status} /></div>
          <div className="info-row"><span>Masa Berlaku s/d</span><b>{fmtDate(apar.tanggalExpired)}</b></div>
          <p className="hint">Lokasi &amp; data APAR terisi otomatis dari hasil scan QR. Tanggal &amp; jam pemeriksaan tercatat otomatis saat Anda submit.</p>
        </div>

        {!loggedPic ? (
          <form className="card" onSubmit={login}>
            <label>Nama PIC Pemeriksa *</label>
            <select value={nama} onChange={(e) => setNama(e.target.value)}>
              <option value="">-- Pilih Nama Anda --</option>
              {picList.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <label>PIN *</label>
            <input type="text" inputMode="numeric" maxLength={8} placeholder="Masukkan PIN Anda" value={pin} onChange={(e) => setPin(e.target.value)} />
            <div className="btn-row"><button className="btn btn-primary" style={{ width: '100%' }} disabled={busyLogin}>{busyLogin ? 'Memeriksa...' : 'MASUK'}</button></div>
            <p className="hint">Login diperlukan supaya data pemeriksa tercatat akurat. Lupa PIN? Hubungi Admin/K3.</p>
            {loginErr && <div className="msg msg-err">{loginErr}</div>}
          </form>
        ) : (
          <div className="card">
            <div className="pic-display">Login sebagai: <b>{loggedPic}</b></div>
            <label>Checklist Kondisi</label>
            {items.map((it) => (
              <div className="item-row" key={it.key}>
                <span>{it.label}</span>
                <select value={nilai[it.key] || 'Baik'} onChange={(e) => setNilai({ ...nilai, [it.key]: e.target.value })}>
                  <option>Baik</option><option>Tidak Baik</option><option>N/A</option>
                </select>
              </div>
            ))}
            <label>Hasil Pemeriksaan *</label>
            <select value={hasil} onChange={(e) => setHasil(e.target.value)}>
              <option>Baik</option><option>Perlu Perbaikan</option><option>Terpakai</option><option>Expired</option>
            </select>
            <label>Catatan</label>
            <textarea rows={3} placeholder="Catatan tambahan (opsional)" value={catatan} onChange={(e) => setCatatan(e.target.value)} />
            <label>Foto APAR</label>
            <input type="file" accept="image/*" capture="environment" onChange={pilihFoto} />
            {foto && <img className="foto-preview" src={foto.dataUrl} alt="pratinjau" />}
            <div className="btn-row">
              <button className="btn btn-primary" style={{ width: '100%', padding: 14 }} disabled={sending} onClick={submit}>
                {sending ? 'Mengirim...' : 'SUBMIT CHECKLIST'}
              </button>
            </div>
            {result && !result.ok && <div className="msg msg-err">⚠️ {result.message}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
