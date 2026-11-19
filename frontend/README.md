# Frontend RUANGKISAH

React + JavaScript + Vite + React Router + CSS Modules. Manrope lokal; token desain pada src/styles/tokens.css.

## Pengembangan

npm ci lalu npm run dev dari frontend. Jalankan API backend di port 4000 untuk fitur akun; proxy /api dikonfigurasi Vite. API_PROXY_TARGET dapat mengubah target proxy saat server Vite dimulai.

Akun wajib untuk fitur dan menggunakan fetch async dan cookie sesi server. authStore.js tidak menyimpan password, akun, sesi, atau token reset ke localStorage. Data refleksi memakai repository lokal dan tetap tidak dikirim ke backend.

## Pengujian

npm run lint, npm run format:check, npm run test:run, npm run build, npm run test:e2e.

Unit/integrasi memakai Vitest/jsdom; E2E menjalankan build melalui backend fixture terisolasi. Konfigurasi browser termasuk Chromium serta smoke test Firefox dan WebKit mobile. WebKit mobile adalah emulasi, bukan bukti pengujian iPhone fisik. Laporan aktual berada di ../docs/testing.

## Integrasi desain

Ikuti ../design.md dan ../structure.md. Ekspor Stitch pada root merupakan referensi; aplikasi tidak bergantung pada Tailwind/Google Fonts CDN dari ekspor. Kontak pendamping opsional dapat dikonfigurasi lewat .env.example sebelum build. Kosongkan bila belum terverifikasi; platform tidak terikat satu sekolah.

Login wajib untuk seluruh aktivitas dan contoh fiktif. Personal repository memakai key ruangkisah:account:<id>:data:v1; draf tetap di memori dan catatan tidak diunggah. Guest tidak membaca repository pribadi. Pemindahan key lama melalui konfirmasi pada halaman Privasi; validasi, batas storage, dan penolakan overwrite tetap berlaku.

Komponen PageHeader, token tipe/ukuran kontrol/selected state serta konfigurasi motion bersama dipakai untuk menjaga konsistensi. Uji E2E memakai fixture sesi server melalui tests/e2e/fixtures.js; pengujian guest menggunakan authenticated: false.
