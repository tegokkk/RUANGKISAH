# Verifikasi UI dan login wajib — versi 1.2

**19 November 2026.** Windows, Node.js 24.21.0, React JavaScript/Vite, Express/Better Auth/SQLite. Data pengujian fiktif; fixture server/database/outbox terpisah dari akun aplikasi lokal. Tidak mengirim jurnal siswa nyata.

## Hasil akhir

| Perintah/pemeriksaan                         | Hasil                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| frontend: npm run lint                       | Lulus, tanpa error/warning                                                |
| frontend: npm run format:check               | Lulus                                                                     |
| frontend: npm run test:run -- --maxWorkers=1 | 22 tes / 7 file lulus, 23,03 detik                                        |
| backend: npm run lint                        | Lulus                                                                     |
| backend: npm run format:check                | Lulus                                                                     |
| backend: npm test                            | 4 tes HTTP lulus, 5,60 detik                                              |
| frontend: npm run build                      | Lulus; otomatis dibangun sebelum E2E                                      |
| frontend: npm run test:e2e -- --workers=2    | 39 lulus, 1,7 menit; Chromium, Firefox, WebKit mobile dan profil performa |
| Snapshot ulang                               | 52 tampilan, 0 pageerror, 0 overflow tingkat dokumen pada 1440 dan 390 px |

Log: [frontend unit](./frontend-unit-final.log), [E2E akhir](./e2e-final.log), [data performa](./2026-11-19-mobile-performance.json), [pengukuran visual](./ui-review-after-2026-11-19/measurements.json).

## Alur yang diperiksa

Guest membuka empat URL fitur: diarahkan ke Masuk; informasi umum tetap terbuka; login melanjutkan tujuan. Footer demo memerlukan login lalu masuk ke contoh fiktif di memori. Catatan akun A tidak muncul pada B; kembali ke A memulihkan catatan A. Logout membatasi akses. Respons sesi awal yang ditunda tidak menghapus input atau mengganti akun baru. Pemindahan catatan lama bisa dibatalkan tanpa perubahan; konfirmasi mempertahankan isi. Tes unit menolak overwrite dan memastikan sumber bertahan saat kuota penuh.

Regresi UI menguji fokus/posisi heading rangkuman dan kembali mengedit dengan draf utuh, kartu riwayat mobile dengan tindakan API nyata, selected saat hover dan label disabled akun belum verifikasi. Rangkaian lain mencakup simpan/edit/hapus, konflik dua tab, fallback IndexedDB, storage penuh/rusak, batas koleksi, filter, role/penghapusan/reset akun, aksesibilitas axe, reflow, reduced motion dan interaksi taman/Slide Tabs.

Akses akun diuji pada API HTTP dengan cookie sungguhan; mock UI tidak dipakai sebagai bukti otorisasi. Fixture visual memakai API sintetis supaya tidak menyentuh akun nyata. Semua 26 halaman/state desktop/mobile diperiksa ulang melalui papan tampilan, dengan reduced motion untuk kestabilan snapshot.

## Performa lab

Tiga cold load build produksi, viewport 390×844, CPU 4×, download 9 Mbps, upload 1,5 Mbps, latency 40 ms, cache nonaktif. LCP: 3.520 / 1.944 / 1.860 ms; CLS: 0 / 0,00074 / 0,00079. **Median LCP 1.944 ms dan median CLS 0,00074**, memenuhi ambang tes median 2.500 ms dan 0,1. Cold load pertama masih lebih lambat; ini bukan jaminan semua pemuatan atau data pengguna lapangan. Modul halaman dipecah agar seluruh fitur tidak dimuat pada Beranda.

## Batas bukti

WebKit mobile pada Windows adalah emulasi iPhone, bukan Safari pada perangkat fisik. Axe dan screenshot bukan sertifikasi WCAG atau pengganti screen reader/uji siswa. SMTP ke kotak masuk nyata, hosting/domain/HTTPS publik, container/CI remote, review BK serta perangkat fisik belum diverifikasi pada pekerjaan ini. Catatan tetap lokal per akun, tidak disinkronkan atau dienkripsi oleh login; Admin tidak membaca isi jurnal melalui API.
