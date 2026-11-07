# ExcelNation CBT Edu — Mode Online

Aplikasi ujian CBT multi-perangkat. Guru dan siswa membuka **alamat yang sama** di jaringan (Wi‑Fi sekolah / hotspot).

## Cara menjalankan (cepat)

### 1. Syarat
- Install [Node.js](https://nodejs.org/) (versi 16 ke atas)
- Laptop guru dan perangkat siswa **satu jaringan**

### 2. Jalankan server di laptop guru
```bash
cd ExcelNation-Online
node server.js
```

Di terminal akan muncul misalnya:
```text
Lokal    : http://127.0.0.1:8080
Jaringan : http://192.168.1.10:8080
```

### 3. Buka di browser / SEB
| Peran | Alamat |
|--------|--------|
| Guru (di laptop) | `http://127.0.0.1:8080` |
| Siswa (HP/laptop lain) | `http://192.168.1.10:8080` ← pakai IP yang muncul di terminal |

Status di pojok harus **● Online**.

## Login
| Peran | Cara |
|--------|------|
| **Siswa** | Pilih nama → password otomatis `ExcelNation123` |
| **Guru** | Panel guru → kode akses **`XC1EL`** |

## Agar soal muncul di beranda siswa
1. Login guru → buat/unggah soal  
2. Atur **jam mulai & selesai** (harus mencakup waktu sekarang)  
3. Klik **Simpan & Terbitkan** (bukan hanya draft)  
4. Siswa refresh / buka **E-Exam** — ujian aktif muncul di beranda  

## Alur online
```text
Guru terbitkan ujian
    → tersimpan di server (data/store.json)
    → sinkron ke semua perangkat (~1,5 detik)
    → siswa melihat di Beranda & E-Exam
```

## Port khusus
```bash
PORT=3000 node server.js
```

## Cadangan data
- Otomatis di `data/store.json`
- Di aplikasi guru: **Pengaturan → Cadangan data**

## SEB (Safe Exam Browser)
Di **Pengaturan** guru: isi Start URL = alamat server (contoh `http://192.168.1.10:8080/`), unduh file `.seb`, bagikan ke siswa.

## Troubleshooting
| Masalah | Solusi |
|---------|--------|
| Siswa tidak lihat ujian | Sudah **Terbitkan**? Jadwal aktif? URL sama dengan guru? Status Online? |
| ● Offline | Pastikan buka lewat `http://IP:8080`, bukan double-click file HTML |
| HP tidak konek | Cek firewall Windows mengizinkan Node; pastikan satu Wi‑Fi |
| Kode ujian ditolak | Samakan kode saat terbit dengan yang diketik siswa |

---
Together We Achieve Greatness · ExcelNation
