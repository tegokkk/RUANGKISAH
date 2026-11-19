# Verifikasi latar hero — 19 November 2026

Permintaan: gunakan komponen taman bunga yang dilampirkan sebagai background slide pertama Beranda.

## Perubahan

- HomePage menempatkan Ember Petal sebagai latar penuh hero; CTA dan teks tetap berada pada lapisan interaktif di depan.
- Gradient gelap menjaga keterbacaan. Pilihan suasana tetap tersedia; tambahkan tombol jeda/lanjut.
- Mode background langsung menampilkan taman mekar, tanpa gate loading, readout, overlay fullscreen atau fokus keyboard pada dekorasi.
- Ambien maksimal 30 fps; berhenti saat section di luar viewport atau tab tersembunyi. Reduced motion menangani perubahan preferensi secara langsung dan merender taman statis.
- React lazy/Suspense memisahkan chunk taman dari bundle utama; project tetap React JavaScript/CSS Modules.
- Pemindaian aksesibilitas menunggu animasi finite selesai; animasi ambient infinite tidak ditunggu sebagai promise yang tidak pernah selesai. Aturan kontras tetap aktif.

## Bukti aktual

- npm run lint: lulus tanpa error/warning.
- npm run format:check: lulus.
- Build Vite produksi: lulus; otomatis dibangun sebelum pengujian browser.
- Dua tes hero background Playwright Chromium: 2/2 lulus, 14,8 detik termasuk persiapan build/server.
- Tes baru memeriksa lebar 320/390/768/1440 px, latar mengisi section, tanpa progressbar/fokus dekorasi, kontrol warna, CTA navigasi, tidak ada pageerror, pause/resume, reduced motion dinamis dan suspend saat offscreen.
- Tes route langsung/refresh dan reflow 320–1440 px: lulus pada rangkaian pemeriksaan perubahan ini.
- Tes aksesibilitas Axe pada route publik, menu keyboard dan reduced motion: lulus pada rangkaian pemeriksaan perubahan ini.
- Pemeriksaan visual melalui Chromium pada localhost:5173: desktop dan ponsel; tidak ada pageerror atau scroll horizontal.

Pratinjau: [desktop](./screenshots/2026-11-19-hero-background-desktop.png), [mobile](./screenshots/2026-11-19-hero-background-mobile.png).

Pengujian ini khusus perubahan hero, bukan klaim menjalankan ulang seluruh suite backend atau validasi perangkat fisik.


## Pembaruan interaksi klik/sentuhan

Permintaan lanjutan: animasi background tetap dapat diklik seperti contoh komponen. Interaksi sekarang diteruskan dari hero melalui ref DOM, sehingga lapisan visual tetap berada di belakang konten. Klik menghasilkan gust dan partikel; gerakan pointer memengaruhi bunga. Klik kontrol tidak memicu partikel atau mengganggu navigasi. Mode background mempertahankan taman mekar, alih-alih menjalankan fase keluar preloader.

Hasil aktual: 4/4 tes hero Playwright Chromium lulus (32,8 detik, termasuk persiapan server/build). Mencakup tes hero sebelumnya, klik desktop, pengecualian kontrol, partikel yang mereda, latar tetap tampil, penolakan interaksi saat jeda/reduced motion, serta ketukan mobile emulasi dengan posisi partikel sesuai lokasi sentuh. Lint dan format:check lulus; build produksi terbaru dibuat otomatis sebelum E2E. Pengujian ini tidak mengklaim perangkat fisik.
