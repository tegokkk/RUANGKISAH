# Penyelesaian audit UI RUANGKISAH.ID — versi 1.2

**19 November 2026.** Seluruh 13 temuan audit awal telah diperbaiki dalam implementasi. Login dengan akun aktif dan email terverifikasi kini diwajibkan untuk menggunakan aktivitas, catatan dan contoh fiktif. Halaman informasi tetap publik.

## Hasil per temuan

| ID    | Perubahan yang selesai                                                                                                                                             | Bukti utama                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| UI-01 | Kartu riwayat mobile berisi waktu, pelaku, tindakan, sasaran dan hasil; tabel desktop dipertahankan.                                                               | E2E UI-01, screenshot superadmin-audit |
| UI-02 | Pergantian form/rangkuman jurnal, target dan detail catatan memfokuskan serta menggulir ke judul; kembali mengedit mempertahankan draf.                            | E2E UI-02, useHeadingFocus             |
| UI-03 | Navigasi aktif ink/putih pada Slide Tabs, menu mobile dan sidebar. Hover tidak menghilangkan selected; pilihan form tetap frost/border action.                     | E2E hover sidebar, token selected      |
| UI-04 | Judul halaman 36/30 px, judul form 32/28 px, section 24/22 px; hero tetap 80/44 px sesuai perannya.                                                                | tokens.css, pengukuran DOM             |
| UI-05 | PageHeader bersama; lebar konten, padding panel dan jarak memakai token yang konsisten.                                                                            | PageHeader, papan desktop/mobile       |
| UI-06 | Field/select/password 56 px, tombol utama minimal 48 px, aksi ringkas minimal 44 px. Label opsional dan kontrol password diselaraskan.                             | Field, PasswordField, token kontrol    |
| UI-07 | Logout netral; danger untuk hapus/nonaktif. Primary biru; pistachio/ink pada konteks permukaan berwarna.                                                           | Header, MobileMenu, Account, Admin     |
| UI-08 | Textarea awal tiga baris, minimum 128/112 px; helper dan label opsional tetap ada. Form mobile lebih ringkas tanpa tombol yang menutup keyboard.                   | Screenshot journal/goal-form           |
| UI-09 | Bar informasi dipersingkat; navigasi Admin mobile ringkas, statistik dua kolom, penjelasan privasi dapat dibuka. Notice bantuan berulang dikurangi.                | Papan mobile, WebKit mobile            |
| UI-10 | EmptyState bersama untuk kosong/404/tidak-diizinkan; filter kosong memakai varian ringkas dan aksi Tampilkan semua catatan.                                        | E2E filter, screenshot empty/404       |
| UI-11 | Copy Beranda, footer, FAQ, Login, Tentang dan Privasi mengikuti aturan login wajib. Catatan lokal dijelaskan terpisah dari akun server.                            | E2E login wajib, source dan dokumen    |
| UI-12 | Akun belum verifikasi menampilkan Menunggu verifikasi email yang disabled; Aktivasi hanya untuk akun dinonaktifkan.                                                | E2E UI-12 dengan akun server uji       |
| UI-13 | Durasi/easing dari token bersama; spring navigasi bersama; kartu statistik noninteraktif tidak mengangkat saat hover. Reduced motion dan jeda taman dipertahankan. | motionConfig, E2E hero/reduced motion  |

Breakpoint Admin yang menyebabkan overflow di WebKit juga diperbaiki. Halaman fitur/pengelola dimuat sesuai kebutuhan agar kode awal Beranda lebih ringan.

## Login dan catatan

- Guest yang membuka URL fitur diarahkan ke Masuk, kemudian kembali ke fitur tujuan setelah berhasil login.
- Catatan lokal dipisahkan per ID akun. Keluar/ganti akun membersihkan tampilan dan draf aktivitas; akun B tidak menampilkan catatan akun A.
- Contoh fiktif tetap di memori, memerlukan login dan dapat dilanjutkan setelah login dari footer.
- Pengelolaan/hapus data pada Privasi memerlukan login. Catatan lama tidak diklaim otomatis: pengguna mengonfirmasi pemindahan ke akun yang belum memiliki catatan.
- Sesi diperiksa ulang saat fokus tab, pemberitahuan antar-tab dan secara berkala. Respons sesi lama tidak menimpa akun yang baru login atau menghapus input formulir publik.
- Login tidak mengenkripsi penyimpanan browser dan tidak mengunggah jurnal. Admin mengelola akun tanpa akses isi catatan melalui server.

## Bukti visual dan pengujian

- [Audit sebelum perbaikan](./docs/testing/ui-review-2026-11-19/UI_AUDIT-before.md).
- [Desktop sesudah perbaikan](./docs/testing/ui-review-after-2026-11-19/overview-1440.png).
- [Mobile sesudah perbaikan](./docs/testing/ui-review-after-2026-11-19/overview-390.png).
- [Pengukuran 52 tampilan sesudah perbaikan](./docs/testing/ui-review-after-2026-11-19/measurements.json).
- [Riwayat pengelola mobile](./docs/testing/ui-review-after-2026-11-19/superadmin-audit-390-full.png).
- [Rangkuman jurnal mobile](./docs/testing/ui-review-after-2026-11-19/journal-summary-390.png).
- [Laporan verifikasi versi 1.2](./docs/testing/2026-11-19-ui-login-verification.md).

Snapshot memakai akun/API sintetis dan data fiktif di browser terisolasi dengan reduced motion: 26 halaman/state pada 1440×1000 dan 390×844. Tidak ada pageerror atau overflow dokumen pada pengukuran tersebut. Snapshot tidak membuktikan otorisasi: tes login/role dan isolasi akun memakai API server nyata pada fixture terpisah.

Emulasi browser dan axe tidak menggantikan uji perangkat fisik, screen reader atau uji siswa. SMTP produksi, hosting/domain dan review materi BK tetap memerlukan verifikasi eksternal.

## Penambahan versi 1.4 — persetujuan akun

Panel Admin/Superadmin menambahkan antrean persetujuan yang memakai token dan kontrol yang sama, dua kolom kartu desktop/satu kolom mobile, dialog konfirmasi, status menunggu dan filter terpisah dari verifikasi email. [Desktop](./docs/testing/screenshots/2026-11-19-approval-1440.png), [mobile](./docs/testing/screenshots/2026-11-19-approval-390.png). Pemindaian axe antrean dan pengukuran overflow pada kedua viewport dijalankan dalam E2E. Ini tambahan pada bukti 52 tampilan versi 1.2, bukan klaim semua snapshot lama diambil ulang.
