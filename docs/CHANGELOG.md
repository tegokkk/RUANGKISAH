# Catatan rilis

## 1.4 — 19 November 2026 — persetujuan akun oleh pengelola

- Pendaftaran pending; email verified dan persetujuan Admin/Superadmin menjadi syarat terpisah sebelum login/aktivitas.
- Tambahkan antrean pengelola, pencarian, pagination, refresh, konfirmasi dan status efektif; keputusan approval tercatat atomik pada audit.
- Cegah bypass melalui aktivasi, reset, perubahan role/profile atau payload signup; frontend juga menolak sesi tanpa persetujuan.
- Schema 2 mempertahankan pengelola lama, memerlukan tinjauan untuk siswa lama tanpa persetujuan dan mencabut sesinya. Bootstrap/import/fixture disesuaikan; catatan lokal tidak dihapus.
- Tambahkan tes otorisasi, reset/race, migrasi lama/idempotence serta UI approval desktop/mobile. Helper PostgreSQL Windows menggunakan shutdown pg_ctl yang tertib.
- Tidak ada deployment/migrasi cloud otomatis. Jalankan migrasi sebelum cutover manual kode baru.

## 1.3 — 19 November 2026 — kode untuk Vercel + Supabase

- Tambahkan PostgreSQL/Kysely dengan schema privat, RLS, role runtime terbatas, indeks, TLS terverifikasi, pool kecil dan lifecycle koneksi Vercel.
- Pertahankan Better Auth, cookie/sesi/role dan jurnal lokal. Produksi menolak SQLite dan email file; migrasi tidak dilakukan pada request.
- Migrasi eksplisit, import akun SQLite read-only ke tujuan kosong, ID/hash dipertahankan; sesi/token tidak dipindah.
- Rate limit database atomik lintas instance dan transaksi admin dengan penguncian ulang actor/target.
- Entry Function, konfigurasi SPA/API/header Vercel, template environment serta langkah deploy manual. Tidak ada deployment/migrasi cloud otomatis.
- Jadwalkan inisialisasi taman dekoratif setelah font/teks mendapat kesempatan tampil agar tidak bersaing pada pemuatan awal.

## 1.2 — 19 November 2026 — penyelarasan UI dan login wajib

- Wajibkan login aktif/terverifikasi untuk refleksi, jurnal, target, Catatan Saya, demo dan pengelolaan data; lanjutkan tujuan setelah login.
- Pisahkan catatan lokal per ID akun. Draf aktivitas tidak dibawa saat ganti akun; catatan tidak diunggah. Pemindahan key lama dengan persetujuan, tanpa overwrite dan tanpa menghapus sumber saat penyimpanan gagal.
- Tangani respons sesi terlambat serta pemeriksaan ulang fokus/antar-tab. Form login publik tidak direset ketika sesi awal selesai dimuat.
- Selesaikan 13 temuan UI: riwayat mobile, fokus rangkuman, selected/hover, tipe/jarak/kontrol/warna, form ringkas, notice/empty, copy, verifikasi dan motion.
- Perbaiki breakpoint Admin di WebKit dan pecah modul halaman untuk mengurangi beban awal Beranda.
- Verifikasi: 22 tes frontend, 4 backend, 39 E2E lulus; lint/format/build lulus. Snapshot ulang 52 tampilan tanpa pageerror/overflow dokumen. Median LCP mobile lab 1.944 ms, CLS 0,00074; cold load pertama masih 3.520 ms. Rincian pada docs/testing/2026-11-19-ui-login-verification.md.

## 1.1 — 19 November 2026 — kandidat lokal

- Platform untuk siswa/siswi lintas sekolah. Refleksi tetap dapat digunakan tanpa akun; pendaftaran tidak meminta sekolah/NISN.
- Ganti simulasi akun localStorage dengan Express, Better Auth dan database SQLite persisten. Tambahkan verifikasi email, pemulihan kata sandi, cookie HttpOnly, pencabutan sesi dan otorisasi server.
- Admin mengelola siswa; Superadmin mengelola siswa/Admin dan melihat audit. Pengelola pertama dibuat melalui bootstrap privat tanpa password bawaan.
- Pertahankan jurnal lokal tanpa unggah otomatis. Perbaiki koordinasi lintas tab dengan Web Locks/transaksi IndexedDB dan penolakan aman bila koordinasi tidak tersedia.
- Tambahkan filter jenis/tanggal dan perbaiki edit rincian target agar memakai ID yang sama.
- Tambahkan transisi halaman, reveal, langkah refleksi, menu/dialog masuk-keluar, interaksi tombol, fokus dan reduced motion. Optimalkan aset font Latin lokal.
- Tambahkan pengujian API, E2E autentikasi, reset, konflik tab, fallback koordinasi, kuota, batas koleksi, aksesibilitas dan browser Firefox/WebKit mobile.
- Selaraskan PRD, desain, struktur, tasklist, panduan lokal, deployment dan instrumen review/uji pengguna.

## Data dan kompatibilitas

Skema catatan lokal tetap versi 1. Sejak versi 1.2 key aktif ruangkisah:account:<id>:data:v1; key lama ruangkisah:data:v1 dipindahkan dengan konfirmasi pada Privasi ke akun kosong. Sumber dihapus setelah salinan baru berhasil disimpan. Versi materi mengikuti metadata di frontend/src/content. Pemberitahuan privasi diperbarui 2026-11-19. Akun simulasi lama tidak diimpor ke akun server; pengguna perlu mendaftar ulang. Login tidak menyinkronkan catatan; tampilan/repository lokal dipisahkan menurut akun, tanpa enkripsi penyimpanan browser. Audit akun disimpan maksimal 180 hari sesuai kebijakan aplikasi.

## Batas kandidat ini

Pengiriman email diuji memakai outbox privat lokal. SMTP kotak masuk nyata, hosting/domain/HTTPS publik, build container/CI remote, screen reader dan perangkat Android/iOS fisik belum diverifikasi. Materi belum mendapat persetujuan ahli BK; belum ada hasil uji siswa. Jangan menyebut kandidat ini sudah tervalidasi secara psikologis atau sudah dipublikasikan.

## Operasi dan rollback

Ikuti docs/deployment/README.md. Gunakan build terdahulu yang kompatibel dengan skema, pertahankan volume akun dan secret, serta uji pemulihan backup terisolasi. Jangan menghapus jurnal browser atau menimpa database untuk rollback UI. Panduan siswa/pendamping berada pada halaman Tentang & Cara Pakai dan README.

## 1.0 — 18 November 2026 — riwayat prototipe

Frontend refleksi, jurnal, target, catatan lokal dan demo; autentikasi saat itu masih simulasi browser. Laporan audit awal dipertahankan di docs/testing/audit-2026-11-18.md.
