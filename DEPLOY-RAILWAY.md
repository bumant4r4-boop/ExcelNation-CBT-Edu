# Deploy ExcelNation ke Railway (gratis) — khusus guru hanya punya HP

Setelah ini, guru & siswa cukup buka **satu link** di Chrome HP. Tidak perlu laptop.

---

## A. Siapkan akun (sekali saja)

1. Buka Chrome di HP: [https://railway.app](https://railway.app)
2. Ketuk **Login**
3. Pilih **Login with GitHub**
   - Jika belum punya GitHub: buat dulu di [https://github.com/signup](https://github.com/signup) (gratis)
4. Izinkan Railway mengakses GitHub

---

## B. Upload kode ke GitHub (dari HP)

### Cara termudah — lewat situs GitHub

1. Buka [https://github.com/new](https://github.com/new)
2. **Repository name:** `excelnation-cbt` (boleh ganti)
3. Pilih **Public**
4. Centang **Add a README file**
5. Ketuk **Create repository**

6. Di halaman repo, ketuk **Add file** → **Upload files**
7. Upload **semua isi folder** `ExcelNation-Online`:
   - `index.html`
   - `server.js`
   - `package.json`
   - `Procfile`
   - `railway.toml`
   - `README.md` (opsional)
8. Ketuk **Commit changes**

> Tips: extract zip di HP dulu (aplikasi Files / ZArchiver), lalu pilih file-file di atas saat upload.

---

## C. Pasang di Railway

1. Buka [https://railway.app/new](https://railway.app/new)
2. Pilih **Deploy from GitHub repo**
3. Pilih repo `excelnation-cbt`
4. Railway akan otomatis build & menjalankan `node server.js`
5. Tunggu sampai status **Success** / **Online** (1–3 menit)

### Aktifkan link publik
1. Buka project Anda di Railway
2. Ketuk service yang baru dibuat
3. Tab **Settings** → **Networking** / **Public Networking**
4. Ketuk **Generate Domain**
5. Salin link-nya, contoh:
   ```text
   https://excelnation-cbt-production-xxxx.up.railway.app
   ```

---

## D. Uji coba

1. Buka link tersebut di Chrome HP
2. Pastikan muncul **● Online**
3. Login guru → kode **`XC1EL`**
4. Buat/unggah soal → atur jadwal → **Simpan & Terbitkan**
5. Di HP lain / mode siswa: buka **link yang sama** → login nama → password `ExcelNation123`
6. Cek **Beranda / E-Exam** — ujian harus terlihat

---

## E. Setiap hari ujian

| Langkah | Siapa |
|---------|--------|
| Buka link Railway | Guru & siswa |
| Login `XC1EL` → terbitkan ujian | Guru |
| Login nama → E-Exam | Siswa |

Simpan link di catatan HP / kirim ke grup WhatsApp kelas.

---

## F. Jika gagal build

Di Railway → tab **Deployments** → lihat log.

Yang sering terjadi:
- File `package.json` atau `server.js` tidak ikut ter-upload → upload ulang
- Domain belum di-generate → Settings → Generate Domain
- Sleep di paket gratis: request pertama bisa lambat 20–60 detik (tunggu, lalu refresh)

---

## G. Alternatif: Render.com

1. [https://render.com](https://render.com) → Sign up with GitHub  
2. **New** → **Web Service** → pilih repo yang sama  
3. **Build Command:** _(kosongkan)_  
4. **Start Command:** `node server.js`  
5. **Create Web Service** → tunggu → salin URL  

---

## Login cepat
- **Guru:** `XC1EL`
- **Siswa:** pilih nama → `ExcelNation123`

---
Together We Achieve Greatness · ExcelNation
