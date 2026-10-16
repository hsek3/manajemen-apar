import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { BULAN_LABEL, fmtDate, fmtDateTime, checklistLink } from './helpers.js';

const periodeLabel = (d) => (BULAN_LABEL[d.bulan] || d.bulan) + ' ' + d.tahun;

/* ---------------------------- EXCEL ---------------------------- */
export function exportLaporanExcel(d, namaPerusahaan) {
  const wb = XLSX.utils.book_new();
  const ringkas = [
    ['LAPORAN BULANAN PEMERIKSAAN APAR'],
    [namaPerusahaan || ''],
    ['Periode', periodeLabel(d)],
    [],
    ['REKAP RINGKAS'],
    ['Total APAR', d.totalApar],
    ['Sudah Diperiksa', d.sudahDicek.length],
    ['Belum Diperiksa', d.belumDicek.length],
    ['Sudah Expired', d.expiredList.length],
    ['Akan Expired', d.akanExpiredList.length],
    ['Terpakai', d.terpakaiList.length],
    ['Perlu Perbaikan', d.perluPerbaikan.length],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ringkas), 'Ringkasan');

  const add = (nama, header, rows) =>
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([header, ...rows]), nama);

  add('Hasil Checklist', ['Kode APAR', 'Lokasi/Unit', 'PIC Pemeriksa', 'Hasil', 'Tanggal'],
    d.hasilChecklist.map((c) => [c.kode, c.lokasi, c.pic, c.hasil, fmtDateTime(c.tanggal)]));
  add('Belum Diperiksa', ['Kode APAR', 'Lokasi/Unit', 'Kategori'], d.belumDicek.map((c) => [c.kode, c.lokasi, c.kategori]));
  add('Expired', ['Kode APAR', 'Lokasi/Unit', 'Kategori'], d.expiredList.map((c) => [c.kode, c.lokasi, c.kategori]));
  add('Akan Expired', ['Kode APAR', 'Lokasi/Unit', 'Tanggal Expired'], d.akanExpiredList.map((c) => [c.kode, c.lokasi, fmtDate(c.expired)]));
  add('Perlu Perbaikan', ['Kode APAR', 'Lokasi/Unit', 'PIC', 'Catatan'], d.perluPerbaikan.map((c) => [c.kode, c.lokasi, c.pic, c.catatan]));

  XLSX.writeFile(wb, `Laporan_APAR_${d.tahun}-${d.bulan}.xlsx`);
}

export function exportQrExcel(items) {
  const rows = items.map((i) => [i.kode, i.lokasi, i.kategori, checklistLink(i.kode)]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Kode APAR', 'Lokasi/Unit', 'Kategori', 'Link Checklist'], ...rows]), 'QR');
  XLSX.writeFile(wb, 'Daftar_QR_APAR.xlsx');
}

/* ---------------------------- PDF ---------------------------- */
function judul(doc, teks, y, size = 11) {
  const h = doc.internal.pageSize.getHeight();
  if (y > h - 40) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold'); doc.setFontSize(size);
  doc.text(teks, 14, y);
  return y + 3;
}
function tabel(doc, y, head, body, opts = {}) {
  autoTable(doc, {
    startY: y, head: [head], body: body.length ? body : [[{ content: 'Tidak ada data.', colSpan: head.length, styles: { halign: 'center', textColor: 120 } }]],
    styles: { fontSize: 8.5, cellPadding: 1.8 }, headStyles: { fillColor: [31, 78, 120] }, margin: { left: 14, right: 14 }, ...opts,
  });
  return doc.lastAutoTable.finalY + 8;
}

/** Laporan pemeriksaan bulanan (ringkas, murni pengecekan APAR). */
export function exportLaporanPdf(d, namaPerusahaan) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.text('LAPORAN BULANAN PEMERIKSAAN APAR', 14, 16);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.text(namaPerusahaan || '', 14, 22);
  doc.text('Periode: ' + periodeLabel(d), 14, 27);

  let y = 34;
  y = judul(doc, 'Rekap Ringkas', y);
  y = tabel(doc, y, ['Keterangan', 'Jumlah'], [
    ['Total APAR', d.totalApar], ['Sudah Diperiksa', d.sudahDicek.length], ['Belum Diperiksa', d.belumDicek.length],
    ['Sudah Expired', d.expiredList.length], ['Akan Expired', d.akanExpiredList.length],
    ['Terpakai', d.terpakaiList.length], ['Perlu Perbaikan', d.perluPerbaikan.length],
  ], { tableWidth: 90 });
  y = judul(doc, 'Hasil Checklist Bulan Ini', y);
  y = tabel(doc, y, ['Kode APAR', 'Lokasi/Unit', 'PIC', 'Hasil', 'Tanggal'], d.hasilChecklist.map((c) => [c.kode, c.lokasi, c.pic, c.hasil, fmtDateTime(c.tanggal)]));
  y = judul(doc, 'Belum Diperiksa', y);
  y = tabel(doc, y, ['Kode APAR', 'Lokasi/Unit', 'Kategori'], d.belumDicek.map((c) => [c.kode, c.lokasi, c.kategori]));
  y = judul(doc, 'Sudah Expired', y);
  y = tabel(doc, y, ['Kode APAR', 'Lokasi/Unit', 'Kategori'], d.expiredList.map((c) => [c.kode, c.lokasi, c.kategori]));
  y = judul(doc, 'Akan Expired', y);
  y = tabel(doc, y, ['Kode APAR', 'Lokasi/Unit', 'Tanggal Expired'], d.akanExpiredList.map((c) => [c.kode, c.lokasi, fmtDate(c.expired)]));
  y = judul(doc, 'Perlu Perbaikan', y);
  tabel(doc, y, ['Kode APAR', 'Lokasi/Unit', 'PIC', 'Catatan'], d.perluPerbaikan.map((c) => [c.kode, c.lokasi, c.pic, c.catatan]));

  doc.save(`Laporan_APAR_${d.tahun}-${d.bulan}.pdf`);
}

/** Draf Laporan Bulanan K3 (format resmi + kolom tanda tangan). */
export function exportLaporanK3Pdf(d, namaPerusahaan) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.text('LAPORAN BULANAN K3', W / 2, 18, { align: 'center' });
  doc.setFontSize(12);
  doc.text('PEMERIKSAAN ALAT PEMADAM API RINGAN (APAR)', W / 2, 25, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.text(namaPerusahaan || '(Nama Perusahaan)', W / 2, 31, { align: 'center' });
  doc.text('Periode: ' + periodeLabel(d), W / 2, 36, { align: 'center' });
  doc.setLineWidth(0.5); doc.line(14, 40, W - 14, 40);

  let y = 48;
  y = judul(doc, '1. RINGKASAN PEMERIKSAAN', y, 11);
  y = tabel(doc, y, ['Keterangan', 'Jumlah'], [
    ['Total APAR Terdaftar', d.totalApar],
    ['Sudah Diperiksa Bulan Ini', d.sudahDicek.length],
    ['Belum Diperiksa', d.belumDicek.length],
    ['Kondisi Baik / Aktif', d.aktif],
    ['Sudah Expired', d.expiredList.length],
    ['Akan Expired (perlu perhatian)', d.akanExpiredList.length],
    ['Terpakai (perlu isi ulang)', d.terpakaiList.length],
    ['Perlu Perbaikan / Tindak Lanjut', d.perluPerbaikan.length],
  ], { tableWidth: 110 });

  y = judul(doc, '2. HASIL PEMERIKSAAN BULAN INI', y, 11);
  y = tabel(doc, y, ['No', 'Kode APAR', 'Lokasi/Unit', 'PIC Pemeriksa', 'Hasil', 'Tanggal'],
    d.hasilChecklist.map((c, i) => [i + 1, c.kode, c.lokasi, c.pic, c.hasil, fmtDateTime(c.tanggal)]));

  y = judul(doc, '3. APAR BELUM DIPERIKSA', y, 11);
  y = tabel(doc, y, ['No', 'Kode APAR', 'Lokasi/Unit', 'Kategori'], d.belumDicek.map((c, i) => [i + 1, c.kode, c.lokasi, c.kategori]));

  y = judul(doc, '4. TEMUAN & TINDAK LANJUT', y, 11);
  y = tabel(doc, y, ['No', 'Kode APAR', 'Lokasi/Unit', 'PIC', 'Catatan Temuan'],
    d.perluPerbaikan.map((c, i) => [i + 1, c.kode, c.lokasi, c.pic, c.catatan || '-']));

  y = judul(doc, '5. STATUS MASA BERLAKU', y, 11);
  const exp = [
    ...d.expiredList.map((c) => [c.kode, c.lokasi, 'Sudah expired']),
    ...d.akanExpiredList.map((c) => [c.kode, c.lokasi, 'Akan expired: ' + fmtDate(c.expired)]),
  ];
  y = tabel(doc, y, ['Kode APAR', 'Lokasi/Unit', 'Status'], exp);

  // Kolom tanda tangan
  const H = doc.internal.pageSize.getHeight();
  if (y > H - 60) { doc.addPage(); y = 25; }
  const cols = [['Disusun oleh,', 'Petugas/Admin APAR'], ['Diperiksa oleh,', 'Koordinator K3'], ['Disetujui oleh,', 'Manajemen']];
  const cw = (W - 28) / 3;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  cols.forEach((c, i) => {
    const x = 14 + i * cw + cw / 2;
    doc.text(c[0], x, y, { align: 'center' });
    doc.text('( ........................ )', x, y + 28, { align: 'center' });
    doc.text(c[1], x, y + 34, { align: 'center' });
  });

  doc.save(`Laporan_K3_APAR_${d.tahun}-${d.bulan}.pdf`);
}

/** Semua QR dalam 1 PDF (grid 4 x 6 per halaman). canvasOf(kode) -> elemen <canvas>. */
export function exportQrPdf(items, canvasOf) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const cols = 4, rows = 6, cellW = (W - 20) / cols, cellH = 46, size = 32;
  items.forEach((it, idx) => {
    const pos = idx % (cols * rows);
    if (idx > 0 && pos === 0) doc.addPage();
    const cx = 10 + (pos % cols) * cellW, cy = 12 + Math.floor(pos / cols) * cellH;
    const canvas = canvasOf(it.kode);
    if (canvas) doc.addImage(canvas.toDataURL('image/png'), 'PNG', cx + (cellW - size) / 2, cy, size, size);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text(it.kode, cx + cellW / 2, cy + size + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    doc.text(String(it.lokasi || '').slice(0, 30), cx + cellW / 2, cy + size + 9, { align: 'center' });
  });
  doc.save('QR_APAR.pdf');
}
