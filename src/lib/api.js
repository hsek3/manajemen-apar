import { API_URL } from '../config.js';

const ADMIN_KEY = 'apar_admin_pw_v1';
export const getAdminPw = () => localStorage.getItem(ADMIN_KEY) || '';
export const setAdminPw = (v) => localStorage.setItem(ADMIN_KEY, v);
export const clearAdminPw = () => localStorage.removeItem(ADMIN_KEY);

/**
 * Panggil API Apps Script. Dikirim sebagai text/plain supaya browser tidak
 * melakukan preflight CORS (Apps Script tidak mendukung preflight).
 */
export async function api(action, payload = {}, adminPassword) {
  let res;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload, adminPassword }),
    });
  } catch (e) {
    throw new Error('Tidak bisa terhubung ke server. Cek koneksi internet / API_URL di src/config.js.');
  }
  let json;
  try {
    json = await res.json();
  } catch (e) {
    throw new Error('Respon server tidak valid. Pastikan Web App Apps Script di-deploy dengan akses "Anyone" dan API_URL benar.');
  }
  if (!json.ok) {
    const err = new Error(json.error || 'Terjadi kesalahan di server.');
    err.code = json.code;
    if (json.code === 'UNAUTHORIZED') window.dispatchEvent(new Event('apar-unauthorized'));
    throw err;
  }
  return json.data;
}

/** Panggil API yang butuh login admin (password diambil dari penyimpanan browser). */
export const apiAdmin = (action, payload = {}) => api(action, payload, getAdminPw());
