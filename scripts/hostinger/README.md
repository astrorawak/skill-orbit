# Hostinger deploy — akun online SKILL//ORBIT (backend PHP)

Cara CEPAT & andal menaruh backend di shared hosting Hostinger **tanpa** PIPELINE NODE
(pipeline node `createNodeJSBuildFromArchive` di API hanya menjalankan `npm install` dan
TIDAK menaruh app ke docroot runtime → app tak pernah serve, 503. Jangan dipakai).

Jalur yang TERBUKTI (live, self-hosted):
1. Buat website addon `hosting_createWebsiteV1` + database `hosting_createAccountDatabaseV1`.
2. **Unggah file `.php` langsung ke docroot via TUS upload** — server Hostinger mengeksekusi
   PHP 8.3 secara instan, tanpa build. Lihat `upload-file.sh` (upload ke subdir `api/`).
3. `.htaccess` di `api/` me-rute semua `/api/*` → `index.php` (front controller).
4. CORS: `Access-Control-Allow-Origin: *` di index.php → frontend GitHub Pages bisa akses.

## Lokasi
- Backend source: `api/` (versi Node — untuk referensi/uji lokal) dan `/tmp/phpapi` (versi PHP yang LIVE).
- Script unggah: `scripts/hostinger/upload-file.sh` (gunakan: `bash upload-file.sh <file> api/<nama> <domain>`).
- Backend **LIVE**: `https://whitesmoke-wallaby-659657.hostingersite.com/api`
  - `/health`, `/health/db`, `/auth/register`, `/auth/login`, `/auth/forgot`(kode), `/auth/reset`, `/me` (GET|DELETE), `/skills` (GET/POST), `/skills/{id}` (PUT/DELETE)
  - Auth: HMAC-JWT (header `Authorization: Bearer <token>`), password bcrypt; `auth_user` cek user masih ada → token akun terhapus langsung mati; skema idempotent (tabel `users` + kolom `reset_hash`/`reset_exp` otomatis).
  - Hubungan CORS dibatasi origin frontend: `ALLOWED_ORIGINS` di `config.php` (default `https://astrorawak.github.io`). Origin lain → tanpa header Allow-Origin → browser blokir.
  - Lupa sandi: bila SMTP belum diisi, kode reset ditampilkan inline (fallback 1-pemilik). Begitu SMTP dipasang (konfig `SMTP_HOST/PORT/USER/PASS/FROM/SECURE` di `config.php`), kode **dikirim via email** (PHPMailer v6.9.3, sudah di-upload ke `api/phpmailer/`); bila kirim gagal otomatis turun ke inline — alur tak pernah rusak.
  - SMTP memakai PHPMailer (pure-PHP, tak perlu composer): `api/phpmailer/{PHPMailer,SMTP,Exception}.php` + `language/phpmailer.lang-id.php`. Gagal connection → `sent_email:false` + `smtp_error` (graceful, bukan 500).
- Database MySQL: `u864726623_skillorbit` (host `srv1868.hstgr.io`, user `u864726623_skillorbit`).
- Kredensial DB/JWT: JANGAN commit ke repo. Ada di `api/.env` (untuk uji lokal) & `config.php` server.

## Catatan penting
- **Jangan commit `.env` ke repo publik.** Sudah pernah bocor → kredensial dirotasi. `.env*` ada di `.gitignore`.
- Data uji `karman@rg.id` (user id 1) sengaja dibiarkan di DB live sbg bukti; Karman bisa daftar akun asli via UI.
- Rotasi kredensial: `hosting_changeDatabasePasswordV1` + patch `config.php` + re-upload (bukan build).
