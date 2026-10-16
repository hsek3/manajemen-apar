import { SITE_URL } from '../config.js';

export function parseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
}

export function fmtDate(v) {
  const d = parseDate(v);
  if (!d) return '-';
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
}

export function fmtDateTime(v) {
  const d = parseDate(v);
  if (!d) return '-';
  const hasTime = typeof v === 'string' && v.length > 10;
  return fmtDate(v) + (hasTime ? ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') : '');
}

export const toInputDate = (v) => (v ? String(v).slice(0, 10) : '');

export function rupiah(n) {
  return 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');
}

export const BULAN_LABEL = {
  '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April', '05': 'Mei', '06': 'Juni',
  '07': 'Juli', '08': 'Agustus', '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember',
};
export const BULAN_SINGKAT = { '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'Mei', '06': 'Jun', '07': 'Jul', '08': 'Agu', '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des' };

export const bulanSekarang = () => String(new Date().getMonth() + 1).padStart(2, '0');
export const tahunSekarang = () => new Date().getFullYear();

/** Link checklist yang ditanam di QR Code (memakai hash agar jalan di GitHub Pages). */
export function checklistLink(kode) {
  const base = SITE_URL || (window.location.origin + window.location.pathname);
  return base.replace(/#.*$/, '') + '#/checklist/' + encodeURIComponent(kode);
}

export function sanitizeKode(v) {
  let s = decodeURIComponent(String(v || '')).trim();
  s = s.replace(/^['"`\u2018\u2019\u201C\u201D]+/, '').replace(/['"`\u2018\u2019\u201C\u201D]+$/, '');
  return s.trim();
}
