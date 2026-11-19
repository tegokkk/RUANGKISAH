# RUANGKISAH.ID - Selfcare-BK

Website refleksi untuk siswa/siswi lintas sekolah: Kenali Diriku, Jurnal Perasaan, Langkah Berani, dan Pusat Bantuan. Pengguna wajib mendaftar, memverifikasi email, mendapat persetujuan Admin dan masuk untuk menggunakan fitur. Halaman bantuan/privasi tetap publik. Akun dan panel Admin/Superadmin memakai backend; isi jurnal tetap lokal.

## Menjalankan aplikasi lengkap secara lokal

Gunakan Node.js >=24.15.0 (diuji dengan 24.21.0). Dari root proyek:

```powershell
npm --prefix frontend ci
npm --prefix backend ci
npm --prefix frontend run build
npm --prefix backend run start:local
```

Buka http://localhost:4000. Build UI dan API disajikan satu origin. Jalankan kembali build setelah mengubah source UI.

Untuk hot reload, gunakan dua terminal: npm --prefix backend run dev dan npm --prefix frontend run dev. Buka http://localhost:5173; Vite meneruskan /api ke port 4000.

## Akun pengelola pertama

Tidak ada akun produksi atau password bawaan. Untuk pengembangan lokal, atur variabel berikut dan jalankan bootstrap satu kali dari root:

```powershell
$env:BOOTSTRAP_EMAIL = Read-Host 'Email pengelola'
$env:BOOTSTRAP_PASSWORD = Read-Host 'Sandi unik minimal 12 karakter' -MaskInput
npm --prefix backend run bootstrap
Remove-Item Env:BOOTSTRAP_PASSWORD
Remove-Item Env:BOOTSTRAP_EMAIL
```

Bootstrap menolak dijalankan ulang jika Superadmin sudah ada. Gunakan halaman Masuk setelahnya. Superadmin dapat menetapkan peran Admin pada akun Siswa; registrasi publik selalu menghasilkan Siswa.

## Email dan data

- Lokal: pesan verifikasi/reset berada di backend/.data/mail; tidak dikirim ke alamat nyata dan tidak tersedia lewat HTTP. Buka tautan pada JSON melalui browser untuk memeriksa alur pengembangan.
- Produksi: SMTP_URL, MAIL_FROM, AUTH_SECRET, PUBLIC_URL HTTPS, serta volume database wajib dikonfigurasi. Jangan memublikasikan mode kotak pesan lokal.
- Akun disimpan di backend/.data/accounts.sqlite. Jangan menaruh folder .data di public, Git, atau bundle frontend.
- Jurnal tidak diunggah, tidak disinkronkan, dan tidak dapat dibaca Admin melalui panel. Catatan dipisahkan menurut akun dalam browser ini. Login bukan enkripsi; akses perangkat tetap perlu dijaga.
- Akun simulasi localStorage lama tidak digunakan atau diimpor sebagai akun server. Pengguna prototipe perlu mendaftar ulang.

## Pemeriksaan

```powershell
npm --prefix backend run lint
npm --prefix backend test
npm --prefix frontend run lint
npm --prefix frontend run format:check
npm --prefix frontend run test:run
npm --prefix frontend run build
npm --prefix frontend run test:e2e
```

Pasang browser pengujian dari frontend dengan npx playwright install chromium firefox webkit bila belum tersedia. E2E memakai server fixture port 4001 dan database/outbox terisolasi, bukan akun lokal pengelola.

## Dokumen

- [PRD](./PRD.md), [Desain](./design.md), [Struktur](./structure.md), [Tasklist](./TASKLIST.md).
- [Audit aktual](./AUDIT.md) dan [keputusan scope](./docs/DECISIONS.md).
- [Deployment](./docs/deployment/README.md), [review materi](./docs/evaluation/review-materi.md), [uji pengguna](./docs/evaluation/rencana-uji.md).

Publikasi internet/SMTP nyata, telaah ahli materi, dan uji perangkat fisik harus dibuktikan terpisah; lihat status terbuka dalam audit.

## Ketentuan akses versi 1.2

Fitur refleksi, jurnal, target, catatan dan contoh fiktif membutuhkan sesi login valid. Membuka URL fitur langsung diarahkan ke Masuk dan dilanjutkan ke tujuan semula sesudah autentikasi. Pergantian akun/logout membersihkan state fitur; catatan tersimpan menggunakan ruang lokal akun masing-masing.

Catatan lama pada ruangkisah:data:v1 tidak dihapus otomatis. Masuk, buka Privasi, lalu konfirmasi Pindahkan catatan lama jika catatan tersebut milikmu. Pemindahan hanya ke akun yang belum memiliki catatan, tidak menimpa atau menggabungkan otomatis, dan menghapus sumber hanya setelah penyimpanan baru berhasil. Jika storage penuh, sumber dipertahankan.

[Status perbaikan UI](./UI_AUDIT.md) menjabarkan penyelesaian temuan dan verifikasi terbaru.

## Target deployment versi 1.3

Vercel + PostgreSQL Supabase (project ref veinqenogcvmxdbefhzm). Panduan langkah manual: [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md). API dan frontend satu origin; akun tetap Better Auth, jurnal tetap lokal. Kode produksi sudah disesuaikan, tetapi koneksi cloud/SMTP/deployment belum diverifikasi. Perintah lokal di atas tetap memakai SQLite bila DATABASE_URL belum diatur; produksi wajib PostgreSQL.

## Persetujuan akun versi 1.4

Pendaftaran baru harus mendapat persetujuan Admin/Superadmin setelah email terverifikasi. Panel Persetujuan Akun menampilkan antrean, pencarian dan dialog Setujui akun. Sebelum persetujuan, login ditolak dengan pesan menunggu. Aktivasi/reset sandi tidak melewati persetujuan. Jalankan npm --prefix backend run db:migrate sebelum menerapkan kode versi ini ke Supabase. Siswa lama tanpa persetujuan akan menunggu tinjauan dan sesinya dicabut; Admin/Superadmin lama dipertahankan agar bisa meninjau. Catatan lokal tetap ada.
