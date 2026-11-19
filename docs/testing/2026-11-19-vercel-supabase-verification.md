# Verifikasi penyesuaian Vercel + Supabase — versi 1.3

**19 November 2026.** Tujuan: pengguna membuka UI React → API same-origin melalui handler Vercel → akun/sesi/audit PostgreSQL → respons UI. Aktivitas/jurnal tetap di browser; migrasi database tidak menambahkan unggah jurnal.

## Lingkungan dan hasil

Windows, Node.js 24.21.0, PostgreSQL 18.6 lokal sementara, Express/Better Auth 1.7.25, Kysely 0.29.9, pg 8.23.1. Cluster PostgreSQL native dijalankan melalui dependency dev embedded-postgres; bukan mock SQL. PostgreSQL proyek Supabase nyata belum dapat diakses untuk pengujian.

| Pemeriksaan                                  | Hasil                                                                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Backend lint / format                        | Lulus                                                                                                                                 |
| Backend default SQLite + konfigurasi/handler | 6 lulus, 1 tes PostgreSQL dilewati sesuai mode; 9,00 detik                                                                            |
| Backend test:postgres                        | 7 lulus, tanpa skip; 29,62 detik                                                                                                      |
| Frontend lint / format                       | Lulus                                                                                                                                 |
| Frontend unit/integrasi                      | 22 lulus, 7 file; 23,05 detik                                                                                                         |
| Build produksi                               | Lulus, dibuat ulang sebelum E2E                                                                                                       |
| E2E melalui handler Vercel + PostgreSQL      | 39 lulus, 1,8 menit; Chromium/Firefox/WebKit mobile/performa                                                                          |
| Konfigurasi entry                            | vercel.json valid JSON; api/index.js valid dan meng-export handler fungsi                                                             |
| Bundle browser                               | Tidak ditemukan nama secret DATABASE_URL/SMTP_URL/MIGRATION_DATABASE_URL/BOOTSTRAP_PASSWORD/RUNTIME_DB_PASSWORD pada JavaScript build |

Log: [PostgreSQL](./2026-11-19-postgres-migration.log), [frontend](./2026-11-19-vercel-frontend-unit.log), [E2E](./2026-11-19-vercel-supabase-e2e.log), [impor/snapshot PostgreSQL akhir](./2026-11-19-postgres-import-final.log).

## Cakupan

- HTTP akun: persetujuan, pemaksaan role siswa, password hash, verifikasi sebelum login, HttpOnly, logout, origin asing, role guard, promosi Admin, pembatasan Admin, perlindungan Superadmin, hapus/nonaktif mencabut sesi, audit dan reset sekali pakai.
- PostgreSQL: migrasi diulang tanpa duplikasi, tujuh tabel hanya pada schema privat ruangkisah, RLS aktif, role browser tidak mendapat akses schema, role backend tidak mendapat izin CREATE schema.
- Runtime database: login khusus dengan keanggotaan ruangkisah_app dapat mendaftar, memperbarui status verifikasi dan login melalui Better Auth tanpa menjadi pemilik tabel/superuser.
- Rate limit: 20 konsumsi serentak lewat dua pool PostgreSQL; tepat tujuh diizinkan untuk batas tujuh. Counter tersimpan bersama dan key di-hash.
- Impor: akun dibuat pada SQLite sementara, lalu diimpor ke PostgreSQL. ID dan login dengan sandi semula tetap bekerja. Sumber sama sebelum/sesudah, sesi tidak dipindahkan dan tujuan berisi data ditolak. Pembacaan sumber memakai transaksi read-only yang konsisten.
- Vercel handler: inisialisasi bersama untuk permintaan serentak, menunggu respons selesai, gagal 503 tanpa detail credential dan dapat mencoba kembali. E2E memakai HTTP handler yang sama; routing cloud Vercel sendiri belum diuji.
- Produksi: konfigurasi menolak SQLite, secret hilang, email file, TLS remote nonaktif, URL tidak sesuai dan migrasi otomatis saat request.
- Browser: 38 skenario fungsi/aksesibilitas/interaksi/regresi dan satu profil performa, dengan backend PostgreSQL terisolasi. Catatan pribadi tidak diunggah.

## Performa

Tiga cold load 390×844, CPU 4×, 9 Mbps download, latency 40 ms dan cache nonaktif. LCP 1.956 / 1.836 / 1.772 ms; median **1.836 ms**. CLS 0 / 0,00074 / 0,03238; median **0,00074**. Inisialisasi taman dekoratif menunggu font dan kesempatan paint konten. Ini pengukuran lab, bukan data pengguna lapangan atau jaminan setiap perangkat.

## Cloud dan operasi yang belum diverifikasi

Project URL dari pengguna: https://veinqenogcvmxdbefhzm.supabase.co. Upaya read-only MCP ditolak dengan pesan tidak memiliki izin. Tidak ada schema cloud dibuat, credential diperoleh atau migrasi cloud dijalankan. URL proyek saja tidak menyediakan password/connection string PostgreSQL.

Pengguna meminta deployment Vercel berupa langkah manual saja. Tidak ada project/deployment Vercel dibuat atau dipublikasikan. Build/routing pada layanan Vercel, TLS dengan sertifikat Supabase nyata, pooler Supabase, SMTP kotak masuk nyata, backup/restore produksi serta cookie pada domain publik masih harus diverifikasi melalui [DEPLOY_VERCEL.md](../../DEPLOY_VERCEL.md).

CI dan konfigurasi Docker/Compose ikut diselaraskan, tetapi eksekusi CI remote/container tidak dilakukan. Review materi BK, uji siswa/screen reader/perangkat fisik mengikuti prasyarat sebelumnya.
