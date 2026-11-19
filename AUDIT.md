# Status audit RUANGKISAH.ID

**Diperbarui 19 November 2026 — versi 1.4.** Pekerjaan teknis aktif mencakup perbaikan audit awal, penyelarasan 13 temuan UI dan login wajib untuk fitur. [Audit 18 November](./docs/testing/audit-2026-11-18.md) adalah riwayat prototipe, bukan gambaran backend saat ini.

## Sudah dikerjakan

- Backend Express, Better Auth dan PostgreSQL Supabase untuk produksi (SQLite hanya lokal); verifikasi email, pemulihan sandi, cookie sesi HttpOnly dan pencabutan sesi.
- Role siswa/Admin/Superadmin dan pemeriksaan kewenangan di API server; bootstrap privat tanpa sandi bawaan, pengelolaan akun dan audit tindakan.
- Refleksi, jurnal, target dan Catatan Saya; simpan dengan konfirmasi, edit ID sama, hapus, filter, konflik antar-tab dan penanganan storage gagal/penuh.
- Koordinasi penulisan Web Locks/fallback transaksi IndexedDB; penolakan aman jika koordinasi tidak tersedia.
- Login wajib untuk aktivitas, contoh fiktif dan pengelolaan data lokal; redirect melanjutkan tujuan. Informasi umum tetap publik.
- Repository lokal per akun dan pemindahan catatan lama dengan konfirmasi, tanpa overwrite atau unggah. Draf aktivitas direset saat akun berubah.
- Penyelesaian [13 temuan UI](./UI_AUDIT.md): mobile Admin, fokus rangkuman, selected/hover, tipe, jarak, kontrol, warna aksi, panjang form, notice, empty/error, copy, status verifikasi dan motion.
- Pengujian unit/integrasi, API HTTP, E2E lintas browser, axe, snapshot desktop/mobile dan performa lab.
- Dokumen kebutuhan/desain/struktur/tasklist mengikuti platform siswa lintas sekolah dan aturan akun versi 1.2.

## Bukti terbaru

Lihat [verifikasi UI dan login versi 1.2](./docs/testing/2026-11-19-ui-login-verification.md), [UI_AUDIT.md](./UI_AUDIT.md) serta [verifikasi backend versi 1.1](./docs/testing/2026-11-19-verification.md). Batas tes dan fixture dijelaskan di masing-masing laporan.

## Prasyarat di luar implementasi lokal

- Pengelola operasional dan persetujuan/review materi oleh ahli BK.
- Uji siswa dengan izin yang sesuai, perangkat Android/iOS fisik, keyboard virtual dan screen reader manual.
- SMTP dan bukti email masuk ke kotak surat nyata; outbox lokal hanya untuk pengembangan/pengujian.
- Hosting/domain/HTTPS publik, backup/restore pada layanan target dan eksekusi CI/container remote.

Platform terbuka bagi siswa/siswi lintas sekolah. Kontak satu sekolah bukan prasyarat; kanal pendamping platform tambahan opsional dan harus diperiksa sebelum diaktifkan. Hal yang membutuhkan pihak/layanan nyata tidak ditandai selesai hanya karena tes lokal lulus.

## Penyesuaian deployment versi 1.3

Adapter PostgreSQL, schema privat/RLS, migrasi, import SQLite read-only, role runtime terbatas, rate limit bersama, handler/routing Vercel dan panduan manual tersedia. Lihat [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md). Supabase project ref veinqenogcvmxdbefhzm belum dapat diakses oleh koneksi MCP; cloud belum dimigrasikan. Vercel tidak dideploy otomatis sesuai permintaan pengguna. Hasil pengujian mengikuti [verifikasi versi 1.3](./docs/testing/2026-11-19-vercel-supabase-verification.md).

## Persetujuan akun versi 1.4

Pendaftaran pending sampai email terverifikasi dan pengelola menyetujui. Endpoint/guard/audit server, antrean desktop/mobile dan pesan pengguna tersedia. Schema version 2 diperlukan untuk deployment; migrasi lama diuji pada SQLite dan PostgreSQL. Pengelola lama tetap dapat masuk, siswa tanpa persetujuan menunggu dan sesinya dicabut tanpa menghapus jurnal. Bukti pada [verifikasi persetujuan](./docs/testing/2026-11-19-account-approval-verification.md). Database lokal dicadangkan sebelum backend diperbarui. Cloud/Vercel tetap manual.
