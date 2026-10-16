import React, { useMemo, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { apiAdmin } from '../lib/api.js';
import { useLoad } from '../lib/hooks.js';
import { checklistLink } from '../lib/helpers.js';
import { exportQrExcel, exportQrPdf } from '../lib/exporters.js';
import { ErrorBox, Loading } from '../components/ui.jsx';

export default function QRCodes() {
  const { data, loading, error, reload } = useLoad(async () => {
    const [a, f] = await Promise.all([apiAdmin('getMasterAparList'), apiAdmin('getMasterForkliftList')]);
    return [
      ...a.map((x) => ({ kode: x.Kode_APAR, lokasi: x.Area, kategori: 'Gedung/Area' })),
      ...f.map((x) => ({ kode: x.Kode_APAR, lokasi: x.Unit_Forklift, kategori: 'Forklift' })),
    ];
  }, []);
  const [kat, setKat] = useState('Semua');
  const items = useMemo(() => (data || []).filter((i) => kat === 'Semua' || i.kategori === kat), [data, kat]);

  const canvasOf = (kode) => document.getElementById('qr_' + kode);

  function unduhJpg(kode) {
    const c = canvasOf(kode);
    if (!c) return;
    const a = document.createElement('a');
    a.href = c.toDataURL('image/jpeg', 0.95);
    a.download = kode + '.jpg';
    a.click();
  }

  return (
    <>
      <h1 className="page-title no-print">🔳 QR Code APAR</h1>
      <p className="page-sub no-print">QR berisi link ke halaman checklist: <code>{checklistLink('APAR-001')}</code></p>
      <div className="toolbar no-print">
        <select value={kat} onChange={(e) => setKat(e.target.value)} style={{ maxWidth: 200 }}>
          <option>Semua</option><option>Gedung/Area</option><option>Forklift</option>
        </select>
        <button className="btn btn-primary" onClick={() => window.print()}>🖨 PRINT</button>
        <button className="btn btn-outline" disabled={!items.length} onClick={() => exportQrPdf(items, canvasOf)}>📄 DOWNLOAD PDF</button>
        <button className="btn btn-outline" disabled={!items.length} onClick={() => exportQrExcel(items)}>📥 DOWNLOAD EXCEL (daftar & link)</button>
      </div>
      {loading && <Loading />}
      {error && <ErrorBox error={error} onRetry={reload} />}
      <div className="qr-grid">
        {items.map((i) => (
          <div className="qr-card" key={i.kode}>
            <QRCodeCanvas id={'qr_' + i.kode} value={checklistLink(i.kode)} size={150} level="M" includeMargin bgColor="#ffffff" fgColor="#000000" />
            <div className="kode">{i.kode}</div>
            <div className="lokasi">{i.lokasi}</div>
            <button className="no-print" onClick={() => unduhJpg(i.kode)}>⬇️ JPG</button>
          </div>
        ))}
      </div>
    </>
  );
}
