# Backend RUANGKISAH

Backend aktif untuk akun, sesi, dan administrasi platform siswa lintas sekolah.

## Stack dan entry point

Node.js >=24.15.0, Express, Better Auth, Kysely, PostgreSQL (pg), Nodemailer dan Helmet. Produksi memakai Supabase; SQLite hanya untuk pengembangan lokal. Rate limit memakai UPSERT database atomik lintas instance. Tidak ada endpoint atau tabel isi jurnal.

- npm run dev: API dengan watch, default localhost:4000; gunakan frontend Vite 5173.
- npm run start:local: API + build frontend, localhost:4000.
- npm start: konfigurasi dari .env/lingkungan; SERVE_FRONTEND=true menyajikan build SPA.
- npm run bootstrap: Superadmin pertama dari BOOTSTRAP_EMAIL/BOOTSTRAP_PASSWORD (minimal 12 karakter); tidak ada seed produksi.
- npm test / npm run lint / npm run format:check: pemeriksaan backend.

.env dibaca dari working directory backend. DATA_DIR default .data; jangan menjalankan dua server terhadap database yang sama untuk pengujian. Semua tes memakai lokasi terisolasi.

## Kontrak HTTP

| Endpoint                             | Akses                                                            |
| ------------------------------------ | ---------------------------------------------------------------- |
| GET /api/health                      | Publik, memeriksa koneksi dan schema aplikasi                    |
| GET /api/config                      | Publik, hanya mode email                                         |
| /api/auth/*                          | Better Auth: daftar/login/logout/verifikasi/reset/update profile |
| GET /api/me                          | Sesi aktif terverifikasi                                         |
| GET /api/admin/accounts              | Admin melihat siswa; Superadmin melihat akun pengelola juga      |
| GET /api/admin/audit                 | Superadmin                                                       |
| DELETE /api/admin/accounts/:id       | Pengelola sesuai kewenangan                                      |
| PATCH /api/admin/accounts/:id/status | Pengelola sesuai kewenangan                                      |
| PATCH /api/admin/accounts/:id/role   | Superadmin, target role siswa/admin                              |

Role berasal dari database, bukan payload/penyimpanan browser. Input role/status pada registrasi diabaikan. Perubahan peran/status dan penghapusan mencabut sesi target. Superadmin dilindungi dan tidak ada endpoint bootstrap publik. Mutation HTTP wajib berasal dari origin yang diizinkan. Cookie sesi HttpOnly, SameSite bawaan library, Secure pada produksi; halaman dipublikasikan satu origin dengan API.

## Email dan operasi

MAIL_MODE=file hanya untuk lokal: outbox privat di .data/mail. Mode produksi menolak startup tanpa secret memadai, URL HTTPS, SMTP_URL dan MAIL_FROM. Jangan menyajikan .data melalui static middleware. Konfigurasi TRUST_PROXY_HOPS=1 hanya ketika aplikasi berada di belakang satu proxy tepercaya dan port backend tidak terbuka langsung ke internet.

Sesi maksimal 24 jam. Akun tersimpan sampai dihapus. Audit akun bertahan 180 hari dan dibersihkan pada startup/permintaan API; sesi/token yang kedaluwarsa ikut dibersihkan. Log audit tidak berisi kata sandi atau jurnal. Backup akun memerlukan backup SQLite yang konsisten beserta pengamanan aksesnya; backup akun tidak mencadangkan jurnal perangkat.

Rujukan integrasi: [Better Auth Express](https://better-auth.com/docs/integrations/express), [SQLite](https://better-auth.com/docs/adapters/sqlite), [email/password](https://better-auth.com/docs/authentication/email-password).

## Vercel + Supabase

Ikuti [panduan deploy manual](../DEPLOY_VERCEL.md). Project ref tujuan: veinqenogcvmxdbefhzm. Entry Function berada pada ../api/index.js. DATABASE_URL di server adalah URI PostgreSQL pooler; URL HTTPS proyek Supabase tidak dapat dipakai sebagai penggantinya. Semua query memakai schema privat ruangkisah; browser tidak memakai API key Supabase.

- npm run db:migrate: migrasi eksplisit dengan MIGRATION_DATABASE_URL atau DATABASE_URL administratif.
- npm run db:create-runtime: membuat login database terbatas menggunakan RUNTIME_DB_PASSWORD privat; tidak merotasi role yang sudah ada.
- npm run db:import-sqlite -- --source PATH: impor akun/hash/ID/audit ke tujuan kosong; sumber read-only, sesi/token tidak dipindah.
- npm run test:postgres: menjalankan tes akun/role/reset serta deployment/izin/impor/limiter pada cluster PostgreSQL sementara.

Produksi menolak SQLite, SMTP file, TLS remote nonaktif dan auto-migrasi saat request. Pool default satu koneksi per instance; TLS memverifikasi sertifikat dan mendukung DATABASE_CA_CERT. Gunakan runtime login terbatas, bukan credential admin/migrasi, pada Vercel. Akun tetap Better Auth, bukan Supabase Auth; jurnal tetap lokal.

## Persetujuan pendaftaran versi 1.4

approvalStatus bersifat server-only: pending saat signup, approved hanya melalui pengelola. PATCH /api/admin/accounts/:id/approval menerima approvalStatus=approved; Admin hanya siswa, Superadmin mengikuti batas perannya. Target harus emailVerified dan enabled. Pengulangan keputusan ditolak; perubahan/audit atomik. Login/reset/aktivasi/perubahan role tidak otomatis menyetujui. Guard memeriksa persetujuan pada setiap sesi/API.

Schema version 2 diperlukan. Migrasi mempertahankan pengelola lama dan mencabut sesi siswa yang belum disetujui tanpa menghapus akun/jurnal; ulang migrasi tidak menyetujui siswa baru. Bootstrap Superadmin tetap lewat CLI privat. Import sumber lama tanpa approvalStatus memberi siswa pending. Penerapan Supabase/Vercel tetap manual.
