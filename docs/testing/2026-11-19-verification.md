# Verifikasi teknis — 19 November 2026

## Lingkungan dan metode

Windows, Node.js 24.21.0, React + JavaScript, frontend build produksi Vite dan API Express/Better Auth/SQLite. Uji memakai data fiktif; tidak ada jurnal siswa nyata dikirim atau dikumpulkan. Tanggal memakai zona waktu proyek Asia/Bangkok; log server UTC dapat menunjukkan 18 November.

Backend unit/integrasi memakai HTTP sungguhan dan database sementara. E2E membuat build baru, menjalankan backend fixture port 4001, akun pengujian terisolasi dan outbox privat, lalu membersihkan fixture. Tidak ada endpoint untuk membaca outbox di browser. Aplikasi lokal normal berada di localhost:4000 dengan database terpisah.

## Perintah dan hasil

| Pemeriksaan | Hasil |
|---|---|
| npm --prefix frontend run lint | Lulus; 0 error dan 0 warning |
| npm --prefix frontend run format:check | Lulus |
| npm --prefix frontend run test:run -- --maxWorkers=1 | 18 tes, 6 file, lulus; 14,48 detik |
| npm --prefix backend run lint | Lulus |
| npm --prefix backend run format:check | Lulus |
| npm --prefix backend test | 4 tes HTTP lulus; 5,3 detik |
| npm --prefix frontend run build | Lulus; dijalankan ulang otomatis sebelum E2E |
| npm --prefix frontend run test:e2e -- --workers=2 | 22 lulus; 55,7 detik |
| npm --prefix frontend audit | 0 kerentanan yang dilaporkan |
| npm --prefix backend audit --omit=dev | 0 kerentanan produksi yang dilaporkan |

## Cakupan bukti

Backend menguji persetujuan wajib, pemaksaan role siswa walau payload dipalsukan, penyimpanan password terhash, penolakan login sebelum verifikasi, cookie HttpOnly, logout, origin asing, siswa yang mencoba API admin, promosi Admin, pembatasan Admin pada siswa, pelindungan Superadmin, nonaktif/hapus yang mencabut sesi, audit, reset netral, token sekali pakai dan pencabutan sesi lama.

Frontend unit/integrasi menguji repository, batas/validasi, kegagalan koordinasi, kontrak API async, alur mandiri, akun/panel, dan kontak fiktif dengan O05 batal/lanjut. Mock dipakai untuk tes UI; bukti keamanan server berasal dari backend dan E2E, bukan mock tersebut.

E2E mencakup route langsung/refresh/reflow 320–1440 px, menu keyboard/fokus/Escape, jurnal simpan/reload/edit/hapus, marker jaringan privat, input skrip sebagai teks, siklus target, draf/navigasi, hapus/conflict dua tab, back/forward, JSON rusak, pendaftaran/verifikasi/login/guard/panel/hapus/audit, reset melalui email lokal, fallback transaksi IDB dua tab tanpa Web Locks, penolakan saat koordinasi diblokir, kuota storage, koleksi penuh, filter metadata dan edit rincian ID sama.

Axe memeriksa 13 route publik (beranda, tiga modul, catatan, bantuan, privasi, tentang, masuk, daftar, lupa/reset sandi, tidak-diizinkan), panel Superadmin/Admin, profil dan dialog penghapusan. Tidak ada violation pada tag yang dipilih dalam pemindaian akhir. Pemeriksaan menunggu animasi masuk selesai agar tidak menilai warna pada satu frame fade. Mode reduced motion diuji tanpa animasi main berjalan. Ini bukan sertifikasi WCAG atau pengganti uji screen reader.

Firefox 159.0 dan WebKit 27.2 menjalankan jurnal simpan/buka/hapus serta login/pemulihan sesi setelah reload dan layout akun. Chromium 159.0.8154.6 menjalankan rangkaian lengkap. WebKit menggunakan emulasi iPhone 13 pada Windows, bukan perangkat Safari iOS nyata.

## Performa lab

Desktop Chromium build lokal, tanpa throttling: LCP 308 / 152 / 76 ms; CLS 0,0001 / 0 / 0. Ketiga pengukuran menggunakan navigasi terpisah. Angka ini tidak mewakili pengguna internet nyata.

Mobile Chromium: viewport 390×844, CPU throttling 4×, download 9 Mbps, upload 1,5 Mbps, latency 40 ms, cache HTTP dinonaktifkan; tiga navigasi. Uji ini dijalankan setelah browser fungsional selesai agar tidak bersaing CPU.

| Run | LCP (ms) | CLS |
|---|---:|---:|
| 1 | 2376 | 5e-05 |
| 2 | 896 | 0 |
| 3 | 940 | 5e-05 |

Median LCP **940 ms**, median CLS **5e-05**; target lab median LCP ≤2500 ms dan CLS ≤0,1 lulus pada pengukuran akhir. Ketiga run akhir juga di bawah target. Data mentah: [JSON](./2026-11-19-mobile-performance.json). Variasi CPU/perangkat/jaringan dapat mengubah hasil; belum ada data field/CrUX.

## Temuan selama verifikasi

- Ketidaksesuaian kontrak UI async, pemilihan elemen akibat filter baru dan alur edit target diperbaiki serta diuji ulang.
- Satu eksekusi terhenti sangat lama sehingga tes mengalami timeout serentak. Hasil gagal dipertahankan sebagai riwayat pekerjaan, lalu pengujian diulang pada lingkungan responsif; hasil akhir yang dilaporkan adalah eksekusi lengkap 22/22.
- Pengukuran LCP pernah bernilai 0 ketika browser bersaing pada pengujian paralel. Pengukuran dipisahkan menjadi proyek setelah dependensi browser selesai, membawa page ke depan dan menunggu observasi paint yang valid; nilai 0 tidak dipakai sebagai lulus.
- Pemindaian Axe pernah menangkap opacity transisi dan melaporkan kontras sementara. Audit kini menunggu document.fonts serta promise animasi selesai; aturan kontras tetap aktif dan tidak dikecualikan.
- Font lokal dibatasi subset Latin, komponen provider/context dan router/layout dipisah; lint akhir tanpa warning.

## Pemeriksaan visual dan aplikasi lokal

Tangkapan layar hasil build: [desktop 1440 px](./screenshots/2026-11-19-home-desktop.png) dan [mobile 390 px](./screenshots/2026-11-19-home-mobile.png). Reflow otomatis juga memeriksa 320, 375, 768 dan 1024 px. Server normal localhost:4000 mengembalikan health 200 dan route langsung /daftar 200, header CSP same-origin serta API Cache-Control no-store.

## Belum diverifikasi

Pembaca layar NVDA/VoiceOver, zoom manual 200%, keyboard virtual ponsel, Chrome Android/Safari iOS pada perangkat fisik, pengiriman SMTP nyata, HTTPS/domain publik, kebijakan log/backup penyedia, build Docker dan CI remote. Reviewer materi dan peserta uji belum menjalankan lembar evaluasi. Tidak menyatakan kontak nyata, validasi ahli atau efektivitas psikologis telah terbukti.

Instrumen dan panduan siap di docs/evaluation dan docs/deployment. Keputusan release tetap mengikuti pekerjaan terbuka di TASKLIST.md/AUDIT.md.
