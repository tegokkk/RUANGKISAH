# Verifikasi persetujuan akun — versi 1.4

**19 November 2026, Asia/Bangkok.** Alur yang diverifikasi: daftar → verifikasi email → login ditolak selama pending → Admin/Superadmin menyetujui → login menuju fitur. Database produksi dirancang untuk PostgreSQL Supabase; verifikasi memakai cluster PostgreSQL native lokal dan data fiktif terisolasi.

## Hasil akhir

| Pemeriksaan                                   | Hasil                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| Backend lint/format                           | Lulus                                                                       |
| Backend default SQLite/config/handler/migrasi | 8 lulus; 1 kasus PostgreSQL dilewati sesuai mode                            |
| Backend test:postgres                         | 9 lulus, tanpa skip; 42,59 detik                                            |
| Frontend lint/format                          | Lulus                                                                       |
| Frontend unit/integrasi                       | 23 lulus / 7 file; 25,81 detik                                              |
| Build produksi                                | Lulus; dibangun ulang sebelum E2E                                           |
| E2E Chromium/Firefox/WebKit mobile/performa   | 41 lulus; 1,7 menit                                                         |
| Backend normal lokal                          | /api/health HTTP 200; schema akun versi 2 dan kolom approvalStatus tersedia |

Log: [PostgreSQL](./2026-11-19-approval-postgres.log), [frontend](./2026-11-19-approval-frontend.log), [E2E](./2026-11-19-approval-e2e.log). Snapshot: [Superadmin desktop](./screenshots/2026-11-19-approval-1440.png), [Admin mobile](./screenshots/2026-11-19-approval-390.png).

## Bukti fungsi dan keamanan

- Signup dengan approvalStatus=approved/role Superadmin palsu tetap menghasilkan siswa/pending.
- Email terverifikasi saja belum memberi sesi. Password salah tetap ditolak tanpa memberikan akses; password benar mendapat ACCOUNT_PENDING_APPROVAL sampai pengelola menyetujui.
- Endpoint persetujuan memerlukan sesi pengelola aktif/terverifikasi/disetujui. Siswa tidak bisa menyetujui akun; Admin terbatas pada siswa. Sasaran belum verifikasi email atau disabled tidak dapat disetujui.
- Aktivasi akun, perubahan role/profile dan reset sandi tidak menyetujui pendaftaran secara otomatis. Perubahan role pending ditolak.
- Dua keputusan serentak menghasilkan satu persetujuan dan satu audit; approve ulang ditolak. Otorisasi actor/target dibaca ulang dengan penguncian transaksi.
- Antrean desktop/mobile menyediakan pencarian, pagination, refresh, detail, konfirmasi persetujuan dan hapus. Tombol belum verifikasi disabled. Batal tidak menyimpan keputusan; setelah disetujui akun hilang dari antrean dan siswa bisa membuka fitur.
- Pemindaian axe pada kedua antrean tidak menemukan violation untuk tag yang diperiksa; tidak ada overflow dokumen pada viewport 1440/390 px. Dua snapshot diperiksa visual.
- Client tidak memperlakukan user pending/metadata persetujuan hilang sebagai sesi aktif. Fixture layout diperbarui agar mengikuti kontrak user yang benar-benar disetujui.

## Migrasi dan kompatibilitas

Schema akun server menjadi versi 2; schema catatan browser tetap versi 1. Tes merekonstruksi schema akun versi lama tanpa kolom approvalStatus, lalu menjalankan migrasi pada SQLite dan PostgreSQL. Pengelola lama menjadi approved; siswa lama tanpa persetujuan menjadi pending dan sesinya dicabut. Akun/ID dan catatan tidak dihapus. Migrasi ulang tidak menyetujui pendaftaran baru.

Bootstrap Superadmin privat menghasilkan pengelola approved. Import sumber lama tanpa approvalStatus memerlukan tinjauan siswa; sumber yang sudah memiliki status persetujuan mempertahankannya. Akun siswa yang sudah disetujui tidak perlu disetujui lagi pada setiap login; disable tetap memblokir akses.

Backend lokal lama dihentikan, database dicadangkan secara privat pada backend/.data, lalu backend dijalankan kembali dengan kode baru. Endpoint health dan metadata schema lokal diperiksa tanpa membaca atau menampilkan password/data catatan.

## Regresi dan performa

Rangkaian mencakup guard/login/reset, demo, simpan/edit/hapus catatan, konflik tab, quota/fallback, reflow, fokus, animasi taman/Slide Tabs serta aksesibilitas. Median mobile lab LCP 1.708 ms dan CLS 0; tiga cold load LCP 1.828/1.564/1.708 ms, CLS 0/0,02221/0. Profil CPU 4×, download 9 Mbps, latency 40 ms dan cache nonaktif. Ini hasil lab, bukan jaminan perangkat pengguna.

## Batas penerapan

Tidak ada migrasi database Supabase cloud atau deployment Vercel dilakukan. Jalankan npm --prefix backend run db:migrate untuk schema 2 melalui credential migrator privat sebelum cutover manual kode baru. Untuk situs versi lama yang sudah aktif, tutup login/pendaftaran dalam jendela pemeliharaan sampai migrasi dan kode baru selesai. Panduan: [DEPLOY_VERCEL.md](../../DEPLOY_VERCEL.md).

Email SMTP kotak masuk nyata, domain/HTTPS publik, perangkat fisik/screen reader dan penelaahan materi BK tetap mengikuti batas verifikasi sebelumnya. Tidak ada unggah jurnal, upload dokumen identitas atau email pemberitahuan persetujuan otomatis yang ditambahkan.
