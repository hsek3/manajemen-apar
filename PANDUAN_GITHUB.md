# Panduan Pasang — Manajemen APAR (Frontend GitHub Pages + Data Google Sheets)

**Cara kerjanya**
- **Data tetap di Google Sheets Anda** (semua sheet & kolom sama seperti sebelumnya → tidak perlu migrasi).
- **Apps Script** sekarang cuma jadi "pintu data" (API JSON), tanpa halaman HTML.
- **Tampilan** (React) di-hosting di **GitHub Pages**, dan memanggil API tadi.

Urutannya: 1) pasang API di Apps Script → 2) isi alamat API di kode → 3) upload ke GitHub → 4) pakai.

---

## 1. Pasang API di Apps Script

1. Buka **spreadsheet LIVE** Anda (yang berisi data & sudah dipakai), di akun **Gmail pribadi** (akun Workspace kantor tidak bisa "Anyone").
2. **Extensions → Apps Script.**
3. Pastikan hanya ada **satu** file `.gs`. **Hapus semua isinya**, lalu tempel seluruh isi file `apps-script/Code.gs` (atau `API_Code.gs`). Klik 💾 Save.
   - File HTML lama (Admin, Checklist, Dashboard, Home, dst.) **tidak dipakai lagi** — boleh dihapus.
4. Pilih fungsi **`authorize`** di dropdown → klik **▷ Jalankan** → izinkan akses (Sheets & Drive). Ini cukup sekali.
5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Klik Deploy → **salin URL yang berakhiran `/exec`**.
6. **Tes:** buka URL itu di browser. Harus muncul teks seperti `{"ok":true,"data":{"pesan":"API Manajemen APAR aktif",...}}`.

> Setiap kali Anda mengubah `Code.gs` di kemudian hari: Deploy → **Manage deployments** → ✏️ → Version: **New version** → Deploy (URL tidak berubah).

**Cek di spreadsheet sebelum lanjut:**
- Sheet `SETTING` → baris `ADMIN_PASSWORD`: **ganti** dari `ubah-password-ini` ke password Anda.
- Sheet `PIC` → kolom `PIN`: isi PIN tiap petugas (disarankan 4 digit; format kolom sebagai *teks* kalau ada PIN berawalan 0).
- (Opsional) `SETTING` → `DRIVE_FOLDER_FOTO_ID`: ID folder Drive untuk menyimpan foto checklist. Kosong = foto masuk ke Drive utama.

## 2. Isi alamat API di kode frontend

Buka `src/config.js`, ganti:
```js
export const API_URL = 'https://script.google.com/macros/s/ISI_DEPLOYMENT_ID_ANDA/exec';
```
dengan URL `/exec` dari langkah 1.5. (Bisa diedit langsung di GitHub setelah di-upload: buka file → ikon ✏️ → Commit.)

Nama repository GitHub bebas (tidak perlu disesuaikan di kode).

## 3. Upload ke GitHub & aktifkan Pages

1. Di github.com buat repository (mis. `manajemen-apar`, **Public**), tanpa README.
2. Ekstrak file zip. Buka folder hasil ekstrak, **pilih semua isinya** (termasuk folder `.github`, `src`, `public`) lalu **drag & drop** ke halaman repository ("uploading an existing file") → **Commit changes**.
   - Penting: yang di-upload adalah *isi* foldernya, bukan zip-nya, dan `package.json` harus berada di paling atas repo.
3. Buka **Settings → Pages** → bagian *Build and deployment* → **Source: GitHub Actions**.
4. Buka tab **Actions**: tunggu proses "Deploy ke GitHub Pages" selesai (±2 menit, centang hijau).
5. Situs Anda: `https://NAMA_AKUN_GITHUB.github.io/NAMA_REPO/`

> Kalau Actions gagal (silang merah): klik prosesnya → salin pesan error merahnya, kirim ke saya.

## 4. Mulai pakai

- Buka situs → login **password admin**. Login tersimpan di browser (tidak perlu login tiap pindah halaman).
- Menu **QR Codes** → cetak / download PDF / download JPG per APAR. **Cetak QR dari situs yang sudah online** (bukan dari komputer lokal), karena isi QR mengikuti alamat situs. QR lama (versi Apps Script) harus diganti.
- Tes alur checklist: `https://NAMA_AKUN_GITHUB.github.io/NAMA_REPO/#/checklist/APAR-001`
- **Logo/favicon:** file `public/favicon.png` (logo pemadam api Anda). Mau ganti logo → timpa file itu.

## Yang berubah dibanding versi Apps Script

| Hal | Sekarang |
|---|---|
| Login admin | Cukup 1x (tersimpan di browser) |
| Ikon tab browser | Langsung pakai logo Anda, tanpa trik apa pun |
| PDF / Excel / Draf Laporan K3 | Dibuat di browser (tidak tergantung izin Google Sheets) |
| QR Code | Dibuat di browser, tanpa layanan luar; ada PDF & JPG |
| Link scan | Berbentuk `.../#/checklist/APAR-001` |
| Realisasi budget | Dihitung langsung dari sheet `PEMBELIAN` |
| Foto checklist | Otomatis diperkecil sebelum upload (hemat sinyal) |

## Catatan keamanan & batasan (jujur)
- API bersifat publik ("Anyone"). **Password admin dicek di server pada setiap permintaan**, dan **PIN dicek di server saat submit checklist**. Tapi tidak ada pembatasan percobaan salah, dan password admin tersimpan di browser perangkat yang dipakai login. Cukup untuk alat internal, bukan untuk data sangat rahasia.
- Tiap aksi memanggil Apps Script, jadi ada jeda ±1–3 detik. Normal.
- Kuota Apps Script akun gratis cukup untuk puluhan petugas; kalau ratusan scan bersamaan, bisa ada yang gagal sesaat.
