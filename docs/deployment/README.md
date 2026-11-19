# Deployment RUANGKISAH — versi 1.3

Target aktif: **Vercel + PostgreSQL Supabase**, project ref veinqenogcvmxdbefhzm. Pengguna meminta deployment Vercel dilakukan manual. Langkah lengkap berada di [DEPLOY_VERCEL.md](../../DEPLOY_VERCEL.md).

## Yang tersedia dalam kode

- Frontend React/Vite, entry API Node.js api/index.js, konfigurasi build/routing/header vercel.json.
- Express/Better Auth dengan query asynchronous Kysely/PostgreSQL; pool kecil, TLS terverifikasi dan integrasi siklus pool Vercel.
- Schema privat ruangkisah dengan RLS dan role runtime terbatas. Tidak ada tabel/endpoint jurnal.
- Migrasi eksplisit melalui db:migrate; tidak dijalankan saat build/request. Import akun SQLite opsional read-only tanpa overwrite; sesi lama tidak dipindahkan.
- Bootstrap Superadmin, SMTP produksi dan rate limit database yang dibagikan antar-instance.
- SQLite tetap dapat dipakai untuk pengembangan lokal; produksi/Vercel menolak SQLite atau email file.

## Status dan batas

Kode diuji memakai PostgreSQL lokal sungguhan dan fixture HTTP/browser terisolasi. Proyek Supabase yang diberikan belum dapat diakses oleh koneksi MCP pengerjaan; migrasi/database cloud, SMTP nyata dan domain Vercel belum diverifikasi. Tidak ada deployment otomatis atau perubahan schema cloud yang dilakukan.

Akun memakai Better Auth pada tabel privat, bukan Supabase Auth/auth.users. Menggunakan Supabase untuk database tidak mengubah jurnal menjadi cloud. URL proyek Supabase bukan connection string database. Secret administrasi/migrator tidak diberikan ke frontend atau runtime Vercel.

## Operasi

- Jalankan migrasi eksplisit sebelum kode yang memerlukannya menerima traffic; gunakan koneksi admin privat yang terpisah dari runtime.
- Preview harus memakai database uji. PUBLIC_URL Production wajib origin HTTPS final; Preview dapat memakai VERCEL_URL otomatis.
- Simpan backup konsisten PostgreSQL dan uji restore; rollback hanya ke kode/schema kompatibel. Jangan menghapus data untuk mengatasi kegagalan startup.
- Konfigurasi Docker/Compose/Caddy adalah alternatif hosting satu server, bukan jalur deployment Vercel. Container belum diuji di lingkungan ini.

Bukti terbaru mengikuti docs/testing/2026-11-19-vercel-supabase-verification.md. Hasil versi 1.2 di laporan sebelumnya merupakan riwayat sebelum penyesuaian PostgreSQL.
